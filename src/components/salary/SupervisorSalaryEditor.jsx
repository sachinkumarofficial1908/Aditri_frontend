import React, { useEffect, useMemo, useState } from 'react';
import { DEFAULT_BONUSES, DEFAULT_DEDUCTIONS, formatCurrency } from '../../utils/salaryUtils';

const numberValue = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);

const getBonusValue = (salary, matcher, fallback) => {
  const bonus = (salary.bonuses || []).find((item, index) => matcher(item, index));
  return bonus?.percentage ?? fallback;
};

const buildBonuses = (salary, draft) => {
  const currentBonuses = salary.bonuses?.length ? salary.bonuses : DEFAULT_BONUSES;
  const hasLeaveBonus = currentBonuses.some((bonus) => bonus.name.toLowerCase().includes('leave'));
  const bonuses = currentBonuses.map((bonus, index) => ({
    name: bonus.name,
    percentage: bonus.name.toLowerCase().includes('leave')
      ? numberValue(draft.leaveBonusPercentage)
      : index === 0
        ? numberValue(draft.bonusPercentage)
        : numberValue(bonus.percentage),
  }));

  if (!hasLeaveBonus) {
    bonuses.push({ name: 'Leave Bonus', percentage: numberValue(draft.leaveBonusPercentage) });
  }

  return bonuses;
};

const groupBySupervisor = (salaries) => {
  const groups = new Map();
  salaries.forEach((salary) => {
    const supervisorId = salary.employee_details?.supervisorId || 'unassigned';
    if (!groups.has(supervisorId)) {
      groups.set(supervisorId, {
        supervisorId,
        supervisorName: salary.employee_details?.supervisorName || 'Unassigned',
        supervisorEmail: salary.employee_details?.supervisorEmail || '',
        rows: [],
      });
    }
    groups.get(supervisorId).rows.push(salary);
  });
  return Array.from(groups.values());
};

const buildDrafts = (salaries, type) => (
  salaries.reduce((drafts, salary) => {
    drafts[salary._id] = {
      days: salary.days ?? 0,
      rate: type === 'gov' ? salary.gov_rate ?? 0 : salary.comp_rate ?? 0,
      bonusPercentage: getBonusValue(salary, (_, index) => index === 0, DEFAULT_BONUSES[0].percentage),
      leaveBonusPercentage: getBonusValue(
        salary,
        (bonus) => bonus.name.toLowerCase().includes('leave'),
        DEFAULT_BONUSES[1].percentage
      ),
      pf: salary.pf ?? 0,
      esic: salary.esic ?? 0,
      pfPercentage: salary.pf_percentage ?? DEFAULT_DEDUCTIONS.pf_percentage,
      esicPercentage: salary.esic_percentage ?? DEFAULT_DEDUCTIONS.esic_percentage,
    };
    return drafts;
  }, {})
);

const controlInputClass = 'mt-1 h-9 w-full rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100';
const tableInputClass = 'h-9 w-full rounded-md border border-gray-300 bg-white px-2 text-right text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100';
const primaryButtonClass = 'inline-flex h-10 min-w-[116px] items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400';
const saveButtonClass = 'inline-flex h-9 min-w-[88px] items-center justify-center rounded-md bg-emerald-600 px-3 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-400';

