const asyncHandler = require('../utils/asyncHandler');
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const ProcurementCentre = require('../models/ProcurementCentre');
const { generateBookingId } = require('../utils/generateIds');
const { getNextToken, getQueueInfoForBooking } = require('../services/queueService');
const { notify } = require('../services/notificationService');

// @desc    Create a new slot booking
// @route   POST /api/bookings
// @access  Private (farmer)
const createBooking = asyncHandler(async (req, res) => {
  const { centreId, slotId, crop, estimatedQuantityKg, date } = req.body;

  if (!centreId || !slotId || !crop || !estimatedQuantityKg || !date) {
    res.status(400);
    throw new Error('centreId, slotId, crop, estimatedQuantityKg and date are all required');
  }

  const centre = await ProcurementCentre.findById(centreId);
  if (!centre || !centre.isActive) {
    res.status(404);
    throw new Error('Procurement centre not found or inactive');
  }

  if (!centre.supportedCrops.includes(crop)) {
    res.status(400);
    throw new Error(`${crop} is not accepted at this procurement centre`);
  }

  // Prevent duplicate booking: same farmer, same centre, same date, same slot
  const existing = await Booking.findOne({
    farmer: req.user._id,
    centre: centreId,
    date,
    slot: slotId,
    status: { $ne: 'CANCELLED' },
  });
  if (existing) {
    res.status(400);
    throw new Error('You already have a booking for this slot');
  }

  const slot = await Slot.findById(slotId);
  if (!slot) {
    res.status(404);
    throw new Error('Slot not found');
  }
  if (slot.bookedCount >= slot.capacity) {
    res.status(400);
    throw new Error('This slot is fully booked. Please choose another slot.');
  }

  // Atomically increment bookedCount only if capacity is not exceeded, to prevent overbooking race conditions
  const updatedSlot = await Slot.findOneAndUpdate(
    { _id: slotId, $expr: { $lt: ['$bookedCount', '$capacity'] } },
    { $inc: { bookedCount: 1 } },
    { new: true }
  );

  if (!updatedSlot) {
    res.status(400);
    throw new Error('This slot just got fully booked. Please choose another slot.');
  }

  const token = await getNextToken(centreId, date);

  const booking = await Booking.create({
    bookingId: generateBookingId(),
    farmer: req.user._id,
    centre: centreId,
    slot: slotId,
    date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    crop,
    estimatedQuantityKg,
    token,
    status: 'BOOKED',
  });

  const queueInfo = await getQueueInfoForBooking(booking);

  await notify({
    userId: req.user._id,
    title: 'Slot Booked Successfully',
    message: `Your slot at ${centre.name} on ${date} at ${slot.startTime} is confirmed. Your token is #${token}.`,
    type: 'BOOKING',
    relatedBooking: booking._id,
  });

  const populated = await booking.populate('centre');

  res.status(201).json({
    success: true,
    data: {
      booking: populated,
      queueInfo,
    },
  });
});

// @desc    Get all bookings for the logged-in farmer
// @route   GET /api/bookings/my
// @access  Private (farmer)
const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ farmer: req.user._id })
    .populate('centre')
    .sort({ createdAt: -1 });
  res.json({ success: true, count: bookings.length, data: bookings });
});

// @desc    Get single booking by id (with live queue info)
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('centre').populate('farmer', 'fullName mobileNumber');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Only the owning farmer, the centre operator of that centre, or an admin may view
  if (
    req.user.role === 'farmer' &&
    booking.farmer._id.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Not authorized to view this booking');
  }

  const queueInfo = await getQueueInfoForBooking(booking);

  res.json({ success: true, data: { booking, queueInfo } });
});

// @desc    Cancel a booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private (farmer - own booking only)
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  if (booking.farmer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to cancel this booking');
  }

  if (['PROCUREMENT_COMPLETED', 'PAYMENT_PROCESSING', 'PAYMENT_COMPLETED', 'CANCELLED'].includes(booking.status)) {
    res.status(400);
    throw new Error(`Booking cannot be cancelled once it reaches status ${booking.status}`);
  }

  booking.status = 'CANCELLED';
  booking.cancelReason = req.body.reason || 'Cancelled by farmer';
  await booking.save();

  // Free up the slot capacity
  await Slot.findByIdAndUpdate(booking.slot, { $inc: { bookedCount: -1 } });

  await notify({
    userId: req.user._id,
    title: 'Booking Cancelled',
    message: `Your booking ${booking.bookingId} has been cancelled.`,
    type: 'BOOKING',
    relatedBooking: booking._id,
  });

  res.json({ success: true, data: booking });
});

module.exports = { createBooking, getMyBookings, getBookingById, cancelBooking };
