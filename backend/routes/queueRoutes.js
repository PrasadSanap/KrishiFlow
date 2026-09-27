const express = require('express');
const {
  getCentreQueueHandler,
  getBookingQueueInfo,
  callNextFarmer,
} = require('../controllers/queueController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/booking/:bookingId', protect, getBookingQueueInfo);
router.get('/:centreId', getCentreQueueHandler);
router.patch('/:bookingId/call', protect, authorize('centre', 'admin'), callNextFarmer);

module.exports = router;
