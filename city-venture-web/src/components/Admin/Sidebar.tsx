import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CheckCircle,
  BedDouble,
  Calendar,
  Store,
  MapPin,
  BarChart,
  User,
  ChevronDown,
  ChevronRight,
  LogOut,
  X,
  Users,
  BriefcaseBusiness,
  Settings,
  AlertCircle,
} from "lucide-react";
import "@/src/components/Admin/Sidebar.css";
import logo from "@/src/assets/images/light-logo.png";
import Typography from "@/src/components/Typography";
import useRBAC from "@/src/hooks/useRBAC";
import { useAuth } from "@/src/context/AuthContext";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  isOpen = false,
  onClose,
}: SidebarProps): React.ReactElement {
  const { logout } = useAuth();
  const { canAny } = useRBAC();
  const navigate = useNavigate();
  const route = "/tourism";

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      {/* Mobile close button */}
      <button
        className="sidebar-close"
        onClick={onClose}
        aria-label="Close sidebar"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          zIndex: 2,
        }}
      >
        <X size={20} />
      </button>
      <div
        className="sidebar-brand"
        onClick={() => {
          navigate(route + "/dashboard");
          onClose?.();
        }}
        style={{ cursor: "pointer" }}
      >
        <img src={logo} alt="City Ventures" className="sidebar-brand-icon" />
        <div className="sidebar-brand-text">
          <div className="sidebar-brand-title">CITY VENTURES</div>
          <div className="sidebar-brand-subtitle">Tourism</div>
        </div>
      </div>

      <nav className="admin-sidebar-nav">
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
        >
          <NavItem
            to="/tourism/dashboard"
            label="Dashboard"
            icon={<LayoutDashboard size={24} />}
            onClick={onClose}
          />
          {canAny(
            "approve_business",
            "approve_event",
            "approve_tourist_spot",
            "approve_shop"
          ) && (
            <NavItem
              to="/tourism/approval"
              label="Approval"
              icon={<CheckCircle size={24} />}
              onClick={onClose}
            />
          )}
          {/* Dropdown for Services */}
          <DropdownNavItem
            label="Services"
            icon={<BriefcaseBusiness color="white" size={24} />}
          >
            <NavItem
              to="/tourism/services/tourist-spot"
              label="Tourist Spot"
              icon={<MapPin size={24} />}
              onClick={onClose}
            />
            <NavItem
              to="/tourism/services/event"
              label="Event"
              icon={<Calendar size={24} />}
              onClick={onClose}
            />
            <NavItem
              to="/tourism/services/accommodation"
              label="Accommodation"
              icon={<BedDouble size={24} />}
              onClick={onClose}
            />
            <NavItem
              to="/tourism/services/shop"
              label="Shop"
              icon={<Store size={24} />}
              onClick={onClose}
            />
          </DropdownNavItem>
          <NavItem
            to="/tourism/reports"
            label="Reports"
            icon={<BarChart size={24} />}
            onClick={onClose}
          />
          <NavItem
            to="/tourism/emergency-facilities"
            label="Emergency Facilities"
            icon={<AlertCircle size={24} />}
            onClick={onClose}
          />
          <NavItem
            to="/tourism/staff"
            label="Manage Staff"
            icon={<Users size={24} color="white" />}
            onClick={onClose}
          />
          {/* Dropdown for Staff
          {canAny("manage_users", "manage_tourism_staff") && (
            <DropdownNavItem
              label="Staffs"
              icon={<Users size={24} color="white" />}
            >
              <NavItem
                to="/tourism/staff"
                label="Manage Staff"
                icon={<Users size={24} color="white" />}
                onClick={onClose}
              />
              <NavItem
                to="/tourism/staff-roles"
                label="Manage Roles"
                icon={<Shield size={24} />}
                onClick={onClose}
              />
            </DropdownNavItem>
          )}*/}
          {canAny("manage_users") && (
            <NavItem
              to="/tourism/users"
              label="User Accounts"
              icon={<Users size={24} />}
              onClick={onClose}
            />
          )}
          <NavItem
            to="/tourism/profile"
            label="Profile"
            icon={<User size={24} />}
            onClick={onClose}
          />
          <NavItem
            to="/tourism/settings"
            label="Settings"
            icon={<Settings size={24} />}
            onClick={onClose}
          />
        </div>
        <div>
          <NavItem
            to="/"
            label="Log Out"
            icon={<LogOut size={24} />}
            onClick={() => {
              logout();
              onClose?.();
            }}
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
          <Typography.Body size="sm">{label}</Typography.Body>
        </div>
        {open ? (
          <ChevronDown color="white" size={24} />
        ) : (
          <ChevronRight color="white" size={24} />
        )}
      </button>

      {open && <div className="dropdown-children">{children}</div>}
    </div>
  );
}
