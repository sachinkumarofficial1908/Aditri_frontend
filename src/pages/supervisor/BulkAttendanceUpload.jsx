import React, { useState } from 'react';
import { useSalaryContext } from '../../context/SalaryContext';
import Toast from '../../components/common/Toast';
import Loader from '../../components/common/Loader';
import BulkUploadPreview from '../../components/salary/BulkUploadPreview';
import { getMonthName } from '../../utils/salaryUtils';
import toast from 'react-hot-toast';

const BulkAttendanceUpload = () => {
  const {
    saveBulkAttendance,
    loading,
    error,
    successMessage,
    clearError,
    clearSuccessMessage,
  } = useSalaryContext();

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    const allowedExtensions = ['.xlsx', '.xls'];
    const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.'));

    if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        // For now, just show the file name
        setPreview({
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          lastModified: new Date(selectedFile.lastModified).toLocaleDateString(),
        });
      } catch (err) {
        toast.error('Error reading file');
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleUpload = async () => {
    try {
      clearError();

      if (!file) {
        toast.error('Please select a file');
        return;
      }

      const result = await saveBulkAttendance(file, month, year);

      setUploadResult(result);
      setFile(null);
      setPreview(null);
    } catch (err) {
      // Error is handled by context
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 min-w-0 py-8 px-4 ">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bulk Attendance Upload</h1>
              <p className="text-gray-600 mt-2">Upload attendance data via Excel file</p>
            </div>
          </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">Excel Format Requirements</h2>
          <ul className="list-disc list-inside text-blue-800 space-y-1">
            <li><strong>Column 1:</strong> CLMS ID</li>
            <li><strong>Column 2:</strong> Employee Name</li>
            <li><strong>Column 3:</strong> Days Present</li>
            <li><strong>Column 4 (Optional):</strong> Rate Per Day</li>
          </ul>
          <p className="text-sm text-blue-700 mt-3">
            ℹ️ If rate is not provided, the system will use the employee master rate.
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload File</h2>

          {/* Month/Year Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
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
                onChange={(e) => setYear(parseInt(e.target.value))}
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

          {/* File Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Excel File
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* File Preview */}
          {preview && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">File Details</h3>
              <p className="text-sm text-gray-600">
                <strong>Name:</strong> {preview.fileName}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Size:</strong> {(preview.fileSize / 1024).toFixed(2)} KB
              </p>
              <p className="text-sm text-gray-600">
                <strong>Modified:</strong> {preview.lastModified}
              </p>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 font-semibold focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            {loading ? 'Uploading...' : 'Upload & Process'}
          </button>
        </div>

        {/* Upload Result */}
        {uploadResult && (
          <BulkUploadPreview result={uploadResult} />
        )}
      </div>

      {/* Toasts */}
      {error && (
        <Toast type="error" message={error} onClose={clearError} />
      )}

      {successMessage && (
        <Toast type="success" message={successMessage} onClose={clearSuccessMessage} />
      )}

      {loading && <Loader />}
      </main>
    </div>
  );
};

export default BulkAttendanceUpload;
