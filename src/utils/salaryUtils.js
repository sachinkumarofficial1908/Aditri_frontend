/**
 * Salary Calculation Utilities for Frontend
 */

/**
 * Round to 2 decimal places
 */
export const roundToDecimal = (value, decimals = 2) => {
  if (!value) return 0;
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

/**
 * Format currency for display
 */
export const formatCurrency = (value) => {
  if (!value) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(value);
};

/**
 * Format number with thousand separator
 */
export const formatNumber = (value) => {
  if (!value) return '0';
  return new Intl.NumberFormat('en-IN').format(value);
};

/**
 * Calculate government salary
 */
export const calculateGovSalary = (
  days,
  gov_rate,
  bonuses = [],
  pf_percentage = 12,
  esic_percentage = 0.75
) => {
  const totalAmount = roundToDecimal(days * gov_rate, 2);

  const calculatedBonuses = bonuses.map((bonus) => ({
    name: bonus.name,
    percentage: bonus.percentage,
    amount: roundToDecimal((totalAmount * bonus.percentage) / 100, 2),
  }));

  const bonusTotal = calculatedBonuses.reduce((sum, b) => sum + b.amount, 0);
  const gross = roundToDecimal(totalAmount + bonusTotal, 2);

  const pf = roundToDecimal((gross * pf_percentage) / 100, 2);
  const esic = roundToDecimal((gross * esic_percentage) / 100, 2);
  const netDeduction = roundToDecimal(pf + esic, 2);
  const netPayable = roundToDecimal(gross - netDeduction, 2);

  return {
    totalAmount,
    bonuses: calculatedBonuses,
    gross,
    pf,
    esic,
    netDeduction,
    netPayable,
  };
};

/**
 * Calculate company salary
 */
export const calculateCompanySalary = (
  days,
  comp_rate,
  bonuses = [],
  pf = 0,
  esic = 0
) => {
  const totalAmount = roundToDecimal(days * comp_rate, 2);

  const calculatedBonuses = bonuses.map((bonus) => ({
    name: bonus.name,
    percentage: bonus.percentage,
    amount: roundToDecimal((totalAmount * bonus.percentage) / 100, 2),
  }));

  const bonusTotal = calculatedBonuses.reduce((sum, b) => sum + b.amount, 0);
  const gross = roundToDecimal(totalAmount + bonusTotal, 2);

  const netDeduction = roundToDecimal(pf + esic, 2);
  const netPayable = roundToDecimal(gross - netDeduction, 2);

  return {
    totalAmount,
    bonuses: calculatedBonuses,
    gross,
    pf,
    esic,
    netDeduction,
    netPayable,
  };
};

/**
 * Get month name
 */
export const getMonthName = (month) => {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return months[month - 1] || '';
};

/**
 * Download file from blob
 */
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Format date
 */
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

/**
 * Validate month/year combination
 */
export const isValidMonthYear = (month, year) => {
  return month >= 1 && month <= 12 && year >= 2000;
};

/**
 * Get current month and year
 */
export const getCurrentMonthYear = () => {
  const date = new Date();
  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
};

/**
 * Parse Excel file
 */
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        // This will require a library like xlsx to parse
        // For now, just pass the file
        resolve(file);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Default bonus configuration
 */
export const DEFAULT_BONUSES = [
  { name: 'Bonus', percentage: 8.33 },
  { name: 'Leave Bonus', percentage: 6.73 },
];

/**
 * Default deduction configuration
 */
export const DEFAULT_DEDUCTIONS = {
  pf_percentage: 12,
  esic_percentage: 0.75,
};

/**
 * Validate attendance data
 */
export const validateAttendanceData = (data) => {
  const errors = [];

  if (!data.employee_id) errors.push('Employee is required');
  if (!data.month) errors.push('Month is required');
  if (!data.year) errors.push('Year is required');
  if (
    data.days_present === undefined ||
    data.days_present === null ||
    Number.isNaN(data.days_present) ||
    data.days_present < 0
  ) {
    errors.push('Days present must be >= 0');
  }
  if (
    data.rate_per_day === undefined ||
    data.rate_per_day === null ||
    Number.isNaN(data.rate_per_day) ||
    data.rate_per_day <= 0
  ) {
    errors.push('Rate per day must be positive');
  }
  if (data.ot_amount !== undefined && data.ot_amount < 0) {
    errors.push('OT amount cannot be negative');
  }
  if (data.advance !== undefined && data.advance < 0) {
    errors.push('Advance cannot be negative');
  }

  return errors;
};

/**
 * Get unique employees from attendance entries
 */
export const getUniqueEmployees = (entries) => {
  const seen = new Set();
  const unique = [];

  entries.forEach((entry) => {
    if (!seen.has(entry.employee_id)) {
      seen.add(entry.employee_id);
      unique.push(entry);
    }
  });

  return unique;
};

/**
 * Check if attendance exists for employee in month/year
 */
export const attendanceExists = (entries, employeeId, month, year) => {
  return entries.some(
    (e) =>
      e.employee_id === employeeId &&
      e.month === month &&
      e.year === year
  );
};
