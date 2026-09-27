const mongoose = require('mongoose');

const procurementSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    centre: { type: mongoose.Schema.Types.ObjectId, ref: 'ProcurementCentre', required: true },
    crop: { type: String, required: true },
    qualityCheckPassed: { type: Boolean },
    qualityCheckNotes: { type: String },
    weightKg: { type: Number },
    ratePerKg: { type: Number },
    totalAmount: { type: Number },
    qualityCheckStartedAt: { type: Date },
    qualityCheckCompletedAt: { type: Date },
    weighingCompletedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Procurement', procurementSchema);
