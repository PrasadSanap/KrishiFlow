const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'BOOKING',
        'QUEUE',
        'PROCUREMENT',
        'PAYMENT',
        'GENERAL',
      ],
      default: 'GENERAL',
    },
    relatedBooking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    isRead: { type: Boolean, default: false },
    // channel is an abstraction so a real SMS provider (Twilio/MSG91) can be
    // plugged in later without changing the rest of the app. For the
    // prototype, everything is delivered as an in-app notification.
    channel: { type: String, enum: ['IN_APP', 'SMS'], default: 'IN_APP' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
