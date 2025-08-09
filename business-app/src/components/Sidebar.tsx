import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Bed, Calendar, BarChart2, User } from "lucide-react";
import "../styles/Sidebar.css"; // Import the CSS file

export default function Sidebar(): React.ReactElement {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">Naga Venture</div>
      {/* Navigation */}
      <nav className="sidebar-nav">
        <NavItem to="/dashboard" label="Dashboard" icon={<Home size={18} />} />
        <NavItem
          to="/transactions"
          label="Transactions"
          icon={<Bed size={18} />}
        />
        <NavItem
          to="/manage-business"
          label="Manage Business"
          icon={<Calendar size={18} />}
        />
        <NavItem to="/reports" label="Reports" icon={<BarChart2 size={18} />} />
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
