const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const logistikController = require('../controllers/logistikController');

router.get('/', auth, logistikController.getLogistik);
router.post('/', auth, logistikController.createLogistik);
router.patch('/:id', auth, logistikController.updateLogistik);
router.delete('/:id', auth, logistikController.deleteLogistik);

module.exports = router;
