import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import { Bell, Repeat, Menu } from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import Button from "@/src/components/Button";
import IconButton from "@/src/components/IconButton";
import Typography from "@/src/components/Typography";
import Container from "@/src/components/Container";
import NotificationPopup from "./NotificationPopup";
import type { Notification } from "./NotificationPopup";
// const pageTitles: Record<string, string> = {
//   "/business/dashboard": "Dashboard",
//   "/business/transactions": "Transactions",
//   "/business/business-profile": "Business Profile",
//   "/business/manage-promotion": "Manage Promotion",
//   "/business/reports": "Reports",
//   "/business/profile": "Profile",
//   "/business": "Business Profile",
//   "/business/reviews": "Reviews & Ratings",
//   "/business/bookings": "Bookings",
//   "/business/rooms": "Manage Rooms",
//   "/business/offers": "Manage Offers",
//   "/business/room-profile": "Manage Room",
//   "/business/owner-profile": "Owner Profile",
// };
import placeholderImage from "@/src/assets/images/placeholder-image.png";
interface MainHeaderProps {
  onMenuClick?: () => void;
}

export default function MainHeader({ onMenuClick }: MainHeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notificationOpen, setNotificationOpen] = useState(false);
  // const location = useLocation();

  // const title = pageTitles[location.pathname] || "Business Dashboard";

  // Mock notifications - Replace with actual API data
  const mockNotifications: Notification[] = [
    {
      id: "1",
      user_name: "John Doe",
      user_avatar: undefined,
      user_role: "Tourist",
      message: "Booked a room for 3 nights at Luxury Suite",
      timestamp: "2 minutes ago",
      date: new Date(),
      is_read: false,
    },
    {
      id: "2",
      user_name: "Jane Smith",
      user_avatar: undefined,
      user_role: "Tourist",
      message: "Paid booking payment for reservation #12345",
      timestamp: "15 minutes ago",
      date: new Date(),
      is_read: false,
    },
    {
      id: "3",
      user_name: "Tourism Admin",
      user_avatar: undefined,
      user_role: "Tourism Admin",
      message: "Has sent you an email regarding your business verification",
      timestamp: "1 hour ago",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
      is_read: true,
    },
    {
      id: "4",
      user_name: "Michael Johnson",
      user_avatar: undefined,
      user_role: "Tourist",
      message: "Booked a room for weekend getaway",
      timestamp: "3 hours ago",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      is_read: true,
    },
    {
      id: "5",
      user_name: "Sarah Wilson",
      user_avatar: undefined,
      user_role: "Tourist",
      message: "Completed check-in for Deluxe Room",
      timestamp: "1 day ago",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      is_read: true,
    },
  ];

  const navigateToBusiness = () => {
    const staffRoles = [
      "Manager",
      "Room Manager",
      "Receptionist",
      "Sales Associate",
    ];
    const userRole = user?.role_name || "";

    if (userRole === "Business Owner") {
      navigate("/business");
    } else if (staffRoles.includes(userRole)) {
      navigate("/business/dashboard");
    } else {
      navigate("/business");
    }
  };

  const handleNotificationClick = () => {
    setNotificationOpen(!notificationOpen);
  };

  const handleNotificationItemClick = (notification: Notification) => {
    console.log("Notification clicked:", notification);
    // Navigate to specific page or show details
    // navigate("/business/notification");
  };

  const handleMarkAsRead = (notificationId: string) => {
    console.log("Mark as read:", notificationId);
    // Update notification status via API
  };

  return (
    <Container
      direction="row"
      align="center"
      justify="space-between"
      elevation={1}
      background="#fff"
      padding="12px 16px"
      style={{ position: "sticky", top: 0, zIndex: 100 }}
    >
      {/* Left - Back Button & Page Title */}
      <Container direction="row" align="center" gap="8px" padding="0">
        {/* Mobile/Tablet menu button - Always show on screens below 1025px */}
        <Box sx={{ display: { xs: "block", lg: "none" } }}>
          <IconButton
            onClick={onMenuClick}
            variant="plain"
            colorScheme="gray"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </IconButton>
        </Box>

        {/* <Typography.Header>{title}</Typography.Header> */}
      </Container>

      {/* Right - Actions */}
      <Container direction="row" align="center" gap="16px" padding="0">
        {/* Notification */}
        <Box sx={{ position: "relative" }}>
          <IconButton
            onClick={handleNotificationClick}
            variant="plain"
            colorScheme="gray"
          >
            <Bell size={22} />
          </IconButton>
          {/* Unread count badge
          {mockNotifications.filter((n) => !n.is_read).length > 0 && (
            <Box
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
                minWidth: 18,
                height: 18,
                bgcolor: "danger.500",
                color: "white",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.65rem",
                fontWeight: "bold",
                px: 0.5,
                border: "2px solid white",
              }}
            >
              {mockNotifications.filter((n) => !n.is_read).length}
            </Box>
          )} */}
        </Box>

        {/* Desktop/Tablet: User Info and Avatar */}
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            gap: "12px",
          }}
        >
          <Container direction="column" align="flex-end" gap="2px" padding="0">
            <Typography.Label weight="bold">
              {user?.first_name} {user?.last_name}
            </Typography.Label>
            <Typography.Body size="xs" sx={{ opacity: 0.7 }}>
              {user?.email}
            </Typography.Body>
          </Container>
          <IconButton
            colorScheme="primary"
            sx={{ padding: 0, margin: 0, borderRadius: "50%" }}
            size="lg"
            variant="soft"
            onClick={() => navigate("user/profile")}
          >
            <img
              src={user?.user_profile || placeholderImage}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          </IconButton>
        </Box>

        {/* Switch Profile - Full button on medium+ screens - Only for Business Owner */}
        {user?.role_name === "Business Owner" && (
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <Button
              colorScheme="gray"
              variant="solid"
              startDecorator={<Repeat size={18} />}
              onClick={navigateToBusiness}
            >
              Switch Profile
            </Button>
          </Box>
        )}

        {/* Switch Profile - Icon only on small screens - Only for Business Owner */}
        {user?.role_name === "Business Owner" && (
          <Box sx={{ display: { xs: "block", md: "none" } }}>
            <IconButton
              colorScheme="gray"
              variant="solid"
              onClick={navigateToBusiness}
              aria-label="Switch Profile"
            >
              <Repeat size={18} />
            </IconButton>
          </Box>
        )}
      </Container>

      {/* Notification Popup */}
      <NotificationPopup
        notifications={mockNotifications}
        open={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        onNotificationClick={handleNotificationItemClick}
        onMarkAsRead={handleMarkAsRead}
      />
    </Container>
  );
}
