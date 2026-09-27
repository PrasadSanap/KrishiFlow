const express = require('express');
const {
  getStats,
  getAllBookings,
  getAllPayments,
  getAllFarmers,
  getAllCentres,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, authorize('admin'));
router.get('/stats', getStats);
router.get('/bookings', getAllBookings);
router.get('/payments', getAllPayments);
router.get('/farmers', getAllFarmers);
router.get('/centres', getAllCentres);

module.exports = router;
