const pool = require('../config/db');

function ensureOperator(req, res) {
  const role = String(req.user?.role || '').toLowerCase();
  if (role !== 'operator') {
    res.status(403).json({ message: 'Akses hanya untuk operator.' });
    return false;
  }
  return true;
}

exports.getStockHistory = async (req, res) => {
  if (!ensureOperator(req, res)) return;
  try {
    const idUser = req.user.id;

    const query = `
      SELECT h.id_history AS id,
             h.waktu,
             u.nama_lengkap AS operator,
             h.nama_item,
             h.aksi,
             'logistik'::text AS tipe,
             h.stok_sebelum,
             h.stok_sesudah,
             h.unit,
             h.status
      FROM logistik_riwayat h
      LEFT JOIN users u ON u.id_user = h.id_user_operator
      WHERE h.id_user_operator = $1

      UNION ALL

      SELECT h.id_history AS id,
             h.waktu,
             u.nama_lengkap AS operator,
             h.nama_item,
             h.aksi,
             'faskes'::text AS tipe,
             h.kapasitas_sebelum AS stok_sebelum,
             h.kapasitas_sesudah AS stok_sesudah,
             h.unit,
             h.status
      FROM faskes_riwayat h
      LEFT JOIN users u ON u.id_user = h.id_user_operator
      WHERE h.id_user_operator = $1

      ORDER BY waktu DESC;
    `;

    const result = await pool.query(query, [idUser]);

    res.status(200).json({
      message: 'Berhasil mengambil riwayat operator.',
      data: result.rows,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error saat mengambil riwayat operator.' });
  }
};
