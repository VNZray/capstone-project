import { useState } from "react";
import { Box, Stack, Divider, Select, Option } from "@mui/joy";
import { X, User, Shield, Calendar } from "lucide-react";
import Typography from "@/src/components/Typography";
import IconButton from "@/src/components/IconButton";
import placeholderImage from "@/src/assets/images/placeholder-image.png";

export interface Notification {
  id: string;
  user_name: string;
  user_avatar?: string;
  user_role: "Tourist" | "Tourism Admin";
  message: string;
  timestamp: string;
  date: Date;
  is_read: boolean;
}

type FilterPeriod = "week" | "month" | "year";

interface NotificationPopupProps {
  notifications: Notification[];
  open: boolean;
  onClose: () => void;
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead?: (notificationId: string) => void;
}

export default function NotificationPopup({
  notifications,
  open,
  onClose,
  onNotificationClick,
  onMarkAsRead,
}: NotificationPopupProps) {
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("week");

  if (!open) return null;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  const getRoleColor = (role: "Tourist" | "Tourism Admin") => {
    return role === "Tourism Admin" ? "primary" : "success";
  };

  const getRoleIcon = (role: "Tourist" | "Tourism Admin") => {
    return role === "Tourism Admin" ? <Shield size={12} /> : <User size={12} />;
  };

  // Filter notifications based on selected period
  const getFilteredNotifications = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    return notifications.filter((notification) => {
      const notifDate = new Date(notification.date);
      
      switch (filterPeriod) {
        case "week":
          return notifDate >= startOfWeek;
        case "month":
          return notifDate >= startOfMonth;
        case "year":
          return notifDate >= startOfYear;
        default:
          return true;
      }
    });
  };

  // Group notifications by day
  const groupNotificationsByDay = (notifs: Notification[]) => {
    const grouped: { [key: string]: Notification[] } = {};
    
    notifs.forEach((notification) => {
      const date = new Date(notification.date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let dayLabel: string;
      
      if (date.toDateString() === today.toDateString()) {
        dayLabel = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        dayLabel = "Yesterday";
      } else {
        dayLabel = date.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
        });
      }
      
      if (!grouped[dayLabel]) {
        grouped[dayLabel] = [];
      }
      grouped[dayLabel].push(notification);
    });
    
    return grouped;
  };

  const filteredNotifications = getFilteredNotifications();
  const groupedNotifications = groupNotificationsByDay(filteredNotifications);

  return (
    <>
      {/* Backdrop */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: "rgba(0, 0, 0, 0.3)",
          zIndex: 999,
        }}
        onClick={onClose}
      />

      {/* Popup */}
      <Box
        sx={{
          position: "fixed",
          top: { xs: "50%", sm: "80px" },
          right: { xs: "50%", sm: "16px" },
          transform: {
            xs: "translate(50%, -50%)",
            sm: "none",
          },
          width: { xs: "90%", sm: "420px" },
          maxWidth: "420px",
          maxHeight: { xs: "80vh", sm: "600px" },
          bgcolor: "background.body",
          borderRadius: "12px",
          boxShadow: "lg",
          zIndex: 1000,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography.CardTitle>Notifications</Typography.CardTitle>
            <IconButton
              onClick={onClose}
              variant="plain"
              colorScheme="gray"
              size="sm"
              aria-label="Close notifications"
            >
              <X size={20} />
            </IconButton>
          </Box>

          {/* Filter */}
          <Select
            size="sm"
            value={filterPeriod}
            onChange={(_, val) => setFilterPeriod(val as FilterPeriod)}
            startDecorator={<Calendar size={16} />}
            sx={{ width: "100%" }}
          >
            <Option value="week">This Week</Option>
            <Option value="month">This Month</Option>
            <Option value="year">This Year</Option>
          </Select>
        </Box>

        {/* Notification List */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {filteredNotifications.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 6,
                px: 3,
              }}
            >
              <Typography.Body
                size="sm"
                sx={{ color: "text.tertiary", textAlign: "center" }}
              >
                No notifications for this period
              </Typography.Body>
            </Box>
          ) : (
            <Stack spacing={0}>
              {Object.entries(groupedNotifications).map(([day, dayNotifications]) => (
                <Box key={day}>
                  {/* Day Header */}
                  <Box
                    sx={{
                      position: "sticky",
                      top: 0,
                      bgcolor: "background.level1",
                      px: 2,
                      py: 1,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      zIndex: 1,
                    }}
                  >
                    <Typography.Label
                      weight="bold"
                      sx={{
                        color: "text.secondary",
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                      }}
                    >
                      {day}
                    </Typography.Label>
                  </Box>

                  {/* Day Notifications */}
                  <Stack spacing={0} divider={<Divider />}>
                    {dayNotifications.map((notification) => (
                <Box
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    p: 2,
                    cursor: "pointer",
                    bgcolor: notification.is_read
                      ? "transparent"
                      : "primary.softBg",
                    transition: "background-color 0.2s",
                    "&:hover": {
                      bgcolor: notification.is_read
                        ? "background.level1"
                        : "primary.softHoverBg",
                    },
                    position: "relative",
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    {/* Avatar */}
                    <Box
                      sx={{
                        position: "relative",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={notification.user_avatar || placeholderImage}
                        alt={notification.user_name}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                      {/* Unread indicator */}
                      {!notification.is_read && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            width: 10,
                            height: 10,
                            bgcolor: "primary.500",
                            borderRadius: "50%",
                            border: "2px solid",
                            borderColor: "background.body",
                          }}
                        />
                      )}
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {/* User Name & Role */}
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ mb: 0.5 }}
                      >
                        <Typography.Label
                          weight="bold"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {notification.user_name}
                        </Typography.Label>
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                            px: 1,
                            py: 0.25,
                            borderRadius: "4px",
                            bgcolor: `${getRoleColor(notification.user_role)}.softBg`,
                            color: `${getRoleColor(notification.user_role)}.solidBg`,
                            flexShrink: 0,
                          }}
                        >
                          {getRoleIcon(notification.user_role)}
                          <Typography.Body
                            size="xs"
                            sx={{
                              fontSize: "0.7rem",
                              lineHeight: 1,
                            }}
                          >
                            {notification.user_role}
                          </Typography.Body>
                        </Box>
                      </Stack>

                      {/* Message */}
                      <Typography.Body
                        size="sm"
                        sx={{
                          color: "text.secondary",
                          mb: 0.5,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {notification.message}
                      </Typography.Body>

                      {/* Timestamp */}
                      <Typography.Body
                        size="xs"
                        sx={{
                          color: "text.tertiary",
                          fontSize: "0.7rem",
                        }}
                      >
                        {notification.timestamp}
                      </Typography.Body>
                    </Box>
                    </Stack>
                  </Box>
                ))}
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    </>
  );
}
