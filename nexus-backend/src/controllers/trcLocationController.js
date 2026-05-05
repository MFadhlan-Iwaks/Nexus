const ACTIVE_WINDOW_MS = 10 * 60 * 1000;
const trcLocationStore = new Map();

function ensureRole(req, res, role) {
  const currentRole = String(req.user?.role || '').toLowerCase();
  if (currentRole !== role) {
    res.status(403).json({ message: `Akses hanya untuk ${role}.` });
    return false;
  }
  return true;
}

function normalizeCoordinate(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

exports.postTrcLocation = (req, res) => {
  if (!ensureRole(req, res, 'trc')) return;

  const latitude = normalizeCoordinate(req.body?.latitude ?? req.body?.lat);
  const longitude = normalizeCoordinate(req.body?.longitude ?? req.body?.lng);

  if (latitude === null || longitude === null) {
    return res.status(400).json({ message: 'Latitude dan longitude wajib diisi.' });
  }

  const userId = String(req.user?.id || '');
  const previous = trcLocationStore.get(userId) || {};
  const nama = req.body?.nama || req.body?.name || previous.nama || null;

  const payload = {
    id: userId,
    nama,
    latitude,
    longitude,
    updated_at: new Date().toISOString(),
  };

  trcLocationStore.set(userId, payload);

  res.status(200).json({ message: 'Lokasi TRC tersimpan.', data: payload });
};

exports.getTrcLocations = (req, res) => {
  if (!ensureRole(req, res, 'admin')) return;

  const now = Date.now();
  const data = Array.from(trcLocationStore.values()).map((item) => {
    const updatedAt = item.updated_at ? new Date(item.updated_at).getTime() : 0;
    const isActive = updatedAt > 0 && (now - updatedAt) <= ACTIVE_WINDOW_MS;
    return {
      ...item,
      status: isActive ? 'aktif' : 'nonaktif',
    };
  });

  res.status(200).json({ data });
};

exports.deleteTrcLocation = (req, res) => {
  if (!ensureRole(req, res, 'trc')) return;

  const userId = String(req.user?.id || '');
  const existed = trcLocationStore.delete(userId);

  res.status(200).json({ message: 'Lokasi TRC dihapus.', removed: existed });
};
