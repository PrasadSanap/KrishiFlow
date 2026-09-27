import api from './api';

const queueService = {
  getCentreQueue: (centreId, date) =>
    api.get(`/queue/${centreId}${date ? `?date=${date}` : ''}`).then((r) => r.data),
  getBookingQueueInfo: (bookingId) => api.get(`/queue/booking/${bookingId}`).then((r) => r.data),
  callNext: (bookingId) => api.patch(`/queue/${bookingId}/call`).then((r) => r.data),
};

export default queueService;
