import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const uploadFile      = (formData)     => api.post('/upload', formData);
export const getUploadLog    = ()              => api.get('/upload/log');

export const getKPIs         = (from, to)     => api.get('/dashboard/kpis',  { params: { from, to } });
export const getDailyChart   = (from, to)     => api.get('/dashboard/daily', { params: { from, to } });

export const getVentesCarb   = (from, to)     => api.get('/ventes/carburants', { params: { from, to } });
export const getVentesProd   = (from, to)     => api.get('/ventes/produits',   { params: { from, to } });
export const getVentesServ   = (from, to)     => api.get('/ventes/services',   { params: { from, to } });

export const getAchatsCarb   = (from, to)     => api.get('/achats/carburants', { params: { from, to } });
export const getAchatsProd   = (from, to)     => api.get('/achats/produits',   { params: { from, to } });

export const getMargesCarb   = ()             => api.get('/marges/carburants');
export const getMargesProd   = ()             => api.get('/marges/produits');
export const getMargesServ   = ()             => api.get('/marges/services');

export const getDailyState   = (from, to)     => api.get('/dailystate',          { params: { from, to } });
export const getRecettes      = (from, to)     => api.get('/dailystate/recettes', { params: { from, to } });
export const getDepenses      = (from, to)     => api.get('/dailystate/depenses', { params: { from, to } });

// Workers
export const getWorkers       = ()         => api.get('/workers');
export const createWorker     = (data)     => api.post('/workers', data);
export const updateWorker     = (id, data) => api.put(`/workers/${id}`, data);
export const deactivateWorker = (id)       => api.delete(`/workers/${id}`);

// Calendar
export const getCalendarEvents    = (year, month) => api.get('/calendar', { params: { year, month } });
export const getAllCalendarEvents  = ()            => api.get('/calendar/all');
export const createCalendarEvent  = (data)         => api.post('/calendar', data);
export const updateCalendarEvent  = (id, data)     => api.put(`/calendar/${id}`, data);
export const deleteCalendarEvent  = (id)           => api.delete(`/calendar/${id}`);

// Tasks
export const getTasks  = ()        => api.get('/tasks');
export const createTask = (data)   => api.post('/tasks', data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id)     => api.delete(`/tasks/${id}`);

export default api;
