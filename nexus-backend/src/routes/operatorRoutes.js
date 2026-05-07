const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const operatorController = require('../controllers/operatorController');

router.get('/riwayat', auth, requireRole('operator'), operatorController.getStockHistory);

module.exports = router;
