import axios from 'axios';

// API will always be served from /api in both development and production
const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:3001/api' : '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login on unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const getProfile = () => api.get('/auth/me');

// Service endpoints
export const getServices = () => api.get('/services');
export const addService = (service) => api.post('/services', service);
export const deleteService = (id) => api.delete(`/services/${id}`);
export const getServiceChecks = (serviceId) => api.get(`/services/${serviceId}/checks`);
export const checkHealth = () => api.get('/health');

export default api; 