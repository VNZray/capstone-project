import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Receipt,
  CalendarCheck,
  BedDouble,
  Tags,
  Store,
  Tag,
  Star,
  User,
  LogOut,
  X,
  LayoutDashboard,
} from "lucide-react";
import logo from "@/src/assets/images/light-logo.png";

import "./Sidebar.css";
import { useBusiness } from "../../context/BusinessContext";
import { useAuth } from "@/src/context/AuthContext";
import { Typography } from "@mui/joy";
import { colors } from "../../utils/Colors";
import Container from "../Container";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps): React.ReactElement {
  const { businessDetails } = useBusiness();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const route = "/business"
  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      {/* Mobile close button */}
      <button className="sidebar-close" onClick={onClose} aria-label="Close sidebar">
        <X size={20} />
      </button>
      <Container background="transparent" direction="row" align="center">
        <Typography textColor={colors.white} startDecorator={<img src={logo} alt="Logo" style={{ width: "40px", height: "40px" }} />} level="title-lg">
          City Venture
        </Typography>
      </Container>
      {/* Navigation */}
      <nav className="sidebar-nav">
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
        >
          <NavItem
            to={`${route}/dashboard`}
            label="Dashboard"
            icon={<LayoutDashboard size={18} />}
            onClick={onClose}
          />
          {businessDetails?.business_type_id === 1 ? (
            <>
              <NavItem
                to={`${route}/transactions`}
                label="Transactions"
                icon={<Receipt size={18} />}
                onClick={onClose}
              />
              <NavItem
                to={`${route}/bookings`}
                label="Bookings"
                icon={<CalendarCheck size={18} />}
                onClick={onClose}
              />
            </>
          ) : null}
          <NavItem
            to={`${route}/business-profile`}
            label="Business Profile"
            icon={<Store size={18} />}
            onClick={onClose}
          />
          {businessDetails?.business_type_id === 1 ? (
            <NavItem
              to={`${route}/rooms`}
              label="Manage Rooms"
              icon={<BedDouble size={18} />}
              onClick={onClose}
            />
          ) : (
            <NavItem
              to={`${route}/offers`}
              label="Manage Offers"
              icon={<Tags size={18} />}
              onClick={onClose}
            />
          )}
          <NavItem
            to={`${route}/manage-promotion`}
            label="Manage Promotion"
            icon={<Tag size={18} />}
            onClick={onClose}
          />
          <NavItem
            to={`${route}/reviews`}
            label="Reviews & Ratings"
            icon={<Star size={18} />}
            onClick={onClose}
          />
          <NavItem to={`${route}/profile`} label="Profile" icon={<User size={18} />} onClick={onClose} />
        </div>

        <div>
          <NavItem 
            label="Log Out" 
            icon={<LogOut size={18} />} 
            onClick={() => { logout(); navigate('/'); onClose?.(); }}
          />
        </div>
      </nav>
    </aside>
  );
}

interface NavItemProps {
  to?: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

function NavItem({ to, label, icon, onClick }: NavItemProps): React.ReactElement {
  if (to) {
    return (
      <NavLink
        to={to}
        className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
      >
        {icon && <span className="sidebar-icon">{icon}</span>}
        <span>{label}</span>
      </NavLink>
    );
  }
  return (
    <button type="button" className="sidebar-link" onClick={onClick} style={{ background: 'transparent', border: 'none', textAlign: 'left', padding: 0, cursor: 'pointer' }}>
      {icon && <span className="sidebar-icon">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}
