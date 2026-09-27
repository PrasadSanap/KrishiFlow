import api from './api';

const slotService = {
  getSlots: (centreId, date) => api.get(`/slots?centreId=${centreId}&date=${date}`).then((r) => r.data),
};

export default slotService;
