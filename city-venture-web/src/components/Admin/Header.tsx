import React from "react";
import { useLocation } from "react-router-dom";
import "./Header.css";
import { useNavigate, Link } from "react-router-dom";
import Typography from "@/src/components/Typography";
import { useAuth } from "@/src/context/AuthContext";
import Button from "../Button";

export default function Header(): React.JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Map paths to titles
  const pageTitles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/transactions": "Transactions",
    "/manage-business": "Manage Business",
    "/manage-promotion": "Manage Promotion",
    "/reports": "Reports",
    "/profile": "Profile",
    "/": "Business Profile",
    "/reviews": "Reviews & Ratings",
    "/bookings": "Bookings",
    "/rooms": "Manage Rooms",
    "/offers": "Manage Offers",
  };

  // Get title based on path (fallback to "Business Dashboard")
  const title = pageTitles[location.pathname] || "";

  return (
    <header className="header">
      {/* Page Title */}
      <Typography.Header size="sm">{title}</Typography.Header>

      {/* User Info */}
      <div className="header-user">
        <Link to={`/profile`}>
          <Typography.Body size="sm" weight="semibold">
            {user?.first_name || "Guest"} {user?.last_name || ""}
          </Typography.Body>
        </Link>
        <Button 
          variant="solid" 
          onClick={handleLogout}
          size="sm"
        >
          Log Out
        </Button>
      </div>
    </header>
  );
}
