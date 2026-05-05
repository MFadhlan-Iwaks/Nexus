const pool = require('../config/db');

exports.getPeringatanDini = async (req, res) => {
  try {
    // Mengambil 5 peringatan terbaru berdasarkan waktu_kirim
    const query = `
      SELECT id_peringatan, id_user_admin, pesan_peringatan, level, target, zona_bahaya, pengirim, waktu_kirim 
      FROM peringatan_dini 
      ORDER BY waktu_kirim DESC 
      LIMIT 5;
    `;
    const result = await pool.query(query);

    res.status(200).json({
      message: "Berhasil mengambil peringatan dini",
      data: result.rows
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error saat mengambil peringatan dini" });
  }
};

exports.createPeringatanDini = async (req, res) => {
  try {
    const role = String(req.user?.role || '').toLowerCase();
    if (role !== 'admin') {
      return res.status(403).json({ message: 'Akses hanya untuk admin.' });
    }

    const { pesan_peringatan, level, target, pengirim, zona_bahaya } = req.body;
    const id_user_admin = req.user?.id || null;

    const zonaText = typeof zona_bahaya === 'string' ? zona_bahaya.trim() : '';
    const isValidWkt = zonaText.startsWith('POINT(') || zonaText.startsWith('POLYGON(') || zonaText.startsWith('MULTIPOLYGON(') || zonaText.startsWith('LINESTRING(') || zonaText.startsWith('SRID=');
    const zonaValue = isValidWkt ? zonaText : null;

    if (!pesan_peringatan) {
      return res.status(400).json({ message: "Pesan peringatan wajib diisi." });
    }

    const query = `
      INSERT INTO peringatan_dini (id_user_admin, pesan_peringatan, level, target, zona_bahaya, pengirim)
      VALUES ($1, $2, $3, $4,
        CASE WHEN $5::text IS NULL THEN NULL ELSE ST_GeomFromText($5::text, 4326) END,
        $6
      )
      RETURNING id_peringatan, id_user_admin, pesan_peringatan, level, target, zona_bahaya, pengirim, waktu_kirim;
    `;

    const result = await pool.query(query, [
      id_user_admin,
      pesan_peringatan,
      level || 'sedang',
      target || '-',
      zonaValue,
      pengirim || 'BPBD',
    ]);

    res.status(201).json({
      message: 'Peringatan dini berhasil dibuat.',
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error saat membuat peringatan dini' });
  }
};

exports.deletePeringatanDini = async (req, res) => {
  try {
    const role = String(req.user?.role || '').toLowerCase();
    if (role !== 'admin') {
      return res.status(403).json({ message: 'Akses hanya untuk admin.' });
    }

    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM peringatan_dini WHERE id_peringatan = $1 RETURNING id_peringatan',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Peringatan tidak ditemukan.' });
    }

    res.status(200).json({ message: 'Peringatan berhasil dihapus.', data: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error saat menghapus peringatan dini' });
  }
};