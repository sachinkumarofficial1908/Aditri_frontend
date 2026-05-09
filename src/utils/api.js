import axios from 'axios';
import { ENV } from './env.js';

const api = axios.create({
  baseURL: ENV.apiBaseUrl,
  withCredentials: true,
  timeout: ENV.apiTimeoutMs,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ENV.authTokenKey);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(ENV.authTokenKey);
      localStorage.removeItem(ENV.authUserKey);
      if (!window.location.pathname.includes(ENV.loginPath)) {
        window.location.href = ENV.loginPath;
      }
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (error) => {
  if (!error) return 'Something went wrong. Please try again.';

  if (error.response) {
    const serverMessage = error.response?.data?.message || error.response?.statusText;
    if (error.response.status >= 500) {
      return 'Unable to connect to the server. Please check your connection or try again later.';
    }
    if (typeof serverMessage === 'string' && serverMessage.trim()) {
      return serverMessage;
    }
    return `Request failed with status ${error.response.status}. Please try again.`;
  }

  if (error.request) {
    return 'Unable to reach the server. Please check your internet connection.';
  }

  return error.message || 'Something went wrong. Please try again.';
};

export default api;

// API helpers
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
};

export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my'),
  getAll: (params) => api.get('/orders', { params }),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};

export const inquiryAPI = {
  create: (data) => api.post('/inquiries', data),
  getAll: (params) => api.get('/inquiries', { params }),
  updateStatus: (id, data) => api.put(`/inquiries/${id}/status`, data),
};

export const projectAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  createSupervisor: (data) => api.post('/admin/supervisors', data),
  toggleUser: (id) => api.put(`/admin/users/${id}/toggle`),
};

export const employeeAPI = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.patch(`/employees/${id}`, data),
  terminate: (id) => api.patch(`/employees/${id}/terminate`),
  remove: (id) => api.delete(`/employees/${id}`),
};

export const uploadAPI = {
  images: (formData) => api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const musterAPI = {
  generate: (formData) => api.post('/muster/generate', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
    timeout: 60000,
  }),
};

export const attendanceAPI = {
  validate: (formData) => api.post('/attendance/validate', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  generate: (formData) => api.post('/attendance/generate', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
    timeout: 60000,
  }),
};

export const wageSlipAPI = {
  generate: (formData) => api.post('/wage-slips/generate', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
    timeout: 60000,
  }),
};
