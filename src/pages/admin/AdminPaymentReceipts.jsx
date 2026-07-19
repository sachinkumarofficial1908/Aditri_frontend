import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, UploadCloud, Download, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { paymentReceiptAPI, sanitizeErrorMessage } from '../../utils/api';

const PAYMENT_MODES = ['NEFT', 'IMPS'];
const TIME_OPTIONS = [
  ...Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, '0')}:00`),
  '23:59',
];

const getApiErrorMessage = async (error, fallback) => {
  const data = error.response?.data;

  if (data instanceof Blob) {
    try {
      const text = await data.text();
      const parsed = JSON.parse(text);
      return sanitizeErrorMessage(parsed.message || parsed.error, fallback);
    } catch {
      return fallback;
    }
  }

  return sanitizeErrorMessage(data?.message || error.message, fallback);
};

export default function AdminPaymentReceipts() {
  const [file, setFile] = useState(null);
  const [remitterName, setRemitterName] = useState('M/S ADITRI CONSTRUCTIONS SERVICES');
  const [remitterAccount, setRemitterAccount] = useState('1267XXXXXXXX1680');
  const [paymentMode, setPaymentMode] = useState('NEFT');
  const [transactionDate, setTransactionDate] = useState('');
  const [timeRangeStart, setTimeRangeStart] = useState('13:00');
  const [timeRangeEnd, setTimeRangeEnd] = useState('17:00');
  const [adminPassword, setAdminPassword] = useState('');
  const [pageAccessGranted, setPageAccessGranted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [downloadName, setDownloadName] = useState('');

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;

    if (selectedFile && !/\.(xlsx|xls)$/i.test(selectedFile.name)) {
      toast.error('Please upload a valid Excel file with .xlsx or .xls extension.');
      event.target.value = '';
      setFile(null);
      setValidationResult(null);
      return;
    }

    setFile(selectedFile);
    setValidationResult(null);
    setDownloadUrl('');
    setDownloadName('');
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
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  const handlePageAccess = () => {
    if (!adminPassword) {
      toast.error('Enter the receipt access password.');
      return;
    }

    setPageAccessGranted(true);
  };

  const validateForm = () => {
    if (!file) {
      toast.error('Please upload an Excel file first.');
      return false;
    }
    if (!transactionDate) {
      toast.error('Please select a transaction date.');
      return false;
    }
    if (!adminPassword) {
      toast.error('Admin password is required.');
      return false;
    }
    if (TIME_OPTIONS.indexOf(timeRangeStart) >= TIME_OPTIONS.indexOf(timeRangeEnd)) {
      toast.error('Choose a valid time range. End time should be after start time.');
      return false;
    }
    return true;
  };

  const handleValidate = async () => {
    if (!file) {
      toast.error('Please upload an Excel file first.');
      return;
    }

    setValidating(true);
    setValidationResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await paymentReceiptAPI.validate(formData);
      const result = response.data;
      setValidationResult(result);

      if (result.missingHeaders?.length) {
        toast.error(`Missing headers: ${result.missingHeaders.join(', ')}`);
        return;
      }

      toast.success(`File validated. Found ${result.foundHeaders?.length || 0} headers.`);
    } catch (error) {
      toast.error(await getApiErrorMessage(error, 'Failed to validate payment receipt file.'));
    } finally {
      setValidating(false);
    }
  };

  const handleGenerate = async () => {
    if (!pageAccessGranted) {
      toast.error('Enter valid access credentials before generating receipts.');
      return;
    }

    if (!validateForm()) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('remitterName', remitterName);
      formData.append('remitterAccount', remitterAccount);
      formData.append('paymentMode', paymentMode);
      formData.append('transactionDate', transactionDate);
      formData.append('timeRangeStart', timeRangeStart);
      formData.append('timeRangeEnd', timeRangeEnd);
      formData.append('password', adminPassword);

      const response = await paymentReceiptAPI.generate(formData);
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const fileName = response.headers['content-disposition']?.split('filename=')[1]?.replace(/"/g, '') || 'payment-receipts.zip';
      saveDownload(blob, fileName);
      toast.success('Payment receipts generated successfully.');
    } catch (error) {
      toast.error(await getApiErrorMessage(error, 'Failed to generate payment receipts.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">Payment Receipt Generator</h1>
              <p className="text-sm text-gray-600 mt-2">
                Upload beneficiary Excel and generate combined PDF receipts in a ZIP file. Admin password required for access.
              </p>
            </div>
            <Link to="/admin" className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition">
              <ArrowLeft size={16} /> Back
            </Link>
          </div>

          {!pageAccessGranted ? (
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="grid gap-6 lg:grid-cols-1">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Enter Receipt Access Password</span>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-700 shadow-sm focus:border-primary-600 focus:outline-none"
                  />
                </label>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handlePageAccess}
                  className="inline-flex items-center justify-center rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
                >
                  Unlock Receipt Generator
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
            <div className="grid gap-6 lg:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Remitter Name</span>
                <input
                  value={remitterName}
                  onChange={(e) => setRemitterName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-700 shadow-sm focus:border-primary-600 focus:outline-none"
                  placeholder="M/S ADITRI CONSTRUCTIONS SERVICES"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Remitter Account</span>
                <input
                  value={remitterAccount}
                  onChange={(e) => setRemitterAccount(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-700 shadow-sm focus:border-primary-600 focus:outline-none"
                  placeholder="1267XXXXXXXX1680"
                />
              </label>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Payment Mode</span>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-700 shadow-sm focus:border-primary-600 focus:outline-none"
                >
                  {PAYMENT_MODES.map((mode) => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Transaction Date</span>
                <input
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-700 shadow-sm focus:border-primary-600 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Time Range</span>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <select
                    value={timeRangeStart}
                    onChange={(e) => setTimeRangeStart(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-700 shadow-sm focus:border-primary-600 focus:outline-none"
                  >
                    {TIME_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <select
                    value={timeRangeEnd}
                    onChange={(e) => setTimeRangeEnd(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-700 shadow-sm focus:border-primary-600 focus:outline-none"
                  >
                    {TIME_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </label>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
              <div className="flex items-start gap-3">
                <UploadCloud size={18} className="mt-1 text-blue-700" />
                <div>
                  <p className="font-semibold">Excel Requirements</p>
                  <p className="mt-1">Upload an Excel file with the beneficiary information rows. Each row should include Beneficiary Name, Beneficiary Account, Beneficiary IFSC Code, Amount, and Payment Remarks.</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-gray-300 p-4">
              <label className="block text-sm font-medium text-gray-700">Upload Beneficiary Excel File</label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="mt-3 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-700 shadow-sm focus:border-primary-600 focus:outline-none"
              />
              {file && <p className="mt-3 text-sm text-gray-600">Selected file: {file.name}</p>}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handleValidate}
                disabled={validating || !file}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary-600 bg-white px-5 py-3 text-sm font-semibold text-primary-700 shadow-sm transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {validating ? 'Validating...' : <><CheckCircle size={16} /> Validate File</>}
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Generating...' : <><Download size={16} /> Generate Receipts</>}
              </button>
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download={downloadName}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary-600 bg-white px-5 py-3 text-sm font-semibold text-primary-700 shadow-sm hover:bg-primary-50"
                >
                  <Download size={16} /> Download ZIP
                </a>
              )}
            </div>
            {validationResult && (
              <div className={`rounded-2xl border p-4 text-sm ${
                validationResult.missingHeaders?.length
                  ? 'border-red-200 bg-red-50 text-red-800'
                  : 'border-green-200 bg-green-50 text-green-800'
              }`}>
                {validationResult.missingHeaders?.length ? (
                  <p><strong>Missing headers:</strong> {validationResult.missingHeaders.join(', ')}</p>
                ) : (
                  <p><strong>Validation passed.</strong> Required headers are present.</p>
                )}
              </div>
            )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
