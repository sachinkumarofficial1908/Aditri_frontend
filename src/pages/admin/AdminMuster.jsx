import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { musterAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowDown, UploadCloud } from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const YEAR_RANGE = Array.from({ length: 10 }, (_, index) => new Date().getFullYear() - 5 + index);

const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate();

export default function AdminMuster() {
  const [file, setFile] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [fromDay, setFromDay] = useState(1);
  const [toDay, setToDay] = useState(getDaysInMonth(month, year));
  const [holidayDates, setHolidayDates] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [downloadName, setDownloadName] = useState('');

  const maxDays = useMemo(() => getDaysInMonth(month, year), [month, year]);

  const handleFileChange = (event) => {
    setFile(event.target.files?.[0] || null);
    setDownloadUrl('');
  };

  const handleGenerate = async (event) => {
    event.preventDefault();
    if (!file) {
      toast.error('Please upload an Excel file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('month', month);
    formData.append('year', year);
    formData.append('fromDay', fromDay);
    formData.append('toDay', toDay);
    formData.append('holidayDates', holidayDates.trim());

    setLoading(true);
    try {
      const response = await musterAPI.generate(formData);
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setDownloadName(response.headers['content-disposition']?.split('filename=')[1]?.replace(/"/g, '') || `muster-roll-${month}-${year}.xlsx`);
      toast.success('Muster roll generated. Download available below.');
    } catch (error) {
      let message = 'Failed to generate the muster roll.';

      if (error.response?.data) {
        try {
          if (typeof error.response.data === 'string') {
            const parsed = JSON.parse(error.response.data);
            message = parsed.message || error.response.statusText || message;
          } else if (error.response.data instanceof Blob) {
            const text = await error.response.data.text();
            const parsed = JSON.parse(text);
            message = parsed.message || error.response.statusText || message;
          } else {
            message = error.response.data.message || error.response.statusText || message;
          }
        } catch {
          message = error.response.statusText || message;
        }
      } else if (error.message) {
        message = error.message;
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (value) => {
    const newMonth = Number(value);
    setMonth(newMonth);
    const days = getDaysInMonth(newMonth, year);
    setToDay((prev) => Math.min(prev, days));
  };

  const handleYearChange = (value) => {
    const newYear = Number(value);
    setYear(newYear);
    const days = getDaysInMonth(month, newYear);
    setToDay((prev) => Math.min(prev, days));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">Attendance Muster Roll Generator</h1>
              <p className="text-sm text-gray-600 mt-2">
                Upload an Excel file with Name and Present Days, then generate a realistic attendance sheet.
              </p>
            </div>
            <Link to="/admin" className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition">
              <ArrowLeft size={16} /> Back
            </Link>
          </div>

          <form onSubmit={handleGenerate} className="space-y-6 bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Upload Excel</span>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-primary-600 focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Month</span>
                <select
                  value={month}
                  onChange={(event) => handleMonthChange(event.target.value)}
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
                  onChange={(event) => handleYearChange(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-primary-600 focus:outline-none"
                >
                  {YEAR_RANGE.map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </label>

              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-gray-700">Holiday Dates</span>
                <input
                  type="text"
                  value={holidayDates}
                  onChange={(event) => setHolidayDates(event.target.value)}
                  placeholder="e.g. 5, 10, 15-17"
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-primary-600 focus:outline-none"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Enter dates within the selected month separated by commas or ranges. Holidays are excluded from working days and marked in the generated sheet.
                </p>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">From Day</span>
                  <input
                    type="number"
                    min="1"
                    max={maxDays}
                    value={fromDay}
                    onChange={(event) => setFromDay(Math.max(1, Math.min(maxDays, Number(event.target.value) || 1)))}
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-primary-600 focus:outline-none"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700">To Day</span>
                  <input
                    type="number"
                    min="1"
                    max={maxDays}
                    value={toDay}
                    onChange={(event) => setToDay(Math.max(1, Math.min(maxDays, Number(event.target.value) || maxDays)))}
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-primary-600 focus:outline-none"
                  />
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Generating...' : 'Generate Muster Roll'}
              </button>

              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download={downloadName}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary-600 bg-white px-5 py-3 text-sm font-semibold text-primary-600 transition hover:bg-primary-50"
                >
                  <ArrowDown size={16} /> Download Excel
                </a>
              )}
            </div>

            <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              <p className="font-medium text-gray-900">Notes</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Excel must contain columns: <strong>ID</strong>, <strong>Name</strong>, and <strong>Present Days</strong>.</li>
                <li>Sundays are marked as <strong>Rest</strong> and are excluded from P/A counts.</li>
                <li>Holiday dates are marked as <strong>Holiday</strong> and excluded from working days.</li>
                <li>The module ensures total <strong>P</strong> always matches <strong>Present Days</strong>.</li>
              </ul>
            </div>
          </form>

          <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-5 text-sm text-gray-600 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
              <UploadCloud size={16} /> Accepted file types
            </div>
            <p>.xlsx, .xls</p>
          </div>
        </div>
      </main>
    </div>
  );
}
