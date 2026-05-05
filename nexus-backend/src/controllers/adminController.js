const pool = require('../config/db');

function ensureAdmin(req, res) {
  const role = String(req.user?.role || '').toLowerCase();
  if (role !== 'admin') {
    res.status(403).json({ message: 'Akses hanya untuk admin.' });
    return false;
  }
  return true;
}

function normalizeRole(role) {
  const r = String(role || '').toLowerCase();
  if (r === 'masyarakat') return 'Masyarakat';
  if (r === 'trc') return 'TRC';
  if (r === 'operator') return 'Operator';
  if (r === 'admin') return 'Admin';
  return null;
}

function getLogisticStatus(stok) {
  if (stok <= 0) return 'Habis';
  if (stok <= 100) return 'Menipis';
  return 'Aman';
}

function getFaskesStatus(kapasitas) {
  if (kapasitas <= 0) return 'Penuh';
  if (kapasitas <= 5) return 'Hampir Penuh';
  return 'Tersedia';
}

exports.getAdminStats = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const laporanQuery = `
      SELECT
        COUNT(*)::int AS total_laporan,
        COUNT(*) FILTER (WHERE LOWER(status::text) = 'menunggu')::int AS menunggu,
        COUNT(*) FILTER (WHERE LOWER(status::text) = 'diproses')::int AS diproses,
        COUNT(*) FILTER (WHERE LOWER(status::text) = 'selesai')::int AS selesai,
        COUNT(*) FILTER (WHERE LOWER(status::text) = 'ditolak')::int AS ditolak
      FROM laporan_bencana;
    `;

    const trcQuery = `
      SELECT COUNT(*)::int AS total_trc
      FROM users
      WHERE LOWER(role::text) = 'trc';
    `;

    const [laporanResult, trcResult] = await Promise.all([
      pool.query(laporanQuery),
      pool.query(trcQuery),
    ]);

    const laporan = laporanResult.rows[0] || {};
    const trc = trcResult.rows[0] || {};

    res.status(200).json({
      data: {
        totalLaporan: laporan.total_laporan || 0,
        menunggu: laporan.menunggu || 0,
        diproses: laporan.diproses || 0,
        selesai: laporan.selesai || 0,
        ditolak: laporan.ditolak || 0,
        totalTrcAktif: trc.total_trc || 0,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Gagal mengambil statistik admin.' });
  }
};

exports.getUsers = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const query = `
      SELECT u.id_user, u.id_instansi, u.nama_lengkap, u.no_hp, u.alamat, u.role,
             u.created_at, i.nama_instansi
      FROM users u
      LEFT JOIN instansi i ON i.id_instansi = u.id_instansi
      ORDER BY u.created_at ASC NULLS LAST, u.id_user ASC;
    `;

    const result = await pool.query(query);
    res.status(200).json({ data: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Gagal mengambil data pengguna.' });
  }
};

exports.updateUserRole = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const { id } = req.params;
    const { role } = req.body;
    const normalized = normalizeRole(role);

    if (!normalized) {
      return res.status(400).json({ message: 'Role tidak valid.' });
    }

    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id_user = $2 RETURNING id_user, role',
      [normalized, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    res.status(200).json({ message: 'Role berhasil diubah.', data: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Gagal mengubah role pengguna.' });
  }
};

exports.deleteUser = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM users WHERE id_user = $1 RETURNING id_user', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }
    res.status(200).json({ message: 'User berhasil dihapus.', data: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Gagal menghapus user.' });
  }
};

exports.getLogisticSummary = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const query = `
      SELECT l.id_instansi,
             i.nama_instansi,
             COUNT(l.id_logistik)::int AS total_items,
             COALESCE(SUM(l.jumlah_stok), 0)::int AS available_stock
      FROM logistik l
      LEFT JOIN instansi i ON i.id_instansi = l.id_instansi
      GROUP BY l.id_instansi, i.nama_instansi
      ORDER BY COUNT(l.id_logistik) DESC;
    `;

    const result = await pool.query(query);
    const data = result.rows.map((row) => ({
      id: row.id_instansi || row.nama_instansi || 'Umum',
      institution: row.nama_instansi || row.id_instansi || 'Umum',
      totalItems: row.total_items || 0,
      availableStock: row.available_stock || 0,
      status: getLogisticStatus(Number(row.available_stock || 0)),
    }));

    res.status(200).json({ data });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Gagal mengambil ringkasan logistik.' });
  }
};

