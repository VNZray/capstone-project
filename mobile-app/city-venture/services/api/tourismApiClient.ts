/**
 * Tourism API Client
 *
 * Handles requests to the Tourism Backend (port 3000):
 * - Tourist spots
 * - Events
 * - Emergency facilities
 */

import axios from 'axios';
import { TOURISM_API_URL } from './api';
import { getAccessToken } from './apiClient';

// Create Axios instance for Tourism Backend
const tourismApiClient = axios.create({
    baseURL: TOURISM_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

if (__DEV__) {
    console.log('[tourismApiClient] Initialized with baseURL:', TOURISM_API_URL);
}

// Request interceptor for auth token and logging
tourismApiClient.interceptors.request.use(
    (config) => {
        // Add auth token if available (share with apiClient)
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            if (__DEV__) {
                console.log('[tourismApiClient] Request with auth:', config.method?.toUpperCase(), config.url);
            }
        } else {
            if (__DEV__) {
                console.log('[tourismApiClient] Request:', config.method?.toUpperCase(), config.url);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
tourismApiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (__DEV__) {
            console.log('[tourismApiClient] Error:', error.response?.status, error.message);
        }

        // Don't throw network errors - let the app handle gracefully
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
            console.warn('[tourismApiClient] Tourism backend unavailable');
        }

        return Promise.reject(error);
    }
);

export default tourismApiClient;
