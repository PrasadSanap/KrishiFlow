const asyncHandler = require('../utils/asyncHandler');
const Booking = require('../models/Booking');
const Procurement = require('../models/Procurement');
const Payment = require('../models/Payment');
const { getCentreQueue } = require('../services/queueService');
const { notify } = require('../services/notificationService');

const broadcast = async (req, booking, event) => {
  const io = req.app.get('io');
  if (!io) return;
  const queueData = await getCentreQueue(booking.centre, booking.date);
  io.to(`centre:${booking.centre}`).emit('queueUpdated', queueData);
  io.to(`user:${booking.farmer}`).emit('bookingUpdated', booking);
  io.to(`centre:${booking.centre}`).emit(event, booking);
  io.to(`user:${booking.farmer}`).emit(event, booking);
};

// @desc    Mark farmer as arrived (used mainly if operator marks arrival manually, separate from "call next")
// @route   PATCH /api/procurement/:bookingId/arrive
// @access  Private (centre)
const markArrived = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (booking.status !== 'BOOKED') {
    res.status(400);
    throw new Error('Farmer must have status BOOKED to be marked arrived');
  }
  booking.status = 'ARRIVED';
  await booking.save();

  await notify({
    userId: booking.farmer,
    title: 'Arrival Confirmed',
    message: `You have been marked as arrived. Token #${booking.token}.`,
    type: 'PROCUREMENT',
    relatedBooking: booking._id,
  });

  await broadcast(req, booking, 'procurementUpdated');
  res.json({ success: true, data: booking });
});

// @desc    Start quality check
// @route   PATCH /api/procurement/:bookingId/quality/start
// @access  Private (centre)
const startQualityCheck = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (booking.status !== 'ARRIVED') {
    res.status(400);
    throw new Error('Farmer must be ARRIVED before starting quality check');
  }

  booking.status = 'QUALITY_CHECK';
  await booking.save();

  let procurement = await Procurement.findOne({ booking: booking._id });
  if (!procurement) {
    procurement = await Procurement.create({
      booking: booking._id,
      farmer: booking.farmer,
      centre: booking.centre,
      crop: booking.crop,
      qualityCheckStartedAt: new Date(),
    });
  } else {
    procurement.qualityCheckStartedAt = new Date();
    await procurement.save();
  }

  await notify({
    userId: booking.farmer,
    title: 'Quality Check Started',
    message: `Quality check has started for your ${booking.crop}.`,
    type: 'PROCUREMENT',
    relatedBooking: booking._id,
  });

  await broadcast(req, booking, 'procurementUpdated');
  res.json({ success: true, data: { booking, procurement } });
});

// @desc    Complete quality check
// @route   PATCH /api/procurement/:bookingId/quality/complete
// @access  Private (centre)
const completeQualityCheck = asyncHandler(async (req, res) => {
  const { passed = true, notes = '' } = req.body;

  const booking = await Booking.findById(req.params.bookingId);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (booking.status !== 'QUALITY_CHECK') {
    res.status(400);
    throw new Error('Farmer must be in QUALITY_CHECK to complete it');
  }

  const procurement = await Procurement.findOne({ booking: booking._id });
  if (!procurement) {
    res.status(404);
    throw new Error('Procurement record not found. Start quality check first.');
  }
  procurement.qualityCheckPassed = passed;
  procurement.qualityCheckNotes = notes;
  procurement.qualityCheckCompletedAt = new Date();
  await procurement.save();

  booking.status = 'WEIGHING';
  await booking.save();

  await notify({
    userId: booking.farmer,
    title: 'Quality Check Completed',
    message: `Quality check ${passed ? 'passed' : 'completed with remarks'}. Moving to weighing.`,
    type: 'PROCUREMENT',
    relatedBooking: booking._id,
  });

  await broadcast(req, booking, 'procurementUpdated');
  res.json({ success: true, data: { booking, procurement } });
});

// @desc    Complete weighing and calculate total amount (weight x rate), then mark procurement completed
// @route   PATCH /api/procurement/:bookingId/weigh
// @access  Private (centre)
const completeWeighing = asyncHandler(async (req, res) => {
  const { weightKg, ratePerKg } = req.body;

  if (!weightKg || !ratePerKg) {
    res.status(400);
    throw new Error('weightKg and ratePerKg are required');
  }

  const booking = await Booking.findById(req.params.bookingId);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (booking.status !== 'WEIGHING') {
    res.status(400);
    throw new Error('Farmer must be in WEIGHING status');
  }

  const procurement = await Procurement.findOne({ booking: booking._id });
  if (!procurement) {
    res.status(404);
    throw new Error('Procurement record not found');
  }

  procurement.weightKg = weightKg;
  procurement.ratePerKg = ratePerKg;
  procurement.totalAmount = Number((weightKg * ratePerKg).toFixed(2));
  procurement.weighingCompletedAt = new Date();
  procurement.completedAt = new Date();
  await procurement.save();

  booking.status = 'PROCUREMENT_COMPLETED';
  await booking.save();

  // Create a pending payment record
  let payment = await Payment.findOne({ booking: booking._id });
  if (!payment) {
    payment = await Payment.create({
      booking: booking._id,
      farmer: booking.farmer,
      procurement: procurement._id,
      amount: procurement.totalAmount,
      status: 'PENDING',
    });
  }

  await notify({
    userId: booking.farmer,
    title: 'Procurement Completed',
    message: `Your ${booking.crop} (${weightKg} kg) has been procured. Total amount: ₹${procurement.totalAmount}.`,
    type: 'PROCUREMENT',
    relatedBooking: booking._id,
  });

  await broadcast(req, booking, 'procurementUpdated');
  res.json({ success: true, data: { booking, procurement, payment } });
});

module.exports = { markArrived, startQualityCheck, completeQualityCheck, completeWeighing };
