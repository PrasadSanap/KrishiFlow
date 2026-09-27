const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    procurement: { type: mongoose.Schema.Types.ObjectId, ref: 'Procurement', required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
    },
    transactionId: { type: String },
    paymentDate: { type: Date },
    isSimulated: { type: Boolean, default: true }, // This is a prototype - no real banking integration
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
