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

// Function to set access token
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

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
        // Attempt refresh
        const refreshToken = await getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
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

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        // Refresh failed - Logout
        setAccessToken(null);
        await clearAllAuthData();
        // Redirect to login or emit event? 
        // In React Native, context usually handles the redirect based on user state.
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

