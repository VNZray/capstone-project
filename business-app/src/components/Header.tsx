import React from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { useAuth } from "@/src/context/AuthContext";
import logo from "../assets/images/light-logo.png";
import Text from "./Text";
import { AccountCircle, Logout } from "@mui/icons-material";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import Link from "@mui/joy/Link";
import { colors } from "../utils/Colors";

// Styled components for cleaner look
const LogoImg = styled("img")({
  height: 40,
  cursor: "pointer",
  marginRight: 12,
});

export default function Header(): React.JSX.Element {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#0A1B47", paddingX: 2 }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Left: Logo + Title */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <LogoImg
            src={logo}
            alt="Logo"
            onClick={() => navigate("/")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") navigate("/");
            }}
          />
          <Text variant="header-title" color="white">
            City Venture
          </Text>
        </Box>

        {/* Right: Navigation */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Link
            underline="none"
            variant="plain"
            href="/business"
            level="title-md"
            sx={{
              color: colors.white,
              ":hover": { backgroundColor: colors.primary },
            }}
          >
            Business
          </Link>
          <Link
            underline="none"
            variant="plain"
            href="/request"
            level="title-md"
            sx={{
              color: colors.white,
              ":hover": { backgroundColor: colors.primary },
            }}
          >
            Request
          </Link>

          {/* Profile Icon */}
          <IconButton onClick={handleMenuOpen} sx={{ color: "white" }}>
            <AccountCircle fontSize="large" />
          </IconButton>

          {/* Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                borderRadius: 2,
                mt: 1.5,
                minWidth: 160,
                boxShadow: "0px 8px 20px rgba(0,0,0,0.15)",
              },
            }}
          >
            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate("/profile");
              }}
            >
              Profile
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                handleMenuClose();
                handleLogout();
              }}
              sx={{ color: "red" }}
            >
              <Logout fontSize="small" style={{ marginRight: 8 }} /> Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
