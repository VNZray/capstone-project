/**
 * Helper Utilities
 * Common utility functions used across the application
 */
import crypto from 'crypto';

/**
 * Generate a random OTP
 * @param {number} length - Length of OTP (default: 6)
 * @returns {string} - Generated OTP
 */
export const generateOtp = (length = 6) => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

/**
 * Generate a secure random token
 * @param {number} bytes - Number of bytes (default: 32)
 * @returns {string} - Hex encoded token
 */
export const generateSecureToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Generate a booking/order reference number
 * @param {string} prefix - Prefix for the reference (default: 'CV')
 * @returns {string} - Reference number
 */
export const generateReference = (prefix = 'CV') => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

/**
 * Calculate pagination offset
 * @param {number} page - Current page (1-indexed)
 * @param {number} limit - Items per page
 * @returns {number} - Offset for database query
 */
export const calculateOffset = (page, limit) => {
  return (Math.max(1, page) - 1) * limit;
};

/**
 * Format pagination response
 * @param {number} totalItems - Total number of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} - Pagination metadata
 */
export const formatPagination = (totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};

/**
 * Parse boolean from various input types
 * @param {any} value - Value to parse
 * @returns {boolean} - Parsed boolean
 */
export const parseBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
  }
  return Boolean(value);
};

/**
 * Sleep/delay utility
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after delay
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Omit specified keys from an object
 * @param {Object} obj - Source object
 * @param {Array<string>} keys - Keys to omit
 * @returns {Object} - New object without specified keys
 */
export const omit = (obj, keys) => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

/**
 * Pick specified keys from an object
 * @param {Object} obj - Source object
 * @param {Array<string>} keys - Keys to pick
 * @returns {Object} - New object with only specified keys
 */
export const pick = (obj, keys) => {
  const result = {};
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

/**
 * Calculate number of nights between two dates
 * @param {Date|string} checkIn - Check-in date
 * @param {Date|string} checkOut - Check-out date
 * @returns {number} - Number of nights
 */
export const calculateNights = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Format date to Philippine timezone
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date string
 */
export const formatDatePHT = (date) => {
  return new Date(date).toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Extract results from MySQL stored procedure query
 * Handles nested array structure: [[data], metadata] or [data] or single object
 * @param {any} queryResult - Raw result from sequelize.query('CALL ...')
 * @returns {Array} - Array of result rows
 */
export const extractProcedureResult = (queryResult) => {
  if (!queryResult) return [];

  // If it's not an array, wrap single object in array
  if (!Array.isArray(queryResult)) {
    return typeof queryResult === 'object' ? [queryResult] : [];
  }

  // If empty array, return empty
  if (queryResult.length === 0) return [];

  const firstElement = queryResult[0];

  // If first element is an array, it's nested: [[rows], metadata]
  if (Array.isArray(firstElement)) {
    return firstElement;
  }

  // If first element is an object with typical row properties, it's [rows]
  if (firstElement && typeof firstElement === 'object') {
    // Check if it looks like a result set (array of objects) vs metadata
    // Metadata typically has properties like 'fieldCount', 'affectedRows', etc.
    if ('fieldCount' in firstElement || 'affectedRows' in firstElement) {
      return [];
    }
    return queryResult;
  }

  return [];
};

/**
 * Extract single result from stored procedure (for getById, etc.)
 * @param {any} queryResult - Raw result from sequelize.query('CALL ...')
 * @returns {Object|null} - Single result object or null
 */
export const extractSingleResult = (queryResult) => {
  const results = extractProcedureResult(queryResult);
  return results.length > 0 ? results[0] : null;
};

export default {
  generateOtp,
  generateSecureToken,
  generateReference,
  calculateOffset,
  formatPagination,
  parseBoolean,
  sleep,
  omit,
  pick,
  calculateNights,
  formatDatePHT,
  extractProcedureResult,
  extractSingleResult
};
