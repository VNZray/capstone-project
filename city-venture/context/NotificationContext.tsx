import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import * as Notifications from 'expo-notifications';
import { useAuth } from './AuthContext';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  NotificationPreferences,
} from '@/services/NotificationPreferencesService';
import {
  getNotificationsByUserId,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  Notification,
} from '@/services/NotificationService';
import { usePushNotification } from '@/hooks/usePushNotification';
import debugLogger from '@/utils/debugLogger';

interface NotificationContextType {
  // Preferences
  preferences: NotificationPreferences | null;
  loadingPreferences: boolean;
  updatePreferences: (
    updates: Partial<NotificationPreferences>
  ) => Promise<void>;

  // Notifications list
  notifications: Notification[];
  unreadCount: number;
  loadingNotifications: boolean;
  refreshNotifications: () => Promise<void>;

  // Actions
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;

  // Push token
  expoPushToken: string | null;

  // Latest notification (for real-time handling)
  latestNotification: Notifications.Notification | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({
  children,
}: NotificationProviderProps) => {
  const { user, isAuthenticated } = useAuth();

  // Preferences state
  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(null);
  const [loadingPreferences, setLoadingPreferences] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [latestNotification, setLatestNotification] =
    useState<Notifications.Notification | null>(null);

  // Refresh interval ref
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  // Initialize push notifications only if push is enabled
  const pushEnabled = preferences?.push_enabled ?? true; // Default to true until preferences load
  const { expoPushToken, notification } = usePushNotification({
    userId: user?.user_id,
    enabled: isAuthenticated && pushEnabled,
  });

  /**
   * Load notification preferences
   */
  const loadPreferences = useCallback(async () => {
    if (!user?.user_id) return;

    try {
      setLoadingPreferences(true);
      const prefs = await getNotificationPreferences(user.user_id);
      setPreferences(prefs);

      debugLogger({
        title: 'NotificationContext: Preferences loaded',
        data: { push_enabled: prefs.push_enabled },
      });
    } catch (error) {
      console.error('[NotificationContext] Failed to load preferences:', error);
      // Set default preferences if loading fails
      setPreferences({
        user_id: user.user_id,
        push_enabled: true,
        push_bookings: true,
        push_orders: true,
        push_payments: true,
        push_promotions: false,
        email_enabled: false,
        email_bookings: false,
        email_orders: false,
        email_payments: false,
        sms_enabled: false,
        sms_bookings: false,
        sms_payments: false,
      });
    } finally {
      setLoadingPreferences(false);
    }
  }, [user?.user_id]);

  /**
   * Update notification preferences
   */
  const updatePreferences = useCallback(
    async (updates: Partial<NotificationPreferences>) => {
      if (!user?.user_id) {
        throw new Error('User not authenticated');
      }

      try {
        const updatedPrefs = await updateNotificationPreferences(
          user.user_id,
          updates
        );
        setPreferences(updatedPrefs);

        debugLogger({
          title: 'NotificationContext: Preferences updated',
          data: updates,
        });
      } catch (error) {
        console.error(
          '[NotificationContext] Failed to update preferences:',
          error
        );
        throw error;
      }
    },
    [user?.user_id]
  );

  /**
   * Load notifications list
   */
  const loadNotifications = useCallback(async () => {
    if (!user?.user_id) return;

    try {
      setLoadingNotifications(true);

      const [notifs, count] = await Promise.all([
        getNotificationsByUserId(user.user_id),
        getUnreadNotificationCount(user.user_id),
      ]);

      setNotifications(notifs);
      setUnreadCount(count);

      debugLogger({
        title: 'NotificationContext: Notifications loaded',
        data: { total: notifs.length, unread: count },
      });
    } catch (error) {
      console.error(
        '[NotificationContext] Failed to load notifications:',
        error
      );
    } finally {
      setLoadingNotifications(false);
    }
  }, [user?.user_id]);

  /**
   * Refresh notifications (public method)
   */
  const refreshNotifications = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!user?.user_id) return;

      try {
        await markNotificationAsRead(notificationId);

        // Update local state optimistically
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        debugLogger({
          title: 'NotificationContext: Marked as read',
          data: { notificationId },
        });
      } catch (error) {
        console.error('[NotificationContext] Failed to mark as read:', error);
        // Reload to sync with server
        await loadNotifications();
      }
    },
    [user?.user_id, loadNotifications]
  );

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    if (!user?.user_id) return;

    try {
      await markAllNotificationsAsRead(user.user_id);

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);

      debugLogger({
        title: 'NotificationContext: Marked all as read',
      });
    } catch (error) {
      console.error('[NotificationContext] Failed to mark all as read:', error);
      // Reload to sync with server
      await loadNotifications();
    }
  }, [user?.user_id, loadNotifications]);

  /**
   * Initialize on user login
   */
  useEffect(() => {
    if (isAuthenticated && user?.user_id) {
      console.log('[NotificationContext] User authenticated, loading data...');
      loadPreferences();
      loadNotifications();

      // Set up periodic refresh for notifications (every 30 seconds)
      refreshIntervalRef.current = setInterval(() => {
        loadNotifications();
      }, 30000);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    } else {
      console.log('[NotificationContext] User logged out, clearing data...');
      setPreferences(null);
      setNotifications([]);
      setUnreadCount(0);
      setLatestNotification(null);

      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    }
  }, [isAuthenticated, user?.user_id, loadPreferences, loadNotifications]);

  /**
   * Handle incoming push notifications
   */
  useEffect(() => {
    if (notification) {
      console.log('[NotificationContext] 📱 New push notification received');
      setLatestNotification(notification);

      // Refresh notifications list to include the new one
      loadNotifications();
    }
  }, [notification, loadNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        // Preferences
        preferences,
        loadingPreferences,
        updatePreferences,

        // Notifications
        notifications,
        unreadCount,
        loadingNotifications,
        refreshNotifications,

        // Actions
        markAsRead,
        markAllAsRead,

        // Push token
        expoPushToken: expoPushToken?.data || null,

        // Latest notification
        latestNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used within NotificationProvider'
    );
  }
  return context;
};
