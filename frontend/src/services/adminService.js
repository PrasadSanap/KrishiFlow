import api from './api';

const adminService = {
  getStats: () => api.get('/admin/stats').then((r) => r.data),
  getBookings: (params = '') => api.get(`/admin/bookings${params}`).then((r) => r.data),
  getPayments: (params = '') => api.get(`/admin/payments${params}`).then((r) => r.data),
  getFarmers: () => api.get('/admin/farmers').then((r) => r.data),
  getCentres: () => api.get('/admin/centres').then((r) => r.data),
};

export default adminService;
