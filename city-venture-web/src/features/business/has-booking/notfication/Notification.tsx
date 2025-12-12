import { useCallback, useEffect, useState, useMemo } from "react";
import PageContainer from "@/src/components/PageContainer";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import { useAuth } from "@/src/context/AuthContext";
import NotificationService, {
  type Notification as NotificationType,
} from "@/src/services/NotificationService";
import {
  Box,
  Card,
  Chip,
  CircularProgress,
  IconButton,
  Divider,
} from "@mui/joy";
import {
  NotificationsNone,
  CheckCircle,
  HotelOutlined,
  PersonOutline,
  CalendarMonth,
  MarkEmailRead,
  Refresh,
} from "@mui/icons-material";
import { colors } from "@/src/utils/Colors";

interface NotificationSection {
  title: string;
  data: NotificationType[];
}

const Notification = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Group notifications by date
  const groupedNotifications = useMemo((): NotificationSection[] => {
    if (notifications.length === 0) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: { [key: string]: NotificationType[] } = {
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
      sections.push({ title: "Today", data: groups.TODAY });
    }
    if (groups.YESTERDAY.length > 0) {
      sections.push({ title: "Yesterday", data: groups.YESTERDAY });
    }
    if (groups.OLDER.length > 0) {
      sections.push({ title: "Older", data: groups.OLDER });
    }

    return sections;
  }, [notifications]);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      const data = await NotificationService.getNotificationsByUserId(user.id);
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (notification: NotificationType) => {
    if (notification.is_read) return;

    try {
      await NotificationService.markNotificationAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, is_read: true } : n
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;

    try {
      await NotificationService.markAllNotificationsAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "booking_created":
        return <HotelOutlined sx={{ color: colors.primary }} />;
      case "booking_confirmed":
        return <CheckCircle sx={{ color: colors.success }} />;
      case "booking_completed":
        return <CheckCircle sx={{ color: colors.success }} />;
      case "booking_cancelled":
        return <HotelOutlined sx={{ color: colors.error }} />;
      default:
        return <NotificationsNone sx={{ color: colors.secondary }} />;
    }
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) {
    return (
      <PageContainer>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography.Header>Notifications</Typography.Header>
            {unreadCount > 0 && (
              <Typography.Body color="secondary">
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </Typography.Body>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              variant="outlined"
              color="neutral"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <Refresh
                sx={{
                  animation: refreshing ? "spin 1s linear infinite" : "none",
                }}
              />
            </IconButton>
            {unreadCount > 0 && (
              <Button
                variant="outlined"
                size="sm"
                startDecorator={<MarkEmailRead />}
                onClick={handleMarkAllAsRead}
              >
                Mark All as Read
              </Button>
            )}
          </Box>
        </Box>

        {/* Empty State */}
        {notifications.length === 0 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 8,
              textAlign: "center",
            }}
          >
            <NotificationsNone
              sx={{ fontSize: 64, color: colors.gray, mb: 2 }}
            />
            <Typography.CardTitle>No Notifications</Typography.CardTitle>
            <Typography.Body color="secondary">
              You're all caught up! New notifications will appear here.
            </Typography.Body>
          </Box>
        )}

        {/* Notification List */}
        {groupedNotifications.map((section) => (
          <Box key={section.title} sx={{ mb: 3 }}>
            <Typography.Label
              size="sm"
              color="secondary"
              sx={{
                marginBottom: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {section.title}
            </Typography.Label>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {section.data.map((notification) => (
                <Card
                  key={notification.id}
                  variant="outlined"
                  sx={{
                    p: 2,
                    cursor: "pointer",
                    backgroundColor: notification.is_read
                      ? "white"
                      : colors.primary,
                    borderColor: notification.is_read
                      ? colors.primary
                      : colors.primary,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      boxShadow: "sm",
                      borderColor: colors.primary,
                    },
                  }}
                  onClick={() => handleMarkAsRead(notification)}
                >
                  <Box sx={{ display: "flex", gap: 2 }}>
                    {/* Icon */}
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        backgroundColor: notification.is_read
                          ? colors.primary
                          : `${colors.primary}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {getNotificationIcon(notification.notification_type)}
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 0.5,
                        }}
                      >
                        <Typography.CardTitle size="sm">
                          {notification.title}
                        </Typography.CardTitle>
                        {!notification.is_read && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              backgroundColor: colors.primary,
                              flexShrink: 0,
                              mt: 0.5,
                            }}
                          />
                        )}
                      </Box>

                      <Typography.Body size="sm" color="secondary">
                        {notification.message}
                      </Typography.Body>

                      {/* Metadata */}
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 1,
                          mt: 1.5,
                          alignItems: "center",
                        }}
                      >
                        <Typography.Label size="xs" color="secondary">
                          {formatTime(notification.created_at)}
                        </Typography.Label>

                        {notification.metadata?.guest_name && (
                          <Chip
                            size="sm"
                            variant="soft"
                            color="neutral"
                            startDecorator={
                              <PersonOutline sx={{ fontSize: 14 }} />
                            }
                          >
                            {notification.metadata.guest_name}
                          </Chip>
                        )}

                        {notification.metadata?.room_number && (
                          <Chip
                            size="sm"
                            variant="soft"
                            color="primary"
                            startDecorator={
                              <HotelOutlined sx={{ fontSize: 14 }} />
                            }
                          >
                            Room {notification.metadata.room_number}
                          </Chip>
                        )}

                        {notification.metadata?.check_in_date && (
                          <Chip
                            size="sm"
                            variant="soft"
                            color="success"
                            startDecorator={
                              <CalendarMonth sx={{ fontSize: 14 }} />
                            }
                          >
                            {notification.metadata.check_in_date}
                          </Chip>
                        )}

                        {notification.metadata?.total_price && (
                          <Chip size="sm" variant="soft" color="warning">
                            ₱
                            {notification.metadata.total_price.toLocaleString()}
                          </Chip>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Box>
          </Box>
        ))}
      </Container>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </PageContainer>
  );
};

export default Notification;
