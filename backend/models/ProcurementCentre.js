const mongoose = require('mongoose');

const CROPS = ['Wheat', 'Rice', 'Maize', 'Soybean', 'Cotton', 'Bajra', 'Jowar', 'Tur', 'Gram'];

const procurementCentreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true, default: 'Maharashtra' },
    contactNumber: {
      type: String,
      required: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'],
    },
    openingTime: { type: String, required: true, default: '09:00' }, // 24h HH:mm
    closingTime: { type: String, required: true, default: '17:00' },
    dailyCapacity: { type: Number, required: true, default: 150 },
    supportedCrops: {
      type: [String],
      enum: CROPS,
      default: CROPS,
    },
    latitude: { type: Number, default: 18.5204 },
    longitude: { type: Number, default: 73.8567 },
    averageProcessingTimeMinutes: { type: Number, default: 5 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

procurementCentreSchema.statics.CROPS = CROPS;

module.exports = mongoose.model('ProcurementCentre', procurementCentreSchema);
