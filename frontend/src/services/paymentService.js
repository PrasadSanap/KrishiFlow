import api from './api';

const paymentService = {
  getByBooking: (bookingId) => api.get(`/payments/${bookingId}`).then((r) => r.data),
  process: (bookingId) => api.patch(`/payments/${bookingId}/process`).then((r) => r.data),
  complete: (bookingId) => api.patch(`/payments/${bookingId}/complete`).then((r) => r.data),
};

export default paymentService;
