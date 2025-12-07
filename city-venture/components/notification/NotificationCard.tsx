import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import Button from '@/components/Button';
import { Colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Notification } from '@/services/NotificationService';

interface NotificationCardProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
  onRateUs?: (notification: Notification) => void;
  hasReviewed?: boolean;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress,
  onRateUs,
  hasReviewed = false,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const textColor = isDark ? '#ECEDEE' : '#1a1a2e';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';
  const timeColor = isDark ? '#9BA1A6' : '#9CA3AF';

  // Background colors based on read status
  const cardBg = notification.is_read
    ? isDark
      ? '#1a1f2e'
      : '#FFFFFF'
    : isDark
    ? '#2a2f4e'
    : '#EEF2FF'; // Light purple/blue for unread

  // Show Rate Us button for accommodation booking completed notifications (only if not already reviewed)
  const showRateButton =
    notification.notification_type === 'booking_completed' &&
    notification.related_type === 'service_booking' &&
    !hasReviewed;

  const getNotificationIcon = (): {
    name: string;
    bgColor: string;
    iconColor: string;
  } => {
    switch (notification.notification_type) {
      case 'booking_completed':
        return {
          name: 'card',
          bgColor: isDark ? '#3730a320' : '#EDE9FE',
          iconColor: '#8B5CF6',
        };
      case 'booking_confirmed':
        return {
          name: 'calendar',
          bgColor: isDark ? '#059669200' : '#D1FAE5',
          iconColor: '#10B981',
        };
      case 'booking_cancelled':
        return {
          name: 'close-circle',
          bgColor: isDark ? '#DC262620' : '#FEE2E2',
          iconColor: '#EF4444',
        };
      case 'payment_received':
        return {
          name: 'checkmark-circle',
          bgColor: isDark ? '#05966920' : '#D1FAE5',
          iconColor: '#10B981',
        };
      case 'order_created':
        return {
          name: 'receipt',
          bgColor: isDark ? '#3B82F620' : '#DBEAFE',
          iconColor: '#3B82F6',
        };
      case 'order_ready':
        return {
          name: 'fast-food',
          bgColor: isDark ? '#F5970020' : '#FEF3C7',
          iconColor: '#F59700',
        };
      default:
        return {
          name: 'notifications',
          bgColor: isDark ? '#6B728020' : '#F3F4F6',
          iconColor: '#6B7280',
        };
    }
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${formattedHours}.${formattedMinutes} ${ampm}`;
  };

  const icon = getNotificationIcon();

  // Parse metadata for order notifications
  const metadata = notification.metadata;
  const orderTotal = metadata?.amount || metadata?.total;
  const isOrderNotification =
    notification.notification_type === 'order_created';

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardBg }]}
      onPress={() => onPress(notification)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: icon.bgColor }]}>
          <Ionicons name={icon.name as any} size={20} color={icon.iconColor} />
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <ThemedText
            type="body-medium"
            weight="semi-bold"
            style={{ color: textColor }}
            numberOfLines={1}
          >
            {notification.title}
          </ThemedText>

          <ThemedText
            type="body-small"
            style={{ color: subTextColor, marginTop: 2 }}
            numberOfLines={2}
          >
            {notification.message}
          </ThemedText>

          {/* Order Total for order notifications */}
          {isOrderNotification && orderTotal && (
            <ThemedText
              type="body-small"
              weight="semi-bold"
              style={{ color: '#F97316', marginTop: 2 }}
            >
              PHP {orderTotal}
            </ThemedText>
          )}

          <ThemedText
            type="label-small"
            style={{ color: timeColor, marginTop: 4 }}
          >
            {formatTime(notification.created_at)}
          </ThemedText>
        </View>

        {/* Rate Us Button */}
        {showRateButton && onRateUs && (
          <View style={styles.buttonContainer}>
            <Button
              label="Rate Us"
              size="small"
              variant="soft"
              color="secondary"
              onPress={() => onRateUs(notification)}
              style={styles.rateButton}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default NotificationCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  buttonContainer: {
    justifyContent: 'center',
  },
  rateButton: {
    paddingHorizontal: 16,
  },
});
