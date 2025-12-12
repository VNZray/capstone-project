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

/**
 * Fetch all notifications for a user
 */
export const getNotificationsByUserId = async (
    userId: string
): Promise<Notification[]> => {
    const response = await apiClient.get(`/notifications/user/${userId}`);
    return response.data[0] || [];
};

/**
 * Fetch unread notifications for a user
 */
export const getUnreadNotifications = async (
    userId: string
): Promise<Notification[]> => {
    const response = await apiClient.get(`/notifications/user/${userId}/unread`);
    return response.data[0] || [];
};

/**
 * Get count of unread notifications
 */
export const getUnreadNotificationCount = async (
    userId: string
): Promise<number> => {
    const response = await apiClient.get(
        `/notifications/user/${userId}/unread/count`
    );
    return response.data[0]?.unread_count || 0;
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (
    notificationId: string
): Promise<void> => {
    await apiClient.put(`/notifications/${notificationId}/read`);
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = async (
    userId: string
): Promise<void> => {
    await apiClient.post(`/notifications/user/${userId}/mark-all-read`);
};

/**
 * Delete a notification
 */
export const deleteNotification = async (
    notificationId: string
): Promise<void> => {
    await apiClient.delete(`/notifications/${notificationId}`);
};

export default {
    getNotificationsByUserId,
    getUnreadNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
};
