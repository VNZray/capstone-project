import Container from "@/src/components/Container";
import PageContainer from "@/src/components/PageContainer";
import Text from "@/src/components/Text";
import {
  Button,
  Grid,
  Input,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/joy";
import InfoCard from "../../../components/InfoCard";
import { Bed, Calendar, DoorOpen, User, Search, Wrench } from "lucide-react";
import { colors } from "@/src/utils/Colors";
import { Add } from "@mui/icons-material";
import StatusFilter from "./components/StatusFilter";
import { useEffect, useState } from "react";
import AddRoomModal from "./components/AddRoomModal";
import RoomCard from "./components/RoomCard";
type Status = "All" | "Available" | "Occupied" | "Maintenance";
import { useBusiness } from "@/src/context/BusinessContext";
import { getData } from "@/src/api_function";
import type { Room } from "@/src/types/Business";
import { useRoom } from "@/src/context/RoomContext";
import placeholderImage from "@/src/assets/images/placeholder-image.png";
import { useNavigate } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import CardHeader from "@/src/components/CardHeader";
import { PieChart } from '@mui/x-charts/PieChart';

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
      room.room_number.toLowerCase().includes(search.toLowerCase()) ||
      room.room_type.toLowerCase().includes(search.toLowerCase());

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
      <Container padding="0" background="transparent">
        <Grid container spacing={3}>
          <Grid xs={3}>
            <InfoCard
              icon={<Bed color={colors.white} size={32} />}
              title={roomCount.toString()}
              subtitle="Total Rooms"
              color={colors.secondary}
            />
          </Grid>
          <Grid xs={3}>
            <InfoCard
              icon={<DoorOpen color={colors.white} size={32} />}
              title={availableCount.toString()}
              subtitle="Available"
              color={colors.success}
            />
          </Grid>
          <Grid xs={3}>
            <InfoCard
              icon={<User color={colors.white} size={32} />}
              title={occupiedCount.toString()}
              subtitle="Occupied"
              color={colors.yellow}
            />
          </Grid>
          <Grid xs={3}>
            <InfoCard
              icon={<Wrench color={colors.white} size={32} />}
              title={maintenanceCount.toString()}
              subtitle="Maintenance"
              color={colors.gray}
            />
          </Grid>
        </Grid>
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
              roomType={room.room_type}
              capacity={room.capacity}
              onDeleted={() => fetchRooms()}
              id={room.id}
              key={room.id}
              image={room.room_image || placeholderImage}
              status={room.status}
              floor={room.floor}
              roomNumber={room.room_number}
              type={room.room_type}
              price={room.room_price}
              guests={2}
              amenities={[]}
              onUpdate={() => {
                fetchRooms();
              }}
              onClick={async () => {
                setRoomId(room.id); // ensure stored
                navigate("/room-profile");
              }}
            />
          ))}
        </div>
      </Container>
    </PageContainer>
  );
};

export default RoomPage;
