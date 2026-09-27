const asyncHandler = require('../utils/asyncHandler');
const Booking = require('../models/Booking');
const { getCentreQueue } = require('../services/queueService');

// @desc    Get today's dashboard summary + live queue for the logged-in centre operator's centre
// @route   GET /api/centre-dashboard/summary
// @access  Private (centre)
const getCentreDashboardSummary = asyncHandler(async (req, res) => {
  if (!req.user.centre) {
    res.status(400);
    throw new Error('This operator account is not linked to any procurement centre');
  }

  const centreId = req.user.centre;
  const date = req.query.date || new Date().toISOString().slice(0, 10);

  const [totalBookings, waiting, completed, pendingPayments] = await Promise.all([
    Booking.countDocuments({ centre: centreId, date, status: { $ne: 'CANCELLED' } }),
    Booking.countDocuments({ centre: centreId, date, status: { $in: ['BOOKED', 'ARRIVED', 'QUALITY_CHECK', 'WEIGHING'] } }),
    Booking.countDocuments({ centre: centreId, date, status: { $in: ['PROCUREMENT_COMPLETED', 'PAYMENT_PROCESSING', 'PAYMENT_COMPLETED'] } }),
    Booking.countDocuments({ centre: centreId, date, status: { $in: ['PROCUREMENT_COMPLETED', 'PAYMENT_PROCESSING'] } }),
  ]);

  const queueData = await getCentreQueue(centreId, date);

  res.json({
    success: true,
    date,
    stats: { totalBookings, waiting, completed, pendingPayments },
    ...queueData,
  });
});

// @desc    Search for a farmer's booking by token, name or phone within the operator's centre
// @route   GET /api/centre-dashboard/search?q=...&date=YYYY-MM-DD
// @access  Private (centre)
const searchFarmer = asyncHandler(async (req, res) => {
  if (!req.user.centre) {
    res.status(400);
    throw new Error('This operator account is not linked to any procurement centre');
  }
  const { q } = req.query;
  const date = req.query.date || new Date().toISOString().slice(0, 10);

  if (!q) {
    res.status(400);
    throw new Error('Query parameter q is required');
  }

  const query = { centre: req.user.centre, date };

  const tokenNum = Number(q);
  const orConditions = [];
  if (!Number.isNaN(tokenNum)) orConditions.push({ token: tokenNum });
  orConditions.push({ bookingId: new RegExp(q, 'i') });

  const bookings = await Booking.find(query)
    .populate({ path: 'farmer', match: { $or: [{ fullName: new RegExp(q, 'i') }, { mobileNumber: new RegExp(q, 'i') }] } })
    .lean();

  const byFarmerMatch = bookings.filter((b) => b.farmer);

  const byOtherMatch = await Booking.find({ ...query, $or: orConditions }).populate('farmer', 'fullName mobileNumber').lean();

  const merged = [...byFarmerMatch, ...byOtherMatch].reduce((acc, b) => {
    acc[b._id.toString()] = b;
    return acc;
  }, {});

  res.json({ success: true, data: Object.values(merged) });
});

module.exports = { getCentreDashboardSummary, searchFarmer };
