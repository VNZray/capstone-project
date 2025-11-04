import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CheckCircle2,
  BedDouble,
  CalendarDays,
  Store,
  MapPin,
  Briefcase,
  BarChart2,
  User2,
  Users2,
  Settings2,
  ChevronDown,
  ChevronRight,
  LogOut,
  X,
  Settings,
} from "lucide-react";
import "@/src/components/Admin/Sidebar.css";
import logo from "@/src/assets/images/light-logo.png";
import { Typography } from "@mui/joy";
import { colors } from "@/src/utils/Colors";
import Container from "../Container";
import useRBAC from "@/src/hooks/useRBAC";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  isOpen = false,
  onClose,
}: SidebarProps): React.ReactElement {
  const { canAny } = useRBAC();
  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      {/* Mobile close button */}
      <button
        className="sidebar-close"
        onClick={onClose}
        aria-label="Close sidebar"
      >
        <X size={20} />
      </button>
      <Container background="transparent" direction="row" align="center">
        <Typography
          textColor={colors.white}
          startDecorator={
            <img
              src={logo}
              alt="Logo"
              style={{ width: "40px", height: "40px" }}
            />
          }
          level="title-lg"
        >
          City Venture
        </Typography>
      </Container>
      <nav className="admin-sidebar-nav">
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
        >
          {canAny("view_reports") && (
            <NavItem
              to="/tourism/dashboard"
              label="Dashboard"
              icon={<LayoutDashboard size={18} />} // Dashboard icon
              onClick={onClose}
            />
          )}
          {canAny(
            "approve_tourist_spot",
            "approve_business",
            "approve_event",
            "approve_shop"
          ) && (
            <NavItem
              to="/tourism/approval"
              label="Approval"
              icon={<CheckCircle2 size={18} />} // Approval icon
              onClick={onClose}
            />
          )}
          {/* Dropdown for Services */}
          {canAny("manage_services", "view_all_profiles") && (
            <DropdownNavItem label="Services" icon={<Briefcase size={18} />}>
              <NavItem
                to="/tourism/services/tourist-spot"
                label="Tourist Spot"
                icon={<MapPin size={18} />} // MapPin for Tourist Spot
                onClick={onClose}
              />
              <NavItem
                to="/tourism/services/event"
                label="Event"
                icon={<CalendarDays size={18} />} // CalendarDays for Event
                onClick={onClose}
              />
              <NavItem
                to="/tourism/services/accommodation"
                label="Accommodation"
                icon={<BedDouble size={18} />} // BedDouble for Accommodation
                onClick={onClose}
              />
              <NavItem
                to="/tourism/services/shop"
                label="Shop"
                icon={<Store size={18} />} // Store for Shop
                onClick={onClose}
              />
            </DropdownNavItem>
          )}
          {canAny("view_reports") && (
            <NavItem
              to="/tourism/reports"
              label="Reports"
              icon={<BarChart2 size={18} />} // BarChart2 for Reports
              onClick={onClose}
            />
          )}
          <NavItem
            to="/tourism/profile"
            label="Profile"
            icon={<User2 size={18} />} // User2 for Profile
            onClick={onClose}
          />
          <NavItem
            to="/tourism/users"
            label="User Management"
            icon={<Users2 size={18} />} // Users2 for User Management
            onClick={onClose}
          />
          <NavItem
            to="/tourism/settings"
            label="Settings"
            icon={<Settings size={18} />} // Settings2 for Settings
            onClick={onClose}
          />
        </div>
        <div>
          <NavItem
            to={`tourism/login`}
            label="Log Out"
            icon={<LogOut size={18} />}
            onClick={onClose}
          />
        </div>
      </nav>
    </aside>
  );
}

interface NavItemProps {
  to: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

function NavItem({
  to,
  label,
  icon,
  onClick,
}: NavItemProps): React.ReactElement {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      {icon && <span className="sidebar-icon">{icon}</span>}
      <span>{label}</span>
    </NavLink>
  );
}

interface DropdownNavItemProps {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

function DropdownNavItem({
  label,
  icon,
  children,
}: DropdownNavItemProps): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <div className="dropdown-nav">
      <button
        className="sidebar-link dropdown-toggle"
        onClick={() => setOpen((prev) => !prev)}
      >
        {icon && <span className="sidebar-icon">{icon}</span>}
        <div className="nav-label">
          <span style={{ fontFamily: "Poppins, sans-serif", fontSize: 16 }}>
            {label}
          </span>
        </div>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={18} />}
      </button>

      {open && <div className="dropdown-children">{children}</div>}
    </div>
  );
}
