const pool = require('../config/db');

function toPoint(longitude, latitude) {
  if (longitude === null || latitude === null || longitude === undefined || latitude === undefined) return null;
  const lon = Number(longitude);
  const lat = Number(latitude);
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
  return { lon, lat };
}

exports.getFaskes = async (req, res) => {
  try {
    const query = `
      SELECT id_faskes, id_instansi, id_user_operator, nama_instansi_medis,
             kategori, unit, kapasitas_tersedia,
             ST_Y(koordinat::geometry) AS latitude,
             ST_X(koordinat::geometry) AS longitude
      FROM fasilitas_kesehatan
      ORDER BY id_faskes DESC;
    `;
    const result = await pool.query(query);

    res.status(200).json({
      message: 'Berhasil mengambil data faskes',
      data: result.rows,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error saat mengambil faskes' });
  }
};

exports.createFaskes = async (req, res) => {
  try {
    const { id_instansi, nama_instansi_medis, kategori, unit, kapasitas_tersedia, latitude, longitude } = req.body;
    const id_user_operator = req.user.id;

    if (!nama_instansi_medis) {
      return res.status(400).json({ message: 'Nama instansi medis wajib diisi.' });
    }

    const point = toPoint(longitude, latitude);

    const query = `
      INSERT INTO fasilitas_kesehatan (id_instansi, id_user_operator, nama_instansi_medis, kategori, unit, kapasitas_tersedia, koordinat)
      VALUES ($1, $2, $3, $4, $5, $6,
        CASE WHEN $7::double precision IS NULL OR $8::double precision IS NULL
          THEN NULL
          ELSE ST_SetSRID(ST_MakePoint($7, $8), 4326)
        END
      )
      RETURNING id_faskes, id_instansi, id_user_operator, nama_instansi_medis,
                kategori, unit, kapasitas_tersedia,
                ST_Y(koordinat::geometry) AS latitude,
                ST_X(koordinat::geometry) AS longitude;
    `;

    const result = await pool.query(query, [
      id_instansi || null,
      id_user_operator,
      nama_instansi_medis,
      kategori || null,
      unit || null,
      Number(kapasitas_tersedia || 0),
      point ? point.lon : null,
      point ? point.lat : null,
    ]);

    const created = result.rows[0];

    await pool.query(
      `INSERT INTO faskes_riwayat (id_faskes, id_user_operator, id_instansi, nama_item, aksi, kapasitas_sebelum, kapasitas_sesudah, unit, status)
       VALUES ($1, $2, $3, $4, 'add', $5, $6, $7, 'Sukses')`,
      [
        created.id_faskes,
        created.id_user_operator,
        created.id_instansi,
        created.nama_instansi_medis,
        null,
        created.kapasitas_tersedia,
        created.unit,
      ]
    );

    res.status(201).json({
      message: 'Faskes berhasil ditambahkan.',
      data: created,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error saat menambah faskes' });
  }
};

exports.updateFaskes = async (req, res) => {
  try {
    const { id } = req.params;
    const { kapasitas_tersedia, latitude, longitude } = req.body;

    const point = toPoint(longitude, latitude);

    const query = `
      UPDATE fasilitas_kesehatan
      SET kapasitas_tersedia = COALESCE($1, kapasitas_tersedia),
          koordinat = CASE
            WHEN $2::double precision IS NULL OR $3::double precision IS NULL THEN koordinat
            ELSE ST_SetSRID(ST_MakePoint($2, $3), 4326)
          END
      WHERE id_faskes = $4
      RETURNING id_faskes, id_instansi, id_user_operator, nama_instansi_medis,
                kategori, unit, kapasitas_tersedia,
                ST_Y(koordinat::geometry) AS latitude,
                ST_X(koordinat::geometry) AS longitude;
    `;

    const prev = await pool.query(
      'SELECT id_faskes, id_instansi, id_user_operator, nama_instansi_medis, unit, kapasitas_tersedia FROM fasilitas_kesehatan WHERE id_faskes = $1',
      [id]
    );

    if (prev.rows.length === 0) {
      return res.status(404).json({ message: 'Faskes tidak ditemukan.' });
    }

    const prevRow = prev.rows[0];

    const result = await pool.query(query, [
      kapasitas_tersedia !== undefined ? Number(kapasitas_tersedia) : null,
      point ? point.lon : null,
      point ? point.lat : null,
      id,
    ]);

    const updated = result.rows[0];

    await pool.query(
      `INSERT INTO faskes_riwayat (id_faskes, id_user_operator, id_instansi, nama_item, aksi, kapasitas_sebelum, kapasitas_sesudah, unit, status)
       VALUES ($1, $2, $3, $4, 'update', $5, $6, $7, 'Sukses')`,
      [
        updated.id_faskes,
        prevRow.id_user_operator,
        updated.id_instansi,
        updated.nama_instansi_medis,
        prevRow.kapasitas_tersedia,
        updated.kapasitas_tersedia,
        updated.unit,
      ]
    );

    res.status(200).json({
      message: 'Faskes berhasil diperbarui.',
      data: updated,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error saat memperbarui faskes' });
  }
};

exports.deleteFaskes = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM fasilitas_kesehatan
       WHERE id_faskes = $1
       RETURNING id_faskes, id_instansi, nama_instansi_medis, unit, kapasitas_tersedia`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Faskes tidak ditemukan.' });
    }

    res.status(200).json({
      message: 'Faskes berhasil dihapus.',
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error saat menghapus faskes' });
  }
};
