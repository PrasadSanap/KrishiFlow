const Notification = require('../models/Notification');

/**
 * Notification service abstraction.
 *
 * This is the single place responsible for creating and delivering
 * notifications. For this prototype, notifications are delivered as
 * in-app notifications only and broadcast in real time via Socket.IO.
 *
 * To connect a real SMS provider later (e.g. Twilio or MSG91), implement
 * `sendSms()` below and call it from `notify()` when channel === 'SMS'.
 * No other part of the codebase needs to change.
 */

let ioInstance = null;

const attachSocket = (io) => {
  ioInstance = io;
};

const sendSms = async (mobileNumber, message) => {
  // Placeholder for a real SMS gateway integration (Twilio / MSG91 / etc).
  // Intentionally not implemented in this prototype.
  console.log(`[SMS-SIMULATED] To: ${mobileNumber} | Message: ${message}`);
  return true;
};

const notify = async ({ userId, title, message, type = 'GENERAL', relatedBooking = null, channel = 'IN_APP' }) => {
  const notification = await Notification.create({
    user: userId,
    title,
    message,
    type,
    relatedBooking,
    channel,
  });

  if (ioInstance) {
    ioInstance.to(`user:${userId}`).emit('notificationCreated', notification);
  }

  if (channel === 'SMS') {
    // Reserved for future real SMS integration
    // await sendSms(mobileNumber, message);
  }

  return notification;
};

module.exports = { notify, attachSocket, sendSms };
