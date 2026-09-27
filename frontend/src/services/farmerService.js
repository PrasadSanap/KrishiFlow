import api from './api';

const farmerService = {
  getProfile: () => api.get('/farmers/profile').then((r) => r.data),
  updateProfile: (payload) => api.put('/farmers/profile', payload).then((r) => r.data),
};

export default farmerService;
