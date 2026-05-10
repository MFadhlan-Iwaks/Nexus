const pool = require('../config/db');

function normalizeCoordinate(value, min, max) {
  if (value === null || value === undefined || String(value).trim() === '') return null;

  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) return null;

  return number;
}

function normalizeText(value) {
  const text = String(value || '').trim();
  return text || null;
}

function toBoolean(value) {
  if (value === true || value === 'true' || value === 1 || value === '1') return true;
  if (value === false || value === 'false' || value === 0 || value === '0') return false;
  return null;
}

exports.buatLaporan = async (req, res) => {
  try {
    const { kategori_bencana, deskripsi_kejadian, longitude, latitude } = req.body;
    const id_user = req.user.id;
    const bukti_visual = req.file ? req.file.filename : null;
    const kategori = normalizeText(kategori_bencana);
    const deskripsi = normalizeText(deskripsi_kejadian);
    const lon = normalizeCoordinate(longitude, -180, 180);
    const lat = normalizeCoordinate(latitude, -90, 90);

    if (!kategori || !deskripsi) {
      return res.status(400).json({ message: "Kategori bencana dan deskripsi kejadian wajib diisi." });
    }

    if (lon === null || lat === null) {
        return res.status(400).json({ message: "Koordinat lokasi wajib diisi dengan angka latitude/longitude yang valid." });
    }

    const query = `
      INSERT INTO laporan_bencana (id_user, kategori_bencana, deskripsi_kejadian, koordinat, bukti_visual, status)
      VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), $6, 'Menunggu')
      RETURNING id_laporan, kategori_bencana, status;
    `;

    const result = await pool.query(query, [
        id_user, kategori, deskripsi, lon, lat, bukti_visual
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


exports.updateProgressLaporan = async (req, res) => {
  try {
    const { id_laporan } = req.params;
    const { status, fase_penanganan, pesan_situasi } = req.body;
    const id_user_trc = req.user.id;
    const foto_progress = req.file ? req.file.filename : null;
    const nextStatus = normalizeText(status);
    const nextFase = normalizeText(fase_penanganan);

    if (!nextStatus || !nextFase) {
      return res.status(400).json({ message: "Status dan fase penanganan wajib diisi." });
    }

    let queryUpdate = `UPDATE laporan_bencana SET status = $1, fase_penanganan = $2`;
    let params = [nextStatus, nextFase, id_laporan];

    if (foto_progress) {
      queryUpdate += `, foto_progress = $4`;
      params.push(foto_progress);
    }
    queryUpdate += ` WHERE id_laporan = $3 RETURNING id_laporan, status, fase_penanganan, foto_progress`;

    const updated = await pool.query(queryUpdate, params);
    if (updated.rows.length === 0) {
      return res.status(404).json({ message: "Laporan tidak ditemukan." });
    }

    if (String(pesan_situasi || '').trim()) {
      await pool.query(
        `INSERT INTO sitrep_laporan (id_laporan, id_user_trc, pesan_situasi)
         SELECT l.id_laporan, $2, $3
         FROM laporan_bencana l
         WHERE l.id_laporan = $1`,
        [id_laporan, id_user_trc, String(pesan_situasi).trim()]
      );
    }

    res.status(200).json({ message: "Update progress berhasil!", data: updated.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Gagal memperbarui progres.", error: err.message });
  }
};

exports.getAllLaporan = async (req, res) => {
  try {

    const query = `
      SELECT l.id_laporan, l.kategori_bencana, l.deskripsi_kejadian, l.status,
             l.waktu_laporan, l.bukti_visual, l.fase_penanganan, l.foto_progress,
             l.keterangan_validasi, l.foto_validasi,
             ST_Y(l.koordinat::geometry) AS latitude,
             ST_X(l.koordinat::geometry) AS longitude,
             u.nama_lengkap, u.no_hp,
             v.id_user_trc, v.skala_darurat, v.waktu_validasi,
             ut.nama_lengkap AS nama_trc,
             s.pesan_situasi, s.waktu_update
      FROM laporan_bencana l
      LEFT JOIN users u ON l.id_user = u.id_user
      LEFT JOIN LATERAL (
        SELECT id_user_trc, skala_darurat, waktu_validasi
        FROM validasi_trc
        WHERE id_laporan = l.id_laporan
        ORDER BY waktu_validasi DESC
        LIMIT 1
      ) v ON true
      LEFT JOIN users ut ON ut.id_user = v.id_user_trc
      LEFT JOIN LATERAL (
        SELECT pesan_situasi, waktu_update
        FROM sitrep_laporan
        WHERE id_laporan = l.id_laporan
        ORDER BY waktu_update DESC
        LIMIT 1
      ) s ON true
      ORDER BY l.waktu_laporan DESC;
    `;

    const result = await pool.query(query);
    res.status(200).json({ data: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Gagal mengambil data laporan global." });
  }
};

exports.validasiLaporan = async (req, res) => {
  try {
    const { id_laporan } = req.params;
    const { is_valid, keterangan, skala_darurat } = req.body; 

    const foto_validasi = req.file ? req.file.filename : null;

    const isValid = toBoolean(is_valid);
    const id_user_trc = req.user.id;

    if (isValid === null) {
      return res.status(400).json({ message: "Status validasi wajib bernilai true atau false." });
    }

    let status_baru = '';
    let fase_baru = '';

    if (isValid) {
      status_baru = 'Diproses';
      fase_baru = 'Persiapan Menuju Lokasi'; 
    } else {
      status_baru = 'Ditolak';
      fase_baru = 'Laporan Palsu/Hoax';
    }

    const updated = await pool.query(
      `UPDATE laporan_bencana 
       SET status = $1, fase_penanganan = $2, keterangan_validasi = $3, foto_validasi = $4
      WHERE id_laporan = $5
      RETURNING id_laporan`,
      [status_baru, fase_baru, normalizeText(keterangan), foto_validasi, id_laporan]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ message: "Laporan tidak ditemukan." });
    }

    await pool.query(
      `INSERT INTO validasi_trc (id_laporan, id_user_trc, skala_darurat, waktu_validasi)
       SELECT l.id_laporan, $2, $3, NOW()
       FROM laporan_bencana l
      WHERE l.id_laporan = $1`,
      [id_laporan, id_user_trc, skala_darurat || null]
    );

    res.status(200).json({ 
      message: isValid ? "Laporan divalidasi dan masuk ke Tugas Aktif." : "Laporan ditandai sebagai Hoax." 
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Gagal memvalidasi laporan." });
  }
};
