import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
  LayoutDashboard,
  Package,
  ShoppingCart,
  Percent,
  Settings as SettingsIcon,
  ChevronDown,
  ShoppingBag,
} from "lucide-react";
import logo from "@/src/assets/images/light-logo.png";

import "./Sidebar.css";
import { useBusiness } from "../../context/BusinessContext";
import { useAuth } from "@/src/context/AuthContext";
// removed Typography/Container usage in brand header

export default function Sidebar(): React.ReactElement {
  const { businessDetails } = useBusiness();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const route = "/business"
  const [storeOpen, setStoreOpen] = React.useState(false);

  React.useEffect(() => {
    // Auto-expand Store section when navigating within store routes
    if (location.pathname.startsWith(`${route}/store`)) {
      setStoreOpen(true);
    }
  }, [location.pathname]);
  return (
  <aside className="sidebar business-sidebar">
      <div className="sidebar-brand">
        <img src={logo} alt="City Ventures" className="sidebar-brand-icon" />
        <div className="sidebar-brand-text">
          <div className="sidebar-brand-title">CITY VENTURES</div>
          <div className="sidebar-brand-subtitle">for Business</div>
        </div>
      </div>
      {/* Navigation */}
      <nav className="sidebar-nav">
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <NavItem
            to={`${route}/dashboard`}
            label="Dashboard"
            icon={<LayoutDashboard size={18} />}
          />
          {businessDetails?.business_type_id === 1 ? (
            <>
              <NavItem
                to={`${route}/transactions`}
                label="Transactions"
                icon={<Receipt size={18} />}
              />
              <NavItem
                to={`${route}/bookings`}
                label="Bookings"
                icon={<CalendarCheck size={18} />}
              />
            </>
          ) : null}
          <NavItem
            to={`${route}/business-profile`}
            label="Business Profile"
            icon={<Store size={18} />}
          />
          {businessDetails?.business_type_id === 1 ? (
            <NavItem
              to={`${route}/rooms`}
              label="Manage Rooms"
              icon={<BedDouble size={18} />}
            />
          ) : (
            <NavItem
              to={`${route}/offers`}
              label="Manage Offers"
              icon={<Tags size={18} />}
            />
          )}
          <NavItem
            to={`${route}/manage-promotion`}
            label="Manage Promotion"
            icon={<Tag size={18} />}
          />

          {/* Store section (Shop only) */}
          {businessDetails?.business_type_id !== 1 && (
            <div className="sidebar-section">
              <button
                type="button"
                className="sidebar-link sidebar-section-header"
                onClick={() => setStoreOpen((v) => !v)}
                aria-expanded={storeOpen}
                aria-controls="store-subnav"
              >
                <span className="sidebar-icon"><ShoppingBag size={18} /></span>
                <span>Store</span>
                <span className={`sidebar-chevron ${storeOpen ? "open" : ""}`}>
                  <ChevronDown size={16} />
                </span>
              </button>
              {storeOpen && (
                <div id="store-subnav" className="sidebar-subnav">
                  <NavItem
                    to={`${route}/store/products`}
                    label="Products"
                    icon={<Package size={18} />}
                  />
                  <NavItem
                    to={`${route}/store/orders`}
                    label="Orders"
                    icon={<ShoppingCart size={18} />}
                  />
                  <NavItem
                    to={`${route}/store/discount`}
                    label="Discount"
                    icon={<Percent size={18} />}
                  />
                  <NavItem
                    to={`${route}/store/settings`}
                    label="Settings"
                    icon={<SettingsIcon size={18} />}
                  />
                </div>
              )}
            </div>
          )}
          <NavItem
            to={`${route}/reviews`}
            label="Reviews & Ratings"
            icon={<Star size={18} />}
          />
          <NavItem to={`${route}/profile`} label="Profile" icon={<User size={18} />} />
        </div>

        <div className="sidebar-logout" style={{ marginTop: "auto", paddingTop: "12px" }}>
          <NavItem 
            label="Log Out" 
            icon={<LogOut size={18} />} 
            onClick={() => { logout(); navigate('/'); }}
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
    <button type="button" className="sidebar-link" onClick={onClick}>
      {icon && <span className="sidebar-icon">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}
