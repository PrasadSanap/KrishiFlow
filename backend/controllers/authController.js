const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');
const User = require('../models/User');

// @desc    Register a new farmer (or, via seed, other roles)
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const {
    fullName,
    mobileNumber,
    email,
    password,
    village,
    district,
    state,
    preferredLanguage,
  } = req.body;

  if (!fullName || !mobileNumber || !email || !password || !village || !district) {
    res.status(400);
    throw new Error('Please fill in all required fields');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({
    fullName,
    mobileNumber,
    email,
    password,
    village,
    district,
    state: state || 'Maharashtra',
    preferredLanguage: preferredLanguage || 'en',
    role: 'farmer',
  });

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      role: user.role,
      preferredLanguage: user.preferredLanguage,
      token: generateToken(user._id, user.role),
    },
  });
});

// @desc    Login (farmer / centre / admin)
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password').populate('centre');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('This account has been deactivated');
  }

  res.json({
    success: true,
    data: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      role: user.role,
      preferredLanguage: user.preferredLanguage,
      centre: user.centre || null,
      token: generateToken(user._id, user.role),
    },
  });
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('centre');
  res.json({ success: true, data: user });
});

module.exports = { register, login, getMe };
