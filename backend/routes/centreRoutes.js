const express = require('express');
const {
  getCentres,
  getCentreById,
  createCentre,
  updateCentre,
  deleteCentre,
} = require('../controllers/centreController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getCentres);
router.get('/:id', getCentreById);
router.post('/', protect, authorize('admin'), createCentre);
router.put('/:id', protect, authorize('admin'), updateCentre);
router.delete('/:id', protect, authorize('admin'), deleteCentre);

module.exports = router;
