const asyncHandler = require('../utils/asyncHandler');
const ProcurementCentre = require('../models/ProcurementCentre');

// @desc    Get all active procurement centres
// @route   GET /api/centres
// @access  Public
const getCentres = asyncHandler(async (req, res) => {
  const filter = req.query.includeInactive === 'true' ? {} : { isActive: true };
  const centres = await ProcurementCentre.find(filter).sort({ name: 1 });
  res.json({ success: true, count: centres.length, data: centres });
});

// @desc    Get single procurement centre
// @route   GET /api/centres/:id
// @access  Public
const getCentreById = asyncHandler(async (req, res) => {
  const centre = await ProcurementCentre.findById(req.params.id);
  if (!centre) {
    res.status(404);
    throw new Error('Procurement centre not found');
  }
  res.json({ success: true, data: centre });
});

// @desc    Create a new procurement centre
// @route   POST /api/centres
// @access  Private (admin)
const createCentre = asyncHandler(async (req, res) => {
  const centre = await ProcurementCentre.create(req.body);
  res.status(201).json({ success: true, data: centre });
});

// @desc    Update a procurement centre
// @route   PUT /api/centres/:id
// @access  Private (admin)
const updateCentre = asyncHandler(async (req, res) => {
  const centre = await ProcurementCentre.findById(req.params.id);
  if (!centre) {
    res.status(404);
    throw new Error('Procurement centre not found');
  }
  Object.assign(centre, req.body);
  const updated = await centre.save();
  res.json({ success: true, data: updated });
});

// @desc    Delete / deactivate a procurement centre
// @route   DELETE /api/centres/:id
// @access  Private (admin)
const deleteCentre = asyncHandler(async (req, res) => {
  const centre = await ProcurementCentre.findById(req.params.id);
  if (!centre) {
    res.status(404);
    throw new Error('Procurement centre not found');
  }
  // Soft delete: deactivate rather than remove, to preserve historical bookings
  centre.isActive = false;
  await centre.save();
  res.json({ success: true, message: 'Procurement centre deactivated', data: centre });
});

module.exports = { getCentres, getCentreById, createCentre, updateCentre, deleteCentre };
