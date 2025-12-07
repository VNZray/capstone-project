import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  SectionList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PageContainer from '@/components/PageContainer';
import { ThemedText } from '@/components/themed-text';
import NotificationCard from '@/components/notification/NotificationCard';
import { Colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';
import NotificationService, {
  type Notification,
} from '@/services/NotificationService';
import AddReview from '@/components/reviews/AddReview';
import { createReview } from '@/services/FeedbackService';

interface NotificationSection {
  title: string;
  data: Notification[];
}

const NotificationScreen = () => {
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
  const sectionHeaderColor = isDark ? '#6B7280' : '#9CA3AF';
  const bgColor = isDark ? '#0D1B2A' : '#F8FAFC';

  // Group notifications by date
  const groupedNotifications = useMemo((): NotificationSection[] => {
    if (notifications.length === 0) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: { [key: string]: Notification[] } = {
      TODAY: [],
      YESTERDAY: [],
      OLDER: [],
    };

    notifications.forEach((notification) => {
      const notifDate = new Date(notification.created_at);
      notifDate.setHours(0, 0, 0, 0);

      if (notifDate.getTime() === today.getTime()) {
        groups.TODAY.push(notification);
      } else if (notifDate.getTime() === yesterday.getTime()) {
        groups.YESTERDAY.push(notification);
      } else {
        groups.OLDER.push(notification);
      }
    });

    const sections: NotificationSection[] = [];

    if (groups.TODAY.length > 0) {
      sections.push({ title: 'TODAY', data: groups.TODAY });
    }
    if (groups.YESTERDAY.length > 0) {
      sections.push({ title: 'YESTERDAY', data: groups.YESTERDAY });
    }
    if (groups.OLDER.length > 0) {
      sections.push({ title: 'OLDER', data: groups.OLDER });
    }

    return sections;
  }, [notifications]);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      const data = await NotificationService.getNotificationsByUserId(
        user.user_id!
      );
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, user?.user_id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationPress = async (notification: Notification) => {
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

    // Open review modal for accommodation booking completed notifications
    if (
      notification.notification_type === 'booking_completed' &&
      notification.related_type === 'service_booking'
    ) {
      setSelectedNotification(notification);
      setReviewModalVisible(true);
    }
  };

  const handleRateUs = (notification: Notification) => {
    setSelectedNotification(notification);
    setReviewModalVisible(true);
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.user_id) return;

    try {
      await NotificationService.markAllNotificationsAsRead(user.user_id);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      Alert.alert('Error', 'Failed to mark all notifications as read.');
    }
  };

  const renderSectionHeader = ({
    section,
  }: {
    section: NotificationSection;
  }) => (
    <View style={styles.sectionHeader}>
      <ThemedText
        type="label-small"
        weight="semi-bold"
        style={{ color: sectionHeaderColor, letterSpacing: 1 }}
      >
        {section.title}
      </ThemedText>
    </View>
  );

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <NotificationCard
      notification={item}
      onPress={handleNotificationPress}
      onRateUs={handleRateUs}
    />
  );

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
      <PageContainer style={{ backgroundColor: bgColor }}>
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
    <PageContainer padding={0} gap={0} style={{ backgroundColor: bgColor }}>
      {/* Header with Mark All as Read */}
      {notifications.length > 0 && unreadCount > 0 && (
        <View style={styles.header}>
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

      {/* Notifications List */}
      {groupedNotifications.length > 0 ? (
        <SectionList
          sections={groupedNotifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotificationItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.light.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}

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
  },
  sectionHeader: {
    paddingHorizontal: 4,
    paddingTop: 16,
    paddingBottom: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    marginBottom: 8,
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
