import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
} from "@mui/material";
import { Bell, Repeat, ArrowLeft, Menu } from "lucide-react";
import { useAuth } from "@/src/context/AuthContext"; // adjust path if needed
import Text from "../Text";

import { Button } from "@mui/joy";
const pageTitles: Record<string, string> = {
  "/business/dashboard": "Dashboard",
  "/business/transactions": "Transactions",
  "/business/business-profile": "Business Profile",
  "/business/manage-promotion": "Manage Promotion",
  "/business/reports": "Reports",
  "/business/profile": "Profile",
  "/business": "Business Profile",
  "/business/reviews": "Reviews & Ratings",
  "/business/bookings": "Bookings",
  "/business/rooms": "Manage Rooms",
  "/business/offers": "Manage Offers",
  "/business/room-profile": "Manage Room",
  "/business/owner-profile": "Owner Profile",
};

interface MainHeaderProps {
  onMenuClick?: () => void;
}

export default function MainHeader({ onMenuClick }: MainHeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();

  const title = pageTitles[location.pathname] || "Business Dashboard";

  const navigateToBusiness = () => {
    navigate("/business");
  };

  const navigateToNotification = () => {
    navigate("/business/notification");
  };

  return (
    <AppBar
      position="sticky"
      sx={{ backgroundColor: "#fff", color: "#000" }}
      elevation={1}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Left - Back Button & Page Title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Mobile menu button */}
          <Box sx={{ display: { xs: "block", md: "none" } }}>
            <IconButton
              onClick={onMenuClick}
              color="inherit"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </IconButton>
          </Box>
          <IconButton
            onClick={() => navigate(-1)}
            color="inherit"
            sx={{ mr: 1 }}
            aria-label="Go Back"
          >
            <ArrowLeft size={22} />
          </IconButton>
          {/* <Text variant="header-title">{title}</Text> */}
        </Box>

        {/* Right - Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Notification */}
          <IconButton
            onClick={navigateToNotification}
            color="inherit"
          >
            <Bell size={22} />
          </IconButton>

          {/* User Info */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
              {user?.first_name} {user?.last_name}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {user?.email}
            </Typography>
          </Box>

          {/* Avatar */}
          <Avatar
            src={user?.user_profile || undefined}
            sx={{ width: 40, height: 40 }}
          >
            {!user?.user_profile && user?.first_name?.[0]}
          </Avatar>

          {/* Switch Profile */}
          <Button
            color="neutral"
            variant="solid"
            startDecorator={<Repeat size={18} />}
            onClick={navigateToBusiness}
          >
            Switch Profile
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
