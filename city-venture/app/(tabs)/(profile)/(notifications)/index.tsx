import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import PageContainer from '@/components/PageContainer';
import { ThemedText } from '@/components/themed-text';
import Button from '@/components/Button';
import Chip from '@/components/Chip';
import { Colors, card, background } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';
import NotificationService, {
  type Notification,
} from '@/services/NotificationService';
import AddReview from '@/components/reviews/AddReview';
import { createReview } from '@/services/FeedbackService';
import { Routes } from '@/routes/mainRoutes';

const NotificationScreen = () => {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';
  const cardBg = isDark ? card.dark : card.light;
  const borderColor = isDark ? '#262B3A' : '#E3E7EF';

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      const data = await NotificationService.getNotificationsByUserId(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      try {
        await NotificationService.markNotificationAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    // Handle booking completed notifications - open review modal
    if (notification.notification_type === 'booking_completed') {
      setSelectedNotification(notification);
      setReviewModalVisible(true);
    }
  };

  const handleRateUs = (notification: Notification) => {
    setSelectedNotification(notification);
    setReviewModalVisible(true);
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;

    try {
      await NotificationService.markAllNotificationsAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      Alert.alert('Error', 'Failed to mark all notifications as read.');
    }
  };

  const getNotificationIcon = (
    type: string
  ): { name: string; color: string } => {
    switch (type) {
      case 'booking_completed':
        return { name: 'checkmark-circle', color: Colors.light.success };
      case 'booking_confirmed':
        return { name: 'calendar-check', color: Colors.light.primary };
      case 'booking_cancelled':
        return { name: 'close-circle', color: Colors.light.error };
      case 'payment_received':
        return { name: 'card', color: Colors.light.success };
      case 'order_created':
        return { name: 'receipt', color: Colors.light.primary };
      case 'order_ready':
        return { name: 'fast-food', color: Colors.light.warning };
      default:
        return { name: 'notifications', color: Colors.light.secondary };
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const icon = getNotificationIcon(item.notification_type);
    const isBookingCompleted = item.notification_type === 'booking_completed';

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          {
            backgroundColor: cardBg,
            borderColor: item.is_read ? borderColor : Colors.light.primary,
            borderWidth: item.is_read ? 1 : 2,
          },
        ]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          <View
            style={[styles.iconWrapper, { backgroundColor: `${icon.color}20` }]}
          >
            <Ionicons name={icon.name as any} size={24} color={icon.color} />
          </View>

          <View style={styles.textContent}>
            <View style={styles.titleRow}>
              <ThemedText
                type="body-medium"
                weight="semi-bold"
                style={{ color: textColor, flex: 1 }}
                numberOfLines={1}
              >
                {item.title}
              </ThemedText>
              {!item.is_read && <View style={styles.unreadDot} />}
            </View>

            <ThemedText
              type="body-small"
              style={{ color: subTextColor, marginTop: 4 }}
              numberOfLines={2}
            >
              {item.message}
            </ThemedText>

            <View style={styles.metaRow}>
              <ThemedText
                type="label-extra-small"
                style={{ color: subTextColor }}
              >
                {formatTimeAgo(item.created_at)}
              </ThemedText>

              {item.metadata?.business_name && (
                <Chip
                  label={item.metadata.business_name}
                  size="small"
                  variant="soft"
                  color="secondary"
                  style={{ marginLeft: 8 }}
                />
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View
        style={[
          styles.emptyIconWrapper,
          { backgroundColor: isDark ? '#1a1f2e' : '#f3f4f6' },
        ]}
      >
        <Ionicons
          name="notifications-off-outline"
          size={48}
          color={subTextColor}
        />
      </View>
      <ThemedText
        type="card-title-medium"
        weight="semi-bold"
        style={{ marginTop: 20, color: textColor }}
      >
        No Notifications
      </ThemedText>
      <ThemedText
        type="body-medium"
        style={{
          marginTop: 8,
          color: subTextColor,
          textAlign: 'center',
          maxWidth: 280,
        }}
      >
        You're all caught up! New notifications will appear here.
      </ThemedText>
    </View>
  );

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) {
    return (
      <PageContainer>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <ThemedText
            type="body-medium"
            style={{ marginTop: 16, color: subTextColor }}
          >
            Loading notifications...
          </ThemedText>
        </View>
      </PageContainer>
    );
  }

  return (
    <PageContainer padding={0} gap={0}>
      {/* Header with mark all as read */}
      {notifications.length > 0 && unreadCount > 0 && (
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <ThemedText type="body-small" style={{ color: subTextColor }}>
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </ThemedText>
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <ThemedText
              type="body-small"
              weight="semi-bold"
              style={{ color: Colors.light.primary }}
            >
              Mark all as read
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        contentContainerStyle={[
          styles.listContent,
          notifications.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.light.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Review Modal */}
      {user && selectedNotification && (
        <AddReview
          visible={reviewModalVisible}
          onClose={() => {
            setReviewModalVisible(false);
            setSelectedNotification(null);
          }}
          onSubmit={async (payload) => {
            try {
              await createReview(payload);
              setReviewModalVisible(false);
              setSelectedNotification(null);
              Alert.alert(
                'Thank You!',
                'Your review has been submitted successfully. We appreciate your feedback!'
              );
            } catch (error) {
              console.error('Error submitting review:', error);
              throw error;
            }
          }}
          touristId={user.id || ''}
          reviewType="room"
          reviewTypeId={selectedNotification.metadata?.room_id || ''}
        />
      )}
    </PageContainer>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  listContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  emptyListContent: {
    flex: 1,
  },
  notificationCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  notificationContent: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
