/**
 * Health Check Service for City Venture Mobile App
 *
 * Checks the health of all backend services:
 * - Mobile Backend (port 5000) - REQUIRED for app to function
 * - Business Backend (port 4000) - Optional, app degrades gracefully
 * - Tourism Backend (port 3000) - Optional, app degrades gracefully
 *
 * The app should only show "Server Down" if the Mobile Backend is down.
 */

import axios from 'axios';
import { MOBILE_API_URL, BUSINESS_API_URL, TOURISM_API_URL } from './api/api';

export interface BackendHealthStatus {
    isUp: boolean;
    responseTime?: number;
    error?: string;
}

export interface AllBackendsHealth {
    mobile: BackendHealthStatus;
    business: BackendHealthStatus;
    tourism: BackendHealthStatus;
    // App is usable if mobile backend is up
    isAppUsable: boolean;
}

/**
 * Check if a specific backend is healthy
 */
const checkBackendHealth = async (
    baseUrl: string,
    serviceName: string
): Promise<BackendHealthStatus> => {
    const startTime = Date.now();

    try {
        const response = await axios.get(`${baseUrl}/auth/health`, {
            timeout: 5000,
        });

        if (response.status >= 200 && response.status < 300) {
            return {
                isUp: true,
                responseTime: Date.now() - startTime,
            };
        }

        return {
            isUp: false,
            responseTime: Date.now() - startTime,
            error: `Unexpected status: ${response.status}`,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`[HealthCheck] ${serviceName} backend unavailable:`, errorMessage);

        return {
            isUp: false,
            responseTime: Date.now() - startTime,
            error: errorMessage,
        };
    }
};

/**
 * Check Mobile Backend health (REQUIRED)
 * If this is down, the app cannot function
 */
export const checkMobileBackendHealth = async (): Promise<BackendHealthStatus> => {
    return checkBackendHealth(MOBILE_API_URL, 'Mobile');
};

/**
 * Check Business Backend health (optional)
 * If down, accommodation/product features won't work
 */
export const checkBusinessBackendHealth = async (): Promise<BackendHealthStatus> => {
    return checkBackendHealth(BUSINESS_API_URL, 'Business');
};

/**
 * Check Tourism Backend health (optional)
 * If down, events/tourist spots features won't work
 */
export const checkTourismBackendHealth = async (): Promise<BackendHealthStatus> => {
    return checkBackendHealth(TOURISM_API_URL, 'Tourism');
};

/**
 * Check all backends health
 * Returns combined status for all backends
 */
export const checkAllBackendsHealth = async (): Promise<AllBackendsHealth> => {
    const [mobile, business, tourism] = await Promise.all([
        checkMobileBackendHealth(),
        checkBusinessBackendHealth(),
        checkTourismBackendHealth(),
    ]);

    return {
        mobile,
        business,
        tourism,
        // App is usable as long as mobile backend is up
        isAppUsable: mobile.isUp,
    };
};

/**
 * Wait for mobile backend to become available
 * Used during app startup
 */
export const waitForMobileBackend = async (
    maxRetries: number = 3,
    retryDelayMs: number = 2000
): Promise<boolean> => {
    for (let i = 0; i < maxRetries; i++) {
        const result = await checkMobileBackendHealth();
        if (result.isUp) {
            return true;
        }

        if (i < maxRetries - 1) {
            console.log(`[HealthCheck] Mobile backend not ready, retrying in ${retryDelayMs}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelayMs));
        }
    }

    return false;
};

export default {
    checkMobileBackendHealth,
    checkBusinessBackendHealth,
    checkTourismBackendHealth,
    checkAllBackendsHealth,
    waitForMobileBackend,
};
