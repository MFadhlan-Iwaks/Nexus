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

    res.status(201).json({
      message: 'Faskes berhasil ditambahkan.',
      data: result.rows[0],
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

    const result = await pool.query(query, [
      kapasitas_tersedia !== undefined ? Number(kapasitas_tersedia) : null,
      point ? point.lon : null,
      point ? point.lat : null,
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Faskes tidak ditemukan.' });
    }

    res.status(200).json({
      message: 'Faskes berhasil diperbarui.',
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error saat memperbarui faskes' });
  }
};
