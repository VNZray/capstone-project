import React from "react";
import { useLocation } from "react-router-dom";
import "../styles/Header.css";

export default function Header(): React.JSX.Element {
  const location = useLocation();

  // Map paths to titles
  const pageTitles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/transactions": "Transactions",
    "/manage-business": "Manage Business",
    "/reports": "Reports",
    "/profile": "Profile",
  };

  // Get title based on path (fallback to "Business Dashboard")
  const title = pageTitles[location.pathname] || "Business Dashboard";

  return (
    <header className="header">
      {/* Page Title */}
      <h1 className="header-title">{title}</h1>

      {/* User Info */}
      <div className="header-user">
        <span className="header-welcome">Welcome, Owner</span>
        <button className="header-logout">Logout</button>
      </div>
    </header>
  );
}
