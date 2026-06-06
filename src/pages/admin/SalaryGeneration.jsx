import React, { useState, useEffect } from 'react';
import { useSalaryContext } from '../../context/SalaryContext';
import { AdminSidebar } from './Dashboard';
import Toast from '../../components/common/Toast';
import Loader from '../../components/common/Loader';
import GovSalaryTable from '../../components/salary/GovSalaryTable';
import CompanySalaryTable from '../../components/salary/CompanySalaryTable';
import SupervisorSalaryEditor from '../../components/salary/SupervisorSalaryEditor';
import { getMonthName, DEFAULT_BONUSES, DEFAULT_DEDUCTIONS } from '../../utils/salaryUtils';

const getDefaultSupervisorConfig = () => ({
  bonusPercentage: DEFAULT_BONUSES[0]?.percentage ?? 8.33,
  leaveBonusPercentage: DEFAULT_BONUSES[1]?.percentage ?? 6.73,
  pfPercentage: DEFAULT_DEDUCTIONS.pf_percentage,
  esicPercentage: DEFAULT_DEDUCTIONS.esic_percentage,
});

const buildSupervisorBonuses = (config) => ([
  { name: DEFAULT_BONUSES[0]?.name || 'Bonus', percentage: Number(config.bonusPercentage) || 0 },
  { name: DEFAULT_BONUSES[1]?.name || 'Leave Bonus', percentage: Number(config.leaveBonusPercentage) || 0 },
]);

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
    updateGovSalary,
    updateCompanySalary,
    updateAttendanceEntry,
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
  const [salaryViewMode, setSalaryViewMode] = useState('all');
  const [attendanceDrafts, setAttendanceDrafts] = useState({});
  const [savingAttendanceId, setSavingAttendanceId] = useState('');
  const [supervisorSalaryConfigs, setSupervisorSalaryConfigs] = useState({});

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

  useEffect(() => {
    const drafts = {};
    const configs = {};
    (processStatus?.supervisorGroups || []).forEach((group) => {
      configs[group.supervisorId] = supervisorSalaryConfigs[group.supervisorId] || getDefaultSupervisorConfig();
      group.entries.forEach((entry) => {
        drafts[entry.id] = {
          daysPresent: entry.daysPresent ?? 0,
          ratePerDay: entry.ratePerDay ?? 0,
          otAmount: entry.otAmount ?? 0,
          advance: entry.advance ?? 0,
        };
      });
    });
    setAttendanceDrafts(drafts);
    setSupervisorSalaryConfigs(configs);
  }, [processStatus]);

  const updateSupervisorSalaryConfig = (supervisorId, field, value) => {
    setSupervisorSalaryConfigs((current) => ({
      ...current,
      [supervisorId]: {
        ...(current[supervisorId] || getDefaultSupervisorConfig()),
        [field]: value,
      },
    }));
  };

  const updateAttendanceDraft = (id, field, value) => {
    setAttendanceDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        [field]: value,
      },
    }));
  };

  const handleSaveAttendanceEntry = async (entry) => {
    const draft = attendanceDrafts[entry.id];
    if (!draft) return;

    setSavingAttendanceId(entry.id);
    try {
      await updateAttendanceEntry(entry.id, {
        days_present: Number(draft.daysPresent) || 0,
        rate_per_day: Number(draft.ratePerDay) || 0,
        ot_amount: Number(draft.otAmount) || 0,
        advance: Number(draft.advance) || 0,
      });
      await loadProcessStatus(month, year);
    } finally {
      setSavingAttendanceId('');
    }
  };

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

  const getConfigForSalary = (salary) => (
    supervisorSalaryConfigs[salary.employee_details?.supervisorId || 'unassigned'] || getDefaultSupervisorConfig()
  );

  const applySupervisorConfigsToGovSalaries = async (salaries) => {
    for (const salary of salaries) {
      const config = getConfigForSalary(salary);
      await updateGovSalary(salary._id, {
        bonuses: buildSupervisorBonuses(config),
        pf_percentage: Number(config.pfPercentage) || 0,
        esic_percentage: Number(config.esicPercentage) || 0,
      });
    }
  };

  const applySupervisorConfigsToCompanySalaries = async (salaries) => {
    for (const salary of salaries) {
      const config = getConfigForSalary(salary);
      await updateCompanySalary(salary._id, {
        bonuses: buildSupervisorBonuses(config),
      });
    }
  };

  const handleStep2Complete = async () => {
    if (!selectedSalaries.gov && !selectedSalaries.company) {
      alert('Please select at least one salary type to generate');
      return;
    }

    try {
      setGenerationInProgress(true);
      clearError();

      if (selectedSalaries.gov || selectedSalaries.company) {
        await generateGovSalary(month, year);
        const generatedGovSalaries = await fetchGovSalaries(month, year);
        await applySupervisorConfigsToGovSalaries(generatedGovSalaries);
        await fetchGovSalaries(month, year);
      }

      if (selectedSalaries.company) {
        await generateCompanySalary(month, year);
        const generatedCompanySalaries = await fetchCompanySalaries(month, year);
        await applySupervisorConfigsToCompanySalaries(generatedCompanySalaries);
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
    setSalaryViewMode('all');
    setSupervisorSalaryConfigs({});
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
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 max-w-6xl">
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
                        <div className="overflow-hidden border-t border-gray-100">
                          <table className="w-full table-fixed text-left text-[11px]">
                            <colgroup>
                              <col className="w-[24%]" />
                              <col className="w-[13%]" />
                              <col className="w-[11%]" />
                              <col className="w-[13%]" />
                              <col className="w-[11%]" />
                              <col className="w-[13%]" />
                              <col className="w-[15%]" />
                            </colgroup>
                            <thead className="bg-gray-50 text-gray-500">
                              <tr>
                                {['Employee', 'CLMS ID', 'Days', 'Rate', 'OT', 'Advance', 'Action'].map((heading) => (
                                  <th key={heading} className="px-2 py-2 font-semibold">{heading}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {group.entries.map((entry) => {
                                const draft = attendanceDrafts[entry.id] || {};
                                const isLocked = processStatus.isCompleted;
                                return (
                                  <tr key={entry.id} className="odd:bg-white even:bg-gray-50">
                                    <td className="truncate px-2 py-1.5 font-medium text-gray-800" title={entry.employeeName}>{entry.employeeName}</td>
                                    <td className="truncate px-2 py-1.5 text-gray-700" title={entry.clmsId}>{entry.clmsId}</td>
                                    {[
                                      ['daysPresent', 'Days'],
                                      ['ratePerDay', 'Rate'],
                                      ['otAmount', 'OT'],
                                      ['advance', 'Advance'],
                                    ].map(([field, label]) => (
                                      <td key={field} className="px-2 py-1.5">
                                        <input
                                          type="number"
                                          step="0.01"
                                          aria-label={`${label} for ${entry.employeeName}`}
                                          value={draft[field] ?? ''}
                                          disabled={isLocked}
                                          onChange={(event) => updateAttendanceDraft(entry.id, field, event.target.value)}
                                          className="h-7 w-full rounded border border-gray-300 bg-white px-1.5 text-right text-xs text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-100 disabled:bg-gray-100 disabled:text-gray-500"
                                        />
                                      </td>
                                    ))}
                                    <td className="px-2 py-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handleSaveAttendanceEntry(entry)}
                                        disabled={isLocked || Boolean(savingAttendanceId)}
                                        className="inline-flex h-7 min-w-[64px] items-center justify-center rounded bg-emerald-600 px-2 text-[11px] font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                                      >
                                        {savingAttendanceId === entry.id ? 'Saving...' : 'Save'}
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!processStatus.isCompleted && (processStatus.supervisorGroups || []).length > 0 && (
                  <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50/60 p-4">
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-900">Supervisor Wise Salary Rules</h3>
                      <p className="mt-1 text-xs text-gray-600">
                        These values will be applied during salary generation for each supervisor group.
                      </p>
                    </div>
                    <div className="space-y-3">
                      {(processStatus.supervisorGroups || []).map((group) => {
                        const config = supervisorSalaryConfigs[group.supervisorId] || getDefaultSupervisorConfig();
                        return (
                          <div key={group.supervisorId} className="rounded-lg border border-gray-200 bg-white p-3">
                            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{group.supervisorName}</p>
                                <p className="text-xs text-gray-500">{group.totalEntries} entries</p>
                              </div>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                              {[
                                ['bonusPercentage', 'Bonus %'],
                                ['leaveBonusPercentage', 'Leave Bonus %'],
                                ['pfPercentage', 'PF %'],
                                ['esicPercentage', 'ESIC %'],
                              ].map(([field, label]) => (
                                <label key={field} className="text-xs font-semibold text-gray-600">
                                  {label}
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={config[field] ?? ''}
                                    onChange={(event) => updateSupervisorSalaryConfig(group.supervisorId, field, event.target.value)}
                                    className="mt-1 h-8 w-full rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-100"
                                  />
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
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
            {!processStatus?.isCompleted && (selectedSalaries.gov || selectedSalaries.company) && (
              <div className="mb-6 grid w-full max-w-md grid-cols-2 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setSalaryViewMode('all')}
                  className={`h-10 rounded-md px-4 text-sm font-semibold transition ${
                    salaryViewMode === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  All Records
                </button>
                <button
                  type="button"
                  onClick={() => setSalaryViewMode('supervisor')}
                  className={`h-10 rounded-md px-4 text-sm font-semibold transition ${
                    salaryViewMode === 'supervisor'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  By Supervisor
                </button>
              </div>
            )}

            {!processStatus?.isCompleted && salaryViewMode === 'all' && selectedSalaries.gov && govSalaries.length > 0 && (
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
            {!processStatus?.isCompleted && salaryViewMode === 'all' && selectedSalaries.company && companySalaries.length > 0 && (
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

            {!processStatus?.isCompleted && salaryViewMode === 'supervisor' && selectedSalaries.gov && govSalaries.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <SupervisorSalaryEditor
                  type="gov"
                  title={`Government Salary by Supervisor - ${getMonthName(month)} ${year}`}
                  salaries={govSalaries}
                  onSaveSalary={updateGovSalary}
                />
              </div>
            )}

            {!processStatus?.isCompleted && salaryViewMode === 'supervisor' && selectedSalaries.company && companySalaries.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <SupervisorSalaryEditor
                  type="company"
                  title={`Original Salary by Supervisor - ${getMonthName(month)} ${year}`}
                  salaries={companySalaries}
                  onSaveSalary={updateCompanySalary}
                />
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

            {!processStatus?.isCompleted && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <button
                  type="button"
                  onClick={handleCompleteProcess}
                  disabled={loading || !processStatus?.totalEntries}
                  className="w-full rounded-md bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:bg-gray-400"
                >
                  This Month Salary Process Completed
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
