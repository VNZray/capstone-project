import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { registerPushToken } from '@/services/NotificationPreferencesService';

export interface PushNotificationState {
  expoPushToken?: Notifications.ExpoPushToken;
  notification?: Notifications.Notification;
}

interface UsePushNotificationProps {
  userId?: string;
  enabled?: boolean;
}

// Set notification handler globally
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const usePushNotification = ({
  userId,
  enabled = true,
}: UsePushNotificationProps = {}): PushNotificationState => {
  const [expoPushToken, setExpoPushToken] = useState<
    Notifications.ExpoPushToken | undefined
  >();
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >();

  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  const registeredTokenRef = useRef<string | null>(null);

  async function registerForPushNotificationsAsync() {
    try {
      console.log('[Push] Starting registration...');
      console.log('[Push] Device.isDevice:', Device.isDevice);
      console.log('[Push] Platform:', Platform.OS);

      if (!Device.isDevice) {
        console.warn('[Push] Must use physical device for Push Notifications');
        Alert.alert(
          'Push Notifications',
          'Push notifications are only available on physical devices.'
        );
        return undefined;
      }

      // Check permissions
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      console.log('[Push] Existing permission status:', existingStatus);

      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        console.log('[Push] Requesting permissions...');
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        console.log('[Push] New permission status:', finalStatus);
      }

      if (finalStatus !== 'granted') {
        console.warn('[Push] Permission not granted:', finalStatus);
        Alert.alert(
          'Notifications Disabled',
          'Please enable notifications in your device settings to receive updates.'
        );
        return undefined;
      }

      // Get project ID
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      console.log('[Push] Project ID:', projectId);

      if (!projectId) {
        console.error('[Push] No project ID found in app.json');
        return undefined;
      }

      // Get Expo push token
      console.log('[Push] Getting Expo push token...');
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      console.log('[Push] ✅ Token obtained:', tokenData.data);

      // Set up Android notification channel
      if (Platform.OS === 'android') {
        console.log('[Push] Setting up Android notification channel...');
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#0A1B47',
          sound: 'default',
        });
      }

      return tokenData;
    } catch (error) {
      console.error('[Push] ❌ Registration error:', error);
      Alert.alert(
        'Push Notification Error',
        'Failed to register for push notifications. Please try again.'
      );
      return undefined;
    }
  }

  useEffect(() => {
    if (!enabled) {
      console.log('[Push] Hook disabled');
      return;
    }

    console.log('[Push] Hook enabled, userId:', userId);

    registerForPushNotificationsAsync().then(async (token) => {
      if (!token) {
        console.log('[Push] No token obtained');
        return;
      }

      setExpoPushToken(token);
      console.log('[Push] Token state updated:', token.data);

      // Register token with backend if user is logged in
      if (userId && token.data !== registeredTokenRef.current) {
        try {
          console.log(
            '[Push] Registering token with backend for user:',
            userId
          );
          const deviceId =
            Device.deviceName || Device.modelName || 'Unknown Device';

          await registerPushToken({
            user_id: userId,
            token: token.data,
            device_id: deviceId,
            platform: Platform.OS as 'ios' | 'android',
          });

          registeredTokenRef.current = token.data;
          console.log('[Push] ✅ Token registered with backend');
          console.log('[Push] Device:', deviceId, 'Platform:', Platform.OS);
        } catch (error) {
          console.error(
            '[Push] ❌ Failed to register token with backend:',
            error
          );
        }
      } else if (!userId) {
        console.log('[Push] No userId provided, skipping backend registration');
      }
    });

    // Set up notification listeners
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log('[Push] 📱 Notification received:', notification);
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('[Push] 👆 Notification tapped:', response);
        // Handle notification tap here (navigation, etc.)
      });

    return () => {
      console.log('[Push] Cleaning up listeners');
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [userId, enabled]);

  return {
    expoPushToken: expoPushToken,
    notification: notification,
  };
};
