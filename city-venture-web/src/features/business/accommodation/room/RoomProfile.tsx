import PageContainer from "@/src/components/PageContainer";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StarIcon from "@mui/icons-material/Star";
import { colors } from "@/src/utils/Colors";
import {
  AspectRatio,
  Chip,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
} from "@mui/joy";
import { useRoom } from "@/src/context/RoomContext";
import Tabs from "@/src/components/Tabs";
import { useState } from "react";
import DetailsComponent from "./components/DetailsComponent";
import PhotosComponent from "./components/PhotosComponent";
import Container from "@/src/components/Container";
import Reviews from "./Reviews";
import NoDataFound from "@/src/components/NoDataFound";
import IconButton from "@/src/components/IconButton";
import { Edit, MoreVertical, Trash2 } from "lucide-react";
import { deleteData } from "@/src/services/Service";
import { useNavigate } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import HotelIcon from "@mui/icons-material/Hotel";
import BuildIcon from "@mui/icons-material/Build";
import ChangeProfile from "./components/ChangeProfile";
import Typography from "@/src/components/Typography";
const RoomProfile = () => {
  const { roomDetails } = useRoom();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"Details" | "Photos" | "Reviews">(
    "Details"
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "success";
      case "Reserved":
        return "neutral";
      case "Occupied":
        return "warning";
      case "Maintenance":
        return "danger";
      default:
        return "neutral";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Available":
        return <CheckCircleIcon sx={{ fontSize: "1.25rem" }} />;
      case "Reserved":
        return <EventSeatIcon sx={{ fontSize: "1.25rem" }} />;
      case "Occupied":
        return <HotelIcon sx={{ fontSize: "1.25rem" }} />;
      case "Maintenance":
        return <BuildIcon sx={{ fontSize: "1.25rem" }} />;
      default:
        return null;
    }
  };

  const deleteRoom = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this room? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      if (!roomDetails?.id) return;
      setIsDeleting(true);
      await deleteData(roomDetails.id as string, "room");
      navigate("/business/rooms");
    } catch (err) {
      console.error("Failed to delete room:", err);
      setIsDeleting(false);
    }
  };

  if (!roomDetails || Object.keys(roomDetails).length === 0) {
    return <NoDataFound message="No room data found." />;
  }

  return (
    <PageContainer
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      {/* --- Room Header --- */}
      <Container
        elevation={2}
        style={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* Header content: Image + Info */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            alignItems: "flex-start",
            width: "100%",
          }}
        >
          <AspectRatio ratio="1" sx={{ width: 130, flexShrink: 0 }}>
            <img
              src={roomDetails?.room_image || ""}
              alt={`Room ${roomDetails?.room_number}`}
            />
          </AspectRatio>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              flex: 1,
            }}
          >
            <Typography.Header>
              Room {roomDetails?.room_number || "Room Number"}
            </Typography.Header>
            <Typography.Body
              startDecorator={
                <LocationOnIcon style={{ color: colors.success }} />
              }
            >
              Floor {roomDetails?.floor || "Floor"}
            </Typography.Body>
            <Typography.Body
              startDecorator={
                <StarIcon style={{ color: colors.yellow }} fontSize="medium" />
              }
            >
              Review
            </Typography.Body>

            {/* Current Status Display */}
            <Chip
              color={getStatusColor(roomDetails?.status || "Available")}
              variant="solid"
              startDecorator={getStatusIcon(roomDetails?.status || "Available")}
            >
              {roomDetails?.status || "Available"}
            </Chip>
          </div>

          {/* Three-dot Menu */}
          <Dropdown>
            <MenuButton
              slots={{ root: IconButton }}
              slotProps={{
                root: {
                  variant: "plain",
                  colorScheme: "secondary",
                },
              }}
            >
              <MoreVertical size={20} />
            </MenuButton>
            <Menu
              placement="bottom-end"
              sx={{
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                borderRadius: "8px",
              }}
            >
              {/* Update Profile */}
              <MenuItem
                onClick={() => setIsEditingProfile(true)}
                sx={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  py: 1,
                  px: 1.5,
                }}
              >
                <Typography.Body size="xs" startDecorator={<Edit size={18} />}>
                  Change Profile
                </Typography.Body>
              </MenuItem>

              {/* Divider */}
              <MenuItem
                disabled
                sx={{
                  display: "none",
                }}
              />

              {/* Delete Room */}
              <MenuItem
                onClick={deleteRoom}
                disabled={isDeleting}
                sx={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  py: 1,
                  px: 1.5,
                  color: "var(--joy-palette-danger-plainColor)",
                  "&:hover": {
                    backgroundColor: "var(--joy-palette-danger-softBg)",
                  },
                }}
              >
                <Typography.Body
                  size="xs"
                  startDecorator={<Trash2 size={18} />}
                >
                  Delete Room
                </Typography.Body>
              </MenuItem>
            </Menu>
          </Dropdown>
        </div>
      </Container>

      {/* --- Room Details --- */}
      <Container elevation={2} padding="0">
        <Tabs active={activeTab} onChange={setActiveTab} />
        {activeTab === "Details" && <DetailsComponent />}
        {activeTab === "Photos" && <PhotosComponent />}
      </Container>
      {activeTab === "Reviews" && <Reviews />}

      {/* ChangeProfile Modal */}
      <ChangeProfile
        open={isEditingProfile}
        onClose={() => setIsEditingProfile(false)}
      />
    </PageContainer>
  );
};

export default RoomProfile;
