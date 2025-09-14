import PageContainer from "@/src/components/PageContainer";
import Paper from "@mui/material/Paper";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StarIcon from "@mui/icons-material/Star";
import EditIcon from "@mui/icons-material/Edit";
import { colors } from "@/src/utils/Colors";
import { Button, Chip, Grid, Sheet, Typography } from "@mui/joy";
import { useRoom } from "@/src/context/RoomContext";
import Tabs from "@/src/components/Tabs";
import { useState } from "react";
import DetailsComponent from "./components/DetailsComponent";
import PhotosComponent from "./components/PhotosComponent";
import ReviewsComponent from "./components/ReviewsComponent";
import Container from "@/src/components/Container";
import EditBasicInfo from "./components/EditBasicInfo";
const RoomProfile = () => {
  const { roomDetails } = useRoom();
  const [activeTab, setActiveTab] = useState<"Details" | "Photos" | "Reviews">(
    "Details"
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "success";
      case "Pending":
        return "neutral";
      case "Maintenance":
        return "danger";
      default:
        return "neutral"; // fallback
    }
  };

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
          alignItems: "center",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div
          style={{
            padding: 0,
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "20px",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              width={130}
              height={130}
              className="card-image"
              src={roomDetails?.room_image || ""}
              style={{ borderRadius: "16px" }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Typography fontFamily={"poppins"} level="h1" fontWeight={700}>
                Room {roomDetails?.room_number || "Room Number"}
              </Typography>
              <Typography
                startDecorator={
                  <LocationOnIcon
                    style={{ color: colors.success }}
                    fontSize="medium"
                  />
                }
                fontFamily={"poppins"}
                level="body-md"
              >
                Floor {roomDetails?.floor || "Floor"}
              </Typography>
              <Typography
                startDecorator={
                  <StarIcon
                    style={{ color: colors.yellow }}
                    fontSize="medium"
                  />
                }
                fontFamily={"poppins"}
                level="body-md"
              >
                Review
              </Typography>
              {roomDetails?.status && (
                <Chip
                  size="lg"
                  color={getStatusColor(roomDetails.status)}
                  variant="soft"
                  sx={{ mt: 1 }}
                >
                  {roomDetails.status}
                </Chip>
              )}
            </div>
          </div>
        </div>
      </Container>

      {/* --- Room Details --- */}
      <Paper
        elevation={2}
        style={{
          borderRadius: "16px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Tabs active={activeTab} onChange={setActiveTab} />
        {activeTab === "Details" && <DetailsComponent />}
        {activeTab === "Photos" && <PhotosComponent />}
        {activeTab === "Reviews" && <ReviewsComponent />}
      </Paper>

     
    </PageContainer>
  );
};

export default RoomProfile;
