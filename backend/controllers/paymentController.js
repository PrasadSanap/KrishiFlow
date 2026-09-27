const asyncHandler = require('../utils/asyncHandler');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const { generateTransactionId } = require('../utils/generateIds');
const { notify } = require('../services/notificationService');

const broadcast = async (req, booking, payment) => {
  const io = req.app.get('io');
  if (!io) return;
  io.to(`user:${booking.farmer}`).emit('paymentUpdated', payment);
  io.to(`centre:${booking.centre}`).emit('paymentUpdated', payment);
  io.to(`user:${booking.farmer}`).emit('bookingUpdated', booking);
};

// @desc    Get payment details for a booking
// @route   GET /api/payments/:bookingId
// @access  Private
const getPaymentByBooking = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ booking: req.params.bookingId }).populate('procurement');
  if (!payment) {
    res.status(404);
    throw new Error('Payment record not found for this booking');
  }
  res.json({ success: true, data: payment });
});

// @desc    Move payment to PROCESSING
// @route   PATCH /api/payments/:bookingId/process
// @access  Private (centre)
const processPayment = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (booking.status !== 'PROCUREMENT_COMPLETED') {
    res.status(400);
    throw new Error('Procurement must be completed before processing payment');
  }

  const payment = await Payment.findOne({ booking: booking._id });
  if (!payment) {
    res.status(404);
    throw new Error('Payment record not found');
  }

  payment.status = 'PROCESSING';
  await payment.save();

  booking.status = 'PAYMENT_PROCESSING';
  await booking.save();

  await notify({
    userId: booking.farmer,
    title: 'Payment Processing',
    message: `Your payment of ₹${payment.amount} is now being processed.`,
    type: 'PAYMENT',
    relatedBooking: booking._id,
  });

  await broadcast(req, booking, payment);
  res.json({ success: true, data: payment });
});

// @desc    Mark payment as COMPLETED and generate a demo transaction ID
// @route   PATCH /api/payments/:bookingId/complete
// @access  Private (centre)
const completePayment = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (booking.status !== 'PAYMENT_PROCESSING') {
    res.status(400);
    throw new Error('Payment must be in PROCESSING status before it can be completed');
  }

  const payment = await Payment.findOne({ booking: booking._id });
  if (!payment) {
    res.status(404);
    throw new Error('Payment record not found');
  }

  payment.status = 'COMPLETED';
  payment.transactionId = generateTransactionId();
  payment.paymentDate = new Date();
  await payment.save();

  booking.status = 'PAYMENT_COMPLETED';
  await booking.save();

  await notify({
    userId: booking.farmer,
    title: 'Payment Completed',
    message: `₹${payment.amount} has been credited. Transaction ID: ${payment.transactionId}. (Simulated prototype payment)`,
    type: 'PAYMENT',
    relatedBooking: booking._id,
  });

  await broadcast(req, booking, payment);
  res.json({ success: true, data: payment });
});

module.exports = { getPaymentByBooking, processPayment, completePayment };
