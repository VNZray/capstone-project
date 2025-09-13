import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/src/assets/images/light-logo.png";
import { AccountCircle, Logout } from "@mui/icons-material";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import Link from "@mui/joy/Link";
import { colors } from "../../utils/Colors";
import { Typography } from "@mui/joy";

export default function Header(): React.JSX.Element {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="fixed" sx={{ backgroundColor: "#0A1B47", padding: 1 }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", padding: 0 }}>
        {/* Left: Logo + Title */}
        <Typography textColor={colors.white} startDecorator={<img src={logo} alt="Logo" style={{ width: "40px", height: "40px" }} />} level="title-lg">
          City Venture
        </Typography>

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

        </Box>
      </Toolbar>
    </AppBar>
  );
}
