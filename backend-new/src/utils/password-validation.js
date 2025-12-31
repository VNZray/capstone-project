/**
 * Password Validation Utility
 * Enforces strong password policies
 */

/**
 * Password policy configuration
 */
export const passwordPolicy = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: '@$!%*?&',
  preventCommonPasswords: true,
  preventUserInfo: true
};

/**
 * Common weak passwords to prevent
 */
const commonPasswords = [
  'password', 'password123', '123456', '12345678', 'qwerty',
  'abc123', 'monkey', 'letmein', 'dragon', 'admin',
  'welcome', 'login', 'master', 'passw0rd', 'hello'
];

/**
 * Validate password against policy
 * @param {string} password - Password to validate
 * @param {Object} userInfo - Optional user info to check against
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export const validatePassword = (password, userInfo = {}) => {
  const errors = [];

  // Check length
  if (!password || password.length < passwordPolicy.minLength) {
    errors.push(`Password must be at least ${passwordPolicy.minLength} characters long`);
  }

  if (password && password.length > passwordPolicy.maxLength) {
    errors.push(`Password must not exceed ${passwordPolicy.maxLength} characters`);
  }

  // Check for uppercase
  if (passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase
  if (passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check for numbers
  if (passwordPolicy.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Check for special characters
  if (passwordPolicy.requireSpecialChars) {
    const specialCharRegex = new RegExp(`[${passwordPolicy.specialChars}]`);
    if (!specialCharRegex.test(password)) {
      errors.push(`Password must contain at least one special character (${passwordPolicy.specialChars})`);
    }
  }

  // Check for common passwords
  if (passwordPolicy.preventCommonPasswords) {
    const lowerPassword = password?.toLowerCase();
    if (commonPasswords.includes(lowerPassword)) {
      errors.push('Password is too common. Please choose a stronger password');
    }
  }

  // Check against user info
  if (passwordPolicy.preventUserInfo && password) {
    const lowerPassword = password.toLowerCase();
    const { email, firstName, lastName, phone } = userInfo;

    if (email && lowerPassword.includes(email.split('@')[0].toLowerCase())) {
      errors.push('Password should not contain your email');
    }

    if (firstName && firstName.length > 2 && lowerPassword.includes(firstName.toLowerCase())) {
      errors.push('Password should not contain your first name');
    }

    if (lastName && lastName.length > 2 && lowerPassword.includes(lastName.toLowerCase())) {
      errors.push('Password should not contain your last name');
    }

    if (phone && phone.length > 4 && lowerPassword.includes(phone.slice(-4))) {
      errors.push('Password should not contain your phone number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Calculate password strength score
 * @param {string} password - Password to evaluate
 * @returns {Object} - { score: number (0-100), strength: string }
 */
export const calculatePasswordStrength = (password) => {
  if (!password) return { score: 0, strength: 'None' };

  let score = 0;

  // Length scoring
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  // Character variety
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 15;
  if (/\d/.test(password)) score += 15;
  if (/[@$!%*?&]/.test(password)) score += 20;

  // Bonus for mixed patterns
  if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) score += 10;

  // Penalty for common patterns
  if (/^[A-Z][a-z]+\d+$/.test(password)) score -= 10;
  if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters

  score = Math.max(0, Math.min(100, score));

  let strength;
  if (score < 30) strength = 'Weak';
  else if (score < 50) strength = 'Fair';
  else if (score < 70) strength = 'Good';
  else if (score < 90) strength = 'Strong';
  else strength = 'Excellent';

  return { score, strength };
};

export default { validatePassword, calculatePasswordStrength, passwordPolicy };
