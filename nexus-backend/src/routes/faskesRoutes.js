const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const faskesController = require('../controllers/faskesController');

router.get('/', auth, faskesController.getFaskes);
router.post('/', auth, faskesController.createFaskes);
router.patch('/:id', auth, faskesController.updateFaskes);

module.exports = router;
