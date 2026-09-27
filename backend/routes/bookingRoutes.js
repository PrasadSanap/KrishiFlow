const express = require('express');
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('farmer'), createBooking);
router.get('/my', protect, authorize('farmer'), getMyBookings);
router.get('/:id', protect, getBookingById);
router.patch('/:id/cancel', protect, authorize('farmer'), cancelBooking);

module.exports = router;
