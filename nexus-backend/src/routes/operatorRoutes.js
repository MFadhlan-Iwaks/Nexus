const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const operatorController = require('../controllers/operatorController');

router.get('/riwayat', auth, operatorController.getStockHistory);

module.exports = router;
