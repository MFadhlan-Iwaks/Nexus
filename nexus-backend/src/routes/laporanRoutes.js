const express = require('express');
const router = express.Router();
const laporanController = require('../controllers/laporanController');
const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedImageExt = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const allowedImageMime = new Set(['image/jpeg', 'image/png', 'image/webp']);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedImageExt.has(ext) || !allowedImageMime.has(file.mimetype)) {
      return cb(new Error('File bukti harus berupa gambar JPG, PNG, atau WEBP.'));
    }
    cb(null, true);
  },
});

function handleUpload(fieldName) {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (!err) return next();

      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Ukuran gambar maksimal 5MB.' });
      }

      return res.status(400).json({ message: err.message || 'Gagal mengunggah gambar.' });
    });
  };
}

router.post('/tambah', auth, requireRole('masyarakat'), handleUpload('bukti_visual'), laporanController.buatLaporan);
router.get('/riwayat', auth, requireRole('masyarakat'), laporanController.getRiwayatLaporan);
router.get('/all', auth, requireRole('admin', 'trc'), laporanController.getAllLaporan);
router.patch('/update/:id_laporan', auth, requireRole('trc'), handleUpload('foto_progress'), laporanController.updateProgressLaporan);
router.patch('/validasi/:id_laporan', auth, requireRole('trc'), handleUpload('foto_validasi'), laporanController.validasiLaporan);

module.exports = router;
