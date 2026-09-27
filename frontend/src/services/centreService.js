import api from './api';

const centreService = {
  getAll: (includeInactive = false) =>
    api.get(`/centres${includeInactive ? '?includeInactive=true' : ''}`).then((r) => r.data),
  getById: (id) => api.get(`/centres/${id}`).then((r) => r.data),
  create: (payload) => api.post('/centres', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/centres/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/centres/${id}`).then((r) => r.data),
};

export default centreService;