exports.getFaskesSummary = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const query = `
      SELECT f.id_instansi,
             i.nama_instansi,
             COUNT(f.id_faskes)::int AS total_units,
             COALESCE(SUM(f.kapasitas_tersedia), 0)::int AS available_capacity
      FROM fasilitas_kesehatan f
      LEFT JOIN instansi i ON i.id_instansi = f.id_instansi
      GROUP BY f.id_instansi, i.nama_instansi
      ORDER BY COUNT(f.id_faskes) DESC;
    `;

    const result = await pool.query(query);
    const data = result.rows.map((row) => ({
      id: row.id_instansi || row.nama_instansi || 'Umum',
      institution: row.nama_instansi || row.id_instansi || 'Umum',
      totalUnits: row.total_units || 0,
      availableCapacity: row.available_capacity || 0,
      status: getFaskesStatus(Number(row.available_capacity || 0)),
    }));

    res.status(200).json({ data });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Gagal mengambil ringkasan faskes.' });
  }
};

exports.getTrcMonitoring = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const query = `
      SELECT u.id_user, u.nama_lengkap,
             s.id_laporan AS sitrep_laporan_id,
             s.pesan_situasi, s.waktu_update, s.status_laporan, s.fase_penanganan,
             v.id_laporan AS validasi_laporan_id,
             v.skala_darurat, v.waktu_validasi
      FROM users u
      LEFT JOIN LATERAL (
        SELECT sl.id_laporan, sl.pesan_situasi, sl.waktu_update,
               lb.status AS status_laporan, lb.fase_penanganan
        FROM sitrep_laporan sl
        JOIN laporan_bencana lb ON lb.id_laporan = sl.id_laporan
        WHERE sl.id_user_trc = u.id_user
        ORDER BY sl.waktu_update DESC
        LIMIT 1
      ) s ON true
      LEFT JOIN LATERAL (
        SELECT v.id_laporan, v.skala_darurat, v.waktu_validasi
        FROM validasi_trc v
        WHERE v.id_user_trc = u.id_user
        ORDER BY v.waktu_validasi DESC
        LIMIT 1
      ) v ON true
      WHERE LOWER(u.role::text) = 'trc'
      ORDER BY u.id_user DESC;
    `;

    const result = await pool.query(query);
    const data = result.rows.map((row) => {
      const waktuUpdate = row.waktu_update || row.waktu_validasi || null;
      const isActive = waktuUpdate
        ? (Date.now() - new Date(waktuUpdate).getTime()) <= 24 * 60 * 60 * 1000
        : false;

      const statusLaporan = String(row.status_laporan || '').toLowerCase();
      const laporanAktifId = statusLaporan && statusLaporan !== 'selesai' && statusLaporan !== 'ditolak'
        ? row.sitrep_laporan_id
        : null;

      return {
        id: row.id_user,
        nama: row.nama_lengkap,
        status: isActive ? 'aktif' : 'nonaktif',
        laporan_aktif_id: laporanAktifId || row.validasi_laporan_id || null,
        progres_terakhir: row.pesan_situasi || null,
        fase: row.fase_penanganan || null,
        waktu_update: waktuUpdate,
        lokasi_terakhir: null,
      };
    });

    res.status(200).json({ data });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Gagal mengambil monitoring TRC.' });
  }
};
