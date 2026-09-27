const mongoose = require('mongoose');

const STATUS_FLOW = [
  'BOOKED',
  'ARRIVED',
  'QUALITY_CHECK',
  'WEIGHING',
  'PROCUREMENT_COMPLETED',
  'PAYMENT_PROCESSING',
  'PAYMENT_COMPLETED',
];

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    centre: { type: mongoose.Schema.Types.ObjectId, ref: 'ProcurementCentre', required: true },
    slot: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    crop: { type: String, required: true },
    estimatedQuantityKg: { type: Number, required: true, min: 1 },
    token: { type: Number, required: true }, // Sequential token number for that centre+date
    status: {
      type: String,
      enum: [...STATUS_FLOW, 'CANCELLED'],
      default: 'BOOKED',
    },
    cancelReason: { type: String },
  },
  { timestamps: true }
);

bookingSchema.index({ farmer: 1, centre: 1, date: 1, slot: 1 });
bookingSchema.statics.STATUS_FLOW = STATUS_FLOW;

module.exports = mongoose.model('Booking', bookingSchema);
