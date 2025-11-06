import Container from "@/src/components/Container";
import PageContainer from "@/src/components/PageContainer";
import {
  Button,
  Input,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogActions,
} from "@mui/joy";
import { Calendar, Search } from "lucide-react";
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

import NoDataFound from "@/src/components/NoDataFound";
import ResponsiveText from "@/src/components/ResponsiveText";

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

  // Filter and sort rooms dynamically
  const filteredRooms = rooms
    .filter((room) => {
      const matchesSearch =
        room.room_number?.toLowerCase().includes(search.toLowerCase()) ||
        room.room_type?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = status === "All" ? true : room.status === status;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // If room_number is numeric, sort numerically; otherwise, lexicographically
      const numA = Number(a.room_number);
      const numB = Number(b.room_number);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return (a.room_number || "").localeCompare(b.room_number || "");
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
      {/* Room Management */}
      <Container gap="0" padding="0" elevation={3}>
        <Container
          direction="row"
          justify="space-between"
          align="center"
          padding="16px 16px 0 16px"
          style={{ flexWrap: "wrap", rowGap: 12, columnGap: 12 }}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              flex: 1,
              minWidth: 240,
            }}
          >
            <ResponsiveText type="title-small" weight="bold">
              Room Management
            </ResponsiveText>
            <Button
              startDecorator={<Calendar />}
              size="lg"
              color="primary"
              variant="soft"
              onClick={() => setCalendarOpen(true)}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Calendar
            </Button>
          </div>

          <Button
            startDecorator={<Add />}
            size="lg"
            color="primary"
            onClick={() => setOpenModal(true)}
            sx={{ width: { xs: "100%", sm: "auto" } }}
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
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 0,
                width: { xs: "100%", sm: "auto" },
                maxWidth: { xs: "calc(100% - 32px)", sm: 600 },
                m: { xs: 1, sm: "auto" },
              }}
              size="lg"
              variant="outlined"
            >
              <ResponsiveText type="title-small">Calendar</ResponsiveText>
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
        {rooms.length === 0 ? (
          <NoDataFound
            icon="database"
            title="No Room Listed"
            message="No rooms yet. Add your first room above."
          />
        ) : filteredRooms.length === 0 && search.trim() !== "" ? (
          <NoDataFound
            icon="search"
            title="No Results Found"
            message={`No rooms match "${search}". Try a different search term.`}
          />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
              gap: "1rem",
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
        )}
      </Container>
    </PageContainer>
  );
};

export default RoomPage;
