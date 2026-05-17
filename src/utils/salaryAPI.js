import axios from 'axios';
import { ENV } from './env.js';

const api = axios.create({
  baseURL: ENV.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ENV.authTokenKey);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Attendance API Services
 */
export const attendanceAPI = {
  // Save manual attendance entry
  saveManualEntry: (data) =>
    api.post('/salary/attendance/manual', data),

  // Bulk upload attendance
  uploadBulk: (file, month, year) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('month', month);
    formData.append('year', year);

    return api.post('/salary/attendance/bulk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get attendance by month/year
  getAttendance: (month, year, supervisorId = null) => {
    const params = { month, year };
    if (supervisorId) params.supervisorId = supervisorId;
    return api.get('/salary/attendance', { params });
  },

  // Get supervisor's attendance
  getSupervisorAttendance: (month, year) =>
    api.get('/salary/attendance', { params: { month, year } }),

  // Update attendance entry
  updateEntry: (id, data) =>
    api.put(`/salary/attendance/${id}`, data),

  // Delete attendance entry
  deleteEntry: (id) =>
    api.delete(`/salary/attendance/${id}`),

  // Search employees
  searchEmployees: (query) =>
    api.get('/salary/attendance/search/employees', {
      params: { query },
    }),
};

/**
 * Salary Generation API Services
 */
export const salaryAPI = {
  getProcessStatus: (month, year) =>
    api.get('/salary/salary/process-status', {
      params: { month, year },
    }),

  completeProcess: (month, year) =>
    api.post('/salary/salary/process-complete', { month, year }),

  // Generate government salary
  generateGovSalary: (month, year, bonusConfig, deductionConfig) =>
    api.post('/salary/salary/gov-salary', {
      month,
      year,
      bonusConfig,
      deductionConfig,
    }),

  // Generate company salary
  generateCompanySalary: (month, year, bonusConfig) =>
    api.post('/salary/salary/company-salary', {
      month,
      year,
      bonusConfig,
    }),

  // Get government salary records
  getGovSalaries: (month, year) =>
    api.get('/salary/salary/gov-salary', {
      params: { month, year },
    }),

  // Get company salary records
  getCompanySalaries: (month, year) =>
    api.get('/salary/salary/company-salary', {
      params: { month, year },
    }),

  // Update government salary
  updateGovSalary: (id, data) =>
    api.put(`/salary/salary/gov-salary/${id}`, data),

  // Update company salary
  updateCompanySalary: (id, data) =>
    api.put(`/salary/salary/company-salary/${id}`, data),

  // Download government salary Excel
  downloadGovSalaryExcel: (month, year) => {
    return api.get('/salary/salary/download/gov-salary', {
      params: { month, year },
      responseType: 'blob',
    });
  },

  // Download company salary Excel
  downloadCompanySalaryExcel: (month, year) => {
    return api.get('/salary/salary/download/company-salary', {
      params: { month, year },
      responseType: 'blob',
    });
  },

  // Download both salary reports
  downloadBothSalaryExcel: (month, year) => {
    return api.get('/salary/salary/download/both', {
      params: { month, year },
      responseType: 'blob',
    });
  },
};

export default api;
