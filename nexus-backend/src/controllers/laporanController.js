const pool = require('../config/db');

exports.buatLaporan = async (req, res) => {
  try {
    const { kategori_bencana, deskripsi_kejadian, longitude, latitude } = req.body;
    const id_user = req.user.id;
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
    const id_user = req.user.id;
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

// Fungsi Update Status & Fase (Untuk TRC)
exports.updateProgressLaporan = async (req, res) => {
  try {
    const { id_laporan } = req.params;
    const { status, fase_penanganan, pesan_situasi } = req.body;
    const id_user_trc = req.user.id;
    const foto_progress = req.file ? req.file.filename : null;

    // 1. Update Tabel Utama
    let queryUpdate = `UPDATE laporan_bencana SET status = $1, fase_penanganan = $2`;
    let params = [status, fase_penanganan, id_laporan];

    if (foto_progress) {
      queryUpdate += `, foto_progress = $4`;
      params.push(foto_progress);
    }
    queryUpdate += ` WHERE id_laporan = $3`;

    await pool.query(queryUpdate, params);

    // 2. Simpan ke Histori Sitrep jika ada pesan situasi
    if (pesan_situasi) {
      await pool.query(
        `INSERT INTO sitrep_laporan (id_laporan, id_user_trc, pesan_situasi) VALUES ($1, $2, $3)`,
        [id_laporan, id_user_trc, pesan_situasi]
      );
    }

    res.status(200).json({ message: "Update progress berhasil!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllLaporan = async (req, res) => {
  try {
    // Kita lakukan JOIN dengan tabel users agar TRC tahu nama & No HP pelapor
    const query = `
      SELECT l.id_laporan, l.kategori_bencana, l.deskripsi_kejadian, l.status, 
             l.waktu_laporan, l.bukti_visual, l.fase_penanganan, l.foto_progress,
             ST_Y(l.koordinat::geometry) AS latitude,
             ST_X(l.koordinat::geometry) AS longitude,
             u.nama_lengkap, u.no_hp
      FROM laporan_bencana l
      JOIN users u ON l.id_user = u.id_user
      ORDER BY l.waktu_laporan DESC;
    `;
    
    const result = await pool.query(query);
    res.status(200).json({ data: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Gagal mengambil data laporan global." });
  }
};
// Fungsi Khusus untuk Validasi Laporan (Benar / Hoax)
exports.validasiLaporan = async (req, res) => {
  try {
    const { id_laporan } = req.params;
    const { is_valid, keterangan } = req.body; 
    // is_valid: boolean (true jika benar, false jika hoax)

    let status_baru = '';
    let fase_baru = '';

    if (is_valid === true) {
      status_baru = 'Diproses';
      fase_baru = 'Persiapan Menuju Lokasi'; // Otomatis masuk ke fase awal penanganan
    } else {
      status_baru = 'Ditolak';
      fase_baru = 'Laporan Palsu/Hoax';
    }

    await pool.query(
      `UPDATE laporan_bencana 
       SET status = $1, fase_penanganan = $2, keterangan_validasi = $3 
       WHERE id_laporan = $4`,
      [status_baru, fase_baru, keterangan || null, id_laporan]
    );

    res.status(200).json({ 
        message: is_valid ? "Laporan divalidasi dan masuk ke Tugas Aktif." : "Laporan ditandai sebagai Hoax." 
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Gagal memvalidasi laporan." });
  }
};