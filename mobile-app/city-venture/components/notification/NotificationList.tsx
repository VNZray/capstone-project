import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '@/context/NotificationContext';
import { Colors } from '@/constants/color';
import { useColorScheme } from '@/hooks';

/**
 * Example Notification List Component
 * Demonstrates how to use the NotificationContext to display notifications
 *
 * Usage:
 * - Import this component in your notification screen
 * - Notifications auto-refresh every 30 seconds
 * - Pull to refresh manually
 * - Tap notification to mark as read and navigate
 */
export default function NotificationList() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const {
    notifications,
    unreadCount,
    loadingNotifications,
    refreshNotifications,
    markAsRead,
  } = useNotifications();

  const handleNotificationPress = async (
    notificationId: string,
    notification: any
  ) => {
    // Mark as read
    await markAsRead(notificationId);

    // Navigate based on notification type
    const { metadata } = notification;

    // Example navigation - adjust routes based on your app structure
    if (metadata?.order_id) {
      // router.push(`/(tabs)/(orders)/orders/${metadata.order_id}`);
      console.log('Navigate to order:', metadata.order_id);
    } else if (metadata?.booking_id) {
      // router.push(`/(tabs)/(bookings)/bookings/${metadata.booking_id}`);
      console.log('Navigate to booking:', metadata.booking_id);
    }
  };

  const renderNotificationItem = ({ item }: { item: any }) => {
    const iconName = getIconForNotificationType(item.notification_type);
    const iconColor = item.is_read ? '#9CA3AF' : Colors.light.primary;

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          {
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            borderLeftColor: item.is_read ? '#E5E7EB' : Colors.light.primary,
          },
        ]}
        onPress={() => handleNotificationPress(item.id, item)}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={iconName} size={24} color={iconColor} />
        </View>

        <View style={styles.contentContainer}>
          <Text
            style={[
              styles.title,
              {
                color: isDark ? '#FFFFFF' : '#111827',
                fontWeight: item.is_read ? '400' : '600',
              },
            ]}
          >
            {item.title}
          </Text>

          <Text
            style={[styles.message, { color: isDark ? '#9CA3AF' : '#6B7280' }]}
            numberOfLines={2}
          >
            {item.message}
          </Text>

          <Text style={styles.timestamp}>
            {formatTimestamp(item.created_at)}
          </Text>
        </View>

        {!item.is_read && (
          <View
            style={[
              styles.unreadBadge,
              { backgroundColor: Colors.light.primary },
            ]}
          />
        )}
      </TouchableOpacity>
    );
  };

  if (notifications.length === 0 && !loadingNotifications) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="notifications-outline" size={64} color="#9CA3AF" />
        <Text style={styles.emptyText}>No notifications yet</Text>
        <Text style={styles.emptySubtext}>
          You&apos;ll see updates about your bookings and orders here
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {unreadCount > 0 && (
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        refreshControl={
          <RefreshControl
            refreshing={loadingNotifications}
            onRefresh={refreshNotifications}
            tintColor={Colors.light.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// Helper functions
function getIconForNotificationType(type: string): any {
  switch (type) {
    case 'booking_confirmed':
    case 'booking_completed':
      return 'checkmark-circle';
    case 'booking_cancelled':
      return 'close-circle';
    case 'order_confirmed':
      return 'cart';
    case 'order_ready':
      return 'restaurant';
    case 'payment_received':
    case 'payment_confirmed':
      return 'card';
    case 'promotion':
      return 'megaphone';
    default:
      return 'notifications';
  }
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: '#EEF2FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E7FF',
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  listContent: {
    paddingVertical: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    marginBottom: 4,
    fontFamily: 'Poppins-Medium',
  },
  message: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Poppins-Regular',
  },
  unreadBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    alignSelf: 'center',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Poppins-Regular',
  },
});
