import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Receipt,
  CalendarCheck,
  BedDouble,
  Store,
  Star,
  LogOut,
  X,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Percent,
  Settings as SettingsIcon,
  ChevronDown,
  ShoppingBag,
  Settings,
  Megaphone,
  Tag,
  CreditCard,
} from "lucide-react";

// Compact icon size
const ICON_SIZE = 24;
import logo from "@/src/assets/logo/city-ventures-main.png";
import "./Sidebar.css";
import { useBusiness } from "../../context/BusinessContext";
import { useAuth } from "@/src/context/AuthContext";
import useRBAC from "@/src/hooks/useRBAC";
import { FaUserFriends } from "react-icons/fa";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  isOpen = false,
  onClose,
}: SidebarProps): React.ReactElement {
  const { businessDetails } = useBusiness();
  const { logout } = useAuth();
  const { hasRole, canAny } = useRBAC();
  const navigate = useNavigate();
  const location = useLocation();
  const route = "/business";
  const [storeOpen, setStoreOpen] = React.useState(false);

  React.useEffect(() => {
    // Auto-expand Store section when navigating within store routes
    if (location.pathname.startsWith(`${route}/store`)) {
      setStoreOpen(true);
    }
  }, [location.pathname]);
  return (
    <aside className={`sidebar business-sidebar ${isOpen ? "open" : ""}`}>
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
          <div className="sidebar-brand-subtitle">for Business</div>
        </div>
      </div>
      {/* Navigation */}
      <nav className="sidebar-nav">
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
        >
          {/* Dashboard visible to any business role */}
          <NavItem
            to={`${route}/dashboard`}
            label="Dashboard"
            icon={<LayoutDashboard size={ICON_SIZE} />}
            onClick={onClose}
          />

          {businessDetails?.hasBooking ? (
            <>
              {(hasRole("Business Owner", "Manager") ||
                canAny(
                  "view_transactions",
                  "manage_transactions",
                  "view_bookings",
                  "manage_bookings"
                )) && (
                <NavItem
                  to={`${route}/transactions`}
                  label="Transactions"
                  icon={<Receipt size={ICON_SIZE} />}
                  onClick={onClose}
                />
              )}
              {(hasRole("Business Owner", "Manager", "Receptionist") ||
                canAny("view_bookings", "manage_bookings")) && (
                <NavItem
                  to={`${route}/bookings`}
                  label="Bookings"
                  icon={<CalendarCheck size={ICON_SIZE} />}
                  onClick={onClose}
                />
              )}
            </>
          ) : null}

          {(hasRole("Business Owner", "Manager") ||
            canAny("view_business_profile", "edit_business_profile")) && (
            <NavItem
              to={`${route}/business-profile`}
              label="Business Profile"
              icon={<Store size={ICON_SIZE} />}
              onClick={onClose}
            />
          )}

          {(hasRole("Business Owner", "Manager", "Sales Associate") ||
            canAny("view_promotions", "manage_promotions")) &&
            (businessDetails?.hasBooking === false ? (
              <NavItem
                to={`${route}/promotion`}
                label="Manage Promotions"
                icon={<Megaphone size={ICON_SIZE} />}
                onClick={onClose}
              />
            ) : (
              <NavItem
                to={`${route}/manage-promotion`}
                label="Manage Promotions"
                icon={<Megaphone size={ICON_SIZE} />}
                onClick={onClose}
              />
            ))}

          {hasRole("Business Owner", "Manager", "Room Manager") && (
            <NavItem
              to={`${route}/rooms`}
              label="Manage Rooms"
              icon={<BedDouble size={ICON_SIZE} />}
              onClick={onClose}
            />
          )}

          {businessDetails?.hasBooking === true &&
            hasRole("Business Owner") && (
              <NavItem
                to={`${route}/subscription`}
                label="Subscription"
                icon={<CreditCard size={ICON_SIZE} />}
                onClick={onClose}
              />
            )}

          {hasRole("Business Owner") && (
            <NavItem
              to={`${route}/subscription`}
              label="Subscription"
              icon={<CreditCard size={ICON_SIZE} />}
              onClick={onClose}
            />
          )}

          {/* Store section (Shop only) */}
          {businessDetails?.hasBooking === false &&
            hasRole("Business Owner", "Manager", "Sales Associate") && (
              <div className="sidebar-section">
                <button
                  type="button"
                  className="sidebar-link sidebar-section-header"
                  onClick={() => setStoreOpen((v) => !v)}
                  aria-expanded={storeOpen}
                  aria-controls="store-subnav"
                >
                  <span className="sidebar-icon">
                    <ShoppingBag size={ICON_SIZE} />
                  </span>
                  <span>Store</span>
                  <span
                    className={`sidebar-chevron ${storeOpen ? "open" : ""}`}
                    aria-hidden="true"
                  >
                    <ChevronDown size={14} />
                  </span>
                </button>
                <div
                  id="store-subnav"
                  className={`sidebar-subnav ${
                    storeOpen ? "expanded" : "collapsed"
                  }`}
                  role="region"
                  aria-label="Store section"
                  hidden={!storeOpen}
                >
                  {/* Store: show to Owner/Manager/Sales Associate */}
                  <NavItem
                    to={`${route}/store/products`}
                    label="Products"
                    icon={<Package size={ICON_SIZE} />}
                    onClick={onClose}
                  />
                  <NavItem
                    to={`${route}/store/categories`}
                    label="Categories"
                    icon={<Tag size={ICON_SIZE} />}
                    onClick={onClose}
                  />
                  <NavItem
                    to={`${route}/store/services`}
                    label="Services"
                    icon={<SettingsIcon size={ICON_SIZE} />}
                    onClick={onClose}
                  />
                  <NavItem
                    to={`${route}/store/orders`}
                    label="Orders"
                    icon={<ShoppingCart size={ICON_SIZE} />}
                    onClick={onClose}
                  />
                  <NavItem
                    to={`${route}/store/discount`}
                    label="Discount"
                    icon={<Percent size={ICON_SIZE} />}
                    onClick={onClose}
                  />
                  <NavItem
                    to={`${route}/store/settings`}
                    label="Settings"
                    icon={<SettingsIcon size={ICON_SIZE} />}
                    onClick={onClose}
                  />
                </div>
              </div>
            )}
          {(hasRole("Business Owner", "Manager") ||
            canAny("view_reviews", "respond_reviews")) && (
            <NavItem
              to={`${route}/reviews`}
              label="Reviews & Ratings"
              icon={<Star size={ICON_SIZE} />}
              onClick={onClose}
            />
          )}
          {hasRole("Business Owner") && (
            <NavItem
              to={`${route}/manage-staff`}
              label="Manage Staff"
              icon={<FaUserFriends />}
              onClick={onClose}
            />
          )}
          {hasRole("Business Owner") && (
            <NavItem
              to={`${route}/settings`}
              label="Settings"
              icon={<Settings size={18} />}
              onClick={onClose}
            />
          )}
        </div>

        <div
          className="sidebar-logout"
          style={{ marginTop: "auto", paddingTop: "8px" }}
        >
          <NavItem
            label="Log Out"
            icon={<LogOut size={ICON_SIZE} />}
            onClick={() => {
              logout();
              navigate("/");
              onClose?.();
            }}
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

function NavItem({
  to,
  label,
  icon,
  onClick,
}: NavItemProps): React.ReactElement {
  if (to) {
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
  return (
    <button type="button" className="sidebar-link" onClick={onClick}>
      {icon && <span className="sidebar-icon">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}
