const express = require('express');
const router = express.Router();
const peringatanController = require('../controllers/peringatanController');
const auth = require('../middleware/authMiddleware'); 
const { requireRole } = require('../middleware/roleMiddleware');


router.get('/', auth, peringatanController.getPeringatanDini);


router.post('/', auth, requireRole('admin'), peringatanController.createPeringatanDini);


router.delete('/:id', auth, requireRole('admin'), peringatanController.deletePeringatanDini);

module.exports = router;
