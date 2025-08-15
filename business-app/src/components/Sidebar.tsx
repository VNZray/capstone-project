import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Receipt,
  CalendarCheck,
  BedDouble,
  Tags,
  Store,
  Tag,
  Star,
  User,
  LogOut,
  LayoutDashboard
} from "lucide-react";
import "./styles/Sidebar.css";

export default function Sidebar(): React.ReactElement {
  const business_type = "Accommodation"; // This should be dynamically set based on the user's business type
  return (
    <aside className="sidebar">
      {/* Logo */}
      <h3 className="sidebar-logo light-text">Naga Venture</h3>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <NavItem
            to="/dashboard"
            label="Dashboard"
            icon={<LayoutDashboard size={18} />}
          />
          {business_type === "Accommodation" ? (
            <>
              <NavItem
                to="/transactions"
                label="Transactions"
                icon={<Receipt size={18} />}
              />
              <NavItem
                to="/bookings"
                label="Bookings"
                icon={<CalendarCheck size={18} />}
              />
            </>
          ) : null}
          <NavItem
            to="/manage-business"
            label="Manage Business"
            icon={<Store size={18} />}
          />
          {business_type === "Accommodation" ? (
            <NavItem
              to="/rooms"
              label="Manage Rooms"
              icon={<BedDouble size={18} />}
            />
          ) : (
            <NavItem
              to="/offers"
              label="Manage Offers"
              icon={<Tags size={18} />}
            />
          )}
          <NavItem
            to="/manage-promotion"
            label="Manage Promotion"
            icon={<Tag size={18} />}
          />
          <NavItem
            to="/reviews"
            label="Reviews & Ratings"
            icon={<Star size={18} />}
          />
          <NavItem to="/profile" label="Profile" icon={<User size={18} />} />
        </div>

        <div>
          <NavItem to="/login" label="Log Out" icon={<LogOut size={18} />} />
        </div>
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
