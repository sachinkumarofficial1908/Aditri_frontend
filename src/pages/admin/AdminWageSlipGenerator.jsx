import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, UploadCloud, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { wageSlipAPI } from '../../utils/api';
import { AdminSidebar } from './Dashboard';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const YEAR_OPTIONS = Array.from({ length: 12 }, (_, index) => 2024 + index);

export default function AdminWageSlipGenerator() {
  const [file, setFile] = useState(null);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [downloadName, setDownloadName] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState([]);
  const [missingHeaders, setMissingHeaders] = useState([]);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [skippedRows, setSkippedRows] = useState(0);

  const resetState = () => {
    setDownloadUrl('');
    setDownloadName('');
    setMessage('');
    setErrors([]);
    setMissingHeaders([]);
    setGeneratedCount(0);
    setSkippedRows(0);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files?.[0] || null);
    resetState();
  };

  const saveDownload = (blob, filename) => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
    const url = URL.createObjectURL(blob);
    setDownloadUrl(url);
    setDownloadName(filename);
  };

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const fetchGenerate = async (confirmMissing = false) => {
    if (!file) {
      toast.error('Please upload an Excel file first.');
      return;
    }

    if (!month) {
      toast.error('Please select a month.');
      return;
    }

    if (!year) {
      toast.error('Please select a year.');
      return;
    }

    setLoading(true);
    setErrors([]);
    setMissingHeaders([]);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('month', month);
      formData.append('year', year);
      if (confirmMissing) formData.append('continueOnMissing', 'true');

      const response = await wageSlipAPI.generate(formData);
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const fileName = response.headers['content-disposition']?.split('filename=')[1]?.replace(/"/g, '') || `wage-slips-${month}-${year}.xlsx`;
      saveDownload(blob, fileName);

      setGeneratedCount(Number(response.headers['x-wageslip-generated'] || 0));
      setSkippedRows(Number(response.headers['x-wageslip-skipped'] || 0));
      setMessage('Wage slips generated successfully.');
      toast.success('Wage slips generated successfully.');
    } catch (error) {
      const serverData = error.response?.data;
      if (serverData?.missingHeaders?.length) {
        setMissingHeaders(serverData.missingHeaders);
        setErrors([serverData.message || 'Some headers are missing.']);
        toast.error('Missing headers detected. Please confirm to continue with blank values.');
        return;
      }

      const message = serverData?.message || error.message || 'Failed to generate wage slips.';
      setErrors([message]);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => fetchGenerate(false);

  const handleContinueMissing = async () => {
    setMissingHeaders([]);
    await fetchGenerate(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar active="wage-slip-generator" />
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">Wage Slip Generator</h1>
              <p className="text-sm text-gray-600 mt-2">
                Upload a worker wage data file, choose the month and year, and generate formatted wage slips for each employee.
              </p>
            </div>
            <Link to="/admin" className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition">
              <ArrowLeft size={16} /> Back
            </Link>
          </div>

          <div className="space-y-6 bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
            <div className="grid gap-6 lg:grid-cols-3">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Month</span>
                <select
                  value={month}
                  onChange={(event) => setMonth(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-primary-600 focus:outline-none"
                >
                  <option value="">Select month</option>
                  {MONTHS.map((label, index) => (
                    <option key={label} value={label}>{label}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Year</span>
                <select
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-primary-600 focus:outline-none"
                >
                  <option value="">Select year</option>
                  {YEAR_OPTIONS.map((value) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Upload Excel</span>
                <div className="mt-2 flex items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-slate-50 px-4 py-4">
                  <UploadCloud size={18} className="text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-700">Select an Excel file with wage data</p>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileChange}
                      className="mt-2 w-full cursor-pointer text-sm text-gray-700"
                    />
                  </div>
                </div>
              </label>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 flex gap-3">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Required Headers:</p>
                <p className="mt-1">Company Name, Name, S/O, Grade, Emp ID No., PF No, ESIC No., Bank A/C, Aadhar, Rate per Day, Total Payable days</p>
                <p className="mt-2 font-semibold">Optional Headers:</p>
                <p>Other Allowance (will be placed in G10 of wage slip)</p>
              </div>
            </div>

            {errors.length > 0 && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <p className="font-semibold">Validation issues</p>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {missingHeaders.length > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="font-semibold">Missing headers detected:</p>
                <p className="mt-2">{missingHeaders.join(', ')}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleContinueMissing}
                    className="inline-flex items-center justify-center rounded-2xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={loading}
                  >
                    Continue with blank values
                  </button>
                  <button
                    type="button"
                    onClick={() => setMissingHeaders([])}
                    className="inline-flex items-center justify-center rounded-2xl border border-amber-600 bg-white px-5 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading || !file || !month || !year}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Generating...' : 'Generate Wage Slips'}
              </button>

              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download={downloadName}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary-600 bg-white px-5 py-3 text-sm font-semibold text-primary-600 transition hover:bg-primary-50"
                >
                  <Download size={16} /> Download Excel
                </a>
              )}
            </div>

            {message && (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
                <p>{message}</p>
                <p className="mt-2 text-sm text-gray-700">Generated slips: {generatedCount}, skipped rows: {skippedRows}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
