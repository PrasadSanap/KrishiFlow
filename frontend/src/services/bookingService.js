import api from './api';

const bookingService = {
  create: (payload) => api.post('/bookings', payload).then((r) => r.data),
  getMy: () => api.get('/bookings/my').then((r) => r.data),
  getById: (id) => api.get(`/bookings/${id}`).then((r) => r.data),
  cancel: (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }).then((r) => r.data),
};

export default bookingService;
