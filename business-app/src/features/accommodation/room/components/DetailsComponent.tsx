import Paper from "@mui/material/Paper";
import { Button, Chip, Divider, Grid, Sheet, Typography } from "@mui/joy";
import { useRoom } from "@/src/context/RoomContext";
import Container from "@/src/components/Container";
import { Bed, Users, ListChecks, PhilippinePeso } from "lucide-react";
import HeightIcon from "@mui/icons-material/Height";
import type { Amenity } from "@/src/types/Amenity";
import { getData } from "@/src/services/Service";
import React, { useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import EditBasicInfo from "./EditBasicInfo";
import { Refresh } from "@mui/icons-material";
import EditAmenitiesModal from "./EditAmenitiesModal";
import EditDescriptionModal from "./EditDescription";

const DetailsComponent = () => {
  const { roomDetails } = useRoom();
  const [amenities, setAmenities] = React.useState<Amenity[]>([]);
  const [editBasicInfoModalOpen, setEditBasicInfoModalOpen] = useState(false);
  const [editAmenitiesModalOpen, setEditAmenitiesModalOpen] = useState(false);
  const [editDescriptionModalOpen, setEditDescriptionModalOpen] = useState(false);

  const fetchRoomAmenities = async () => {
    if (!roomDetails?.id) return;

    const roomAmenityResponse = await getData("room-amenities");
    const amenityResponse = await getData("amenities");

    const filtered = Array.isArray(roomAmenityResponse)
      ? roomAmenityResponse
          .filter((ra) => ra.room_id === roomDetails.id)
          .map((ra) => {
            const match: Amenity | undefined = (
              amenityResponse as Amenity[]
            ).find((a: Amenity) => a.id === ra.amenity_id);
            return { ...ra, name: match?.name || "Unknown" };
          })
      : [];

    setAmenities(filtered);
  };

  React.useEffect(() => {
    fetchRoomAmenities();
  }, [roomDetails?.id]);

  return (
    <Paper
      elevation={0}
      style={{
        padding: "0 20px",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <Grid container spacing={2}>
        <Grid
          xs={6}
          sx={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <Container
            padding="0"
            direction="row"
            align="center"
            justify="space-between"
          >
            <Typography
              fontFamily={"poppins"}
              level="title-lg"
              fontWeight={600}
            >
              Basic Information
            </Typography>

            <Button
              color="primary"
              size="sm"
              variant="outlined"
              startDecorator={<EditIcon />}
              onClick={() => setEditBasicInfoModalOpen(true)}
            >
              Edit
            </Button>
          </Container>
          <Paper
            variant="outlined"
            sx={{ p: 2, display: "flex", flexDirection: "row" }}
          >
            <Container
              gap="16px"
              padding="0"
              direction="column"
              style={{ flex: 1 }}
            >
              <div>
                <Typography
                  fontFamily={"poppins"}
                  level="title-md"
                  fontWeight={500}
                >
                  Room Number
                </Typography>
                <Typography
                  startDecorator={<Bed size={18} />}
                  fontFamily={"poppins"}
                  level="body-md"
                >
                  {roomDetails?.room_number || "-"}
                </Typography>
              </div>

              <div>
                <Typography
                  fontFamily={"poppins"}
                  level="title-md"
                  fontWeight={500}
                >
                  Floor
                </Typography>
                <Typography
                  startDecorator={<HeightIcon fontSize="small" />}
                  fontFamily={"poppins"}
                  level="body-md"
                >
                  {roomDetails?.floor || "-"}
                </Typography>
              </div>

              <div>
                <Typography
                  fontFamily={"poppins"}
                  level="title-md"
                  fontWeight={500}
                >
                  Price
                </Typography>
                <Typography
                  startDecorator={<PhilippinePeso size={18} />}
                  fontFamily={"poppins"}
                  level="body-md"
                >
                  {roomDetails?.room_price?.toLocaleString() || "-"}
                </Typography>
              </div>
            </Container>
            <Container padding="0" direction="column" style={{ flex: 1 }}>
              <div>
                <Typography
                  fontFamily={"poppins"}
                  level="title-md"
                  fontWeight={500}
                >
                  Room Type
                </Typography>
                <Typography
                  startDecorator={<ListChecks size={18} />}
                  fontFamily={"poppins"}
                  level="body-md"
                >
                  {roomDetails?.room_type || "-"}
                </Typography>
              </div>
              <div>
                <Typography
                  fontFamily={"poppins"}
                  level="title-md"
                  fontWeight={500}
                >
                  Capacity
                </Typography>
                <Typography
                  startDecorator={<Users size={18} />}
                  fontFamily={"poppins"}
                  level="body-md"
                >
                  {roomDetails?.capacity || "-"}
                </Typography>
              </div>
            </Container>
          </Paper>

          <Container
            padding="0"
            direction="row"
            align="center"
            justify="space-between"
          >
            <Typography
              fontFamily={"poppins"}
              level="title-lg"
              fontWeight={600}
            >
              Amenities
            </Typography>

            <Button
              color="primary"
              size="sm"
              variant="outlined"
              startDecorator={<EditIcon />}
              onClick={() => setEditAmenitiesModalOpen(true)}
            >
              Edit
            </Button>
          </Container>

          <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {amenities.map((amenity) => (
                <Chip key={amenity.id} size="lg" variant="soft" color="primary">
                  {amenity.name}
                </Chip>
              ))}
            </div>
          </Paper>
        </Grid>

        <Grid
          xs={6}
          sx={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <Container
            padding="0"
            direction="row"
            align="center"
            justify="space-between"
          >
            <Typography
              fontFamily={"poppins"}
              level="title-lg"
              fontWeight={600}
            >
              Description
            </Typography>

            <Button
              color="primary"
              size="sm"
              variant="outlined"
              startDecorator={<EditIcon />}
              onClick={() => setEditDescriptionModalOpen(true)}
            >
              Edit
            </Button>
          </Container>
          <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
            <Typography fontFamily={"poppins"} level="body-md">
              {roomDetails?.description || "-"}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid
          xs={12}
          sx={{ display: "flex", flexDirection: "column", gap: "16px" }}
        ></Grid>
      </Grid>

      <EditBasicInfo
        open={editBasicInfoModalOpen}
        initialRoomNumber={roomDetails?.room_number}
        initialRoomType={roomDetails?.room_type}
        initialFloor={roomDetails?.floor}
        initialCapacity={roomDetails?.capacity}
        initialPrice={roomDetails?.room_price}
        roomId={roomDetails?.id}
        onClose={() => setEditBasicInfoModalOpen(false)}
        onSave={() => {
          window.location.reload();
        }}
      />

      <EditAmenitiesModal
        open={editAmenitiesModalOpen}
        roomId={roomDetails?.id}
        onClose={() => setEditAmenitiesModalOpen(false)}
        onSave={() => {
          window.location.reload();
        }}
      />

      <EditDescriptionModal
        open={editDescriptionModalOpen}
        initialDescription={roomDetails?.description}
        roomId={roomDetails?.id}
        onClose={() => setEditDescriptionModalOpen(false)}
        onSave={() => {
          window.location.reload();
        }}
      />
    </Paper>
  );
};

export default DetailsComponent;
