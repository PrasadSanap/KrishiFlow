const asyncHandler = require('../utils/asyncHandler');
const Slot = require('../models/Slot');
const ProcurementCentre = require('../models/ProcurementCentre');

// Generates 30-minute slots between a centre's opening and closing time for a given date,
// creating any that don't already exist yet, and returns all slots for that centre+date.
const ensureSlotsForDate = async (centre, date) => {
  const [openH, openM] = centre.openingTime.split(':').map(Number);
  const [closeH, closeM] = centre.closingTime.split(':').map(Number);

  let cursor = openH * 60 + openM;
  const end = closeH * 60 + closeM;

  const slotsToEnsure = [];
  while (cursor + 30 <= end) {
    const startH = Math.floor(cursor / 60);
    const startM = cursor % 60;
    const endMinutes = cursor + 30;
    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;

    const pad = (n) => String(n).padStart(2, '0');
    slotsToEnsure.push({
      startTime: `${pad(startH)}:${pad(startM)}`,
      endTime: `${pad(endH)}:${pad(endM)}`,
    });
    cursor += 30;
  }

  for (const s of slotsToEnsure) {
    await Slot.updateOne(
      { centre: centre._id, date, startTime: s.startTime },
      {
        $setOnInsert: {
          centre: centre._id,
          date,
          startTime: s.startTime,
          endTime: s.endTime,
          capacity: 10,
          bookedCount: 0,
        },
      },
      { upsert: true }
    );
  }

  return Slot.find({ centre: centre._id, date }).sort({ startTime: 1 });
};

// @desc    Get available slots for a centre on a given date (auto-generates them if missing)
// @route   GET /api/slots?centreId=...&date=YYYY-MM-DD
// @access  Public
const getSlots = asyncHandler(async (req, res) => {
  const { centreId, date } = req.query;

  if (!centreId || !date) {
    res.status(400);
    throw new Error('centreId and date are required query parameters');
  }

  const centre = await ProcurementCentre.findById(centreId);
  if (!centre) {
    res.status(404);
    throw new Error('Procurement centre not found');
  }

  const slots = await ensureSlotsForDate(centre, date);
  res.json({ success: true, count: slots.length, data: slots });
});

// @desc    Manually create/override a slot (admin/centre use)
// @route   POST /api/slots
// @access  Private (admin, centre)
const createSlot = asyncHandler(async (req, res) => {
  const { centre, date, startTime, endTime, capacity } = req.body;
  const slot = await Slot.create({ centre, date, startTime, endTime, capacity });
  res.status(201).json({ success: true, data: slot });
});

module.exports = { getSlots, createSlot, ensureSlotsForDate };
