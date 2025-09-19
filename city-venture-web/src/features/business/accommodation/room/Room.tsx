import Container from "@/src/components/Container";
import PageContainer from "@/src/components/PageContainer";
import Text from "@/src/components/Text";
import {
  Button,
  Input,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogActions,
  Typography,
} from "@mui/joy";
import {  Calendar, Search } from "lucide-react";
import { Add } from "@mui/icons-material";
import StatusFilter from "./components/StatusFilter";
import { useEffect, useState } from "react";
import AddRoomModal from "./components/AddRoomModal";
import RoomCard from "./components/RoomCard";
type Status = "All" | "Available" | "Occupied" | "Maintenance";
import { useBusiness } from "@/src/context/BusinessContext";
import { getData } from "@/src/services/Service";
import type { Room } from "@/src/types/Business";
import { useRoom } from "@/src/context/RoomContext";
import placeholderImage from "@/src/assets/images/placeholder-image.png";
import { useNavigate } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import CardHeader from "@/src/components/CardHeader";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import CircularProgress from "@mui/joy/CircularProgress";
import SvgIcon from "@mui/joy/SvgIcon";

const RoomPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("All");
  const [openModal, setOpenModal] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [roomCount, setRoomCount] = useState(0);
  const [availableCount, setAvailableCount] = useState(0);
  const [occupiedCount, setOccupiedCount] = useState(0);
  const [maintenanceCount, setMaintenanceCount] = useState(0);

  const { businessDetails } = useBusiness();

  const [search, setSearch] = useState("");
  const { setRoomId } = useRoom();
  const [rooms, setRooms] = useState<Room[]>([]);

  // Filter rooms dynamically
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.room_number?.toLowerCase().includes(search.toLowerCase()) ||
      room.room_type?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = status === "All" ? true : room.status === status;

    return matchesSearch && matchesStatus;
  });

  const fetchRooms = async () => {
    if (!businessDetails?.id) return;
    const response = await getData("room");
    const filtered = Array.isArray(response)
      ? response.filter((room) => room.business_id === businessDetails.id)
      : [];
    setRooms(filtered);
  };

  // Prevent division by zero
