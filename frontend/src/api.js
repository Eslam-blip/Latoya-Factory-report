import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const factoryAPI = {
  getAll: () => api.get('/factories').then(r => r.data),
  create: (name) => api.post('/factories', { name }).then(r => r.data),
  update: (id, name) => api.put(`/factories/${id}`, { name }).then(r => r.data),
  delete: (id) => api.delete(`/factories/${id}`).then(r => r.data),
};

export const modelAPI = {
  getAll: (params) => api.get('/models', { params }).then(r => r.data),
  getOne: (id) => api.get(`/models/${id}`).then(r => r.data),
  create: (data) => api.post('/models', data).then(r => r.data),
  update: (id, data) => api.put(`/models/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/models/${id}`).then(r => r.data),
};

export const statsAPI = {
  get: (factory_id) => api.get('/stats', { params: { factory_id } }).then(r => r.data),
};

export const timelineAPI = {
  get: (params) => api.get('/timeline', { params }).then(r => r.data),
};
