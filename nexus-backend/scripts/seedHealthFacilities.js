const pool = require('../src/config/db');

const healthFacilities = [
  {
    nama: 'RSUD dr. Soekardjo',
    kategori: 'Rumah Sakit',
    wilayah: 'Kota Tasikmalaya',
    latitude: -7.327,
    longitude: 108.22,
    kapasitas_tersedia: 12,
    unit: 'Bed',
  },
  {
    nama: 'Puskesmas Tawang',
    kategori: 'Puskesmas',
    wilayah: 'Kota Tasikmalaya',
    latitude: -7.331,
    longitude: 108.224,
    kapasitas_tersedia: 4,
    unit: 'Bed',
  },
  {
    nama: 'Klinik Pratama Contoh',
    kategori: 'Klinik',
    wilayah: 'Kota Tasikmalaya',
    latitude: -7.325,
    longitude: 108.217,
    kapasitas_tersedia: 2,
    unit: 'Bed',
  },
];

async function findOrCreateInstitution(client, facility) {
  const existing = await client.query(
    'SELECT id_instansi FROM instansi WHERE LOWER(nama_instansi) = LOWER($1) LIMIT 1',
    [facility.nama]
  );

  if (existing.rows.length > 0) return existing.rows[0].id_instansi;

  const created = await client.query(
    `INSERT INTO instansi (nama_instansi, alamat_kantor)
     VALUES ($1, $2)
     RETURNING id_instansi`,
    [facility.nama, facility.wilayah]
  );

  return created.rows[0].id_instansi;
}

async function findOperatorForInstitution(client, idInstansi) {
  const matching = await client.query(
    `SELECT id_user
     FROM users
     WHERE LOWER(role::text) = 'operator'
       AND id_instansi = $1
     ORDER BY created_at ASC NULLS LAST, id_user ASC
     LIMIT 1`,
    [idInstansi]
  );

  if (matching.rows.length > 0) return matching.rows[0].id_user;

  const fallback = await client.query(
    `SELECT id_user
     FROM users
     WHERE LOWER(role::text) = 'operator'
     ORDER BY created_at ASC NULLS LAST, id_user ASC
     LIMIT 1`
  );

  return fallback.rows[0]?.id_user || null;
}

async function upsertFacility(client, facility) {
  const idInstansi = await findOrCreateInstitution(client, facility);
  const idOperator = await findOperatorForInstitution(client, idInstansi);

  const existing = await client.query(
    'SELECT id_faskes FROM fasilitas_kesehatan WHERE LOWER(nama_instansi_medis) = LOWER($1) LIMIT 1',
    [facility.nama]
  );

  const values = [
    idInstansi,
    idOperator,
    facility.nama,
    facility.kategori,
    facility.unit,
    Number(facility.kapasitas_tersedia || 0),
    facility.longitude,
    facility.latitude,
  ];

  if (existing.rows.length > 0) {
    const updated = await client.query(
      `UPDATE fasilitas_kesehatan
       SET id_instansi = $1,
           id_user_operator = $2,
           nama_instansi_medis = $3,
           kategori = $4,
           unit = $5,
           kapasitas_tersedia = $6,
           koordinat = ST_SetSRID(ST_MakePoint($7, $8), 4326)
       WHERE id_faskes = $9
       RETURNING id_faskes, nama_instansi_medis`,
      [...values, existing.rows[0].id_faskes]
    );

    return { action: 'updated', row: updated.rows[0] };
  }

  const inserted = await client.query(
    `INSERT INTO fasilitas_kesehatan
       (id_instansi, id_user_operator, nama_instansi_medis, kategori, unit, kapasitas_tersedia, koordinat)
     VALUES
       ($1, $2, $3, $4, $5, $6, ST_SetSRID(ST_MakePoint($7, $8), 4326))
     RETURNING id_faskes, nama_instansi_medis`,
    values
  );

  return { action: 'inserted', row: inserted.rows[0] };
}

async function main() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const results = [];
    for (const facility of healthFacilities) {
      results.push(await upsertFacility(client, facility));
    }

    await client.query('COMMIT');

    const inserted = results.filter((result) => result.action === 'inserted').length;
    const updated = results.filter((result) => result.action === 'updated').length;
    console.log(`Seed fasilitas kesehatan selesai. Inserted: ${inserted}, updated: ${updated}.`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seed fasilitas kesehatan gagal:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
