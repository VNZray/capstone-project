import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { registerPushToken } from './NotificationPreferencesService';

// Configure notification handler globally
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export interface PushNotificationConfig {
    userId?: string;
    onNotificationReceived?: (notification: Notifications.Notification) => void;
    onNotificationTapped?: (response: Notifications.NotificationResponse) => void;
}

class PushNotificationManager {
    private expoPushToken: string | null = null;
    private notificationListener: Notifications.Subscription | null = null;
    private responseListener: Notifications.Subscription | null = null;
    private registeredUserId: string | null = null;

    /**
     * Request notification permissions from user
     */
    async requestPermissions(): Promise<boolean> {
        try {
            if (!Device.isDevice) {
                console.warn('[PushManager] Push notifications require a physical device');
                return false;
            }

            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.warn('[PushManager] Notification permissions not granted');
                return false;
            }

            console.log('[PushManager] ✅ Permissions granted');
            return true;
        } catch (error) {
            console.error('[PushManager] Error requesting permissions:', error);
            return false;
        }
    }

    /**
     * Get Expo Push Token
     */
    async getExpoPushToken(): Promise<string | null> {
        try {
            if (!Device.isDevice) {
                console.warn('[PushManager] Cannot get push token on simulator');
                return null;
            }

            const projectId = Constants.expoConfig?.extra?.eas?.projectId;
            if (!projectId) {
                console.error('[PushManager] No project ID found in app.json');
                return null;
            }

            const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
            this.expoPushToken = tokenData.data;

            console.log('[PushManager] ✅ Push token obtained:', this.expoPushToken);

            // Set up Android notification channel
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'Default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#0A1B47',
                    sound: 'default',
                    enableLights: true,
                    enableVibrate: true,
                });
            }

            return this.expoPushToken;
        } catch (error) {
            console.error('[PushManager] Error getting push token:', error);
            return null;
        }
    }

    /**
     * Register push token with backend
     */
    async registerWithBackend(userId: string): Promise<boolean> {
        try {
            if (!this.expoPushToken) {
                console.warn('[PushManager] No push token to register');
                return false;
            }

            if (this.registeredUserId === userId) {
                console.log('[PushManager] Token already registered for this user');
                return true;
            }

            const deviceId = Device.deviceName || Device.modelName || 'Unknown Device';

            await registerPushToken({
                user_id: userId,
                token: this.expoPushToken,
                device_id: deviceId,
                platform: Platform.OS as 'ios' | 'android',
            });

            this.registeredUserId = userId;
            console.log('[PushManager] ✅ Token registered with backend for user:', userId);
            console.log('[PushManager] Device:', deviceId, 'Platform:', Platform.OS);

            return true;
        } catch (error) {
            console.error('[PushManager] Error registering token with backend:', error);
            return false;
        }
    }

    /**
     * Initialize push notification service
     */
    async initialize(config: PushNotificationConfig): Promise<void> {
        try {
            console.log('[PushManager] Initializing push notifications...');

            // Request permissions
            const hasPermission = await this.requestPermissions();
            if (!hasPermission) {
                console.warn('[PushManager] No permission, skipping initialization');
                return;
            }

            // Get push token
            const token = await this.getExpoPushToken();
            if (!token) {
                console.warn('[PushManager] No push token obtained');
                return;
            }

            // Register with backend if userId provided
            if (config.userId) {
                await this.registerWithBackend(config.userId);
            }

            // Set up listeners
            this.setupListeners(config);

            console.log('[PushManager] ✅ Push notifications initialized successfully');
        } catch (error) {
            console.error('[PushManager] Initialization error:', error);
        }
    }

    /**
     * Setup notification listeners
     */
    private setupListeners(config: PushNotificationConfig): void {
        // Remove existing listeners
        this.removeListeners();

        // Notification received listener (app in foreground)
        this.notificationListener = Notifications.addNotificationReceivedListener(
            (notification) => {
                console.log('[PushManager] 📱 Notification received:', {
                    title: notification.request.content.title,
                    body: notification.request.content.body,
                    data: notification.request.content.data,
                });

                if (config.onNotificationReceived) {
                    config.onNotificationReceived(notification);
                }
            }
        );

        // Notification tapped listener (user interaction)
        this.responseListener = Notifications.addNotificationResponseReceivedListener(
            (response) => {
                console.log('[PushManager] 👆 Notification tapped:', {
                    title: response.notification.request.content.title,
                    data: response.notification.request.content.data,
                });

                if (config.onNotificationTapped) {
                    config.onNotificationTapped(response);
                }
            }
        );
    }

    /**
     * Remove notification listeners
     */
    private removeListeners(): void {
        if (this.notificationListener) {
            this.notificationListener.remove();
            this.notificationListener = null;
        }

        if (this.responseListener) {
            this.responseListener.remove();
            this.responseListener = null;
        }
    }

    /**
     * Update configuration (when userId changes)
     */
    async updateConfig(config: PushNotificationConfig): Promise<void> {
        if (config.userId && config.userId !== this.registeredUserId) {
            await this.registerWithBackend(config.userId);
        }

        // Update listeners if callbacks changed
        if (config.onNotificationReceived || config.onNotificationTapped) {
            this.setupListeners(config);
        }
    }

    /**
     * Cleanup on logout
     */
    cleanup(): void {
        console.log('[PushManager] Cleaning up...');
        this.removeListeners();
        this.registeredUserId = null;
        // Note: Keep the push token, it can be reused
    }

    /**
     * Get current push token
     */
    getCurrentToken(): string | null {
        return this.expoPushToken;
    }

    /**
     * Check if notifications are enabled
     */
    async areNotificationsEnabled(): Promise<boolean> {
        const { status } = await Notifications.getPermissionsAsync();
        return status === 'granted';
    }

    /**
     * Schedule a local notification (for testing)
     */
    async scheduleTestNotification(): Promise<void> {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Test Notification',
                body: 'This is a test notification from City-Venture',
                data: { test: true },
            },
            trigger: { seconds: 1 },
        });
    }
}

// Export singleton instance
const PushNotificationService = new PushNotificationManager();

export default PushNotificationService;

// Export helper functions
export const requestNotificationPermissions = () =>
    PushNotificationService.requestPermissions();

export const getExpoPushToken = () =>
    PushNotificationService.getExpoPushToken();

export const areNotificationsEnabled = () =>
    PushNotificationService.areNotificationsEnabled();
