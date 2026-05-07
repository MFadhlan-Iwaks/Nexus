const pool = require('../src/config/db');

async function main() {
  try {
    await pool.query('BEGIN');
    await pool.query('CREATE SEQUENCE IF NOT EXISTS sitrep_laporan_id_sitrep_seq');
    await pool.query(`
      SELECT setval(
        'sitrep_laporan_id_sitrep_seq',
        COALESCE((SELECT MAX(id_sitrep) FROM sitrep_laporan), 0) + 1,
        false
      )
    `);
    await pool.query(`
      ALTER TABLE sitrep_laporan
      ALTER COLUMN id_sitrep SET DEFAULT nextval('sitrep_laporan_id_sitrep_seq')
    `);
    await pool.query(`
      ALTER SEQUENCE sitrep_laporan_id_sitrep_seq
      OWNED BY sitrep_laporan.id_sitrep
    `);
    await pool.query('COMMIT');
    console.log('Default sequence id_sitrep berhasil dipasang.');
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Gagal memasang default sequence id_sitrep:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
