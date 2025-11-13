import React from "react";
import { useLocation } from "react-router-dom";
import "./Header.css";
import { useNavigate, Link } from "react-router-dom";
import ResponsiveText from "@/src/components/ResponsiveText";
import { useAuth } from "@/src/context/AuthContext"; // adjust path if needed
import Button from "@/src/components/Button";

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
  <ResponsiveText type="title-small" weight="bold">{title}</ResponsiveText>

      {/* User Info */}
      <div className="header-user">
        <Link to={`/profile`}>
          <ResponsiveText type="body-small" weight="medium">
            {user?.first_name || "Guest"} {user?.last_name || ""}
          </ResponsiveText>
        </Link>
        <Button 
          variant="solid" 
          colorScheme="primary"
          onClick={handleLogout}
          size="sm"
        >
          Log Out
        </Button>
      </div>
    </header>
  );
}
