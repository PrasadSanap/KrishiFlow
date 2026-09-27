const express = require('express');
const { getProfile, updateProfile } = require('../controllers/farmerController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, authorize('farmer'));
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router;
