const express = require('express');
const { getCentreDashboardSummary, searchFarmer } = require('../controllers/centreDashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, authorize('centre', 'admin'));
router.get('/summary', getCentreDashboardSummary);
router.get('/search', searchFarmer);

module.exports = router;
