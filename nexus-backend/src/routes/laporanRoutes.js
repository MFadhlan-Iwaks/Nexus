const express = require('express');
const router = express.Router();
const laporanController = require('../controllers/laporanController');
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/tambah', auth, upload.single('bukti_visual'), laporanController.buatLaporan);
router.get('/riwayat', auth, laporanController.getRiwayatLaporan);
router.get('/all', auth, laporanController.getAllLaporan);
router.patch('/update/:id_laporan', auth, upload.single('foto_progress'), laporanController.updateProgressLaporan);
router.patch('/validasi/:id_laporan', auth, laporanController.validasiLaporan);

module.exports = router;