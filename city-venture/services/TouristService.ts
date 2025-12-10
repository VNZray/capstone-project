import api from './api';
import { Tourist } from '../types/Tourist';

/**
 * Tourist Service
 * Handles tourist profile-related API operations
 */

/**
 * Update tourist profile by ID
 * @param touristId - The tourist ID to update
 * @param touristData - Partial tourist data to update
 * @returns Updated tourist object
 */
export const updateTourist = async (
    touristId: string,
    touristData: Partial<Tourist>
): Promise<Tourist> => {
    try {
        const response = await fetch(`${api}/tourist/${touristId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(touristData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update tourist profile');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating tourist profile:', error);
        throw error;
    }
};

/**
 * Get tourist profile by ID
 * @param touristId - The tourist ID
 * @returns Tourist object
 */
export const getTouristById = async (touristId: string): Promise<Tourist> => {
    try {
        const response = await fetch(`${api}/tourist/${touristId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch tourist profile');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching tourist profile:', error);
        throw error;
    }
};

/**
 * Get tourist profile by user ID
 * @param userId - The user ID
 * @returns Tourist object
 */
export const getTouristByUserId = async (userId: string): Promise<Tourist> => {
    try {
        const response = await fetch(`${api}/tourist/user/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch tourist profile');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching tourist profile:', error);
        throw error;
    }
};

/**
 * Create new tourist profile
 * @param touristData - Tourist data
 * @returns Created tourist object
 */
export const createTourist = async (
    touristData: Omit<Tourist, 'id'>
): Promise<Tourist> => {
    try {
        const response = await fetch(`${api}/tourist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(touristData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create tourist profile');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating tourist profile:', error);
        throw error;
    }
};

/**
 * Delete tourist profile by ID
 * @param touristId - The tourist ID to delete
 * @returns Success message
 */
export const deleteTourist = async (
    touristId: string
): Promise<{ message: string }> => {
    try {
        const response = await fetch(`${api}/tourist/${touristId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete tourist profile');
        }

        return await response.json();
    } catch (error) {
        console.error('Error deleting tourist profile:', error);
        throw error;
    }
};

/**
 * Update tourist personal information
 * @param touristId - The tourist ID
 * @param personalInfo - Personal information to update
 * @returns Updated tourist object
 */
export const updateTouristPersonalInfo = async (
    touristId: string,
    personalInfo: {
        first_name?: string;
        middle_name?: string;
        last_name?: string;
        birthdate?: string;
        age?: string;
        gender?: string;
    }
): Promise<Tourist> => {
    try {
        const response = await fetch(`${api}/tourist/${touristId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(personalInfo),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(
                error.message || 'Failed to update tourist personal information'
            );
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating tourist personal information:', error);
        throw error;
    }
};

/**
 * Update tourist nationality and origin information
 * @param touristId - The tourist ID
 * @param locationInfo - Nationality and origin information
 * @returns Updated tourist object
 */
export const updateTouristLocationInfo = async (
    touristId: string,
    locationInfo: {
        nationality?: string;
        ethnicity?: string;
        origin?: string;
    }
): Promise<Tourist> => {
    try {
        const response = await fetch(`${api}/tourist/${touristId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(locationInfo),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(
                error.message || 'Failed to update tourist location information'
            );
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating tourist location information:', error);
        throw error;
    }
};
