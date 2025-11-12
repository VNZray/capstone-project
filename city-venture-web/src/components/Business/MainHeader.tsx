import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import { Bell, Repeat, ArrowLeft, Menu } from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import Button from "@/src/components/Button";
import IconButton from "@/src/components/IconButton";
import Typography from "@/src/components/Typography";
import Container from "@/src/components/Container";
// const pageTitles: Record<string, string> = {
//   "/business/dashboard": "Dashboard",
//   "/business/transactions": "Transactions",
//   "/business/business-profile": "Business Profile",
//   "/business/manage-promotion": "Manage Promotion",
//   "/business/reports": "Reports",
//   "/business/profile": "Profile",
//   "/business": "Business Profile",
//   "/business/reviews": "Reviews & Ratings",
//   "/business/bookings": "Bookings",
//   "/business/rooms": "Manage Rooms",
//   "/business/offers": "Manage Offers",
//   "/business/room-profile": "Manage Room",
//   "/business/owner-profile": "Owner Profile",
// };
import placeholderImage from "@/src/assets/images/placeholder-image.png";
interface MainHeaderProps {
  onMenuClick?: () => void;
}

export default function MainHeader({ onMenuClick }: MainHeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  // const location = useLocation();

  // const title = pageTitles[location.pathname] || "Business Dashboard";

  const navigateToBusiness = () => {
    navigate("/business");
  };

  const navigateToNotification = () => {
    navigate("/business/notification");
  };

  return (
    <Container
      direction="row"
      align="center"
      justify="space-between"
      elevation={1}
      background="#fff"
      padding="12px 16px"
      style={{ position: "sticky", top: 0, zIndex: 100 }}
    >
      {/* Left - Back Button & Page Title */}
      <Container direction="row" align="center" gap="8px" padding="0">
        {/* Mobile/Tablet menu button - Always show on screens below 1025px */}
        <Box sx={{ display: { xs: "block", lg: "none" } }}>
          <IconButton
            onClick={onMenuClick}
            variant="plain"
            colorScheme="gray"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </IconButton>
        </Box>
        <IconButton
          onClick={() => navigate(-1)}
          variant="plain"
          colorScheme="gray"
          aria-label="Go Back"
        >
          <ArrowLeft size={22} />
        </IconButton>
        {/* <Typography.Header>{title}</Typography.Header> */}
      </Container>

      {/* Right - Actions */}
      <Container direction="row" align="center" gap="16px" padding="0">
        {/* Notification */}
        <IconButton 
          onClick={navigateToNotification} 
          variant="plain"
          colorScheme="gray"
        >
          <Bell size={22} />
        </IconButton>

        {/* Desktop/Tablet: User Info and Avatar */}
        <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: "12px" }}>
          <Container
            direction="column"
            align="flex-end"
            gap="2px"
            padding="0"
          >
            <Typography.Label weight="bold">
              {user?.first_name} {user?.last_name}
            </Typography.Label>
            <Typography.Body size="xs" sx={{ opacity: 0.7 }}>
              {user?.email}
            </Typography.Body>
          </Container>
          <img 
            src={user?.user_profile || placeholderImage} 
            style={{ 
              width: 40, 
              height: 40, 
              borderRadius: "50%",
              objectFit: "cover"
            }} 
          />
        </Box>

        {/* Switch Profile - Full button on medium+ screens */}
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <Button
            colorScheme="gray"
            variant="solid"
            startDecorator={<Repeat size={18} />}
            onClick={navigateToBusiness}
          >
            Switch Profile
          </Button>
        </Box>

        {/* Switch Profile - Icon only on small screens */}
        <Box sx={{ display: { xs: "block", md: "none" } }}>
          <IconButton
            colorScheme="gray"
            variant="solid"
            onClick={navigateToBusiness}
            aria-label="Switch Profile"
          >
            <Repeat size={18} />
          </IconButton>
        </Box>
      </Container>
    </Container>
  );
}
