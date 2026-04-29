const pool = require('../config/db');

function toPoint(longitude, latitude) {
  if (longitude === null || latitude === null || longitude === undefined || latitude === undefined) return null;
  const lon = Number(longitude);
  const lat = Number(latitude);
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
  return { lon, lat };
}

exports.getLogistik = async (req, res) => {
  try {
    const query = `
      SELECT id_logistik, id_instansi, id_user_operator, nama_barang, kategori, unit,
             jumlah_stok,
             ST_Y(koordinat::geometry) AS latitude,
             ST_X(koordinat::geometry) AS longitude
      FROM logistik
      ORDER BY id_logistik DESC;
    `;
    const result = await pool.query(query);

    res.status(200).json({
      message: 'Berhasil mengambil data logistik',
      data: result.rows,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error saat mengambil logistik' });
  }
};

exports.createLogistik = async (req, res) => {
  try {
    const { id_instansi, nama_barang, kategori, unit, jumlah_stok, latitude, longitude } = req.body;
    const id_user_operator = req.user.id;

    if (!nama_barang) {
      return res.status(400).json({ message: 'Nama barang wajib diisi.' });
    }

    const point = toPoint(longitude, latitude);

    const query = `
      INSERT INTO logistik (id_instansi, id_user_operator, nama_barang, kategori, unit, jumlah_stok, koordinat)
      VALUES ($1, $2, $3, $4, $5, $6,
        CASE WHEN $7::double precision IS NULL OR $8::double precision IS NULL
          THEN NULL
          ELSE ST_SetSRID(ST_MakePoint($7, $8), 4326)
        END
      )
      RETURNING id_logistik, id_instansi, id_user_operator, nama_barang, kategori, unit,
                jumlah_stok,
                ST_Y(koordinat::geometry) AS latitude,
                ST_X(koordinat::geometry) AS longitude;
    `;

    const result = await pool.query(query, [
      id_instansi || null,
      id_user_operator,
      nama_barang,
      kategori || null,
      unit || null,
      Number(jumlah_stok || 0),
      point ? point.lon : null,
      point ? point.lat : null,
    ]);

    res.status(201).json({
      message: 'Logistik berhasil ditambahkan.',
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error saat menambah logistik' });
  }
};

exports.updateLogistik = async (req, res) => {
  try {
    const { id } = req.params;
    const { jumlah_stok, latitude, longitude } = req.body;

    const point = toPoint(longitude, latitude);

    const query = `
      UPDATE logistik
      SET jumlah_stok = COALESCE($1, jumlah_stok),
          koordinat = CASE
            WHEN $2::double precision IS NULL OR $3::double precision IS NULL THEN koordinat
            ELSE ST_SetSRID(ST_MakePoint($2, $3), 4326)
          END
      WHERE id_logistik = $4
      RETURNING id_logistik, id_instansi, id_user_operator, nama_barang, kategori, unit,
                jumlah_stok,
                ST_Y(koordinat::geometry) AS latitude,
                ST_X(koordinat::geometry) AS longitude;
    `;

    const result = await pool.query(query, [
      jumlah_stok !== undefined ? Number(jumlah_stok) : null,
      point ? point.lon : null,
      point ? point.lat : null,
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Logistik tidak ditemukan.' });
    }

    res.status(200).json({
      message: 'Logistik berhasil diperbarui.',
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error saat memperbarui logistik' });
  }
};
