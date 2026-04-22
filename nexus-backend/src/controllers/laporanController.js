const pool = require('../config/db');

exports.buatLaporan = async (req, res) => {
  try {
    const { kategori_bencana, deskripsi_kejadian, longitude, latitude } = req.body;
    const id_user = req.user.id; 
    
    // Ambil nama file dari multer (jika ada file yang diunggah)
    const bukti_visual = req.file ? req.file.filename : null;

    if (!longitude || !latitude) {
        return res.status(400).json({ message: "Koordinat lokasi wajib diisi!" });
    }

    const query = `
      INSERT INTO laporan_bencana (id_user, kategori_bencana, deskripsi_kejadian, koordinat, bukti_visual, status)
      VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), $6, 'Menunggu')
      RETURNING id_laporan, kategori_bencana, status;
    `;

    const result = await pool.query(query, [
        id_user, kategori_bencana, deskripsi_kejadian, longitude, latitude, bukti_visual
    ]);
    
    res.status(201).json({ message: "Laporan berhasil dikirim!", data: result.rows[0] });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Terjadi kesalahan pada server saat menyimpan laporan." });
  }
};

exports.getRiwayatLaporan = async (req, res) => {
  try {
    const id_user = req.user.id; // Didapat dari token authMiddleware

    // Query untuk mengambil data, diurutkan dari yang paling baru (DESC)
    const query = `
      SELECT id_laporan, kategori_bencana, deskripsi_kejadian, status, waktu_laporan, bukti_visual
      FROM laporan_bencana 
      WHERE id_user = $1
      ORDER BY waktu_laporan DESC;
    `;

    const result = await pool.query(query, [id_user]);
    
    res.status(200).json({ 
        message: "Berhasil mengambil riwayat", 
        data: result.rows 
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Terjadi kesalahan saat mengambil data riwayat." });
  }
};