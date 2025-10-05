import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CheckCircle,
  BedDouble,
  Calendar,
  Store,
  MapPin,
  Briefcase,
  BarChart,
  User,
  ChevronDown,
  ChevronRight,
  LogOut,
  X,
} from "lucide-react";
import "@/src/components/Admin/Sidebar.css";
import logo from "@/src/assets/images/light-logo.png";
import { Typography } from "@mui/joy";
import { colors } from "@/src/utils/Colors";
import Container from "../Container";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps): React.ReactElement {
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
          <NavItem
            to="/tourism/dashboard"
            label="Dashboard"
            icon={<LayoutDashboard size={18} />}
            onClick={onClose}
          />
          <NavItem
            to="/tourism/approval"
            label="Approval"
            icon={<CheckCircle size={18} />}
            onClick={onClose}
          />
          {/* Dropdown for Services */}
          <DropdownNavItem label="Services" icon={<Briefcase size={18} />}>
            <NavItem
              to="/tourism/services/tourist-spot"
              label="Tourist Spot"
              icon={<MapPin size={18} />}
              onClick={onClose}
            />
            <NavItem
              to="/tourism/services/event"
              label="Event"
              icon={<Calendar size={18} />}
              onClick={onClose}
            />
            <NavItem
              to="/tourism/services/accommodation"
              label="Accommodation"
              icon={<BedDouble size={18} />}
              onClick={onClose}
            />
            <NavItem
              to="/tourism/services/shop"
              label="Shop"
              icon={<Store size={18} />}
              onClick={onClose}
            />
          </DropdownNavItem>
          <NavItem
            to="/tourism/reports"
            label="Reports"
            icon={<BarChart size={18} />}
            onClick={onClose}
          />
          <NavItem
            to="/tourism/profile"
            label="Profile"
            icon={<User size={18} />}
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

function NavItem({ to, label, icon, onClick }: NavItemProps): React.ReactElement {
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
          <span>{label}</span>
        </div>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>

      {open && <div className="dropdown-children">{children}</div>}
    </div>
  );
}
