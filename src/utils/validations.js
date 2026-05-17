/**
 * Validation utility functions for form fields
 */

export const validations = {
  // Phone Number: exactly 10 digits
  phone: {
    pattern: /^\d{10}$/,
    message: 'Phone number must be exactly 10 digits',
    format: (value) => value.replace(/\D/g, '').slice(0, 10),
  },

  // Pincode: exactly 6 digits
  pincode: {
    pattern: /^\d{6}$/,
    message: 'Pincode must be exactly 6 digits',
    format: (value) => value.replace(/\D/g, '').slice(0, 6),
  },

  // Aadhar Number: exactly 12 digits
  aadharNo: {
    pattern: /^\d{12}$/,
    message: 'Aadhar number must be exactly 12 digits',
    format: (value) => value.replace(/\D/g, '').slice(0, 12),
  },

  // UAN: exactly 10 digits (Indian UAN format)
  uanNo: {
    pattern: /^\d{10}$/,
    message: 'UAN must be exactly 10 digits',
    format: (value) => value.replace(/\D/g, '').slice(0, 10),
  },

  // ESIC: max 17 digits (usually format: XX-XX-XXXXXXXXX)
  esicNo: {
    pattern: /^\d{1,17}$/,
    message: 'ESIC number must not exceed 17 digits',
    format: (value) => value.replace(/\D/g, '').slice(0, 17),
  },

  // Bank Account Number: max 30 digits
  bankAccountNumber: {
    pattern: /^\d{1,30}$/,
    message: 'Bank account number must not exceed 30 digits',
    format: (value) => value.replace(/\D/g, '').slice(0, 30),
  },

  // IFSC Code: max 16 characters, auto uppercase
  ifscCode: {
    pattern: /^[A-Z0-9]{1,16}$/,
    message: 'IFSC code must not exceed 16 characters',
    format: (value) => value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16),
  },

  // PAN Number: exactly 10 characters, auto uppercase (format: AAAAA0000A)
  panNo: {
    pattern: /^[A-Z0-9]{10}$/,
    message: 'PAN number must be exactly 10 characters',
    format: (value) => value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10),
  },

  // Daily Wages Rate: positive number
  dailyWagesRate: {
    pattern: /^\d+(\.\d{1,2})?$/,
    message: 'Daily wages rate must be a positive number',
    format: (value) => value.replace(/[^\d.]/g, '').replace(/\.(?=.*\.)/g, ''),
  },

  // Government Daily Wage: positive number
  govDailyWage: {
    pattern: /^\d+(\.\d{1,2})?$/,
    message: 'Government daily wage must be a positive number',
    format: (value) => value.replace(/[^\d.]/g, '').replace(/\.(?=.*\.)/g, ''),
  },

  // CLMS ID: alphanumeric
  clmsId: {
    pattern: /^[A-Z0-9]{1,}$/,
    message: 'CLMS ID must contain only letters and numbers',
    format: (value) => value.toUpperCase().replace(/[^A-Z0-9]/g, ''),
  },
};

/**
 * Validate a specific field
 * @param {string} fieldName - Name of the field to validate
 * @param {string} value - Value to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateField = (fieldName, value) => {
  if (!value) return false;
  const validation = validations[fieldName];
  if (!validation) return true;
  return validation.pattern.test(String(value));
};

/**
 * Format a field value according to its rules
 * @param {string} fieldName - Name of the field
 * @param {string} value - Raw value to format
 * @returns {string} - Formatted value
 */
export const formatField = (fieldName, value) => {
  if (!value) return '';
  const validation = validations[fieldName];
  if (!validation || !validation.format) return value;
  return validation.format(String(value));
};

/**
 * Get validation message for a field
 * @param {string} fieldName - Name of the field
 * @returns {string} - Validation message
 */
export const getValidationMessage = (fieldName) => {
  const validation = validations[fieldName];
  return validation ? validation.message : 'Invalid value';
};

/**
 * Phone number validation (applied everywhere)
 */
export const isValidPhone = (phone) => validateField('phone', phone);

/**
 * Get errors array from backend response and format as object
 * @param {Array} errorsArray - Array of error objects from backend
 * @returns {Object} - Object with field names as keys and error messages as values
 */
export const formatBackendErrors = (errorsArray) => {
  const errorObject = {};
  if (Array.isArray(errorsArray)) {
    errorsArray.forEach((error) => {
      if (error.param) {
        errorObject[error.param] = error.msg;
      }
    });
  }
  return errorObject;
};
