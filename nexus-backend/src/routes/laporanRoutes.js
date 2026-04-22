const express = require('express');
const router = express.Router();
const laporanController = require('../controllers/laporanController');
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // 1. Tambahkan modul File System bawaan Node.js

// 2. Logika untuk membuat folder 'uploads' secara otomatis jika belum ada
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Konfigurasi tempat penyimpanan foto
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // 3. Arahkan ke variabel folder yang sudah dipastikan ada
  },
  filename: function (req, file, cb) {
    // Nama file: timestamp + ekstensi asli (contoh: 169812345.jpg)
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Route dengan tambahan middleware upload file
router.post('/tambah', auth, upload.single('bukti_visual'), laporanController.buatLaporan);
// Tambahkan baris ini di bawah route POST /tambah yang sudah ada
router.get('/riwayat', auth, laporanController.getRiwayatLaporan);

module.exports = router;