const SupervisorSalaryEditor = ({ type, salaries, title, onSaveSalary }) => {
  const [drafts, setDrafts] = useState({});
  const [groupConfigs, setGroupConfigs] = useState({});
  const [savingKey, setSavingKey] = useState('');
  const groups = useMemo(() => groupBySupervisor(salaries || []), [salaries]);
  const isGov = type === 'gov';

  useEffect(() => {
    setDrafts(buildDrafts(salaries || [], type));
  }, [salaries, type]);

  useEffect(() => {
    setGroupConfigs((current) => {
      const next = { ...current };
      groups.forEach((group) => {
        if (!next[group.supervisorId]) {
          next[group.supervisorId] = {
            bonusPercentage: DEFAULT_BONUSES[0].percentage,
            leaveBonusPercentage: DEFAULT_BONUSES[1].percentage,
            pfPercentage: DEFAULT_DEDUCTIONS.pf_percentage,
            esicPercentage: DEFAULT_DEDUCTIONS.esic_percentage,
          };
        }
      });
      return next;
    });
  }, [groups]);

  const updateDraft = (id, field, value) => {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        [field]: value,
      },
    }));
  };

  const updateGroupConfig = (supervisorId, field, value) => {
    setGroupConfigs((current) => ({
      ...current,
      [supervisorId]: {
        ...current[supervisorId],
        [field]: value,
      },
    }));
  };

  const buildPayload = (salary, draft) => {
    const payload = {
      days: numberValue(draft.days),
      bonuses: buildBonuses(salary, draft),
    };

    if (isGov) {
      payload.pf_percentage = numberValue(draft.pfPercentage);
      payload.esic_percentage = numberValue(draft.esicPercentage);
    } else {
      payload.comp_rate = numberValue(draft.rate);
      payload.pf = numberValue(draft.pf);
      payload.esic = numberValue(draft.esic);
    }

    return payload;
  };

  const saveRow = async (salary) => {
    const draft = drafts[salary._id];
    if (!draft) return;

    setSavingKey(salary._id);
    try {
      await onSaveSalary(salary._id, buildPayload(salary, draft));
    } finally {
      setSavingKey('');
    }
  };

  const applyToSupervisor = async (group) => {
    const config = groupConfigs[group.supervisorId];
    if (!config) return;

    setSavingKey(group.supervisorId);
    try {
      for (const salary of group.rows) {
        const currentDraft = drafts[salary._id] || {};
        const nextDraft = {
          ...currentDraft,
          bonusPercentage: config.bonusPercentage,
          leaveBonusPercentage: config.leaveBonusPercentage,
          pfPercentage: config.pfPercentage,
          esicPercentage: config.esicPercentage,
        };

        await onSaveSalary(salary._id, {
          bonuses: buildBonuses(salary, nextDraft),
          pf_percentage: numberValue(config.pfPercentage),
          esic_percentage: numberValue(config.esicPercentage),
        });
      }
    } finally {
      setSavingKey('');
    }
  };

  if (!salaries || salaries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">
          Edit individual rows, or apply bonus and deduction percentages to one supervisor group.
          {isGov ? ' Government rate is fixed from employee master.' : ''}
        </p>
      </div>
      {groups.map((group) => {
        const totals = group.rows.reduce((sum, salary) => ({
          gross: sum.gross + (salary.gross || 0),
          net: sum.net + (salary.net_payable || 0),
        }), { gross: 0, net: 0 });
        const config = groupConfigs[group.supervisorId] || {};

        return (
          <div key={group.supervisorId} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-gray-50 p-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-gray-900">{group.supervisorName}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-white px-3 py-1 font-medium text-gray-600 ring-1 ring-gray-200">
                      {group.rows.length} employees
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 font-medium text-gray-600 ring-1 ring-gray-200">
                      Gross {formatCurrency(totals.gross)}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 font-medium text-green-700 ring-1 ring-green-100">
                      Net {formatCurrency(totals.net)}
                    </span>
                  </div>
                </div>

                <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-5 xl:max-w-3xl">
                  {[
                    ['bonusPercentage', 'Bonus %'],
                    ['leaveBonusPercentage', 'Leave %'],
                    ['pfPercentage', 'PF %'],
                    ['esicPercentage', 'ESIC %'],
                  ].map(([field, label]) => (
                    <label key={field} className="text-xs font-semibold text-gray-600">
                      <span>{label}</span>
                      <input
                        type="number"
                        step="0.01"
                        value={config[field] ?? ''}
                        onChange={(event) => updateGroupConfig(group.supervisorId, field, event.target.value)}
                        className={controlInputClass}
                      />
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={() => applyToSupervisor(group)}
                    disabled={Boolean(savingKey)}
                    className={`${primaryButtonClass} self-end`}
                  >
                    {savingKey === group.supervisorId ? 'Applying...' : 'Apply'}
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1240px] table-fixed border-collapse text-xs">
                <colgroup>
                  <col className="w-[110px]" />
                  <col className="w-[180px]" />
                  <col className="w-[92px]" />
                  <col className="w-[116px]" />
                  <col className="w-[104px]" />
                  <col className="w-[104px]" />
                  <col className="w-[104px]" />
                  <col className="w-[104px]" />
                  <col className="w-[130px]" />
                  <col className="w-[140px]" />
                  <col className="w-[110px]" />
                </colgroup>
                <thead className={isGov ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}>
                  <tr>
                    {[
                      'CLMS ID',
                      'Employee',
                      'Days',
                      isGov ? 'Gov Rate' : 'Comp Rate',
                      'Bonus %',
                      'Leave %',
                      isGov ? 'PF %' : 'PF',
                      isGov ? 'ESIC %' : 'ESIC',
                      'Gross',
                      'Net Payable',
                      'Action',
                    ].map((heading) => (
                      <th key={heading} className="border border-gray-300 px-3 py-3 text-left font-semibold">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {group.rows.map((salary) => {
                    const draft = drafts[salary._id] || {};
                    return (
                      <tr key={salary._id} className="odd:bg-white even:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2 font-medium text-gray-700">{salary.clms_id}</td>
                        <td className="border border-gray-300 px-3 py-2 font-semibold text-gray-900">{salary.employee_details?.name || 'N/A'}</td>
                        {[
                          'days',
                          'rate',
                          'bonusPercentage',
                          'leaveBonusPercentage',
                          isGov ? 'pfPercentage' : 'pf',
                          isGov ? 'esicPercentage' : 'esic',
                        ].map((field) => (
                          <td key={field} className="border border-gray-300 px-3 py-2">
                            {isGov && field === 'rate' ? (
                              <input
                                type="number"
                                value={draft[field] ?? ''}
                                disabled
                                title="Government rate is fixed from employee master"
                                className={`${tableInputClass} cursor-not-allowed bg-gray-100 text-gray-600`}
                              />
                            ) : (
                              <input
                                type="number"
                                step="0.01"
                                value={draft[field] ?? ''}
                                onChange={(event) => updateDraft(salary._id, field, event.target.value)}
                                className={tableInputClass}
                              />
                            )}
                          </td>
                        ))}
                        <td className="border border-gray-300 px-3 py-2 text-right font-semibold text-gray-900">{formatCurrency(salary.gross)}</td>
                        <td className="border border-gray-300 px-3 py-2 text-right font-bold text-green-700">{formatCurrency(salary.net_payable)}</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => saveRow(salary)}
                            disabled={Boolean(savingKey)}
                            className={saveButtonClass}
                          >
                            {savingKey === salary._id ? 'Saving...' : 'Save'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SupervisorSalaryEditor;
