
/**
 * Form Validation Utilities
 * Provides reusable validation functions with user-friendly error messages
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email format
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password || password.length === 0) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }

  return { isValid: true };
};

/**
 * Validate password with strength requirements
 */
export const validatePasswordStrength = (password: string): ValidationResult => {
  if (!password || password.length === 0) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }

  // Optional: Add more strength checks
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    return {
      isValid: false,
      error: 'Password must include uppercase, lowercase, and numbers',
    };
  }

  return { isValid: true };
};

/**
 * Validate phone number (Philippines format)
 */
export const validatePhoneNumber = (phoneNumber: string): ValidationResult => {
  if (!phoneNumber || phoneNumber.trim().length === 0) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove spaces and dashes
  const cleaned = phoneNumber.replace(/[\s-]/g, '');

  // Check if it's a valid Philippine mobile number (09XX-XXXX-XXX or +639XX-XXXX-XXX)
  const phoneRegex = /^(09|\+639)\d{9}$/;
  if (!phoneRegex.test(cleaned)) {
    return {
      isValid: false,
      error: 'Please enter a valid Philippine mobile number',
    };
  }

  return { isValid: true };
};

/**
 * Validate required field
 */
export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value || value.trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true };
};

/**
 * Validate name (no numbers, min 2 chars)
 */
export const validateName = (name: string, fieldName: string = 'Name'): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters` };
  }

  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(name)) {
    return { isValid: false, error: `${fieldName} can only contain letters` };
  }

  return { isValid: true };
};

/**
 * Validate password confirmation
 */
export const validatePasswordMatch = (password: string, confirmPassword: string): ValidationResult => {
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }
  return { isValid: true };
};

/**
 * Validate date of birth (must be 18+)
 */
export const validateBirthdate = (birthdate: Date | null): ValidationResult => {
  if (!birthdate) {
    return { isValid: false, error: 'Birthdate is required' };
  }

  const today = new Date();
  const age = today.getFullYear() - birthdate.getFullYear();
  const monthDiff = today.getMonth() - birthdate.getMonth();
  const dayDiff = today.getDate() - birthdate.getDate();

  const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

  if (actualAge < 13) {
    return { isValid: false, error: 'You must be at least 13 years old' };
  }

  return { isValid: true };
};

/**
 * Validate login form
 */
export const validateLoginForm = (email: string, password: string): ValidationResult => {
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return emailValidation;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }

  return { isValid: true };
};

/**
 * Validate registration form
 */
export const validateRegistrationForm = (data: {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  birthdate: Date | null;
}): ValidationResult => {
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) return emailValidation;

  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) return passwordValidation;

  const passwordMatchValidation = validatePasswordMatch(data.password, data.confirmPassword);
  if (!passwordMatchValidation.isValid) return passwordMatchValidation;

  const firstNameValidation = validateName(data.firstName, 'First name');
  if (!firstNameValidation.isValid) return firstNameValidation;

  const lastNameValidation = validateName(data.lastName, 'Last name');
  if (!lastNameValidation.isValid) return lastNameValidation;

  const phoneValidation = validatePhoneNumber(data.phoneNumber);
  if (!phoneValidation.isValid) return phoneValidation;

  const birthdateValidation = validateBirthdate(data.birthdate);
  if (!birthdateValidation.isValid) return birthdateValidation;

  return { isValid: true };
};