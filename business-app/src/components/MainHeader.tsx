import React from "react";
import { FaBell, FaUser } from "react-icons/fa";
import "./styles/MainHeader.css";
import Text from "./Text";
import { useLocation, useNavigate } from "react-router-dom";
import { Repeat } from "lucide-react";

import { Bell } from "lucide-react";
import Button from "./Button";
import { useAuth } from "@/src/context/AuthContext"; // adjust path if needed

const MainHeader: React.FC = ({}) => {
  const navigate = useNavigate();
  const { user } = useAuth(); // from AuthProvider
  const location = useLocation();

  const navigateToBusiness = () => {
    navigate(`/business`);
  };

  // Map paths to titles
  const pageTitles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/transactions": "Transactions",
    "/manage-business": "Manage Business",
    "/manage-promotion": "Manage Promotion",
    "/reports": "Reports",
    "/profile": "Profile",
    "/": "Business Profile",
    "/reviews": "Reviews & Ratings",
    "/bookings": "Bookings",
    "/rooms": "Manage Rooms",
    "/offers": "Manage Offers",
  };
  // Get title based on path (fallback to "Business Dashboard")
  const title = pageTitles[location.pathname] || "Business Dashboard";

  return (
    <div className="header-container">
      <div className="header-left">
        <Text variant="header-title">{title}</Text>
      </div>

      <div className="header-middle"></div>

      <div className="header-right">
        <div className="header-right-inner">
          <button
            className="notification-container"
            onClick={() => console.log("Notification pressed")}
          >
            <Bell size={24} color="black" />
          </button>

          <div className="user-details">
            <Text variant="header-name">{user?.first_name}</Text>
            <Text variant="header-email">{user?.email}</Text>
          </div>

          <div className="user-icon">
            <img
              width={40}
              height={40}
              style={{ borderRadius: "50%" }}
              src="https://scontent.fmnl4-3.fna.fbcdn.net/v/t39.30808-6/473779260_1650871915635859_3696627546110909035_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=-QHgJ0OEfKgQ7kNvwH6SPiI&_nc_oc=AdmntoVAwjKNPzsPVi3sSbLv-78THTR0KRCJ16hZNrcmJdYIix4boUMDYcKMpDebIHVHAESz9NwlmvK1oJHEdZL-&_nc_zt=23&_nc_ht=scontent.fmnl4-3.fna&_nc_gid=dMLkuKZ3n3Iz2IJEL0dO0w&oh=00_AfXdnlRosu9KtqXJMt6OADxhkVs_5V2lxS1qVYbOJotqbQ&oe=689FD5E2"
            />
          </div>

          <div style={{ marginLeft: "12px" }}>
            <Button
              padding={"8px 16px"}
              icon={<Repeat size={24} />}
              variant="primary"
              fontSize={14}
              onClick={navigateToBusiness}
            >
              Switch Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainHeader;
