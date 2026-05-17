import React from 'react';

const DeductionConfig = ({ deductionConfig, setDeductionConfig }) => {
  const handleDeductionChange = (field, value) => {
    setDeductionConfig({
      ...deductionConfig,
      [field]: parseFloat(value),
    });
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-red-900 mb-4">Deduction Configuration</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PF Percentage (% of Gross)
          </label>
          <input
            type="number"
            value={deductionConfig.pf_percentage}
            onChange={(e) => handleDeductionChange('pf_percentage', e.target.value)}
            step="0.01"
            min="0"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <p className="text-xs text-gray-600 mt-1">
            Default: 12% (typically deducted from employee salary)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ESIC Percentage (% of Gross)
          </label>
          <input
            type="number"
            value={deductionConfig.esic_percentage}
            onChange={(e) => handleDeductionChange('esic_percentage', e.target.value)}
            step="0.01"
            min="0"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <p className="text-xs text-gray-600 mt-1">
            Default: 0.75% (typically shared between employee and employer)
          </p>
        </div>
      </div>

      <div className="mt-6 bg-white border border-red-200 rounded-md p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Example Calculation</h4>
        <p className="text-sm text-gray-600 mb-2">
          If Gross Salary = ₹10,000
        </p>
        <p className="text-sm text-gray-600 mb-1">
          PF Deduction = ₹10,000 × {deductionConfig.pf_percentage}% = ₹
          {(10000 * deductionConfig.pf_percentage / 100).toFixed(2)}
        </p>
        <p className="text-sm text-gray-600">
          ESIC Deduction = ₹10,000 × {deductionConfig.esic_percentage}% = ₹
          {(10000 * deductionConfig.esic_percentage / 100).toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default DeductionConfig;
