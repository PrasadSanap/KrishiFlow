const asyncHandler = require('../utils/asyncHandler');
const Booking = require('../models/Booking');
const { getCentreQueue, getQueueInfoForBooking, ACTIVE_STATUSES } = require('../services/queueService');
const { notify } = require('../services/notificationService');

// @desc    Get the live queue for a centre on a given date (defaults to today)
// @route   GET /api/queue/:centreId?date=YYYY-MM-DD
// @access  Public
const getCentreQueueHandler = asyncHandler(async (req, res) => {
  const { centreId } = req.params;
  const date = req.query.date || new Date().toISOString().slice(0, 10);

  const data = await getCentreQueue(centreId, date);
  res.json({ success: true, date, ...data });
});

// @desc    Get queue position/info for a specific booking
// @route   GET /api/queue/booking/:bookingId
// @access  Private
const getBookingQueueInfo = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  const queueInfo = await getQueueInfoForBooking(booking);
  res.json({ success: true, data: queueInfo });
});

// @desc    Call the next waiting farmer at a centre (moves them to ARRIVED... actually just flags as "called")
// @route   PATCH /api/queue/:bookingId/call
// @access  Private (centre)
const callNextFarmer = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId).populate('centre');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  if (booking.status !== 'BOOKED') {
    res.status(400);
    throw new Error('Only farmers with status BOOKED can be called next');
  }

  booking.status = 'ARRIVED';
  await booking.save();

  const io = req.app.get('io');
  const queueData = await getCentreQueue(booking.centre._id, booking.date);

  if (io) {
    io.to(`centre:${booking.centre._id}`).emit('farmerCalled', { bookingId: booking._id, token: booking.token });
    io.to(`centre:${booking.centre._id}`).emit('queueUpdated', queueData);
    io.to(`user:${booking.farmer}`).emit('bookingUpdated', booking);
  }

  await notify({
    userId: booking.farmer,
    title: "It's Your Turn!",
    message: `Please proceed to ${booking.centre.name}. Your token #${booking.token} has been called.`,
    type: 'QUEUE',
    relatedBooking: booking._id,
  });

  res.json({ success: true, data: booking });
});

module.exports = { getCentreQueueHandler, getBookingQueueInfo, callNextFarmer };
