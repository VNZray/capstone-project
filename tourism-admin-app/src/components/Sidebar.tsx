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
} from "lucide-react";
import "./styles/Sidebar.css";

export default function Sidebar(): React.ReactElement {
  return (
    <aside className="sidebar">
      <h3 className="sidebar-logo light-text">Naga Venture</h3>

      <nav className="sidebar-nav">
        <NavItem
          to="/dashboard"
          label="Dashboard"
          icon={<LayoutDashboard size={18} />}
        />
        <NavItem
          to="/approval"
          label="Approval"
          icon={<CheckCircle size={18} />}
        />

        {/* Dropdown for Services */}
        <DropdownNavItem label="Services" icon={<Briefcase size={18} />}>
          <NavItem
            to="/services/accommodation"
            label="Accommodation"
            icon={<BedDouble size={18} />}
          />
          <NavItem
            to="/services/event"
            label="Event"
            icon={<Calendar size={18} />}
          />
          <NavItem
            to="/services/shop"
            label="Shop"
            icon={<Store size={18} />}
          />
          <NavItem
            to="/services/tourist-spot"
            label="Tourist Spot"
            icon={<MapPin size={18} />}
          />
        </DropdownNavItem>

        <NavItem to="/reports" label="Reports" icon={<BarChart size={18} />} />
        <NavItem to="/profile" label="Profile" icon={<User size={18} />} />
      </nav>
    </aside>
  );
}

interface NavItemProps {
  to: string;
  label: string;
  icon?: React.ReactNode;
}

function NavItem({ to, label, icon }: NavItemProps): React.ReactElement {
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
