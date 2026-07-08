import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../utils/api';

/**
 * Salary Management Dashboard
 * Admin view for managing salaries, generating reports, and locking salary months
 */

const SalaryManagementDashboard = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [salaryType, setSalaryType] = useState('normal');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('json');

  // Fetch salary summary
  const fetchSalarySummary = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get('/api/salary/summary', {
        params: { month, year, salaryType }
      });

      setSummary(response.data.data);
    } catch (err) {
      setError(getErrorMessage(err) || 'Failed to fetch summary');
    } finally {
      setLoading(false);
    }
  };

  // Generate salary report
  const generateReport = async (format = 'json') => {
    try {
      setLoading(true);

      if (format === 'excel') {
        const response = await axios.get('/api/reports/salary/monthly', {
          params: { month, year, salaryType, format: 'excel' },
          responseType: 'blob'
        });

        // Download Excel file
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `salary_report_${month}_${year}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      } else {
        const response = await axios.get('/api/reports/salary/monthly', {
          params: { month, year, salaryType, format: 'json' }
        });

        setSummary(response.data.data);
        toast.success('Report generated successfully.');
      }
    } catch (err) {
      setError(getErrorMessage(err) || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  // Lock salary month
  const lockSalaryMonth = async () => {
    if (!window.confirm(`Lock salary for ${month}/${year}? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);

      await axios.post('/api/salary/lock', {
        month: parseInt(month),
        year: parseInt(year),
        salaryType
      });

      toast.success('Salary month locked successfully!');
      fetchSalarySummary();
    } catch (err) {
      setError(getErrorMessage(err) || 'Failed to lock salary');
    } finally {
      setLoading(false);
    }
  };

  // Unlock salary month
  const unlockSalaryMonth = async () => {
    if (!window.confirm(`Unlock salary for ${month}/${year}? Allow further edits?`)) {
      return;
    }

    try {
      setLoading(true);

      await axios.post('/api/salary/unlock', {
        month: parseInt(month),
        year: parseInt(year),
        salaryType
      });

      toast.success('Salary month unlocked successfully!');
      fetchSalarySummary();
    } catch (err) {
      setError(getErrorMessage(err) || 'Failed to unlock salary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalarySummary();
  }, [month, year, salaryType]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Salary Management Dashboard</h1>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Filters & Actions</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                <option value="both">Both</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
              <button
                onClick={fetchSalarySummary}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => generateReport('json')}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
            >
              View Report
            </button>

            <button
              onClick={() => generateReport('excel')}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
            >
              Download Excel
            </button>

            <button
              onClick={lockSalaryMonth}
              disabled={loading}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition"
            >
              Lock Month
            </button>

            <button
              onClick={unlockSalaryMonth}
              disabled={loading}
              className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 transition"
            >
              Unlock Month
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <SummaryCard
              title="Total Records"
              value={summary.totalRecords}
              icon="📊"
            />
            <SummaryCard
              title="Total Gross Amount"
              value={`₹${summary.totalGross?.toLocaleString()}`}
              icon="💰"
            />
            <SummaryCard
              title="Total Deductions"
              value={`₹${summary.totalNetDeduction?.toLocaleString()}`}
              icon="📉"
            />
            <SummaryCard
              title="Total Net Payable"
              value={`₹${summary.totalNetPayable?.toLocaleString()}`}
              icon="✅"
            />
            <SummaryCard
              title="Average Gross"
              value={`₹${Math.round(summary.averageGross)?.toLocaleString()}`}
              icon="📈"
            />
            <SummaryCard
              title="Average Net Payable"
              value={`₹${Math.round(summary.averageNetPayable)?.toLocaleString()}`}
              icon="🎯"
            />
          </div>
        )}

        {/* Loading State */}
        {loading && !summary && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading data...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Summary Card Component
 */
const SummaryCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
};

export default SalaryManagementDashboard;
