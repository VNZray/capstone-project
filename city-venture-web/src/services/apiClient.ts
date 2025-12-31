import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { apiV1 } from './api'; // v1 API URL

/**
 * Standard API Response format from the new backend
 */
interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const apiClient = axios.create({
  baseURL: apiV1, // Use v1 API routes
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for HttpOnly cookies
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
      // Use v1 auth refresh endpoint
      const response = await axios.post<ApiResponse<{ accessToken: string }>>(`${apiV1}/auth/refresh`, {}, {
        withCredentials: true
      });

      // Handle new response format
      const responseData = response.data as ApiResponse<{ accessToken: string }>;
      const newAccessToken = responseData.data?.accessToken;
      if (!newAccessToken) {
        throw new Error('No access token in response');
      }
      setAccessToken(newAccessToken);
      return newAccessToken;
    } catch {
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
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - unwrap standardized response format
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // If response follows the new format { success, message, data }, unwrap it
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      // Keep pagination info if present
      if (response.data.pagination) {
        const dataValue = response.data.data;
        response.data = {
          ...(typeof dataValue === 'object' && dataValue !== null ? dataValue : {}),
          _pagination: response.data.pagination
        } as unknown as ApiResponse;
      } else if (response.data.data !== undefined) {
        response.data = response.data.data as unknown as ApiResponse;
      }
    }
    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Use centralized refresh with lock
        const newAccessToken = await refreshTokens();

        if (!newAccessToken) {
          return Promise.reject(error);
        }

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    // Extract error message from standardized response
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }

    return Promise.reject(error);
  }
);

export default apiClient;

