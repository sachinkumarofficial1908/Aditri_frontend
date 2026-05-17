import React, { useState } from 'react';
import axios from 'axios';

/**
 * Excel Upload Component
 * Allows supervisors to upload bulk attendance Excel files
 */

const AttendanceExcelUpload = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [salaryType, setSalaryType] = useState('normal');

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadStage, setUploadStage] = useState('upload'); // upload, preview, confirm
  const [validationData, setValidationData] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Handle file selection
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError(null);
    }
  };

  // Validate and preview file
  const validateFile = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('month', month);
      formData.append('year', year);
      formData.append('salaryType', salaryType);

      const response = await axios.post(
        '/api/excel/attendance/validate',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      setValidationData(response.data.data);
      setUploadStage('preview');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to validate file');
    } finally {
      setLoading(false);
    }
  };

  // Confirm and save attendance
  const confirmUpload = async () => {
    if (!validationData?.validData) {
      setError('No valid data to upload');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('/api/excel/attendance/confirm', {
        attendanceData: validationData.validData,
        month: parseInt(month),
        year: parseInt(year),
        salaryType
      });

      const result = response.data.data;
      setSuccessMessage(
        `Successfully uploaded ${result.savedCount} records. ${result.failedCount} failed.`
      );

      // Reset form
      setFile(null);
      setFileName('');
      setValidationData(null);
      setUploadStage('upload');

      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm upload');
    } finally {
      setLoading(false);
    }
  };

  // Download template
  const downloadTemplate = async () => {
    try {
      const response = await axios.get('/api/excel/template/attendance', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError('Failed to download template');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Bulk Attendance Upload</h1>

        {/* Period Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upload Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                disabled={uploadStage !== 'upload'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
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
                disabled={uploadStage !== 'upload'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
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
                disabled={uploadStage !== 'upload'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="normal">Normal</option>
                <option value="gov">Government</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
              <button
                onClick={downloadTemplate}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Download Template
              </button>
            </div>
          </div>
        </div>

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

        {/* Upload Stage */}
        {uploadStage === 'upload' && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Select File</h2>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6 hover:border-blue-500 transition">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
                disabled={loading}
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <div className="text-4xl mb-4">📁</div>
                <p className="text-lg font-semibold text-gray-800">
                  {fileName || 'Click to select Excel file or drag and drop'}
                </p>
                <p className="text-sm text-gray-600 mt-2">Only .xlsx and .xls files are accepted</p>
              </label>
            </div>

            {fileName && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">Selected file:</p>
                <p className="text-lg font-semibold text-gray-900">{fileName}</p>
              </div>
            )}

            <button
              onClick={validateFile}
              disabled={!file || loading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium"
            >
              {loading ? 'Validating...' : 'Validate & Preview'}
            </button>
          </div>
        )}

        {/* Preview Stage */}
        {uploadStage === 'preview' && validationData && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Preview Data</h2>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-gray-600 text-sm">Valid Entries</p>
                <p className="text-2xl font-bold text-green-600">{validationData.validEntries}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <p className="text-gray-600 text-sm">Invalid Entries</p>
                <p className="text-2xl font-bold text-red-600">{validationData.invalidEntries}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-gray-600 text-sm">Total Entries</p>
                <p className="text-2xl font-bold text-blue-600">{validationData.totalEntries}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <p className="text-gray-600 text-sm">Success Rate</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {Math.round((validationData.validEntries / validationData.totalEntries) * 100)}%
                </p>
              </div>
            </div>

            {/* Valid Data Table */}
            {validationData.validData.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Valid Records ({validationData.validEntries})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">CLMS ID</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Name</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Days</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validationData.validData.slice(0, 10).map((record, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2">{record.clms_id}</td>
                          <td className="px-4 py-2">{record.name}</td>
                          <td className="px-4 py-2">{record.days_present}</td>
                          <td className="px-4 py-2">₹{record.rate_per_day}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {validationData.validData.length > 10 && (
                  <p className="text-sm text-gray-600 mt-2">
                    ... and {validationData.validData.length - 10} more records
                  </p>
                )}
              </div>
            )}

            {/* Errors */}
            {validationData.errors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-red-600 mb-4">Errors ({validationData.errors.length})</h3>
                <div className="bg-red-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  {validationData.errors.slice(0, 20).map((err, idx) => (
                    <div key={idx} className="text-sm text-red-700 mb-2 pb-2 border-b border-red-200">
                      <strong>{err.clmsId}</strong>: {err.error}
                    </div>
                  ))}
                  {validationData.errors.length > 20 && (
                    <p className="text-sm text-red-600 mt-2">... and {validationData.errors.length - 20} more errors</p>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setUploadStage('upload');
                  setValidationData(null);
                  setFile(null);
                  setFileName('');
                }}
                className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
              >
                Back
              </button>

              <button
                onClick={confirmUpload}
                disabled={loading || validationData.validEntries === 0}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition font-medium"
              >
                {loading ? 'Uploading...' : `Confirm & Upload ${validationData.validEntries} Records`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceExcelUpload;
