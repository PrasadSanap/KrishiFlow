const express = require('express');
const {
  markArrived,
  startQualityCheck,
  completeQualityCheck,
  completeWeighing,
} = require('../controllers/procurementController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, authorize('centre', 'admin'));
router.patch('/:bookingId/arrive', markArrived);
router.patch('/:bookingId/quality/start', startQualityCheck);
router.patch('/:bookingId/quality/complete', completeQualityCheck);
router.patch('/:bookingId/weigh', completeWeighing);

module.exports = router;
