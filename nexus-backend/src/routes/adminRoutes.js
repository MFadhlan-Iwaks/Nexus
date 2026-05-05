const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');
const trcLocationController = require('../controllers/trcLocationController');

router.get('/stats', auth, adminController.getAdminStats);
router.get('/users', auth, adminController.getUsers);
router.patch('/users/:id/role', auth, adminController.updateUserRole);
router.delete('/users/:id', auth, adminController.deleteUser);
router.get('/trc', auth, adminController.getTrcMonitoring);
router.get('/trc-locations', auth, trcLocationController.getTrcLocations);
router.get('/logistik/summary', auth, adminController.getLogisticSummary);
router.get('/faskes/summary', auth, adminController.getFaskesSummary);

module.exports = router;
