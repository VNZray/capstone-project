/**
 * Password Policy Utility
 * 
 * Enforces password complexity requirements to protect against:
 * - Brute-force attacks
 * - Dictionary attacks
 * - Credential stuffing
 * 
 * @module utils/passwordPolicy
 */

// Common weak passwords to reject
const COMMON_PASSWORDS = new Set([
  'password', 'password1', 'password123',
  '123456', '12345678', '123456789', '1234567890',
  'qwerty', 'qwerty123', 'qwertyuiop',
  'letmein', 'welcome', 'admin', 'login',
  'abc123', 'monkey', 'master', 'dragon',
  'iloveyou', 'trustno1', 'sunshine', 'princess',
  'football', 'baseball', 'soccer', 'hockey',
  'batman', 'superman', 'starwars',
  'passw0rd', 'p@ssword', 'p@ssw0rd',
]);

// Configuration (can be moved to env vars)
const MIN_LENGTH = 8;
const MAX_LENGTH = 128;
const REQUIRE_UPPERCASE = true;
const REQUIRE_LOWERCASE = true;
const REQUIRE_NUMBER = true;
const REQUIRE_SPECIAL = true;
const SPECIAL_CHARS = '!@#$%^&*(),.?":{}|<>[]\\-_=+;\'`~';

/**
 * Validates password against complexity requirements
 * @param {string} password - The password to validate
 * @returns {{ valid: boolean, errors: string[], score: number }} Validation result
 */
