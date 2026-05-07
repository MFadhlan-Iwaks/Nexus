const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const faskesController = require('../controllers/faskesController');

router.get('/', auth, requireRole('admin', 'operator'), faskesController.getFaskes);
router.post('/', auth, requireRole('operator'), faskesController.createFaskes);
router.patch('/:id', auth, requireRole('operator'), faskesController.updateFaskes);
router.delete('/:id', auth, requireRole('operator'), faskesController.deleteFaskes);

module.exports = router;
