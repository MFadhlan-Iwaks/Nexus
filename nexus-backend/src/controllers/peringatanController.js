const pool = require('../config/db');

async function getOptionalPeringatanColumns() {
  const result = await pool.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_name = 'peringatan_dini'
       AND column_name IN ('radius_meter', 'nama_zona')`
  );
  return new Set(result.rows.map((row) => row.column_name));
}

exports.getPeringatanDini = async (req, res) => {
  try {
    const optionalColumns = await getOptionalPeringatanColumns();
    const optionalSelect = [
      optionalColumns.has('radius_meter') ? 'radius_meter' : 'NULL::integer AS radius_meter',
      optionalColumns.has('nama_zona') ? 'nama_zona' : 'NULL::text AS nama_zona',
    ].join(', ');

    // Mengambil 5 peringatan terbaru berdasarkan waktu_kirim
    const query = `
      SELECT id_peringatan, id_user_admin, pesan_peringatan, level, target, zona_bahaya,
             ${optionalSelect}, pengirim, waktu_kirim
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
    const role = String(req.user?.role || '').toLowerCase();
    if (role !== 'admin') {
      return res.status(403).json({ message: 'Akses hanya untuk admin.' });
    }

    const { pesan_peringatan, level, target, pengirim, zona_bahaya, radius_meter, nama_zona } = req.body;
    const id_user_admin = req.user?.id || null;
    const optionalColumns = await getOptionalPeringatanColumns();

    const zonaText = typeof zona_bahaya === 'string' ? zona_bahaya.trim() : '';
    const isValidWkt = zonaText.startsWith('POINT(') || zonaText.startsWith('POLYGON(') || zonaText.startsWith('MULTIPOLYGON(') || zonaText.startsWith('LINESTRING(') || zonaText.startsWith('SRID=');
    const zonaValue = isValidWkt ? zonaText : null;

    if (!pesan_peringatan) {
      return res.status(400).json({ message: "Pesan peringatan wajib diisi." });
    }

    const columns = ['id_user_admin', 'pesan_peringatan', 'level', 'target', 'zona_bahaya', 'pengirim'];
    const values = [
      id_user_admin,
      pesan_peringatan,
      level || 'sedang',
      target || '-',
      zonaValue,
      pengirim || 'BPBD',
    ];
    const placeholders = ['$1', '$2', '$3', '$4', 'CASE WHEN $5::text IS NULL THEN NULL ELSE ST_GeomFromText($5::text, 4326) END', '$6'];
    const returning = ['id_peringatan', 'id_user_admin', 'pesan_peringatan', 'level', 'target', 'zona_bahaya', 'pengirim', 'waktu_kirim'];

    if (optionalColumns.has('radius_meter')) {
      columns.push('radius_meter');
      values.push(radius_meter === undefined || radius_meter === null ? null : Number(radius_meter));
      placeholders.push(`$${values.length}`);
      returning.push('radius_meter');
    }

    if (optionalColumns.has('nama_zona')) {
      columns.push('nama_zona');
      values.push(nama_zona || null);
      placeholders.push(`$${values.length}`);
      returning.push('nama_zona');
    }

    const query = `
      INSERT INTO peringatan_dini (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING ${returning.join(', ')};
    `;

    const result = await pool.query(query, values);

    res.status(201).json({
      message: 'Peringatan dini berhasil dibuat.',
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error saat membuat peringatan dini' });
  }
};

exports.deletePeringatanDini = async (req, res) => {
  try {
    const role = String(req.user?.role || '').toLowerCase();
    if (role !== 'admin') {
      return res.status(403).json({ message: 'Akses hanya untuk admin.' });
    }

    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM peringatan_dini WHERE id_peringatan = $1 RETURNING id_peringatan',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Peringatan tidak ditemukan.' });
    }

    res.status(200).json({ message: 'Peringatan berhasil dihapus.', data: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error saat menghapus peringatan dini' });
  }
};
