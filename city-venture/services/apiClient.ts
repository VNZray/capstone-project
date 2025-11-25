import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import api from './api'; // The string URL
import { getRefreshToken, saveRefreshToken, clearAllAuthData } from '@/utils/secureStorage';

// Create Axios instance
const apiClient = axios.create({
  baseURL: api,
  headers: {
    'Content-Type': 'application/json',
  },
});

// In-memory access token
let accessToken: string | null = null;

// Refresh lock to prevent concurrent refresh attempts (race condition fix)
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// Function to set access token
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
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        return null;
      }

      // Call refresh endpoint (using a separate axios instance to avoid loop)
      const response = await axios.post(`${api}/auth/refresh`, {
        refreshToken,
      });

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

      // Update state and storage
      setAccessToken(newAccessToken);
      if (newRefreshToken) {
        await saveRefreshToken(newRefreshToken);
      }

      return newAccessToken;
    } catch {
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
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
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

