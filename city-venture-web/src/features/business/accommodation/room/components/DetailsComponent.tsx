import Paper from "@mui/material/Paper";
import { Button, Chip, Grid } from "@mui/joy";
import { useRoom } from "@/src/context/RoomContext";
import Container from "@/src/components/Container";
import { Users, ListChecks, PhilippinePeso } from "lucide-react";
import type { Amenity } from "@/src/types/Amenity";
import { getData } from "@/src/services/Service";
import React, { useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import EditBasicInfo from "./EditBasicInfo";
import EditAmenitiesModal from "./EditAmenitiesModal";
import EditDescriptionModal from "./EditDescription";
import Typography from "@/src/components/Typography";
import Calendar from "@/src/components/ui/Calendar";
const DetailsComponent = () => {
  const { roomDetails } = useRoom();
  const [amenities, setAmenities] = React.useState<Amenity[]>([]);
  const [bookings, setBookings] = React.useState<any[]>([]);
  const [editBasicInfoModalOpen, setEditBasicInfoModalOpen] = useState(false);
  const [editAmenitiesModalOpen, setEditAmenitiesModalOpen] = useState(false);
  const [editDescriptionModalOpen, setEditDescriptionModalOpen] =
    useState(false);

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

  const fetchRoomBookings = async () => {
    if (!roomDetails?.id) return;

    try {
      const bookingResponse = await getData(`booking/room/${roomDetails.id}`);
      console.log("Fetched bookings:", bookingResponse);
      setBookings(Array.isArray(bookingResponse) ? bookingResponse : []);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      setBookings([]);
    }
  };

  React.useEffect(() => {
    fetchRoomAmenities();
    fetchRoomBookings();
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
          xs={12}
          sm={12}
          md={6}
          lg={6}
          xl={6}
          sx={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <Container
            padding="0"
            direction="row"
            align="center"
            justify="space-between"
          >
            <Typography.CardTitle>Basic Information</Typography.CardTitle>

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
                <Typography.Label>Room Type</Typography.Label>
                <Typography.Body startDecorator={<ListChecks size={18} />}>
                  {roomDetails?.room_type || "-"}
                </Typography.Body>
              </div>
              <div>
                <Typography.Label>Room Size sqm(㎡)</Typography.Label>
                <Typography.Body startDecorator={<ListChecks size={18} />}>
                  {roomDetails?.room_size || "-"}
                </Typography.Body>
              </div>
            </Container>
            <Container padding="0" direction="column" style={{ flex: 1 }}>
              <div>
                <Typography.Label fontFamily={"poppins"}>
                  Price
                </Typography.Label>
                <Typography.Body startDecorator={<PhilippinePeso size={18} />}>
                  {roomDetails?.room_price?.toLocaleString() || "-"}
                </Typography.Body>
              </div>

              <div>
                <Typography.Label fontFamily={"poppins"}>
                  Capacity
                </Typography.Label>
                <Typography.Body startDecorator={<Users size={18} />}>
                  {roomDetails?.capacity || "-"}
                </Typography.Body>
              </div>
            </Container>
          </Paper>

          <Container
            padding="0"
            direction="row"
            align="center"
            justify="space-between"
          >
            <Typography.CardTitle fontFamily={"poppins"}>
              Amenities
            </Typography.CardTitle>

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

          <Container
            padding="0"
            direction="row"
            align="center"
            justify="space-between"
          >
            <Typography.CardTitle fontFamily={"poppins"}>
              Description
            </Typography.CardTitle>

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
            <Typography.Body>{roomDetails?.description || "-"}</Typography.Body>
          </Paper>
        </Grid>

        <Grid
          xs={12}
          sm={12}
          md={6}
          lg={6}
          xl={6}
          sx={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <Paper variant="outlined" sx={{ p: 0, overflow: "hidden" }}>
            <Calendar
              events={(() => {
                const calendarEvents = bookings.flatMap((booking) => {
                  const checkIn = new Date(booking.check_in_date);
                  const checkOut = new Date(booking.check_out_date);
                  const dates = [];

                  console.log("Processing booking:", {
                    checkIn: checkIn.toISOString(),
                    checkOut: checkOut.toISOString(),
                    status: booking.booking_status,
                  });

                  // Generate all dates between check-in and check-out (inclusive of check-in, exclusive of check-out)
                  const currentDate = new Date(checkIn);
                  while (currentDate < checkOut) {
                    let status:
                      | "Available"
                      | "Reserved"
                      | "Occupied"
                      | "Maintenance" = "Available";

                    // Map booking status to calendar status
                    if (
                      booking.booking_status === "Reserved" ||
                      booking.booking_status === "Pending"
                    ) {
                      status = "Reserved";
                    } else if (booking.booking_status === "Checked-In") {
                      status = "Occupied";
                    } else if (booking.booking_status === "Checked-Out") {
                      status = "Available";
                    } else if (booking.booking_status === "Canceled") {
                      status = "Available";
                    }

                    dates.push({
                      date: new Date(currentDate),
                      status: status,
                    });
                    currentDate.setDate(currentDate.getDate() + 1);
                  }
                  return dates;
                });
                console.log("Calendar events generated:", calendarEvents);
                return calendarEvents;
              })()}
            />
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
        initialStatus={roomDetails?.status}
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
