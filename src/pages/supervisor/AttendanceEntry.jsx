import React, { useState } from 'react';
import { useSalaryContext } from '../../context/SalaryContext';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/common/Toast';
import Loader from '../../components/common/Loader';
import { AdminSidebar } from '../admin/Dashboard';
import EmployeeSearchModal from '../../components/salary/EmployeeSearchModal';
import AttendanceEntryTable from '../../components/salary/AttendanceEntryTable';
import { validateAttendanceData, getMonthName } from '../../utils/salaryUtils';

const AttendanceEntry = () => {
  const { user } = useAuth();
  const {
    saveAttendanceEntry,
    loading,
    error,
    successMessage,
    clearError,
    clearSuccessMessage,
  } = useSalaryContext();

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [entries, setEntries] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    clms_id: '',
    days_present: '',
    rate_per_day: '',
    ot_amount: '0',
    advance: '0',
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const getEmployeeDailyRate = (employee) => (
    Number(employee?.dailyWageRate || employee?.dailyWagesRate || employee?.comp_rate || 0)
  );

  const getEmployeeGovRate = (employee) => (
    Number(employee?.govDailyRate || employee?.govDailyWage || employee?.gov_rate || 0)
  );

  // Handle month/year change
  const handleMonthYearChange = (newMonth, newYear) => {
    setMonth(newMonth);
    setYear(newYear);
    setEntries([]);
    setFormData({
      employee_id: '',
      clms_id: '',
      days_present: '',
      rate_per_day: '',
      ot_amount: '0',
      advance: '0',
    });
  };

  // Handle employee selection
  const handleEmployeeSelect = (employee) => {
    const dailyRate = getEmployeeDailyRate(employee);
    setSelectedEmployee(employee);
    setFormData({
      employee_id: employee._id,
      clms_id: employee.clmsId,
      days_present: '',
      rate_per_day: dailyRate || '',
      ot_amount: '0',
      advance: '0',
    });
    setShowSearchModal(false);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle add entry
  const handleAddEntry = async () => {
    try {
      clearError();

      // Validate data
      const resolvedRatePerDay = parseFloat(formData.rate_per_day) || getEmployeeDailyRate(selectedEmployee);
      const validationErrors = validateAttendanceData({
        employee_id: formData.employee_id,
        month,
        year,
        days_present: parseFloat(formData.days_present),
        rate_per_day: resolvedRatePerDay,
        ot_amount: parseFloat(formData.ot_amount) || 0,
        advance: parseFloat(formData.advance) || 0,
      });

      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      // Check for duplicate
      const isDuplicate = entries.some(
        (e) => e.employee_id === formData.employee_id
      );

      if (isDuplicate) {
        throw new Error('This employee is already added. Edit or delete the existing entry.');
      }

      // Add to local state (don't save to DB yet)
      const newEntry = {
        id: `temp-${Date.now()}`,
        ...formData,
        employee_id: formData.employee_id,
        clms_id: formData.clms_id,
        month,
        year,
        days_present: parseFloat(formData.days_present),
        rate_per_day: resolvedRatePerDay,
        ot_amount: parseFloat(formData.ot_amount) || 0,
        advance: parseFloat(formData.advance) || 0,
        employee_details: selectedEmployee,
      };

      setEntries((prev) => [...prev, newEntry]);

      // Reset form
      setFormData({
        employee_id: '',
        clms_id: '',
        days_present: '',
        rate_per_day: '',
        ot_amount: '0',
        advance: '0',
      });
      setSelectedEmployee(null);
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle save all
  const handleSaveAll = async () => {
    try {
      clearError();

      if (entries.length === 0) {
        alert('Please add at least one entry');
        return;
      }

      // Save all entries
      let savedCount = 0;
      const errors = [];

      for (const entry of entries) {
        try {
          await saveAttendanceEntry({
            employee_id: entry.employee_id,
            clms_id: entry.clms_id,
            month,
            year,
            days_present: entry.days_present,
            rate_per_day: entry.rate_per_day,
            ot_amount: entry.ot_amount || 0,
            advance: entry.advance || 0,
          });
          savedCount++;
        } catch (err) {
          errors.push({
            clmsId: entry.clms_id,
            error: err.message,
          });
        }
      }

      // Show result
      if (savedCount > 0) {
        alert(`Successfully saved ${savedCount} entries`);
        setEntries([]);
      }

      if (errors.length > 0) {
        console.error('Errors:', errors);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle delete entry
  const handleDeleteEntry = (id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  // Handle update entry
  const handleUpdateEntry = (id, updatedData) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updatedData } : e))
    );
  };

  return (
<div className="flex min-h-screen bg-gray-50">
        <AdminSidebar active="attendance-entry" isMobileOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
        <main className="flex-1 py-8 px-4 lg:ml-64">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Attendance Entry</h1>
                <p className="text-gray-600 mt-2">Supervisor: {user?.name || 'N/A'}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
              >
                Menu
              </button>
            </div>

        {/* Month/Year Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month
              </label>
              <select
                value={month}
                onChange={(e) => handleMonthYearChange(parseInt(e.target.value), year)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {getMonthName(i + 1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <select
                value={year}
                onChange={(e) => handleMonthYearChange(month, parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const y = new Date().getFullYear() - 2 + i;
                  return (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Selected: <strong>{getMonthName(month)} {year}</strong>
          </p>
        </div>

        {/* Employee Search and Entry Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Attendance Entry</h2>

          {/* Selected Employee Info */}
          {selectedEmployee && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
              <p className="text-sm text-gray-600">
                <strong>Employee:</strong> {selectedEmployee.name} ({selectedEmployee.clmsId})
              </p>
              <p className="text-sm text-gray-600">
                <strong>Daily Gov Rate:</strong> {getEmployeeGovRate(selectedEmployee) || 0}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Daily Wage Rate:</strong> {getEmployeeDailyRate(selectedEmployee) || 0}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Employee Search Button */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Employee
              </label>
              <button
                onClick={() => setShowSearchModal(true)}
                className="w-full px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Search by CLMS ID or Name
              </button>
            </div>

            {/* Days Present */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Days Present
              </label>
              <input
                type="number"
                name="days_present"
                value={formData.days_present}
                onChange={handleInputChange}
                placeholder="0"
                step="0.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Rate Per Day */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate Per Day {getEmployeeDailyRate(selectedEmployee) ? '(Optional)' : ''}
              </label>
              <input
                type="number"
                name="rate_per_day"
                value={formData.rate_per_day}
                onChange={handleInputChange}
                placeholder={getEmployeeDailyRate(selectedEmployee) ? String(getEmployeeDailyRate(selectedEmployee)) : 'Enter rate per day'}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* OT Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OT Amount (₹)
              </label>
              <input
                type="number"
                name="ot_amount"
                value={formData.ot_amount}
                onChange={handleInputChange}
                placeholder="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Advance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Advance (₹)
              </label>
              <input
                type="number"
                name="advance"
                value={formData.advance}
                onChange={handleInputChange}
                placeholder="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleAddEntry}
            disabled={loading || !selectedEmployee}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            {loading ? 'Adding...' : 'Add Entry'}
          </button>
        </div>

        {/* Entries Table */}
        {entries.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Entries to Save ({entries.length})
            </h2>
            <AttendanceEntryTable
              entries={entries}
              onUpdate={handleUpdateEntry}
              onDelete={handleDeleteEntry}
            />
          </div>
        )}

        {/* Save All Button */}
        {entries.length > 0 && (
          <button
            onClick={handleSaveAll}
            disabled={loading}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {loading ? 'Saving...' : `Save All ${entries.length} Entries`}
          </button>
        )}
          </div>
        </main>

        {/* Modals and Toasts */}
      {showSearchModal && (
        <EmployeeSearchModal
          onSelect={handleEmployeeSelect}
          onClose={() => setShowSearchModal(false)}
        />
      )}

      {error && (
        <Toast type="error" message={error} onClose={clearError} />
      )}

      {successMessage && (
        <Toast type="success" message={successMessage} onClose={clearSuccessMessage} />
      )}

      {loading && <Loader />}
    </div>
  );
};

export default AttendanceEntry;
