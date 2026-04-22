const pool = require('../config/db');

exports.getPeringatanDini = async (req, res) => {
  try {
    // Mengambil 5 peringatan terbaru berdasarkan waktu_kirim
    const query = `
      SELECT id_peringatan, pesan_peringatan, waktu_kirim 
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