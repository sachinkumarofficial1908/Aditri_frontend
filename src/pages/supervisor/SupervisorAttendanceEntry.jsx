import React, { useState, useCallback } from 'react';
import debounce from 'lodash/debounce';
import api from '../../utils/api';

/**
 * Supervisor Attendance Entry Page
 * Allows supervisors to enter attendance one-by-one
 */

const SupervisorAttendanceEntry = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [salaryType, setSalaryType] = useState('normal');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Form fields
  const [attendanceData, setAttendanceData] = useState({
    numberOfDays: 0,
    otAmount: 0,
    advance: 0
  });

  const [calculatedSalary, setCalculatedSalary] = useState(null);
  const [queueStats, setQueueStats] = useState(null);

  // Search employees
  const handleSearch = useCallback(
    debounce(async (query) => {
      if (!query || query.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        const response = await api.get('/salary/attendance/search/employees', {
          params: { query }
        });

        setSearchResults(response.data.data || []);
      } catch (err) {
        console.error('Search error:', err);
      }
    }, 300),
    []
  );

  const onSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleSearch(query);
  };

  // Select employee
  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
    setSearchQuery('');
    setSearchResults([]);
    setAttendanceData({
      numberOfDays: 0,
      otAmount: 0,
      advance: 0
    });
    setCalculatedSalary(null);
  };

  // Update attendance data
  const handleAttendanceChange = (e) => {
    const { name, value } = e.target;
    setAttendanceData({
      ...attendanceData,
      [name]: parseFloat(value) || 0
    });
  };

  // Calculate salary preview
  const calculatePreview = async () => {
    if (!selectedEmployee) {
      setError('Please select an employee first');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.post('/salary/salary/calculate', {
        clms_id: selectedEmployee.clmsId,
        numberOfDays: attendanceData.numberOfDays,
        otAmount: attendanceData.otAmount,
        advance: attendanceData.advance,
        salaryType
      });

      setCalculatedSalary(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to calculate salary');
    } finally {
      setLoading(false);
    }
  };

  // Save attendance entry
  const saveAttendance = async () => {
    if (!selectedEmployee) {
      setError('Please select an employee');
      return;
    }

    if (attendanceData.numberOfDays < 0 || attendanceData.numberOfDays > 31) {
      setError('Days must be between 0 and 31');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await api.post('/salary/attendance/manual', {
        clms_id: selectedEmployee.clmsId,
        employee_id: selectedEmployee._id,
        month: parseInt(month),
        year: parseInt(year),
        numberOfDays: attendanceData.numberOfDays,
        otAmount: attendanceData.otAmount,
        advance: attendanceData.advance,
        salaryType
      });

      setSuccessMessage('Attendance saved successfully!');
      setSelectedEmployee(null);
      setAttendanceData({
        numberOfDays: 0,
        otAmount: 0,
        advance: 0
      });
      setCalculatedSalary(null);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setLoading(false);
    }
  };

  // Fetch queue stats
  const fetchQueueStats = async () => {
    try {
      const response = await api.get('/attendance/queue/stats', {
        params: { month, year }
      });

      if (response.data.data) {
        setQueueStats(response.data.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch queue stats:', err);
    }
  };

  React.useEffect(() => {
    fetchQueueStats();
  }, [month, year]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Attendance Entry</h1>

        {/* Period Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Period & Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Salary Type</label>
              <select
                value={salaryType}
                onChange={(e) => setSalaryType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="normal">Normal</option>
                <option value="gov">Government</option>
              </select>
            </div>
          </div>
        </div>

        {/* Queue Stats */}
        {queueStats && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-100 rounded-lg p-4 text-center">
              <p className="text-gray-600 text-sm">Total Records</p>
              <p className="text-2xl font-bold text-blue-600">{queueStats.totalRecords}</p>
            </div>
            <div className="bg-green-100 rounded-lg p-4 text-center">
              <p className="text-gray-600 text-sm">Submitted</p>
              <p className="text-2xl font-bold text-green-600">{queueStats.submitted}</p>
            </div>
            <div className="bg-yellow-100 rounded-lg p-4 text-center">
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{queueStats.pending}</p>
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-8">
            {successMessage}
          </div>
        )}

        {/* Employee Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Search Employee</h2>

          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search by CLMS ID or Employee Name"
              value={searchQuery}
              onChange={onSearchChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 shadow-lg z-10 max-h-64 overflow-y-auto">
                {searchResults.map((emp) => (
                  <button
                    key={emp._id}
                    onClick={() => handleSelectEmployee(emp)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-200 transition"
                  >
                    <div className="font-semibold text-gray-900">{emp.name}</div>
                    <div className="text-sm text-gray-600">CLMS: {emp.clmsId} | Rate: ₹{emp.comp_rate}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Employee */}
          {selectedEmployee && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-lg font-semibold text-gray-900">{selectedEmployee.name}</p>
                  <p className="text-sm text-gray-600">CLMS ID: {selectedEmployee.clmsId}</p>
                  <p className="text-sm text-gray-600">Daily Rate: ₹{selectedEmployee.comp_rate}</p>
                </div>
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Attendance Form */}
        {selectedEmployee && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Attendance Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Days Worked *
                </label>
                <input
                  type="number"
                  name="numberOfDays"
                  value={attendanceData.numberOfDays}
                  onChange={handleAttendanceChange}
                  min="0"
                  max="31"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">OT Amount</label>
                <input
                  type="number"
                  name="otAmount"
                  value={attendanceData.otAmount}
                  onChange={handleAttendanceChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Advance</label>
                <input
                  type="number"
                  name="advance"
                  value={attendanceData.advance}
                  onChange={handleAttendanceChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                onClick={calculatePreview}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium"
              >
                {loading ? 'Calculating...' : 'Calculate Salary'}
              </button>

              <button
                onClick={saveAttendance}
                disabled={loading || !calculatedSalary}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition font-medium"
              >
                {loading ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </div>
        )}

        {/* Calculated Salary Preview */}
        {calculatedSalary && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Salary Preview</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SalaryField label="Total Amount" value={`₹${calculatedSalary.totalAmount}`} />
              <SalaryField label="Bonus (8.33%)" value={`₹${calculatedSalary.bonus}`} />
              <SalaryField label="Leave Bonus" value={`₹${calculatedSalary.leaveBonus}`} />
              <SalaryField label="Gross" value={`₹${calculatedSalary.gross}`} highlight />
              <SalaryField label="PF (12%)" value={`₹${calculatedSalary.pf}`} />
              <SalaryField label="ESIC (0.75%)" value={`₹${calculatedSalary.esic}`} />
              <SalaryField label="Net Deduction" value={`₹${calculatedSalary.netDeduction}`} />
              <SalaryField label="Net Payable" value={`₹${calculatedSalary.netPayable}`} highlight success />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Salary Field Component
 */
const SalaryField = ({ label, value, highlight, success }) => {
  let bgColor = 'bg-white';
  let textColor = 'text-gray-900';

  if (highlight) {
    bgColor = success ? 'bg-green-50' : 'bg-yellow-50';
    textColor = success ? 'text-green-700' : 'text-yellow-700';
  }

  return (
    <div className={`${bgColor} border border-gray-200 rounded-lg p-4`}>
      <p className="text-gray-600 text-xs font-medium uppercase mb-1">{label}</p>
      <p className={`${textColor} text-lg font-bold`}>{value}</p>
    </div>
  );
};

export default SupervisorAttendanceEntry;
