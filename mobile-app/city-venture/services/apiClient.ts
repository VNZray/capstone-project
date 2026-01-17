import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import api from './api'; // The string URL
import { getRefreshToken, saveRefreshToken, clearAllAuthData } from '@/utils/secureStorage';

// Create Axios instance
const apiClient = axios.create({
  baseURL: api,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Debug: Log base URL
console.log('[apiClient] Initialized with baseURL:', api);

// In-memory access token
let accessToken: string | null = null;

// Refresh lock to prevent concurrent refresh attempts (race condition fix)
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// Session ID to invalidate stale refresh operations after logout
let sessionId = 0;

// Function to set access token
export const setAccessToken = (token: string | null) => {
  console.log('[apiClient] setAccessToken called:', token ? 'token set' : 'token cleared');
  accessToken = token;
};

export const getAccessToken = () => accessToken;

/**
 * Clear all client-side auth state.
 * Call this on logout to ensure no stale state persists.
 * Increments sessionId to invalidate any in-flight refresh operations.
 */
export const clearApiClientState = () => {
  console.log('[apiClient] Clearing all auth state');
  accessToken = null;
  isRefreshing = false;
  refreshPromise = null;
  sessionId++; // Invalidate any pending refresh operations
};

/**
 * Centralized token refresh function with lock.
 * Ensures only ONE refresh request is made even if called multiple times.
 * All callers wait for the same promise.
 * Uses sessionId to detect if logout occurred during refresh.
 */
export const refreshTokens = async (): Promise<string | null> => {
  // Capture current session ID to detect logout during async operations
  const currentSessionId = sessionId;

  // If already refreshing, return the existing promise
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        console.log('[apiClient] No refresh token available');
        return null;
      }

      // Check if logout occurred while we were getting the refresh token
      if (sessionId !== currentSessionId) {
        console.log('[apiClient] Session invalidated during refresh - aborting');
        return null;
      }

      // Call refresh endpoint (using a separate axios instance to avoid loop)
      const response = await axios.post(`${api}/auth/refresh`, {
        refreshToken,
      });

      // Check again after async operation
      if (sessionId !== currentSessionId) {
        console.log('[apiClient] Session invalidated after refresh call - discarding tokens');
        return null;
      }

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

      // Update state and storage
      setAccessToken(newAccessToken);
      if (newRefreshToken) {
        await saveRefreshToken(newRefreshToken);
      }

      console.log('[apiClient] Token refresh successful');
      return newAccessToken;
    } catch (error) {
      console.log('[apiClient] Token refresh failed:', error instanceof Error ? error.message : 'Unknown error');
      // Refresh failed - clear auth data
      setAccessToken(null);
      await clearAllAuthData();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// Request Interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Public endpoints that don't require authentication
    const publicEndpoints = [
      '/auth/login',
      '/auth/refresh',
      '/auth/register',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/verify-email',
    ];

    const isPublicEndpoint = publicEndpoints.some(endpoint =>
      config.url?.includes(endpoint)
    );

    // Always read the current accessToken (may have changed since last request)
    const currentToken = accessToken;
    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
      console.log('[apiClient] Request with auth token:', config.url);
    } else {
      // Ensure no stale Authorization header exists
      delete config.headers.Authorization;
      if (!isPublicEndpoint) {
        console.log('[apiClient] Request without auth token (protected endpoint):', config.url);
      } else {
        console.log('[apiClient] Request without auth token (public endpoint):', config.url);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Use centralized refresh with lock to prevent race conditions
        const newAccessToken = await refreshTokens();

        if (!newAccessToken) {
          // Refresh failed - reject with original error
          return Promise.reject(error);
        }

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        // Refresh failed - already handled in refreshTokens
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

