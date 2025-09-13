import React from "react";
import { NavLink } from "react-router-dom";
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
} from "lucide-react";
import logo from "@/src/assets/images/light-logo.png";

import "./Sidebar.css";
import { useBusiness } from "../../context/BusinessContext";
import { Typography } from "@mui/joy";
import { colors } from "../../utils/Colors";
import Container from "../Container";

export default function Sidebar(): React.ReactElement {
  const { businessDetails } = useBusiness();
  const route = "/business"
  return (
    <aside className="sidebar">
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
          <NavItem
            to={`${route}/reviews`}
            label="Reviews & Ratings"
            icon={<Star size={18} />}
          />
          <NavItem to={`${route}/profile`} label="Profile" icon={<User size={18} />} />
        </div>

        <div>
          <NavItem to={`${route}/login`} label="Log Out" icon={<LogOut size={18} />} />
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
