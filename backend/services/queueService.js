const Booking = require('../models/Booking');
const ProcurementCentre = require('../models/ProcurementCentre');

// Statuses that count as "still in the active queue" (not yet arrived/being served is BOOKED,
// and everything up to PROCUREMENT_COMPLETED is considered "in progress" at the centre)
const ACTIVE_STATUSES = [
  'BOOKED',
  'ARRIVED',
  'QUALITY_CHECK',
  'WEIGHING',
];

/**
 * Determine the "current serving" token for a centre on a given date.
 * This is the highest token number that has moved past BOOKED (i.e. has been called),
 * excluding fully completed/cancelled bookings.
 */
const getCurrentServingToken = async (centreId, date) => {
  const inProgress = await Booking.findOne({
    centre: centreId,
    date,
    status: { $in: ['ARRIVED', 'QUALITY_CHECK', 'WEIGHING'] },
  })
    .sort({ token: -1 })
    .lean();

  if (inProgress) return inProgress.token;

  // If nobody is currently in progress, "current serving" is the last completed token
  const lastCompleted = await Booking.findOne({
    centre: centreId,
    date,
    status: { $in: ['PROCUREMENT_COMPLETED', 'PAYMENT_PROCESSING', 'PAYMENT_COMPLETED'] },
  })
    .sort({ token: -1 })
    .lean();

  return lastCompleted ? lastCompleted.token : 0;
};

/**
 * Compute queue position info for a specific booking:
 * - farmersAhead
 * - estimatedWaitingMinutes
 * - currentServingToken
 */
const getQueueInfoForBooking = async (booking) => {
  const centre = await ProcurementCentre.findById(booking.centre).lean();
  const avgTime = centre?.averageProcessingTimeMinutes || 5;

  const currentServingToken = await getCurrentServingToken(booking.centre, booking.date);

  const farmersAhead = await Booking.countDocuments({
    centre: booking.centre,
    date: booking.date,
    status: { $in: ACTIVE_STATUSES },
    token: { $gt: currentServingToken, $lt: booking.token },
  });

  const estimatedWaitingMinutes = Math.max(farmersAhead, 0) * avgTime;

  return {
    token: booking.token,
    currentServingToken,
    farmersAhead: Math.max(farmersAhead, 0),
    estimatedWaitingMinutes,
  };
};

/**
 * Get the full live queue list for a centre+date, ordered by token.
 */
const getCentreQueue = async (centreId, date) => {
  const bookings = await Booking.find({ centre: centreId, date })
    .populate('farmer', 'fullName mobileNumber')
    .sort({ token: 1 })
    .lean();

  const currentServingToken = await getCurrentServingToken(centreId, date);

  return {
    currentServingToken,
    queue: bookings.map((b) => ({
      bookingId: b.bookingId,
      _id: b._id,
      token: b.token,
      farmerName: b.farmer?.fullName,
      farmerMobile: b.farmer?.mobileNumber,
      crop: b.crop,
      status: b.status,
    })),
  };
};

/**
 * Generate the next sequential token number for a centre on a given date.
 */
const getNextToken = async (centreId, date) => {
  const last = await Booking.findOne({ centre: centreId, date }).sort({ token: -1 }).lean();
  return last ? last.token + 1 : 1;
};

module.exports = {
  getCurrentServingToken,
  getQueueInfoForBooking,
  getCentreQueue,
  getNextToken,
  ACTIVE_STATUSES,
};
