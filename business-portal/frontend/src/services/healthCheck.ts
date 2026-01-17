import axios from 'axios';

/**
 * Health check service for the Business Portal.
 * Only checks the Business backend (port 4000) - independent of Tourism backend status.
 */

const BUSINESS_API_URL = import.meta.env.VITE_API_URL_BUSINESS || 'http://localhost:4000/api';

export interface HealthCheckResult {
    isUp: boolean;
    responseTime?: number;
    error?: string;
}

/**
 * Check if the Business backend is running.
 * Uses a lightweight endpoint to minimize latency.
 */
export const checkBusinessBackendHealth = async (): Promise<HealthCheckResult> => {
    const startTime = Date.now();

    try {
        // Try multiple endpoints in case one is not available
        const endpoints = [
            `${BUSINESS_API_URL}/auth/health`,
            `${BUSINESS_API_URL}/business`,  // Public endpoint
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await axios.get(endpoint, {
                    timeout: 5000,
                    // Don't send credentials for health check
                    withCredentials: false,
                });

                if (response.status >= 200 && response.status < 300) {
                    return {
                        isUp: true,
                        responseTime: Date.now() - startTime,
                    };
                }
            } catch {
                // Try next endpoint
                continue;
            }
        }

        // All endpoints failed
        return {
            isUp: false,
            responseTime: Date.now() - startTime,
            error: 'All health check endpoints failed',
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
            isUp: false,
            responseTime: Date.now() - startTime,
            error: errorMessage,
        };
    }
};

/**
 * Periodically check backend health with retry logic.
 * Returns true if backend becomes available within retries.
 */
export const waitForBackend = async (
    maxRetries: number = 3,
    retryDelayMs: number = 2000
): Promise<boolean> => {
    for (let i = 0; i < maxRetries; i++) {
        const result = await checkBusinessBackendHealth();
        if (result.isUp) {
            return true;
        }

        if (i < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, retryDelayMs));
        }
    }

    return false;
};

export default {
    checkBusinessBackendHealth,
    waitForBackend,
};
