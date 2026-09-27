// Utility functions to generate human-readable, realistic-looking demo IDs

const generateBookingId = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `KQ-${year}-${random}`;
};

const generateTransactionId = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(10000000 + Math.random() * 90000000);
  return `PAY-KQ-${year}-${random}`;
};

module.exports = { generateBookingId, generateTransactionId };
