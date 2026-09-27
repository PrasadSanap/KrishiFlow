const express = require('express');
const { getSlots, createSlot } = require('../controllers/slotController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getSlots);
router.post('/', protect, authorize('admin', 'centre'), createSlot);

module.exports = router;
