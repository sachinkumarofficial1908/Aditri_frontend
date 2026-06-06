import React, { createContext, useState, useCallback } from 'react';
import { attendanceAPI, salaryAPI } from '../utils/salaryAPI';
import { DEFAULT_BONUSES, DEFAULT_DEDUCTIONS } from '../utils/salaryUtils';

export const SalaryContext = createContext();

export const SalaryProvider = ({ children }) => {
  // Attendance state
  const [attendanceEntries, setAttendanceEntries] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Salary generation state
  const [govSalaries, setGovSalaries] = useState([]);
  const [companySalaries, setCompanySalaries] = useState([]);
  const [bonusConfig, setBonusConfig] = useState({
    bonuses: DEFAULT_BONUSES,
  });
  const [deductionConfig, setDeductionConfig] = useState(DEFAULT_DEDUCTIONS);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  /**
   * ATTENDANCE OPERATIONS
   */

  const saveAttendanceEntry = useCallback(
    async (data) => {
      try {
        setLoading(true);
        setError(null);

        const response = await attendanceAPI.saveManualEntry(data);
        setSuccessMessage('Attendance entry saved successfully');

        return response.data;
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to save attendance entry';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const saveBulkAttendance = useCallback(
    async (file, month, year) => {
      try {
        setLoading(true);
        setError(null);

        const response = await attendanceAPI.uploadBulk(file, month, year);
        setSuccessMessage('Bulk attendance uploaded successfully');

        return response.data;
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to upload bulk attendance';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchAttendance = useCallback(
    async (month, year, supervisorId = null) => {
      try {
        setLoading(true);
        setError(null);

        const response = await attendanceAPI.getAttendance(month, year, supervisorId);
        setAttendanceEntries(response.data.data || []);

        return response.data.data || [];
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to fetch attendance';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateAttendanceEntry = useCallback(
    async (id, data) => {
      try {
        setLoading(true);
        setError(null);

        const response = await attendanceAPI.updateEntry(id, data);
        setSuccessMessage('Attendance entry updated successfully');

        // Update local state
        setAttendanceEntries((prev) =>
          prev.map((entry) => (entry._id === id ? response.data.data : entry))
        );

        return response.data;
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to update attendance entry';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteAttendanceEntry = useCallback(
    async (id) => {
      try {
        setLoading(true);
        setError(null);

        await attendanceAPI.deleteEntry(id);
        setSuccessMessage('Attendance entry deleted successfully');

        // Update local state
        setAttendanceEntries((prev) =>
          prev.filter((entry) => entry._id !== id)
        );
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to delete attendance entry';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const searchEmployees = useCallback(
    async (query) => {
      try {
        const response = await attendanceAPI.searchEmployees(query);
        return response.data.data || [];
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to search employees';
        setError(message);
        throw err;
      }
    },
    []
  );

  /**
   * SALARY GENERATION OPERATIONS
   */

  const generateGovSalary = useCallback(
    async (month, year) => {
      try {
        setLoading(true);
        setError(null);

        const response = await salaryAPI.generateGovSalary(
          month,
          year,
          bonusConfig,
          deductionConfig
        );

        setSuccessMessage('Government salary generated successfully');
        return response.data.data || [];
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to generate government salary';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [bonusConfig, deductionConfig]
  );

  const generateCompanySalary = useCallback(
    async (month, year) => {
      try {
        setLoading(true);
        setError(null);

        const response = await salaryAPI.generateCompanySalary(
          month,
          year,
          bonusConfig
        );

        setSuccessMessage('Original salary generated successfully');
        return response.data.data || [];
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to generate original salary';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [bonusConfig]
  );

  const fetchGovSalaries = useCallback(
    async (month, year) => {
      try {
        setLoading(true);
        setError(null);

        const response = await salaryAPI.getGovSalaries(month, year);
        setGovSalaries(response.data.data || []);

        return response.data.data || [];
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to fetch government salaries';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchCompanySalaries = useCallback(
    async (month, year) => {
      try {
        setLoading(true);
        setError(null);

        const response = await salaryAPI.getCompanySalaries(month, year);
        setCompanySalaries(response.data.data || []);

        return response.data.data || [];
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to fetch company salaries';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateGovSalary = useCallback(
    async (id, data) => {
      try {
        setLoading(true);
        setError(null);

        const response = await salaryAPI.updateGovSalary(id, data);
        const updatedSalary = response.data.data;
        setGovSalaries((prev) =>
          prev.map((salary) => (salary._id === id ? updatedSalary : salary))
        );
        setSuccessMessage('Government salary updated successfully');

        return updatedSalary;
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to update government salary';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateCompanySalary = useCallback(
    async (id, data) => {
      try {
        setLoading(true);
        setError(null);

        const response = await salaryAPI.updateCompanySalary(id, data);
        const updatedSalary = response.data.data;
        setCompanySalaries((prev) =>
          prev.map((salary) => (salary._id === id ? updatedSalary : salary))
        );
        setSuccessMessage('Original salary updated successfully');

        return updatedSalary;
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to update original salary';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const downloadGovSalaryExcel = useCallback(
    async (month, year) => {
      try {
        setLoading(true);
        setError(null);

        const response = await salaryAPI.downloadGovSalaryExcel(month, year);

        // Download file
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Government_Salary_${month}_${year}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);

        setSuccessMessage('Government salary Excel downloaded successfully');
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to download government salary Excel';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const downloadCompanySalaryExcel = useCallback(
    async (month, year) => {
      try {
        setLoading(true);
        setError(null);

        const response = await salaryAPI.downloadCompanySalaryExcel(month, year);

        // Download file
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Original_Salary_${month}_${year}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);

        setSuccessMessage('Original salary Excel downloaded successfully');
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to download original salary Excel';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const downloadBothSalaryExcel = useCallback(
    async (month, year) => {
      try {
        setLoading(true);
        setError(null);

        const response = await salaryAPI.downloadBothSalaryExcel(month, year);

        // Download file
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Salary_Reports_${month}_${year}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);

        setSuccessMessage('Salary reports Excel downloaded successfully');
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to download salary reports Excel';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getSalaryProcessStatus = useCallback(
    async (month, year) => {
      try {
        setLoading(true);
        setError(null);

        const response = await salaryAPI.getProcessStatus(month, year);
        return response.data.data;
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to fetch salary process status';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const completeSalaryProcess = useCallback(
    async (month, year) => {
      try {
        setLoading(true);
        setError(null);

        const response = await salaryAPI.completeProcess(month, year);
        setSuccessMessage('This month salary process completed');
        return response.data.data;
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to complete salary process';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * HELPER FUNCTIONS
   */

  const clearError = useCallback(() => setError(null), []);
  const clearSuccessMessage = useCallback(() => setSuccessMessage(null), []);

  const value = {
    // Attendance state
    attendanceEntries,
    setAttendanceEntries,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,

    // Salary state
    govSalaries,
    setGovSalaries,
    companySalaries,
    setCompanySalaries,
    bonusConfig,
    setBonusConfig,
    deductionConfig,
    setDeductionConfig,

    // UI state
    loading,
    error,
    successMessage,
    clearError,
    clearSuccessMessage,

    // Attendance operations
    saveAttendanceEntry,
    saveBulkAttendance,
    fetchAttendance,
    updateAttendanceEntry,
    deleteAttendanceEntry,
    searchEmployees,

    // Salary operations
    generateGovSalary,
    generateCompanySalary,
    fetchGovSalaries,
    fetchCompanySalaries,
    updateGovSalary,
    updateCompanySalary,
    downloadGovSalaryExcel,
    downloadCompanySalaryExcel,
    downloadBothSalaryExcel,
    getSalaryProcessStatus,
    completeSalaryProcess,
  };

  return (
    <SalaryContext.Provider value={value}>
      {children}
    </SalaryContext.Provider>
  );
};

export const useSalaryContext = () => {
  const context = React.useContext(SalaryContext);
  if (!context) {
    throw new Error('useSalaryContext must be used within SalaryProvider');
  }
  return context;
};
