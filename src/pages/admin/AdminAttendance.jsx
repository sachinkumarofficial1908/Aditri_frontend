import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowDown, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import { attendanceAPI } from '../../utils/api';
import { AdminSidebar } from './Dashboard';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const YEAR_RANGE = Array.from({ length: 10 }, (_, index) => new Date().getFullYear() - 5 + index);

const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate();

const isValidTime = (value) => typeof value === 'string' && value.trim().length > 0;

export default function AdminAttendance() {
  const [uploadType, setUploadType] = useState('basic');
  const [file, setFile] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [entryStart, setEntryStart] = useState('08:00');
  const [entryEnd, setEntryEnd] = useState('08:30');
  const [exitStart, setExitStart] = useState('17:00');
  const [exitEnd, setExitEnd] = useState('17:30');
  const [loadingValidate, setLoadingValidate] = useState(false);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [preview, setPreview] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [downloadName, setDownloadName] = useState('');

  const maxDays = useMemo(() => getDaysInMonth(month, year), [month, year]);
  const canGenerate = preview?.valid && !loadingGenerate;

  const clearPreview = () => {
    setPreview(null);
    setDownloadUrl('');
    setDownloadName('');
  };

  const handleFileChange = (event) => {
    setFile(event.target.files?.[0] || null);
    clearPreview();
  };

  const handleTypeChange = (type) => {
    setUploadType(type);
    clearPreview();
  };

  const handleValidate = async () => {
    if (!file) {
      toast.error('Please upload an Excel file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadType', uploadType);
    formData.append('month', month);
    formData.append('year', year);

    setLoadingValidate(true);
    setPreview(null);
    try {
      const response = await attendanceAPI.validate(formData);
      const data = response.data;
      setPreview(data);
      if (data.errors?.length > 0) {
        toast.error('Validation found issues. Review errors and warnings.');
      } else if (data.warnings?.length > 0) {
        toast.success('Validation complete with warnings. Review them before generating.');
      } else {
        toast.success('Validation complete. Ready to generate attendance.');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Validation failed.';
      toast.error(message);
      setPreview({ errors: [message], warnings: [], valid: false });
    } finally {
      setLoadingValidate(false);
    }
  };

  const handleGenerate = async () => {
    if (!file) {
      toast.error('Please upload an Excel file first.');
      return;
    }
    if (!canGenerate) {
      toast.error('Please validate the file and fix any errors before generating.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadType', uploadType);
    formData.append('month', month);
    formData.append('year', year);
    formData.append('entryStart', entryStart);
    formData.append('entryEnd', entryEnd);
    formData.append('exitStart', exitStart);
    formData.append('exitEnd', exitEnd);

    setLoadingGenerate(true);
    try {
      const response = await attendanceAPI.generate(formData);
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setDownloadName(response.headers['content-disposition']?.split('filename=')[1]?.replace(/"/g, '') || `attendance-${month}-${year}.xlsx`);
      toast.success('Timing attendance sheet generated. Download is ready.');
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to generate attendance.';
      toast.error(message);
    } finally {
      setLoadingGenerate(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar active="attendance-generator" />
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">Timing Attendance Generator</h1>
              <p className="text-sm text-gray-600 mt-2">
                Upload a basic sheet or existing muster roll, validate the content, and generate a timing attendance Excel file.
              </p>
            </div>
            <Link to="/admin" className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition">
              <ArrowLeft size={16} /> Back
            </Link>
          </div>

          <div className="space-y-6 bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-3">
                <p className="text-sm font-semibold text-gray-700">Upload Type</p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('basic')}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${uploadType === 'basic' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}
                  >
                    Basic Sheet
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('existing')}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${uploadType === 'existing' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}
                  >
                    Existing Muster Roll
                  </button>
                </div>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Month</span>
                <select
                  value={month}
                  onChange={(event) => setMonth(Number(event.target.value))}
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-primary-600 focus:outline-none"
                >
                  {MONTHS.map((label, index) => (
                    <option key={label} value={index + 1}>{label}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Year</span>
                <select
                  value={year}
                  onChange={(event) => setYear(Number(event.target.value))}
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-primary-600 focus:outline-none"
                >
                  {YEAR_RANGE.map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </label>

              <div className="lg:col-span-3 grid gap-6 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Entry Start Time</span>
                  <input
                    type="time"
                    value={entryStart}
                    onChange={(event) => setEntryStart(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-primary-600 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Entry End Time</span>
                  <input
                    type="time"
                    value={entryEnd}
                    onChange={(event) => setEntryEnd(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-primary-600 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Exit Start Time</span>
                  <input
                    type="time"
                    value={exitStart}
                    onChange={(event) => setExitStart(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-primary-600 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Exit End Time</span>
                  <input
                    type="time"
                    value={exitEnd}
                    onChange={(event) => setExitEnd(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-primary-600 focus:outline-none"
                  />
                </label>
              </div>

              <label className="block lg:col-span-3">
                <span className="text-sm font-medium text-gray-700">Upload Excel</span>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-primary-600 focus:outline-none"
                />
              </label>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handleValidate}
                disabled={loadingValidate}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingValidate ? 'Validating...' : 'Validate File'}
              </button>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary-600 bg-white px-5 py-3 text-sm font-semibold text-primary-600 transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingGenerate ? 'Generating...' : 'Generate Attendance'}
              </button>
            </div>

            {downloadUrl && (
              <a
                href={downloadUrl}
                download={downloadName}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary-600 bg-white px-5 py-3 text-sm font-semibold text-primary-600 transition hover:bg-primary-50"
              >
                <ArrowDown size={16} /> Download Excel
              </a>
            )}

            <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              <p className="font-medium text-gray-900">Supported Formats</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li><strong>Basic Sheet:</strong> ID, Name, Present Days</li>
                <li><strong>Existing Muster Roll:</strong> ID, Name, Present Days, 1, 2, 3, ...</li>
                <li>Entry and exit times are generated only for marked <strong>P</strong> days.</li>
                <li>Sundays are excluded when generating from a basic sheet.</li>
                <li>Present days are always matched exactly with input values.</li>
              </ul>
            </div>

            {preview && (
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Validation Preview</h2>
                    <p className="text-sm text-gray-500">Review parsed headers, employee count, and any warnings or errors.</p>
                  </div>
                  <div className="space-x-2 text-sm text-gray-600">
                    <span>Format: <strong>{preview.uploadType}</strong></span>
                    <span>|</span>
                    <span>Employees: <strong>{preview.employeeCount}</strong></span>
                    <span>|</span>
                    <span>Days: <strong>{preview.daysInMonth}</strong></span>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-900">Headers</p>
                    <p className="mt-2 text-xs text-gray-600">{preview.headers?.map((value, idx) => `${value || ''}${idx !== preview.headers.length - 1 ? ', ' : ''}`)}</p>
                  </div>
                  <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-900">Status</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${preview.valid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {preview.valid ? 'Valid' : 'Issues Found'}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">Warnings: {preview.warnings?.length || 0}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">Errors: {preview.errors?.length || 0}</span>
                    </div>
                  </div>
                </div>

                {preview.errors?.length > 0 && (
                  <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <p className="font-semibold">Errors</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {preview.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {preview.warnings?.length > 0 && (
                  <div className="mt-6 rounded-3xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
                    <p className="font-semibold">Warnings</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {preview.warnings.map((warning, index) => (
                        <li key={index}>{warning.message || warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {preview.previewRows?.length > 0 && (
                  <div className="mt-6 overflow-x-auto rounded-3xl border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-3 text-sm font-semibold text-gray-900">Sample Rows</div>
                    <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
                      <thead className="bg-white">
                        <tr>
                          <th className="px-3 py-2 font-semibold text-gray-700">ID</th>
                          <th className="px-3 py-2 font-semibold text-gray-700">Name</th>
                          <th className="px-3 py-2 font-semibold text-gray-700">Present Days</th>
                          <th className="px-3 py-2 font-semibold text-gray-700">Actual P</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {preview.previewRows.map((row) => (
                          <tr key={`${row.id}-${row.name}-${row.presentDays}`}>
                            <td className="px-3 py-2 text-gray-700">{row.id || '-'}</td>
                            <td className="px-3 py-2 text-gray-700">{row.name || '-'}</td>
                            <td className="px-3 py-2 text-gray-700">{row.presentDays ?? '-'}</td>
                            <td className="px-3 py-2 text-gray-700">{row.actualPresent}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
