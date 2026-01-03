import apiClient from './apiClient';

export interface NotificationPreferences {
    id?: string;
    user_id: string;
    push_enabled: boolean;
    push_bookings: boolean;
    push_orders: boolean;
    push_payments: boolean;
    push_promotions: boolean;
    email_enabled: boolean;
    email_bookings: boolean;
    email_orders: boolean;
    email_payments: boolean;
    sms_enabled: boolean;
    sms_bookings: boolean;
    sms_payments: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface PushToken {
    id?: string;
    user_id: string;
    token: string;
    device_id?: string;
    platform?: 'ios' | 'android' | 'web';
    is_active?: boolean;
    last_used_at?: string;
    created_at?: string;
}

/**
 * Get user notification preferences
 */
export const getNotificationPreferences = async (
    userId: string
): Promise<NotificationPreferences> => {
    try {
        const response = await apiClient.get(`/notification-preferences/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch notification preferences:', error);
        throw error;
    }
};

/**
 * Update user notification preferences
 */
export const updateNotificationPreferences = async (
    userId: string,
    preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> => {
    try {
        const response = await apiClient.put(
            `/notification-preferences/${userId}`,
            preferences
        );
        return response.data.data;
    } catch (error) {
        console.error('Failed to update notification preferences:', error);
        throw error;
    }
};

/**
 * Register or update push token
 */
export const registerPushToken = async (
    pushToken: Omit<PushToken, 'id' | 'is_active' | 'last_used_at' | 'created_at'>
): Promise<PushToken> => {
    try {
        const response = await apiClient.post(
            '/notification-preferences/push-tokens',
            pushToken
        );
        return response.data.data;
    } catch (error) {
        console.error('Failed to register push token:', error);
        throw error;
    }
};

/**
 * Get active push tokens for user
 */
export const getActivePushTokens = async (
    userId: string
): Promise<PushToken[]> => {
    try {
        const response = await apiClient.get(
            `/notification-preferences/push-tokens/${userId}`
        );
        return response.data;
    } catch (error) {
        console.error('Failed to fetch push tokens:', error);
        throw error;
    }
};

/**
 * Deactivate push token
 */
export const deactivatePushToken = async (token: string): Promise<void> => {
    try {
        await apiClient.put(
            `/notification-preferences/push-tokens/${token}/deactivate`
        );
    } catch (error) {
        console.error('Failed to deactivate push token:', error);
        throw error;
    }
};

/**
 * Delete push token
 */
export const deletePushToken = async (token: string): Promise<void> => {
    try {
        await apiClient.delete(`/notification-preferences/push-tokens/${token}`);
    } catch (error) {
        console.error('Failed to delete push token:', error);
        throw error;
    }
};
