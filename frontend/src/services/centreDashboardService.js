import api from './api';

const centreDashboardService = {
  getSummary: (date) => api.get(`/centre-dashboard/summary${date ? `?date=${date}` : ''}`).then((r) => r.data),
  search: (q, date) =>
    api.get(`/centre-dashboard/search?q=${encodeURIComponent(q)}${date ? `&date=${date}` : ''}`).then((r) => r.data),
};

export default centreDashboardService;
