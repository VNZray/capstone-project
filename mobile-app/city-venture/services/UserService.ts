import apiClient from './api/apiClient';
import { User } from '../types/User';

/**
 * User Service
 * Handles user-related API operations
 * Uses apiClient for automatic Authorization header injection
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
        const response = await apiClient.put<User>(`/users/${userId}`, userData);
        return response.data;
    } catch (error: any) {
        console.error('Error updating user:', error);
        throw new Error(error.response?.data?.message || error.message || 'Failed to update user');
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
        const response = await apiClient.put<User>(`/users/${userId}`, {
            email,
            otp,
            is_verified: true, // Reset verification status when email changes
        });
        return response.data;
    } catch (error: any) {
        console.error('Error updating user email:', error);
        throw new Error(error.response?.data?.message || error.message || 'Failed to update user email');
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
        const response = await apiClient.put<User>(`/users/${userId}`, {
            password,
            otp,
        });
        return response.data;
    } catch (error: any) {
        console.error('Error updating user password:', error);
        throw new Error(error.response?.data?.message || error.message || 'Failed to update user password');
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
        const response = await apiClient.put<User>(`/users/${userId}`, {
            otp,
        });
        return response.data;
    } catch (error: any) {
        console.error('Error storing OTP:', error);
        throw new Error(error.response?.data?.message || error.message || 'Failed to store OTP');
    }
};

/**
 * Clear OTP after successful verification
 * @param userId - The user ID
 * @returns Updated user object
 */
export const clearUserOtp = async (userId: string): Promise<User> => {
    try {
        const response = await apiClient.put<User>(`/users/${userId}`, {
            otp: null,
        });
        return response.data;
    } catch (error: any) {
        console.error('Error clearing OTP:', error);
        throw new Error(error.response?.data?.message || error.message || 'Failed to clear OTP');
    }
};

/**
 * Verify user account
 * @param userId - The user ID
 * @returns Updated user object
 */
export const verifyUser = async (userId: string): Promise<User> => {
    try {
        const response = await apiClient.put<User>(`/users/${userId}`, {
            is_verified: true,
            otp: null, // Clear OTP after verification
        });
        return response.data;
    } catch (error: any) {
        console.error('Error verifying user:', error);
        throw new Error(error.response?.data?.message || error.message || 'Failed to verify user');
    }
};

/**
 * Get user by ID
 * @param userId - The user ID
 * @returns User object
 */
export const getUserById = async (userId: string): Promise<User> => {
    try {
        const response = await apiClient.get<User>(`/users/${userId}`);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching user:', error);
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch user');
    }
};
