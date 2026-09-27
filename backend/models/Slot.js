const mongoose = require('mongoose');

// A Slot represents one bookable time window at a centre on a specific date
const slotSchema = new mongoose.Schema(
  {
    centre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProcurementCentre',
      required: true,
    },
    date: { type: String, required: true }, // Stored as YYYY-MM-DD for easy querying
    startTime: { type: String, required: true }, // e.g. "09:00"
    endTime: { type: String, required: true }, // e.g. "09:30"
    capacity: { type: Number, required: true, default: 10 },
    bookedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

slotSchema.index({ centre: 1, date: 1, startTime: 1 }, { unique: true });

slotSchema.virtual('availableCount').get(function () {
  return Math.max(this.capacity - this.bookedCount, 0);
});

slotSchema.set('toJSON', { virtuals: true });
slotSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Slot', slotSchema);