export function validatePassword(password) {
  const errors = [];
  let score = 0;

  // Check if password is provided
  if (!password || typeof password !== 'string') {
    return {
      valid: false,
      errors: ['Password is required'],
      score: 0,
    };
  }

  // Length checks
  if (password.length < MIN_LENGTH) {
    errors.push(`Password must be at least ${MIN_LENGTH} characters long`);
  } else {
    score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
  }

  if (password.length > MAX_LENGTH) {
    errors.push(`Password must not exceed ${MAX_LENGTH} characters`);
  }

  // Character type checks
  if (REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else if (/[A-Z]/.test(password)) {
    score += 1;
  }

  if (REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else if (/[a-z]/.test(password)) {
    score += 1;
  }

  if (REQUIRE_NUMBER && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  } else if (/[0-9]/.test(password)) {
    score += 1;
  }

  if (REQUIRE_SPECIAL) {
    const specialRegex = new RegExp(`[${SPECIAL_CHARS.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}]`);
    if (!specialRegex.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
    } else {
      score += 1;
    }
  }

  // Check against common passwords
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    errors.push('Password is too common and easily guessable');
  }

  // Check for sequential characters (123, abc, etc.)
  if (hasSequentialChars(password, 3)) {
    errors.push('Password should not contain sequential characters (e.g., 123, abc)');
  }

  // Check for repeated characters (aaa, 111, etc.)
  if (hasRepeatedChars(password, 3)) {
    errors.push('Password should not contain repeated characters (e.g., aaa, 111)');
  }

  // Bonus for mixed case throughout
  const uppercaseCount = (password.match(/[A-Z]/g) || []).length;
  const lowercaseCount = (password.match(/[a-z]/g) || []).length;
  if (uppercaseCount > 1 && lowercaseCount > 1) {
    score += 1;
  }

  return {
    valid: errors.length === 0,
    errors,
    score: Math.min(score, 10), // Cap at 10
  };
}

/**
 * Gets human-readable password strength
 * @param {number} score - Password score (0-10)
 * @returns {string} Strength description
 */
export function getPasswordStrength(score) {
  if (score <= 2) return 'Weak';
  if (score <= 4) return 'Fair';
  if (score <= 6) return 'Good';
  if (score <= 8) return 'Strong';
  return 'Very Strong';
}

/**
 * Checks for sequential characters
 * @param {string} str - String to check
 * @param {number} length - Sequence length to detect
 * @returns {boolean} True if sequential chars found
 */
function hasSequentialChars(str, length) {
  const lower = str.toLowerCase();
  for (let i = 0; i <= lower.length - length; i++) {
    let isSequential = true;
    for (let j = 1; j < length; j++) {
      if (lower.charCodeAt(i + j) !== lower.charCodeAt(i) + j) {
        isSequential = false;
        break;
      }
    }
    if (isSequential) return true;

    // Check reverse sequence
    isSequential = true;
    for (let j = 1; j < length; j++) {
      if (lower.charCodeAt(i + j) !== lower.charCodeAt(i) - j) {
        isSequential = false;
        break;
      }
    }
    if (isSequential) return true;
  }
  return false;
}

/**
 * Checks for repeated characters
 * @param {string} str - String to check
 * @param {number} length - Repeat length to detect
 * @returns {boolean} True if repeated chars found
 */
function hasRepeatedChars(str, length) {
  const lower = str.toLowerCase();
  for (let i = 0; i <= lower.length - length; i++) {
    let isRepeated = true;
    for (let j = 1; j < length; j++) {
      if (lower[i + j] !== lower[i]) {
        isRepeated = false;
        break;
      }
    }
    if (isRepeated) return true;
  }
  return false;
}

/**
 * Validates that password doesn't contain user info
 * @param {string} password - Password to check
 * @param {Object} userInfo - User information to check against
 * @param {string} [userInfo.email] - User's email
 * @param {string} [userInfo.firstName] - User's first name
 * @param {string} [userInfo.lastName] - User's last name
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validatePasswordNotContainsUserInfo(password, userInfo = {}) {
  const lower = password.toLowerCase();
  const checks = [];

  if (userInfo.email) {
    const emailParts = userInfo.email.toLowerCase().split('@')[0];
    if (emailParts.length >= 3 && lower.includes(emailParts)) {
      checks.push('Password should not contain your email username');
    }
  }

  if (userInfo.firstName && userInfo.firstName.length >= 3) {
    if (lower.includes(userInfo.firstName.toLowerCase())) {
      checks.push('Password should not contain your first name');
    }
  }

  if (userInfo.lastName && userInfo.lastName.length >= 3) {
    if (lower.includes(userInfo.lastName.toLowerCase())) {
      checks.push('Password should not contain your last name');
    }
  }

  return {
    valid: checks.length === 0,
    errors: checks,
  };
}

/**
 * Express middleware to validate password in request body
 * @param {Object} options - Middleware options
 * @param {string} [options.passwordField='password'] - Field name containing password
 * @param {boolean} [options.checkUserInfo=false] - Whether to check against user info
 * @returns {Function} Express middleware
 */
export function passwordValidationMiddleware(options = {}) {
  const { passwordField = 'password', checkUserInfo = false } = options;

  return (req, res, next) => {
    const password = req.body[passwordField];
    
    if (!password) {
      return res.status(400).json({
        message: 'Password is required',
        errors: ['Password is required'],
      });
    }

    const result = validatePassword(password);

    if (checkUserInfo && req.body) {
      const userInfoResult = validatePasswordNotContainsUserInfo(password, {
        email: req.body.email,
        firstName: req.body.first_name || req.body.firstName,
        lastName: req.body.last_name || req.body.lastName,
      });
      
      if (!userInfoResult.valid) {
        result.valid = false;
        result.errors.push(...userInfoResult.errors);
      }
    }

    if (!result.valid) {
      return res.status(400).json({
        message: 'Password does not meet requirements',
        errors: result.errors,
        strength: getPasswordStrength(result.score),
      });
    }

    // Attach score to request for potential logging
    req.passwordScore = result.score;
    req.passwordStrength = getPasswordStrength(result.score);
    
    next();
  };
}

export default {
  validatePassword,
  getPasswordStrength,
  validatePasswordNotContainsUserInfo,
  passwordValidationMiddleware,
};
