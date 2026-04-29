const express = require('express');
const router = express.Router();
const peringatanController = require('../controllers/peringatanController');
const auth = require('../middleware/authMiddleware'); // Menggunakan pelindung token

// Endpoint: GET /api/peringatan
// Hanya bisa diakses jika membawa Token JWT
router.get('/', auth, peringatanController.getPeringatanDini);

// Endpoint: POST /api/peringatan
// Hanya bisa diakses jika membawa Token JWT
router.post('/', auth, peringatanController.createPeringatanDini);

module.exports = router;