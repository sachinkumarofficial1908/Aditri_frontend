import React, { useState, useEffect } from 'react';
import { useSalaryContext } from '../../context/SalaryContext';

const EmployeeSearchModal = ({ onSelect, onClose }) => {
  const { searchEmployees } = useSalaryContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const getEmployeeDailyRate = (employee) => (
    Number(employee?.dailyWageRate || employee?.dailyWagesRate || employee?.comp_rate || 0)
  );
  const getEmployeeGovRate = (employee) => (
    Number(employee?.govDailyRate || employee?.govDailyWage || employee?.gov_rate || 0)
  );

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim()) {
        try {
          setLoading(true);
          const employees = await searchEmployees(searchQuery);
          setResults(employees);
        } catch (error) {
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchEmployees]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Search Employee
          </h2>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search by CLMS ID or Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-500">
              Loading...
            </div>
          ) : results.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {results.map((employee) => (
                <li
                  key={employee._id}
                  onClick={() => onSelect(employee)}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition"
                >
                  <p className="font-semibold text-gray-900">{employee.name}</p>
                  <p className="text-sm text-gray-600">CLMS ID: {employee.clmsId}</p>
                  <p className="text-sm text-gray-600">
                    Daily Gov Rate: {getEmployeeGovRate(employee) || 0} | Daily Wage Rate: {getEmployeeDailyRate(employee) || 0}
                  </p>
                </li>
              ))}
            </ul>
          ) : searchQuery ? (
            <div className="p-6 text-center text-gray-500">
              No employees found
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              Type to search
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSearchModal;
