const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

// @desc    Get logged-in farmer's profile
// @route   GET /api/farmers/profile
// @access  Private (farmer)
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, data: user });
});

// @desc    Update logged-in farmer's profile
// @route   PUT /api/farmers/profile
// @access  Private (farmer)
const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, mobileNumber, village, district, state, preferredLanguage } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.fullName = fullName ?? user.fullName;
  user.mobileNumber = mobileNumber ?? user.mobileNumber;
  user.village = village ?? user.village;
  user.district = district ?? user.district;
  user.state = state ?? user.state;
  user.preferredLanguage = preferredLanguage ?? user.preferredLanguage;

  const updated = await user.save();
  res.json({ success: true, data: updated });
});

module.exports = { getProfile, updateProfile };
