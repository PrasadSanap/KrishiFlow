const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const ProcurementCentre = require('../models/ProcurementCentre');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

// @desc    Get overall admin analytics stats
// @route   GET /api/admin/stats
// @access  Private (admin)
const getStats = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  const [
    totalFarmers,
    totalCentres,
    todaysBookings,
    waitingFarmers,
    completedProcurements,
    pendingProcurements,
    completedPayments,
    pendingPayments,
    totalAmountAgg,
    centreWiseAgg,
    dailyBookingsAgg,
    paymentStatusAgg,
  ] = await Promise.all([
    User.countDocuments({ role: 'farmer' }),
    ProcurementCentre.countDocuments({ isActive: true }),
    Booking.countDocuments({ date: today, status: { $ne: 'CANCELLED' } }),
    Booking.countDocuments({ status: { $in: ['BOOKED', 'ARRIVED', 'QUALITY_CHECK', 'WEIGHING'] } }),
    Booking.countDocuments({ status: { $in: ['PROCUREMENT_COMPLETED', 'PAYMENT_PROCESSING', 'PAYMENT_COMPLETED'] } }),
    Booking.countDocuments({ status: { $in: ['BOOKED', 'ARRIVED', 'QUALITY_CHECK', 'WEIGHING'] } }),
    Payment.countDocuments({ status: 'COMPLETED' }),
    Payment.countDocuments({ status: { $in: ['PENDING', 'PROCESSING'] } }),
    Payment.aggregate([{ $match: { status: 'COMPLETED' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Booking.aggregate([
      { $match: { status: { $ne: 'CANCELLED' } } },
      { $group: { _id: '$centre', count: { $sum: 1 } } },
      { $lookup: { from: 'procurementcentres', localField: '_id', foreignField: '_id', as: 'centre' } },
      { $unwind: '$centre' },
      { $project: { _id: 0, centreName: '$centre.name', count: 1 } },
      { $sort: { count: -1 } },
    ]),
    Booking.aggregate([
      { $match: { status: { $ne: 'CANCELLED' } } },
      { $group: { _id: '$date', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 14 },
    ]),
    Payment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  res.json({
    success: true,
    data: {
      totalFarmers,
      totalCentres,
      todaysBookings,
      waitingFarmers,
      completedProcurements,
      pendingProcurements,
      completedPayments,
      pendingPayments,
      totalProcurementAmount: totalAmountAgg[0]?.total || 0,
      centreWiseStats: centreWiseAgg,
      dailyBookingStats: dailyBookingsAgg.map((d) => ({ date: d._id, count: d.count })),
      paymentStatusStats: paymentStatusAgg.map((p) => ({ status: p._id, count: p.count })),
    },
  });
});

// @desc    Get all bookings (admin view, with filters)
// @route   GET /api/admin/bookings
// @access  Private (admin)
const getAllBookings = asyncHandler(async (req, res) => {
  const { status, centreId, date } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (centreId) filter.centre = centreId;
  if (date) filter.date = date;

  const bookings = await Booking.find(filter)
    .populate('farmer', 'fullName mobileNumber')
    .populate('centre', 'name district')
    .sort({ createdAt: -1 })
    .limit(200);

  res.json({ success: true, count: bookings.length, data: bookings });
});

// @desc    Get all payments (admin view)
// @route   GET /api/admin/payments
// @access  Private (admin)
const getAllPayments = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const payments = await Payment.find(filter)
    .populate('farmer', 'fullName mobileNumber')
    .populate({ path: 'booking', populate: { path: 'centre', select: 'name' } })
    .sort({ createdAt: -1 })
    .limit(200);

  res.json({ success: true, count: payments.length, data: payments });
});

// @desc    Get all farmers
// @route   GET /api/admin/farmers
// @access  Private (admin)
const getAllFarmers = asyncHandler(async (req, res) => {
  const farmers = await User.find({ role: 'farmer' }).sort({ createdAt: -1 }).limit(500);
  res.json({ success: true, count: farmers.length, data: farmers });
});

// @desc    Get all centres (including inactive) for admin management
// @route   GET /api/admin/centres
// @access  Private (admin)
const getAllCentres = asyncHandler(async (req, res) => {
  const centres = await ProcurementCentre.find().sort({ name: 1 });
  res.json({ success: true, count: centres.length, data: centres });
});

module.exports = { getStats, getAllBookings, getAllPayments, getAllFarmers, getAllCentres };
