const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const trcLocationController = require('../controllers/trcLocationController');

router.post('/location', auth, trcLocationController.postTrcLocation);
router.delete('/location', auth, trcLocationController.deleteTrcLocation);

module.exports = router;
