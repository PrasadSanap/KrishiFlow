import api from './api';

const procurementService = {
  markArrived: (bookingId) => api.patch(`/procurement/${bookingId}/arrive`).then((r) => r.data),
  startQuality: (bookingId) => api.patch(`/procurement/${bookingId}/quality/start`).then((r) => r.data),
  completeQuality: (bookingId, payload) =>
    api.patch(`/procurement/${bookingId}/quality/complete`, payload).then((r) => r.data),
  completeWeighing: (bookingId, payload) =>
    api.patch(`/procurement/${bookingId}/weigh`, payload).then((r) => r.data),
};

export default procurementService;
