import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import api from './api'; // String URL

const apiClient = axios.create({
  baseURL: api,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for HttpOnly cookies
});

// Separate axios instance for refresh to avoid interceptor loops
// MUST have same config as apiClient for cookies to work
const refreshClient = axios.create({
  baseURL: api,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Critical: must match apiClient
});

let accessToken: string | null = null;

// Refresh lock to prevent concurrent refresh attempts (race condition)
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

/**
 * Centralized token refresh function with lock.
 * Ensures only ONE refresh request is made even if called multiple times.
 * All callers wait for the same promise.
 */
export const refreshTokens = async (): Promise<string | null> => {
  // If already refreshing, return the existing promise
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      console.debug('[refreshTokens] Attempting refresh. Current cookies:', document.cookie);

      // Use refreshClient (configured with withCredentials) instead of raw axios
      const response = await refreshClient.post('/auth/refresh', {
        client: 'web'  // Identify as web client for proper cookie handling
      });

      console.debug('[refreshTokens] Refresh successful');

      const { accessToken: newAccessToken } = response.data;
      setAccessToken(newAccessToken);
      return newAccessToken;
    } catch (error) {
      setAccessToken(null);
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

    console.debug('[apiClient] Request to:', config.url, '| Has token:', !!accessToken, '| Public:', isPublicEndpoint);

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else if (!isPublicEndpoint) {
      console.warn('[apiClient] No access token available for protected endpoint:', config.url);
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

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Use centralized refresh with lock
        const newAccessToken = await refreshTokens();

        if (!newAccessToken) {
          // Refresh failed - session expired, redirect to login
          console.error('[apiClient] Session expired - redirecting to login');

          // Trigger logout event for all tabs
          localStorage.setItem('logout-event', Date.now().toString());
          localStorage.removeItem('logout-event');

          // Clear session and redirect
          setAccessToken(null);
          window.location.href = '/login';

          return Promise.reject(error);
        }

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        // Refresh failed - session expired, redirect to login
        console.error('[apiClient] Refresh failed - redirecting to login');

        // Trigger logout event for all tabs
        localStorage.setItem('logout-event', Date.now().toString());
        localStorage.removeItem('logout-event');

        // Clear session and redirect
        setAccessToken(null);
        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

