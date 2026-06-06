import React, { useState } from 'react';
import { useSalaryContext } from '../../context/SalaryContext';
import { useAuth } from '../../context/AuthContext';
import { employeeAPI } from '../../utils/api';
import Toast from '../../components/common/Toast';
import Loader from '../../components/common/Loader';
import { AdminSidebar } from '../admin/Dashboard';
import AttendanceEntryTable from '../../components/salary/AttendanceEntryTable';
import { validateAttendanceData, getMonthName } from '../../utils/salaryUtils';

const emptyForm = {
  employee_id: '',
  clms_id: '',
  days_present: '',
  rate_per_day: '',
  ot_amount: '0',
  advance: '0',
};

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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const getEmployeeDailyRate = (employee) => (
    Number(employee?.dailyWageRate || employee?.dailyWagesRate || employee?.comp_rate || 0)
  );

  const getEmployeeGovRate = (employee) => (
    Number(employee?.govDailyRate || employee?.govDailyWage || employee?.gov_rate || 0)
  );

  React.useEffect(() => {
    const loadEmployees = async () => {
      try {
        setIsLoadingEmployees(true);
        const response = await employeeAPI.getAll({ limit: 10000, status: 'Valid' });
        setEmployees(response.data?.employees || []);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to load employees');
      } finally {
        setIsLoadingEmployees(false);
      }
    };

    loadEmployees();
  }, []);

  const filteredEmployees = employees.filter((employee) => {
    const query = employeeSearch.trim().toLowerCase();
    if (!query) return true;

    return (
      employee.name?.toLowerCase().includes(query) ||
      employee.clmsId?.toLowerCase().includes(query)
    );
  });

  const handleMonthYearChange = (newMonth, newYear) => {
    setMonth(newMonth);
    setYear(newYear);
    setEntries([]);
    setFormData(emptyForm);
    setSelectedEmployee(null);
  };

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
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddEntry = async () => {
    try {
      clearError();

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

      const isDuplicate = entries.some((entry) => entry.employee_id === formData.employee_id);
      if (isDuplicate) {
        throw new Error('This employee is already added. Edit or delete the existing entry.');
      }

      const newEntry = {
        id: `temp-${Date.now()}`,
        ...formData,
        month,
        year,
        days_present: parseFloat(formData.days_present),
        rate_per_day: resolvedRatePerDay,
        ot_amount: parseFloat(formData.ot_amount) || 0,
        advance: parseFloat(formData.advance) || 0,
        employee_details: selectedEmployee,
      };

      setEntries((prev) => [...prev, newEntry]);
      setFormData(emptyForm);
      setSelectedEmployee(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveAll = async () => {
    try {
      clearError();

      if (entries.length === 0) {
        alert('Please add at least one entry');
        return;
      }

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

  const handleDeleteEntry = (id) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleUpdateEntry = (id, updatedData) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, ...updatedData } : entry))
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar active="attendance-entry" isMobileOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
      <main className="flex-1 py-8 px-4 lg:ml-64">
        <div className="max-w-6xl mx-auto">
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

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                <select
                  value={month}
                  onChange={(e) => handleMonthYearChange(parseInt(e.target.value, 10), year)}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <select
                  value={year}
                  onChange={(e) => handleMonthYearChange(month, parseInt(e.target.value, 10))}
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

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Your Employees</h2>
                <p className="mt-1 text-sm text-gray-500">Select an employee to enter attendance details.</p>
              </div>
              <label className="w-full md:max-w-sm">
                <span className="block text-sm font-medium text-gray-700 mb-2">Search by Name or CLMS ID</span>
                <input
                  type="text"
                  value={employeeSearch}
                  onChange={(event) => setEmployeeSearch(event.target.value)}
                  placeholder="Search employee..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full table-fixed text-sm">
                <colgroup>
                  <col className="w-[20%]" />
                  <col className="w-[32%]" />
                  <col className="w-[28%]" />
                  <col className="w-[20%]" />
                </colgroup>
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    {['CLMS', 'Name', 'Designation', 'Action'].map((heading) => (
                      <th key={heading} className="px-4 py-3 text-left font-semibold">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoadingEmployees && (
                    <tr>
                      <td colSpan="4" className="px-4 py-6 text-center text-sm text-gray-500">Loading employees...</td>
                    </tr>
                  )}
                  {!isLoadingEmployees && filteredEmployees.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-4 py-6 text-center text-sm text-gray-500">No employees found.</td>
                    </tr>
                  )}
                  {!isLoadingEmployees && filteredEmployees.map((employee) => {
                    const isSelected = selectedEmployee?._id === employee._id;
                    return (
                      <tr key={employee._id} className={isSelected ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}>
                        <td className="truncate px-4 py-3 font-medium text-gray-700" title={employee.clmsId}>{employee.clmsId || '-'}</td>
                        <td className="truncate px-4 py-3 font-semibold text-gray-900" title={employee.name}>{employee.name || '-'}</td>
                        <td className="truncate px-4 py-3 text-gray-600" title={employee.designation}>{employee.designation || '-'}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleEmployeeSelect(employee)}
                            className={`inline-flex h-8 min-w-[76px] items-center justify-center rounded-md px-3 text-xs font-semibold transition ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-900 text-white hover:bg-gray-800'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {selectedEmployee && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
                  <p className="text-base font-semibold text-gray-900">{selectedEmployee.name}</p>
                  <p className="text-sm text-gray-600">CLMS ID: {selectedEmployee.clmsId}</p>
                  <p className="text-sm text-gray-600">Designation: {selectedEmployee.designation || '-'}</p>
                  <p className="text-sm text-gray-600">Government Daily Wage: {getEmployeeGovRate(selectedEmployee) || 0}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEmployee(null)}
                  className="inline-flex h-9 items-center justify-center rounded-md border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Attendance Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Days</label>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rate</label>
                  <input
                    type="number"
                    name="rate_per_day"
                    value={formData.rate_per_day}
                    onChange={handleInputChange}
                    placeholder={getEmployeeDailyRate(selectedEmployee) ? String(getEmployeeDailyRate(selectedEmployee)) : 'Enter rate'}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">OT</label>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Advance</label>
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
          )}

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
