import React, { useState, useEffect } from 'react';
import { useSalaryContext } from '../../context/SalaryContext';
import { AdminSidebar } from './Dashboard';
import Toast from '../../components/common/Toast';
import Loader from '../../components/common/Loader';
import BonusConfig from '../../components/salary/BonusConfig';
import DeductionConfig from '../../components/salary/DeductionConfig';
import GovSalaryTable from '../../components/salary/GovSalaryTable';
import CompanySalaryTable from '../../components/salary/CompanySalaryTable';
import { getMonthName, DEFAULT_BONUSES, DEFAULT_DEDUCTIONS } from '../../utils/salaryUtils';

const SalaryGeneration = () => {
  const {
    bonusConfig,
    setBonusConfig,
    deductionConfig,
    setDeductionConfig,
    govSalaries,
    companySalaries,
    generateGovSalary,
    generateCompanySalary,
    fetchGovSalaries,
    fetchCompanySalaries,
    downloadGovSalaryExcel,
    downloadCompanySalaryExcel,
    downloadBothSalaryExcel,
    getSalaryProcessStatus,
    completeSalaryProcess,
    loading,
    error,
    successMessage,
    clearError,
    clearSuccessMessage,
  } = useSalaryContext();

  const previousPeriod = (() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return { month: date.getMonth() + 1, year: date.getFullYear() };
  })();
  const [month, setMonth] = useState(previousPeriod.month);
  const [year, setYear] = useState(previousPeriod.year);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSalaries, setSelectedSalaries] = useState({
    gov: false,
    company: false,
  });
  const [generationInProgress, setGenerationInProgress] = useState(false);
  const [processStatus, setProcessStatus] = useState(null);
  const [expandedSupervisor, setExpandedSupervisor] = useState(null);

  const loadProcessStatus = async (selectedMonth = month, selectedYear = year) => {
    try {
      const status = await getSalaryProcessStatus(selectedMonth, selectedYear);
      setProcessStatus(status);
      if (status?.isCompleted) {
        setCurrentStep(3);
      } else {
        setCurrentStep(1);
      }
    } catch (err) {
      setProcessStatus(null);
    }
  };

  useEffect(() => {
    loadProcessStatus(month, year);
  }, [month, year]);

  const handleCompleteProcess = async () => {
    if (!processStatus?.totalEntries) {
      alert('No attendance entries found for selected month/year');
      return;
    }
    if (!window.confirm(`Mark salary process completed for ${getMonthName(month)} ${year}?`)) {
      return;
    }
    await completeSalaryProcess(month, year);
    await loadProcessStatus(month, year);
  };

  // Step 1: Attendance View
  const handleStep1Complete = () => {
    if (processStatus?.isCompleted) {
      setCurrentStep(3);
      return;
    }
    setCurrentStep(2);
  };

  // Step 2: Salary Generation Options
  const handleSalarySelection = (type, value) => {
    setSelectedSalaries((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleStep2Complete = async () => {
    if (!selectedSalaries.gov && !selectedSalaries.company) {
      alert('Please select at least one salary type to generate');
      return;
    }

    try {
      setGenerationInProgress(true);
      clearError();

      if (selectedSalaries.gov) {
        await generateGovSalary(month, year);
      }

      if (selectedSalaries.company) {
        await generateCompanySalary(month, year);
      }

      if (selectedSalaries.gov) {
        await fetchGovSalaries(month, year);
      }
      if (selectedSalaries.company) {
        await fetchCompanySalaries(month, year);
      }
      setCurrentStep(3);
    } catch (err) {
      // Error handled by context
    } finally {
      setGenerationInProgress(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedSalaries({ gov: false, company: false });
    setBonusConfig({ bonuses: DEFAULT_BONUSES });
    setDeductionConfig(DEFAULT_DEDUCTIONS);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar active="salary-generation" />
      <main className="ml-64 flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Salary Generation</h1>
          <p className="text-gray-600 mt-2">
            Generate government and company salary slips for {getMonthName(month)} {year}
          </p>
        </div>

        {/* Month/Year Selection */}
        {currentStep === 1 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 max-w-4xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Previous Month & Year</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            {processStatus && (
              <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Supervisor Wise Entries</h3>
                    <p className="text-sm text-gray-600">
                      {processStatus.totalEntries || 0} attendance entries for {getMonthName(month)} {year}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    processStatus.isCompleted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {processStatus.isCompleted ? 'Process Completed' : 'Pending Completion'}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {(processStatus.supervisorGroups || []).length === 0 && (
                    <p className="rounded-md bg-white p-4 text-sm text-gray-500">No supervisor entries found for this month.</p>
                  )}
                  {(processStatus.supervisorGroups || []).map((group) => (
                    <div key={group.supervisorId} className="rounded-lg border border-gray-200 bg-white">
                      <button
                        type="button"
                        onClick={() => setExpandedSupervisor((current) => (
                          current === group.supervisorId ? null : group.supervisorId
                        ))}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">{group.supervisorName}</p>
                          <p className="text-xs text-gray-500">{group.totalEntries} entries | {group.totalDays} days</p>
                        </div>
                        <span className="text-xs font-semibold text-blue-600">
                          {expandedSupervisor === group.supervisorId ? 'Hide' : 'View'}
                        </span>
                      </button>
                      {expandedSupervisor === group.supervisorId && (
                        <div className="overflow-x-auto border-t border-gray-100">
                          <table className="w-full min-w-[720px] text-left text-xs">
                            <thead className="bg-gray-50 text-gray-500">
                              <tr>
                                {['Employee', 'CLMS ID', 'Days', 'Rate', 'OT', 'Advance', 'Source'].map((heading) => (
                                  <th key={heading} className="px-3 py-2">{heading}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {group.entries.map((entry) => (
                                <tr key={entry.id}>
                                  <td className="px-3 py-2 font-medium text-gray-800">{entry.employeeName}</td>
                                  <td className="px-3 py-2">{entry.clmsId}</td>
                                  <td className="px-3 py-2">{entry.daysPresent}</td>
                                  <td className="px-3 py-2">{entry.ratePerDay}</td>
                                  <td className="px-3 py-2">{entry.otAmount}</td>
                                  <td className="px-3 py-2">{entry.advance}</td>
                                  <td className="px-3 py-2 capitalize">{entry.source}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!processStatus.isCompleted && (
                  <button
                    type="button"
                    onClick={handleCompleteProcess}
                    disabled={loading || !processStatus.totalEntries}
                    className="mt-4 w-full rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:bg-gray-400"
                  >
                    This Month Salary Process Completed
                  </button>
                )}
              </div>
            )}
            <button
              onClick={handleStep1Complete}
              className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {processStatus?.isCompleted ? 'Go to Download' : 'Next'}
            </button>
          </div>
        )}

        {/* Step 1 Indicator */}
        {currentStep > 1 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">
              ✓ Using {getMonthName(month)} {year}
            </p>
          </div>
        )}

        {/* Step 2: Salary Generation Options */}
        {currentStep === 2 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Configuration
            </h2>

            {/* Salary Type Selection */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Select Salary Types to Generate
              </h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedSalaries.gov}
                    onChange={(e) => handleSalarySelection('gov', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">
                    <strong>Generate Government Salary</strong>
                    <p className="text-sm text-gray-500">
                      Using government rates from employee master
                    </p>
                  </span>
                </label>

                <label className="flex items-center mt-4">
                  <input
                    type="checkbox"
                    checked={selectedSalaries.company}
                    onChange={(e) => handleSalarySelection('company', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">
                    <strong>Generate Original Salary</strong>
                    <p className="text-sm text-gray-500">
                      Using original daily wage rates with PF/ESIC from government salary
                    </p>
                  </span>
                </label>
              </div>
            </div>

            {/* Bonus Configuration */}
            {selectedSalaries.gov && (
              <BonusConfig
                bonusConfig={bonusConfig}
                setBonusConfig={setBonusConfig}
              />
            )}

            {/* Deduction Configuration */}
            {selectedSalaries.gov && (
              <DeductionConfig
                deductionConfig={deductionConfig}
                setDeductionConfig={setDeductionConfig}
              />
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 font-semibold focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Back
              </button>
              <button
                onClick={handleStep2Complete}
                disabled={generationInProgress || (!selectedSalaries.gov && !selectedSalaries.company)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 font-semibold focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                {generationInProgress ? 'Generating...' : 'Generate Salary'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Generated Salaries */}
        {currentStep === 3 && (
          <>
            {processStatus?.isCompleted && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4">
                  <h2 className="text-xl font-semibold text-green-900">
                    Salary Process Completed - {getMonthName(month)} {year}
                  </h2>
                  <p className="mt-1 text-sm text-green-700">
                    Final salary downloads are available for this completed month.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <button
                    onClick={() => downloadGovSalaryExcel(month, year)}
                    disabled={loading}
                    className="rounded-md bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Downloading...' : 'Download Final Government Salary Excel'}
                  </button>
                  <button
                    onClick={() => downloadCompanySalaryExcel(month, year)}
                    disabled={loading}
                    className="rounded-md bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Downloading...' : 'Download Original Salary Excel'}
                  </button>
                </div>
              </div>
            )}

            {/* Government Salary Table */}
            {!processStatus?.isCompleted && selectedSalaries.gov && govSalaries.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Government Salary - {getMonthName(month)} {year}
                </h2>
                <GovSalaryTable salaries={govSalaries} />
                <button
                  onClick={() => downloadGovSalaryExcel(month, year)}
                  disabled={loading}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {loading ? 'Downloading...' : 'Download Government Salary Excel'}
                </button>
              </div>
            )}

            {/* Company Salary Table */}
            {!processStatus?.isCompleted && selectedSalaries.company && companySalaries.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Original Salary - {getMonthName(month)} {year}
                </h2>
                <CompanySalaryTable salaries={companySalaries} />
                <button
                  onClick={() => downloadCompanySalaryExcel(month, year)}
                  disabled={loading}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 font-semibold focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  {loading ? 'Downloading...' : 'Download Original Salary Excel'}
                </button>
              </div>
            )}

            {/* Download Both Option */}
            {!processStatus?.isCompleted && selectedSalaries.gov && selectedSalaries.company && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <button
                  onClick={() => downloadBothSalaryExcel(month, year)}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  {loading ? 'Downloading...' : 'Download Both Salary Reports (Excel)'}
                </button>
              </div>
            )}

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 font-semibold focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Process Another Month
            </button>
          </>
        )}
      </main>

      {/* Toasts */}
      {error && (
        <Toast type="error" message={error} onClose={clearError} />
      )}

      {successMessage && (
        <Toast type="success" message={successMessage} onClose={clearSuccessMessage} />
      )}

      {loading && <Loader />}
    </div>
  );
};

export default SalaryGeneration;
