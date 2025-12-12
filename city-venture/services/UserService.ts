import api from './api';
import { User } from '../types/User';

/**
 * User Service
 * Handles user-related API operations
 */

/**
 * Update user by ID
 * @param userId - The user ID to update
 * @param userData - Partial user data to update (can include email, phone_number, password, otp, etc.)
 * @returns Updated user object
 */
export const updateUser = async (
    userId: string,
    userData: Partial<User>
): Promise<User> => {
    try {
        const response = await fetch(`${api}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update user');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

/**
 * Update user email with OTP storage
 * @param userId - The user ID
 * @param email - New email address
 * @param otp - Generated OTP for verification
 * @returns Updated user object
 */
export const updateUserEmail = async (
    userId: string,
    email: string,
    otp: number
): Promise<User> => {
    try {
        const response = await fetch(`${api}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                otp,
                is_verified: true, // Reset verification status when email changes
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update user email');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating user email:', error);
        throw error;
    }
};

/**
 * Update user password with OTP storage
 * @param userId - The user ID
 * @param password - New password (will be hashed on backend)
 * @param otp - Generated OTP for verification
 * @returns Updated user object
 */
export const updateUserPassword = async (
    userId: string,
    password: string,
    otp: number
): Promise<User> => {
    try {
        const response = await fetch(`${api}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                password,
                otp,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update user password');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating user password:', error);
        throw error;
    }
};

/**
 * Store OTP for user verification
 * @param userId - The user ID
 * @param otp - Generated OTP code
 * @returns Updated user object
 */
export const storeUserOtp = async (
    userId: string,
    otp: number
): Promise<User> => {
    try {
        const response = await fetch(`${api}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                otp,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to store OTP');
        }

        return await response.json();
    } catch (error) {
        console.error('Error storing OTP:', error);
        throw error;
    }
};

/**
 * Clear OTP after successful verification
 * @param userId - The user ID
 * @returns Updated user object
 */
export const clearUserOtp = async (userId: string): Promise<User> => {
    try {
        const response = await fetch(`${api}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                otp: null,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to clear OTP');
        }

        return await response.json();
    } catch (error) {
        console.error('Error clearing OTP:', error);
        throw error;
    }
};

/**
 * Verify user account
 * @param userId - The user ID
 * @returns Updated user object
 */
export const verifyUser = async (userId: string): Promise<User> => {
    try {
        const response = await fetch(`${api}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                is_verified: true,
                otp: null, // Clear OTP after verification
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to verify user');
        }

        return await response.json();
    } catch (error) {
        console.error('Error verifying user:', error);
        throw error;
    }
};

/**
 * Get user by ID
 * @param userId - The user ID
 * @returns User object
 */
export const getUserById = async (userId: string): Promise<User> => {
    try {
        const response = await fetch(`${api}/users/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch user');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
};
