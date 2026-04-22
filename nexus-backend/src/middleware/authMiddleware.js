const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Ambil token dari header request Frontend
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: "Akses ditolak, silakan login terlebih dahulu." });

  try {
    // Verifikasi token dengan kunci rahasia
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Menyimpan data user (id & role) untuk dipakai di controller
    next(); // Lanjut ke proses berikutnya
  } catch (err) {
    res.status(400).json({ message: "Token tidak valid atau sudah kedaluwarsa." });
  }
};