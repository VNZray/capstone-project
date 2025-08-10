import React from "react";
import { useLocation } from "react-router-dom";
import "./styles/Header.css";
import { useNavigate, Link } from "react-router-dom";
import Text from "./Text";
import { useAuth } from "@/src/context/AuthContext"; // adjust path if needed

export default function Header(): React.JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const switchProfile = () => {
    // Clear user session and navigate to login
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
  const title = pageTitles[location.pathname] || "Business Dashboard";

  return (
    <header className="header">
      {/* Page Title */}
      <Text variant="header-title">{title}</Text>

      {/* User Info */}
      <div className="header-user">
          <Link to={`/profile`}>
            <Text variant="normal">{user?.first_name || "Guest"} {user?.last_name || ""}</Text>
          </Link>
        <button className="header-logout" onClick={switchProfile}>
          Switch Profile
        </button>
      </div>
    </header>
  );
}
