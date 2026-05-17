import React from 'react';

const BulkUploadPreview = ({ result }) => {
  const { success, errors, summary } = result;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Summary</h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-sm text-gray-600">Total Records</p>
          <p className="text-2xl font-bold text-blue-900">{summary.total}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-sm text-gray-600">Successfully Saved</p>
          <p className="text-2xl font-bold text-green-900">{summary.saved}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-gray-600">Failed</p>
          <p className="text-2xl font-bold text-red-900">{summary.failed}</p>
        </div>
      </div>

      {/* Success Records */}
      {success && success.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">
            ✓ Successfully Saved ({success.length})
          </h3>
          <div className="bg-green-50 border border-green-200 rounded-md p-4 max-h-64 overflow-y-auto">
            <ul className="space-y-2">
              {success.map((record, idx) => (
                <li key={idx} className="text-sm text-green-800">
                  {record.clms_id} - {record.days_present} days @ ₹{record.rate_per_day}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Error Records */}
      {errors && errors.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-red-900 mb-3">
            ✕ Failed ({errors.length})
          </h3>
          <div className="bg-red-50 border border-red-200 rounded-md p-4 max-h-64 overflow-y-auto">
            <ul className="space-y-2">
              {errors.map((error, idx) => (
                <li key={idx} className="text-sm text-red-800">
                  <strong>{error.clms_id}</strong>: {error.error}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkUploadPreview;
