import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppBar, Toolbar, Box, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useAuth } from "@/src/context/AuthContext"; 
import logo from "../assets/images/light-logo.png";
import Text from "./Text";

// Styled components for cleaner look
const LogoImg = styled("img")({
  height: 40,
  cursor: "pointer",
  marginRight: 12,
});

export default function Header(): React.JSX.Element {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
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
          <Button color="inherit" component={Link} to="/business">
            Business
          </Button>
          <Button color="inherit" component={Link} to="/request">
            Request
          </Button>
          <Button
            variant="outlined"
            sx={{
              borderColor: "white",
              color: "white",
              "&:hover": { borderColor: "#f5f5f5", background: "rgba(255,255,255,0.1)" },
            }}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
