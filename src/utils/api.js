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
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    if (typeof config.headers.delete === 'function') {
      config.headers.delete('Content-Type');
    } else {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }
  }
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

const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.';
const INTERNAL_ERROR_PATTERNS = [
  /converting circular structure/i,
  /constructor 'socket'/i,
  /httpparser/i,
  /closes the circle/i,
  /\bat\s+\S+\s+\(/i,
  /internal server error/i,
];

export const sanitizeErrorMessage = (message, fallback = DEFAULT_ERROR_MESSAGE) => {
  if (typeof message !== 'string') return fallback;
  const clean = message.trim();
  if (!clean) return fallback;
  if (INTERNAL_ERROR_PATTERNS.some((pattern) => pattern.test(clean))) return fallback;
  return clean;
};

export const getErrorMessage = (error) => {
  if (!error) return DEFAULT_ERROR_MESSAGE;

  if (error.code === 'ECONNABORTED' || /timeout/i.test(error.message || '')) {
    return 'The request timed out. Please try again in a moment.';
  }

  if (error.response) {
    if (error.response.status >= 500) {
      return 'The server could not complete the request. Please try again later.';
    }
    const serverMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || error.response?.statusText;
    const safeServerMessage = sanitizeErrorMessage(serverMessage, '');
    if (safeServerMessage) {
      return safeServerMessage;
    }
    return `Request failed with status ${error.response.status}. Please try again.`;
  }

  if (error.request) {
    return 'Unable to reach the server. Please check your internet connection.';
  }

  return sanitizeErrorMessage(error.message, DEFAULT_ERROR_MESSAGE);
};

export default api;

// API helpers
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  sendRegisterEmailOtp: (email) => api.post('/auth/register/email-otp/send', { email }),
  verifyRegisterEmailOtp: (data) => api.post('/auth/register/email-otp/verify', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data, { timeout: 20000 }),
  resetPassword: (token, data) => api.put(`/auth/reset-password/${token}`, data),
  getGoogleOAuthUrl: ({ mode = 'login', redirect = '/' } = {}) => {
    const baseUrl = ENV.apiBaseUrl.replace(/\/$/, '');
    const url = new URL(`${baseUrl}/auth/google`, window.location.origin);
    url.searchParams.set('mode', mode);
    url.searchParams.set('redirect', redirect);
    url.searchParams.set('clientUrl', window.location.origin);
    return url.toString();
  },
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  sendPhoneOtp: (phone) => api.post('/auth/phone-otp/send', { phone }),
  verifyPhoneOtp: (data) => api.post('/auth/phone-otp/verify', data),
};

export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getCategories: () => api.get('/products/meta/categories'),
};

export const orderAPI = {
  createPaymentOrder: (data) => api.post('/orders/payment-order', data),
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
  getSupervisors: () => api.get('/employees/supervisors'),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  createWithFile: (formData) =>
    api.post('/employees', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    }),
  update: (id, data) => api.patch(`/employees/${id}`, data),
  updateWithFile: (id, formData) =>
    api.patch(`/employees/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    }),
  terminate: (id) => api.patch(`/employees/${id}/terminate`),
  remove: (id) => api.delete(`/employees/${id}`),
};

export const uploadAPI = {
  images: (formData) => api.post('/upload', formData, { timeout: 60000 }),
};

export const musterAPI = {
  generate: (formData) => api.post('/muster/generate', formData, {
    responseType: 'blob',
    timeout: 60000,
  }),
};

export const attendanceAPI = {
  validate: (formData) => api.post('/attendance/validate', formData, {
    timeout: 30000,
  }),
  generate: (formData) => api.post('/attendance/generate', formData, {
    responseType: 'blob',
    timeout: 60000,
  }),
};

export const wageSlipAPI = {
  validate: (formData) => api.post('/wage-slips/validate', formData, {
    timeout: 30000,
  }),
  generate: (formData) => api.post('/wage-slips/generate', formData, {
    responseType: 'blob',
    timeout: 60000,
  }),
};

export const paymentReceiptAPI = {
  validate: (formData) => api.post('/receipts/validate', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  }),
  generate: (formData) => api.post('/receipts/generate', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
    timeout: 120000,
  }),
};
