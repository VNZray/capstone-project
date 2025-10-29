import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
} from "@mui/material";
import { Bell, ArrowLeft, Menu } from "lucide-react";
import { useAuth } from "@/src/context/AuthContext"; // adjust path if needed
import ResponsiveText from "../ResponsiveText";

// import { Button } from "@mui/joy";
const pageTitles: Record<string, string> = {
  "/tourism/dashboard": "Dashboard",
  "/tourism/approval": "Approval",
  "/tourism/services/accommodation": "Accommodation",
  "/tourism/services/event": "Event",
  "/tourism/services/shop": "Shop",
  "/tourism/services/tourist-spot": "Tourist Spot Management",
  "/tourism/services/tourist-spot/:id": "Tourist Spot Details",
  "/tourism/reports": "Report Management",
  "/tourism/reports/:id": "Report Details",
  "/tourism/profile": "Profile",
};

interface MainHeaderProps {
  onMenuClick?: () => void;
}

export default function MainHeader({ onMenuClick }: MainHeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();

  // Support exact matches and dynamic route matches (e.g., details page)
  const title =
    pageTitles[location.pathname] ||
    (location.pathname.startsWith("/tourism/services/tourist-spot/")
      ? "Tourist Spot Details"
      : location.pathname.startsWith("/tourism/reports/")
      ? "Report Details"
      : "Business Dashboard");


  return (
    <AppBar
      position="static"
      elevation={4}
      sx={{ backgroundColor: "#fff", color: "#000", boxShadow: 2 }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Left - Back Button & Page Title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Mobile menu button */}
          <Box sx={{ display: { xs: "block", md: "none" } }}>
            <IconButton onClick={onMenuClick} color="inherit" aria-label="Open menu">
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
          <ResponsiveText type="title-small" weight="bold">{title}</ResponsiveText>
        </Box>

        {/* Right - Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Notification */}
          <IconButton
            onClick={() => console.log("Notification pressed")}
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
            src="https://scontent.fmnl4-3.fna.fbcdn.net/v/t39.30808-6/473779260_1650871915635859_3696627546110909035_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=-QHgJ0OEfKgQ7kNvwH6SPiI&_nc_oc=AdmntoVAwjKNPzsPVi3sSbLv-78THTR0KRCJ16hZNrcmJdYIix4boUMDYcKMpDebIHVHAESz9NwlmvK1oJHEdZL-&_nc_zt=23&_nc_ht=scontent.fmnl4-3.fna&_nc_gid=dMLkuKZ3n3Iz2IJEL0dO0w&oh=00_AfXdnlRosu9KtqXJMt6OADxhkVs_5V2lxS1qVYbOJotqbQ&oe=689FD5E2"
            sx={{ width: 40, height: 40 }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
