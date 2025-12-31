import apiClient from './apiClient';

export interface Notification {
    id: string;
    user_id: string;
    notification_type: string;
    related_id: string;
    related_type: 'order' | 'service_booking';
    title: string;
    message: string;
    metadata?: {
        order_id?: string;
        booking_id?: string;
        business_id?: string;
        business_name?: string;
        room_id?: string;
        room_number?: string;
        guest_name?: string;
        check_in_date?: string;
        check_out_date?: string;
        total_price?: number;
        [key: string]: unknown;
    };
    is_read: boolean;
    delivery_method: 'push' | 'email' | 'sms' | 'in_app';
    delivery_status: 'pending' | 'sent' | 'failed' | 'delivered';
    sent_at?: string;
    read_at?: string;
    created_at: string;
}

export interface NotificationPreferences {
    push_enabled: boolean;
    email_enabled: boolean;
    sms_enabled: boolean;
    in_app_enabled: boolean;
}

/**
 * Fetch all notifications for the current user
 * Uses the new v1 API which authenticates based on JWT
 */
export const getNotifications = async (): Promise<Notification[]> => {
    const response = await apiClient.get<Notification[]>(`/notifications`);
    return Array.isArray(response.data) ? response.data : [];
};

/**
 * Get count of unread notifications for the current user
 */
export const getUnreadNotificationCount = async (): Promise<number> => {
    const response = await apiClient.get<{ count: number }>(`/notifications/unread-count`);
    return response.data?.count ?? 0;
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (
    notificationId: string
): Promise<void> => {
    await apiClient.patch(`/notifications/${notificationId}/read`);
};

/**
 * Mark all notifications as read for the current user
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
    await apiClient.patch(`/notifications/read-all`);
};

/**
 * Delete a notification
 */
export const deleteNotification = async (
    notificationId: string
): Promise<void> => {
    await apiClient.delete(`/notifications/${notificationId}`);
};

/**
 * Get notification preferences for the current user
 */
export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
    const response = await apiClient.get<NotificationPreferences>(`/notifications/preferences`);
    return response.data;
};

/**
 * Update notification preferences for the current user
 */
export const updateNotificationPreferences = async (
    preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> => {
    const response = await apiClient.put<NotificationPreferences>(`/notifications/preferences`, preferences);
    return response.data;
};

// Legacy functions for backward compatibility
// @deprecated Use getNotifications() instead
export const getNotificationsByUserId = getNotifications;

// @deprecated Use getUnreadNotificationCount() instead
export const getUnreadNotifications = async (): Promise<Notification[]> => {
    const notifications = await getNotifications();
    return notifications.filter(n => !n.is_read);
};

export default {
    getNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getNotificationPreferences,
    updateNotificationPreferences,
    // Legacy exports
    getNotificationsByUserId,
    getUnreadNotifications,
};
