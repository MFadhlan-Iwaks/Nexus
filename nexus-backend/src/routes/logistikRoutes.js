const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const logistikController = require('../controllers/logistikController');

router.get('/', auth, requireRole('admin', 'operator'), logistikController.getLogistik);
router.post('/', auth, requireRole('operator'), logistikController.createLogistik);
router.patch('/:id', auth, requireRole('operator'), logistikController.updateLogistik);
router.delete('/:id', auth, requireRole('operator'), logistikController.deleteLogistik);

module.exports = router;
