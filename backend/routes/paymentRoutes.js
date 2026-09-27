const express = require('express');
const {
  getPaymentByBooking,
  processPayment,
  completePayment,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:bookingId', protect, getPaymentByBooking);
router.patch('/:bookingId/process', protect, authorize('centre', 'admin'), processPayment);
router.patch('/:bookingId/complete', protect, authorize('centre', 'admin'), completePayment);

module.exports = router;
