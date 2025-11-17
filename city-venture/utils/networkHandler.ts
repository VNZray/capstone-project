
import axios, { AxiosError } from 'axios';

/**
 * Network Error Handler Utility
 * Provides user-friendly error messages for different network scenarios
 */

export interface NetworkError {
  message: string;
  code?: string;
  status?: number;
  isNetworkError: boolean;
}

/**
 * Check if device is online (basic check)
 */
export const isOnline = (): boolean => {
  // Note: For more robust checking, use @react-native-community/netinfo
  return true; // Placeholder - can be enhanced
};

/**
 * Handle axios errors and return user-friendly messages
 */
export const handleNetworkError = (error: unknown): NetworkError => {
  // Network/Connection errors
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;

    // No internet connection
    if (axiosError.code === 'ECONNABORTED' || axiosError.message === 'Network Error') {
      return {
        message: 'No internet connection. Please check your network and try again.',
        code: 'NETWORK_ERROR',
        isNetworkError: true,
      };
    }

    // Timeout
    if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('timeout')) {
      return {
        message: 'Request timed out. Please try again.',
        code: 'TIMEOUT',
        isNetworkError: true,
      };
    }

    // Server responded with error
    if (axiosError.response) {
      const status = axiosError.response.status;
      const data = axiosError.response.data as any;

      // 400 Bad Request
      if (status === 400) {
        return {
          message: data?.message || data?.error || 'Invalid request. Please check your input.',
          code: 'BAD_REQUEST',
          status,
          isNetworkError: false,
        };
      }

      // 401 Unauthorized
      if (status === 401) {
        return {
          message: data?.message || 'Incorrect email or password.',
          code: 'UNAUTHORIZED',
          status,
          isNetworkError: false,
        };
      }

      // 403 Forbidden
      if (status === 403) {
        return {
          message: data?.message || 'Access denied. Please contact support.',
          code: 'FORBIDDEN',
          status,
          isNetworkError: false,
        };
      }

      // 404 Not Found
      if (status === 404) {
        return {
          message: data?.message || 'Resource not found.',
          code: 'NOT_FOUND',
          status,
          isNetworkError: false,
        };
      }

      // 409 Conflict (e.g., email already exists)
      if (status === 409) {
        return {
          message: data?.message || 'This email is already registered.',
          code: 'CONFLICT',
          status,
          isNetworkError: false,
        };
      }

      // 422 Unprocessable Entity (validation error)
      if (status === 422) {
        return {
          message: data?.message || 'Validation failed. Please check your input.',
          code: 'VALIDATION_ERROR',
          status,
          isNetworkError: false,
        };
      }

      // 429 Too Many Requests
      if (status === 429) {
        return {
          message: 'Too many attempts. Please try again later.',
          code: 'RATE_LIMIT',
          status,
          isNetworkError: false,
        };
      }

      // 500 Internal Server Error
      if (status >= 500) {
        return {
          message: 'Server error. Please try again later.',
          code: 'SERVER_ERROR',
          status,
          isNetworkError: false,
        };
      }

      // Generic error with status
      return {
        message: data?.message || data?.error || 'Something went wrong. Please try again.',
        code: 'UNKNOWN_ERROR',
        status,
        isNetworkError: false,
      };
    }

    // Request was made but no response received
    if (axiosError.request) {
      return {
        message: 'Unable to reach server. Please check your connection.',
        code: 'NO_RESPONSE',
        isNetworkError: true,
      };
    }
  }

  // Generic error
  const genericError = error as Error;
  return {
    message: genericError?.message || 'An unexpected error occurred.',
    code: 'UNKNOWN',
    isNetworkError: false,
  };
};

/**
 * Format error message for display
 */
export const formatErrorMessage = (error: unknown): string => {
  const networkError = handleNetworkError(error);
  return networkError.message;
};

/**
 * Check if error is authentication related
 */
export const isAuthError = (error: unknown): boolean => {
  const networkError = handleNetworkError(error);
  return networkError.status === 401 || networkError.code === 'UNAUTHORIZED';
};

/**
 * Check if error requires logout
 */
export const shouldLogout = (error: unknown): boolean => {
  const networkError = handleNetworkError(error);
  return networkError.status === 401 || networkError.status === 403;
};

/**
 * Retry configuration for network requests
 */
export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // ms
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (error: unknown): boolean => {
  const networkError = handleNetworkError(error);
  return (
    networkError.isNetworkError ||
    (networkError.status !== undefined &&
      RETRY_CONFIG.retryableStatuses.includes(networkError.status))
  );
};