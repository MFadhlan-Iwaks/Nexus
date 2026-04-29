const pool = require('../config/db');

exports.getPeringatanDini = async (req, res) => {
  try {
    // Mengambil 5 peringatan terbaru berdasarkan waktu_kirim
    const query = `
      SELECT id_peringatan, pesan_peringatan, level, target, pengirim, waktu_kirim 
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
    const { pesan_peringatan, level, target, pengirim } = req.body;

    if (!pesan_peringatan) {
      return res.status(400).json({ message: "Pesan peringatan wajib diisi." });
    }

    const query = `
      INSERT INTO peringatan_dini (pesan_peringatan, level, target, pengirim)
      VALUES ($1, $2, $3, $4)
      RETURNING id_peringatan, pesan_peringatan, level, target, pengirim, waktu_kirim;
    `;

    const result = await pool.query(query, [
      pesan_peringatan,
      level || 'sedang',
      target || '-',
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