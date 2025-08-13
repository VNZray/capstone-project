import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "./styles/Header.css";
import { useAuth } from "@/src/context/AuthContext"; // adjust path if needed
import logo from "../assets/images/light-logo.png";
import Text from "./Text";

export default function Header(): React.JSX.Element {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="header">
      {/* Left: Logo */}
      <div className="header-left">
        <img
          src={logo}
          alt="Logo"
          className="header-logo"
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
      </div>

      {/* Right: Nav Links + Logout */}
      <nav className="header-right">
        <Link to="/business" className="header-link">
          Business
        </Link>

        <Link to="/business-listing" className="header-link">
          Register
        </Link>

        <Link to="/request" className="header-link">
          Request
        </Link>

        <button className="header-logout" onClick={handleLogout}>
          Logout
        </button>
      </nav>
    </header>
  );
}
