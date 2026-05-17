import React from 'react';
import { formatCurrency } from '../../utils/salaryUtils';

const GovSalaryTable = ({ salaries }) => {
  if (!salaries || salaries.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-yellow-800">No salary records found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="border border-gray-300 p-2 text-left">CLMS ID</th>
            <th className="border border-gray-300 p-2 text-left">Employee Name</th>
            <th className="border border-gray-300 p-2 text-right">Days</th>
            <th className="border border-gray-300 p-2 text-right">Gov Rate</th>
            <th className="border border-gray-300 p-2 text-right">Total Amt</th>
            <th className="border border-gray-300 p-2 text-right">Gross</th>
            <th className="border border-gray-300 p-2 text-right">PF</th>
            <th className="border border-gray-300 p-2 text-right">ESIC</th>
            <th className="border border-gray-300 p-2 text-right">Deductions</th>
            <th className="border border-gray-300 p-2 text-right">Net Payable</th>
          </tr>
        </thead>
        <tbody>
          {salaries.map((salary, idx) => (
            <tr
              key={salary._id}
              className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
            >
              <td className="border border-gray-300 p-2">{salary.clms_id}</td>
              <td className="border border-gray-300 p-2">
                {salary.employee_details?.name || 'N/A'}
              </td>
              <td className="border border-gray-300 p-2 text-right">{salary.days}</td>
              <td className="border border-gray-300 p-2 text-right">
                {formatCurrency(salary.gov_rate)}
              </td>
              <td className="border border-gray-300 p-2 text-right">
                {formatCurrency(salary.total_amount)}
              </td>
              <td className="border border-gray-300 p-2 text-right font-semibold">
                {formatCurrency(salary.gross)}
              </td>
              <td className="border border-gray-300 p-2 text-right">
                {formatCurrency(salary.pf)}
              </td>
              <td className="border border-gray-300 p-2 text-right">
                {formatCurrency(salary.esic)}
              </td>
              <td className="border border-gray-300 p-2 text-right">
                {formatCurrency(salary.net_deduction)}
              </td>
              <td className="border border-gray-300 p-2 text-right font-bold text-green-600">
                {formatCurrency(salary.net_payable)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary Footer */}
      <div className="mt-6 bg-gray-50 border border-gray-300 rounded-md p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-xs text-gray-600">Total Employees</p>
            <p className="text-lg font-bold text-gray-900">{salaries.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Total Gross</p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(
                salaries.reduce((sum, s) => sum + s.gross, 0)
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Total PF</p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(
                salaries.reduce((sum, s) => sum + s.pf, 0)
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Total ESIC</p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(
                salaries.reduce((sum, s) => sum + s.esic, 0)
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Total Net Payable</p>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(
                salaries.reduce((sum, s) => sum + s.net_payable, 0)
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovSalaryTable;
