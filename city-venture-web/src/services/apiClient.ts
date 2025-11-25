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

let accessToken: string | null = null;

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

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt refresh (cookie sent automatically)
        // Use a new instance to avoid interceptor loop? 
        // Yes, or just use axios directly.
        const response = await axios.post(`${api}/auth/refresh`, {}, {
            withCredentials: true 
        });

        const { accessToken: newAccessToken } = response.data;
        setAccessToken(newAccessToken);

        // Retry
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        setAccessToken(null);
        // Clear user data handled by AuthContext or caller
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

