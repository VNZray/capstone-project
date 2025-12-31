import Container from "@/src/components/Container";
import PageContainer from "@/src/components/PageContainer";
import {
  Input,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogActions,
} from "@mui/joy";
import {
  Calendar,
  ListChecks,
  PauseCircle,
  PlayCircle,
  Search,
  TimerOff,
  Lock,
} from "lucide-react";
import { Add, SortRounded } from "@mui/icons-material";
import { useEffect, useState } from "react";
import AddRoomModal from "./components/AddRoomModal";
import BlockDatesModal from "./components/BlockDatesModal";
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
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import * as RoomService from "@/src/services/RoomService";
import dayjs, { Dayjs } from "dayjs";

import NoDataFound from "@/src/components/NoDataFound";
import Button from "@/src/components/Button";
import IconButton from "@/src/components/IconButton";
import DynamicTab from "@/src/components/ui/DynamicTab";
import Typography from "@/src/components/Typography";

import Alert from "@/src/components/Alert";

const RoomPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("All");
  const [openModal, setOpenModal] = useState(false);
  const [blockDatesModalOpen, setBlockDatesModalOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [isFilteringByDate, setIsFilteringByDate] = useState(false);
  const [availableRoomIds, setAvailableRoomIds] = useState<string[]>([]);

  // Alert state for block dates success
  const [blockSuccessOpen, setBlockSuccessOpen] = useState(false);

  const { businessDetails } = useBusiness();

  const [search, setSearch] = useState("");
  const { setRoomId, clearRoomId } = useRoom();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [roomDiscount, setRoomDiscount] = useState<number | null>(null);

  const tabs = [
    { id: "all", label: "All", icon: <ListChecks size={16} /> },
    { id: "available", label: "Available", icon: <PlayCircle size={16} /> },
    { id: "occupied", label: "Occupied", icon: <PauseCircle size={16} /> },
    { id: "maintenance", label: "Maintenance", icon: <TimerOff size={16} /> },
  ];
  // Filter and sort rooms dynamically
  const filteredRooms = rooms
    .filter((room) => {
      const matchesSearch =
        room.room_number?.toLowerCase().includes(search.toLowerCase()) ||
        room.room_type?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = status === "All" ? true : room.status === status;

      const matchesDateFilter = isFilteringByDate
        ? availableRoomIds.includes(room.id)
        : true;

      return matchesSearch && matchesStatus && matchesDateFilter;
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
    const response = await getData("rooms");
    const filtered = Array.isArray(response)
      ? response.filter((room) => room.business_id === businessDetails.id)
      : [];
    setRooms(filtered);

    // Fetch active room discount
    const discount = await RoomService.getActiveRoomDiscount(
      businessDetails.id
    );
    setRoomDiscount(discount);
  };

  const handleApplyDateFilter = async () => {
    if (!businessDetails?.id || !startDate || !endDate) {
      setIsFilteringByDate(false);
      setAvailableRoomIds([]);
      return;
    }

    if (endDate.isBefore(startDate)) {
      alert("End date must be after start date");
      return;
    }

    try {
      const availableRooms = await RoomService.fetchAvailableRoomsByDateRange(
        businessDetails.id,
        startDate.format("YYYY-MM-DD"),
        endDate.format("YYYY-MM-DD")
      );
      setAvailableRoomIds(availableRooms.map((room) => room.id));
      setIsFilteringByDate(true);
      setCalendarOpen(false);
    } catch (error) {
      console.error("Error fetching available rooms:", error);
      alert("Failed to fetch available rooms. Please try again.");
    }
  };

  const handleClearDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setIsFilteringByDate(false);
    setAvailableRoomIds([]);
  };

  useEffect(() => {
    if (businessDetails?.id) {
      fetchRooms();
      clearRoomId();
    }
  }, [businessDetails?.id, clearRoomId]);

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
              flexWrap: "wrap",
            }}
          >
            <Typography.Header>Room Management</Typography.Header>
            <Button
              startDecorator={<Calendar />}
              colorScheme="secondary"
              variant="solid"
              onClick={() => setCalendarOpen(true)}
            >
              {isFilteringByDate ? "Change Dates" : "Filter by Date"}
            </Button>
            <Button
              startDecorator={<Lock size={16} />}
              colorScheme="warning"
              variant="solid"
              onClick={() => setBlockDatesModalOpen(true)}
            >
              Block Dates
            </Button>
            {isFilteringByDate && (
              <Button
                colorScheme="secondary"
                variant="outlined"
                onClick={handleClearDateFilter}
                size="sm"
              >
                Clear Filter
              </Button>
            )}
            {isFilteringByDate && startDate && endDate && (
              <Typography.Body size="sm" sx={{ color: "text.secondary" }}>
                Showing: {startDate.format("MMM D")} -{" "}
                {endDate.format("MMM D, YYYY")}
              </Typography.Body>
            )}
          </div>

          <IconButton
            onClick={() => setOpenModal(true)}
            size="lg"
            floating
            floatPosition="bottom-right"
            hoverEffect="rotate"
          >
            <Add />
          </IconButton>

          {/* Add Room Modal */}
          <AddRoomModal
            business_name={businessDetails?.business_name}
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
                gap: 2,
                width: { xs: "100%", sm: "auto" },
                maxWidth: { xs: "calc(100% - 32px)", sm: 600 },
                m: { xs: 1, sm: "auto" },
              }}
              size="lg"
              variant="outlined"
            >
              <Typography.CardTitle>
                Filter by Availability
              </Typography.CardTitle>
              <DialogTitle
                sx={{ fontSize: "0.875rem", color: "text.secondary" }}
              >
                Select date range to view available rooms
              </DialogTitle>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    minDate={dayjs()}
                    slotProps={{
                      textField: {
                        size: "medium",
                        fullWidth: true,
                      },
                    }}
                  />
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    minDate={startDate || dayjs()}
                    disabled={!startDate}
                    slotProps={{
                      textField: {
                        size: "medium",
                        fullWidth: true,
                      },
                    }}
                  />
                </div>
              </LocalizationProvider>
              <DialogActions>
                <Button
                  fullWidth
                  colorScheme="secondary"
                  variant="plain"
                  onClick={() => setCalendarOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  onClick={handleApplyDateFilter}
                  disabled={!startDate || !endDate}
                >
                  Apply Filter
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

          <IconButton variant="outlined" size="lg">
            <SortRounded />
          </IconButton>
        </Container>

        {/* Tabs */}
        <DynamicTab
          tabs={tabs}
          activeTabId={activeTab}
          onChange={(tabId) => {
            setActiveTab(String(tabId));
            setStatus(
              tabId === "all"
                ? "All"
                : tabId === "available"
                ? "Available"
                : tabId === "occupied"
                ? "Occupied"
                : tabId === "maintenance"
                ? "Maintenance"
                : "All"
            );
          }}
        />
      </Container>

      <Container background="transparent" padding="0">
        {rooms.length === 0 ? (
          <NoDataFound
            icon="database"
            title="No Room Listed"
            message="No rooms yet. Add your first room above."
          >
            <Button
              startDecorator={<Add />}
              size="lg"
              onClick={() => setOpenModal(true)}
            >
              Add Room
            </Button>
          </NoDataFound>
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
                key={room.id}
                image={room.room_image || placeholderImage}
                status={room.status!}
                floor={room.floor!}
                roomNumber={room.room_number!}
                type={room.room_type!}
                price={room.room_price!}
                discountPercentage={roomDiscount}
                room_size={room.room_size!}
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

      {/* Block Dates Modal */}
      <BlockDatesModal
        open={blockDatesModalOpen}
        onClose={() => setBlockDatesModalOpen(false)}
        rooms={rooms.map((r) => ({
          id: r.id,
          room_number: r.room_number || "",
          room_type: r.room_type || "",
        }))}
        businessId={businessDetails?.id || ""}
        onSuccess={() => {
          setBlockSuccessOpen(true);
          fetchRooms();
        }}
      />

      {/* Block Dates Success Alert */}
      <Alert
        open={blockSuccessOpen}
        onClose={() => setBlockSuccessOpen(false)}
        type="success"
        title="Dates Blocked"
        message="Selected dates have been successfully blocked for the room(s)."
        confirmText="OK"
        showCancel={false}
      />
    </PageContainer>
  );
};

export default RoomPage;
