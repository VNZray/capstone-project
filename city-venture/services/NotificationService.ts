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
        [key: string]: any;
    };
    is_read: boolean;
    delivery_method: 'push' | 'email' | 'sms' | 'in_app';
    delivery_status: 'pending' | 'sent' | 'failed' | 'delivered';
    sent_at?: string;
    read_at?: string;
    created_at: string;
}

export interface NotificationResponse {
    notifications: Notification[];
    unreadCount: number;
}

/**
 * Fetch all notifications for a user
 */
export const getNotificationsByUserId = async (
    userId: string
): Promise<Notification[]> => {
    try {
        const response = await apiClient.get(`/notifications/user/${userId}`);
        // Response is an array with the first element being the notifications array
        return response.data[0] || [];
    } catch (error) {
        console.error('Failed to fetch notifications:', error);
        throw error;
    }
};

/**
 * Fetch unread notifications for a user
 */
export const getUnreadNotifications = async (
    userId: string
): Promise<Notification[]> => {
    try {
        const response = await apiClient.get(`/notifications/user/${userId}/unread`);
        return response.data[0] || [];
    } catch (error) {
        console.error('Failed to fetch unread notifications:', error);
        throw error;
    }
};

/**
 * Get count of unread notifications
 */
export const getUnreadNotificationCount = async (
    userId: string
): Promise<number> => {
    try {
        const response = await apiClient.get(
            `/notifications/user/${userId}/unread/count`
        );
        return response.data[0]?.unread_count || 0;
    } catch (error) {
        console.error('Failed to fetch unread notification count:', error);
        return 0;
    }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (
    notificationId: string
): Promise<void> => {
    try {
        await apiClient.put(`/notifications/${notificationId}/read`);
    } catch (error) {
        console.error('Failed to mark notification as read:', error);
        throw error;
    }
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = async (
    userId: string
): Promise<void> => {
    try {
        await apiClient.post(`/notifications/user/${userId}/mark-all-read`);
    } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
        throw error;
    }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (
    notificationId: string
): Promise<void> => {
    try {
        await apiClient.delete(`/notifications/${notificationId}`);
    } catch (error) {
        console.error('Failed to delete notification:', error);
        throw error;
    }
};

/**
 * Check if notification is a booking completed type
 */
export const isBookingCompletedNotification = (
    notification: Notification
): boolean => {
    return notification.notification_type === 'booking_completed';
};

export default {
    getNotificationsByUserId,
    getUnreadNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    isBookingCompletedNotification,
};
