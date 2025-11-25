/**
 * Password Validation Utilities
 * Enforces strong password requirements for security compliance
 * 
 * @module utils/passwordValidation
 */

/**
 * Password requirements configuration
 */
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

/**
 * Validates password strength against security requirements
 * @param {string} password - The password to validate
 * @returns {{ isValid: boolean, errors: string[] }} Validation result
 */
export function validatePasswordStrength(password) {
  const errors = [];

  if (!password) {
    return { isValid: false, errors: ['Password is required'] };
  }

  // Length checks
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  }

  if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
    errors.push(`Password must not exceed ${PASSWORD_REQUIREMENTS.maxLength} characters`);
  }

  // Complexity checks
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (PASSWORD_REQUIREMENTS.requireSpecialChars) {
    const specialRegex = new RegExp(`[${PASSWORD_REQUIREMENTS.specialChars.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}]`);
    if (!specialRegex.test(password)) {
      errors.push(`Password must contain at least one special character (${PASSWORD_REQUIREMENTS.specialChars})`);
    }
  }

  // Check for common weak patterns
  const weakPatterns = [
    /^(.)\1+$/, // All same character (e.g., "aaaaaaaa")
    /^123456/, // Starts with sequential numbers
    /^password/i, // Contains "password"
    /^qwerty/i, // Common keyboard pattern
    /^admin/i, // Common admin pattern
  ];

  for (const pattern of weakPatterns) {
    if (pattern.test(password)) {
      errors.push('Password contains a common weak pattern');
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Express middleware to validate password in request body
 */
export const validatePasswordMiddleware = (req, res, next) => {
  const { password } = req.body;
  
  const { isValid, errors } = validatePasswordStrength(password);
  
  if (!isValid) {
    return res.status(400).json({
      message: 'Password does not meet security requirements',
      errors,
      requirements: {
        minLength: PASSWORD_REQUIREMENTS.minLength,
        requireUppercase: PASSWORD_REQUIREMENTS.requireUppercase,
        requireLowercase: PASSWORD_REQUIREMENTS.requireLowercase,
        requireNumbers: PASSWORD_REQUIREMENTS.requireNumbers,
        requireSpecialChars: PASSWORD_REQUIREMENTS.requireSpecialChars,
      },
    });
  }
  
  next();
};

/**
 * Get human-readable password requirements for client display
 */
export function getPasswordRequirementsText() {
  const requirements = [];
  
  requirements.push(`At least ${PASSWORD_REQUIREMENTS.minLength} characters`);
  
  if (PASSWORD_REQUIREMENTS.requireUppercase) {
    requirements.push('At least one uppercase letter (A-Z)');
  }
  
  if (PASSWORD_REQUIREMENTS.requireLowercase) {
    requirements.push('At least one lowercase letter (a-z)');
  }
  
  if (PASSWORD_REQUIREMENTS.requireNumbers) {
    requirements.push('At least one number (0-9)');
  }
  
  if (PASSWORD_REQUIREMENTS.requireSpecialChars) {
    requirements.push(`At least one special character (${PASSWORD_REQUIREMENTS.specialChars})`);
  }
  
  return requirements;
}