const calcPercentage = (count: number) => {
  return roomCount > 0 ? (count / roomCount) * 100 : 0;
};

  useEffect(() => {
    if (businessDetails?.id) {
      fetchRooms();
    }
  }, [businessDetails?.id]);

  useEffect(() => {
    setRoomCount(rooms.length);
    setAvailableCount(
      rooms.filter((room) => room.status === "Available").length
    );
    setOccupiedCount(rooms.filter((room) => room.status === "Occupied").length);
    setMaintenanceCount(
      rooms.filter((room) => room.status === "Maintenance").length
    );
  }, [rooms]);

  return (
    <PageContainer>
      {/* Stats Cards */}
      <Container padding="0" background="transparent" direction="row">
        {/* Total Rooms */}
        <Card sx={{ flex: 1 }} variant="solid" color="primary" invertedColors>
          <CardContent orientation="horizontal">
            <CircularProgress size="lg" determinate value={calcPercentage(roomCount)}>
              <SvgIcon>
                {/* Building Office Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 21V5a2 2 0 012-2h3v18H3zm6 0V3h6v18H9zm9 0V9h3a2 2 0 012 2v10h-5z"
                  />
                </svg>
              </SvgIcon>
            </CircularProgress>
            <CardContent>
              <Typography level="body-md">Total Rooms</Typography>
              <Typography level="h2">{roomCount}</Typography>
            </CardContent>
          </CardContent>
        </Card>

        {/* Available */}
        <Card sx={{ flex: 1 }} variant="solid" color="success" invertedColors>
          <CardContent orientation="horizontal">
            <CircularProgress size="lg" determinate value={calcPercentage(availableCount)}>
              <SvgIcon>
                {/* Check Circle Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75l2.25 2.25L15 9.75M12 21a9 9 0 100-18 9 9 0 000 18z"
                  />
                </svg>
              </SvgIcon>
            </CircularProgress>
            <CardContent>
              <Typography level="body-md">Available</Typography>
              <Typography level="h2">{availableCount}</Typography>
            </CardContent>
          </CardContent>
        </Card>

        {/* Occupied */}
        <Card sx={{ flex: 1 }} variant="solid" color="warning" invertedColors>
          <CardContent orientation="horizontal">
            <CircularProgress size="lg" determinate value={calcPercentage(occupiedCount)}>
              <SvgIcon>
                {/* User Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0v.75h-15v-.75z"
                  />
                </svg>
              </SvgIcon>
            </CircularProgress>
            <CardContent>
              <Typography level="body-md">Occupied</Typography>
              <Typography level="h2">{occupiedCount}</Typography>
            </CardContent>
          </CardContent>
        </Card>

        {/* Maintenance */}
        <Card sx={{ flex: 1 }} variant="solid" color="danger" invertedColors>
          <CardContent orientation="horizontal">
            <CircularProgress size="lg" determinate value={calcPercentage(maintenanceCount)}>
              <SvgIcon>
                {/* Wrench / Tools Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.232 5.232a4 4 0 105.536 5.536L15.232 5.232zM6.75 6.75L3 21l14.25-3.75L6.75 6.75z"
                  />
                </svg>
              </SvgIcon>
            </CircularProgress>
            <CardContent>
              <Typography level="body-md">Maintenance</Typography>
              <Typography level="h2">{maintenanceCount}</Typography>
            </CardContent>
          </CardContent>
        </Card>
      </Container>

      {/* Room Management */}
      <Container gap="0" padding="0" elevation={3}>
        <Container
          direction="row"
          justify="space-between"
          align="center"
          padding="16px 16px 0 16px"
        >
          <div style={{ display: "flex", gap: "12px" }}>
            <Text variant="header-title">Room Management</Text>
            <Button
              startDecorator={<Calendar />}
              size="lg"
              color="primary"
              variant="soft"
              onClick={() => setCalendarOpen(true)}
            >
              Calendar
            </Button>
          </div>

          <Button
            startDecorator={<Add />}
            size="lg"
            color="primary"
            onClick={() => setOpenModal(true)}
          >
            Add Room
          </Button>

          {/* Add Room Modal */}
          <AddRoomModal
            open={openModal}
            onClose={() => setOpenModal(false)}
            onRoomAdded={fetchRooms}
          />
          {/* Calendar Popup Modal */}
          <Modal open={calendarOpen} onClose={() => setCalendarOpen(false)}>
            <ModalDialog
              sx={{ display: "flex", flexDirection: "column", gap: 0 }}
              size="lg"
              variant="outlined"
            >
              <CardHeader title="Calendar" color="white" />
              <DialogTitle></DialogTitle>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar sx={{ width: "100%" }} />
              </LocalizationProvider>
              <DialogActions>
                <Button
                  fullWidth
                  color="neutral"
                  variant="plain"
                  onClick={() => setCalendarOpen(false)}
                >
                  Close
                </Button>
                <Button
                  fullWidth
                  color="primary"
                  onClick={() => setCalendarOpen(false)}
                >
                  Confirm
                </Button>
              </DialogActions>
            </ModalDialog>
          </Modal>
        </Container>

        {/* Search + Filter */}
        <Container
          padding="20px 20px 0 20px"
          direction="row"
          justify="space-between"
          align="center"
        >
          <Input
            startDecorator={<Search />}
            placeholder="Search Rooms"
            size="lg"
            fullWidth
            onChange={(e) => setSearch(e.target.value)}
          />
        </Container>

        {/* Tabs Placeholder */}
        <StatusFilter active={status} onChange={setStatus} />
      </Container>

      <Container background="transparent" padding="0">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1rem",
            width: "100%",
            alignItems: "stretch",
          }}
        >
          {filteredRooms.map((room) => (
            <RoomCard
              roomType={room.room_type!}
              capacity={room.capacity}
              onDeleted={() => fetchRooms()}
              id={room.id}
              key={room.id}
              image={room.room_image || placeholderImage}
              status={room.status!}
              floor={room.floor!}
              roomNumber={room.room_number!}
              type={room.room_type!}
              price={room.room_price!}
              guests={2}
              amenities={[]}
              onUpdate={() => {
                fetchRooms();
              }}
              onClick={async () => {
                setRoomId(room.id); // ensure stored
                navigate("/business/room-profile");
              }}
            />
          ))}
        </div>
      </Container>
    </PageContainer>
  );
};

export default RoomPage;
