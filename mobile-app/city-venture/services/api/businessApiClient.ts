/**
 * Business API Client
 *
 * Handles requests to the Business Backend (port 4000):
 * - Accommodation/Business listings
 * - Rooms and room details
 * - Products and shop categories
 * - Amenities
 * - Business hours
 * - Promotions
 * - Services
 */

import axios from 'axios';
import { BUSINESS_API_URL } from './api';
import { getAccessToken } from './apiClient';

// Create Axios instance for Business Backend
const businessApiClient = axios.create({
    baseURL: BUSINESS_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

if (__DEV__) {
    console.log('[businessApiClient] Initialized with baseURL:', BUSINESS_API_URL);
}

// Request interceptor for auth token and logging
businessApiClient.interceptors.request.use(
    (config) => {
        // Add auth token if available (share with apiClient)
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            if (__DEV__) {
                console.log('[businessApiClient] Request with auth:', config.method?.toUpperCase(), config.url);
            }
        } else {
            if (__DEV__) {
                console.log('[businessApiClient] Request:', config.method?.toUpperCase(), config.url);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
businessApiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (__DEV__) {
            console.log('[businessApiClient] Error:', error.response?.status, error.message);
        }

        // Don't throw network errors - let the app handle gracefully
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
            console.warn('[businessApiClient] Business backend unavailable');
        }

        return Promise.reject(error);
    }
);

export default businessApiClient;
