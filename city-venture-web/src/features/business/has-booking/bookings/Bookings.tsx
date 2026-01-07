import { useEffect, useState, useMemo } from "react";
import Typography from "@/src/components/Typography";
import NoDataFound from "@/src/components/NoDataFound";
import PageContainer from "@/src/components/PageContainer";
import Alert from "@/src/components/Alert";
import Button from "@/src/components/Button";
import {
  Search,
  Check,
  XCircle,
  List,
  Clock,
  LogIn,
  LogOut,
  UserPlus,
} from "lucide-react";
import BookingDetails from "./components/BookingDetails";
import WalkInBookingModal from "./components/WalkInBookingModal";
import { Input, Box, Typography as JoyTypography } from "@mui/joy"; // Added Box and JoyTypography
import Container from "@/src/components/Container";
import { Select, Option } from "@mui/joy";
import { useBusiness } from "@/src/context/BusinessContext";
import {
  fetchBookingsByBusinessId,
  updateBookingStatus,
  fetchGuestInfoByIds,
} from "@/src/services/BookingService";
import { fetchRoomNumbersByIds } from "@/src/services/RoomService";
import type { Booking } from "@/src/types/Booking";
import DynamicTab from "@/src/components/ui/DynamicTab";
import Table, {
  type TableColumn,
  GuestAvatar,
  StatusChip,
  type GuestInfo,
} from "@/src/components/ui/Table";

// Extend Booking type to include guest info and room info
interface BookingRow extends Booking {
  guest?: GuestInfo;
  room_name?: string;
}

// Local helper to normalize status casing differences from backend
const normalizeStatus = (status?: string) => {
  if (!status) return "Pending";
  const lower = status.toLowerCase();
  if (lower === "checked-in" || lower === "checked_in") return "Checked-in";
  if (lower === "checked-out" || lower === "checked_out") return "Checked-out";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const Bookings = () => {
  // const { user } = useAuth(); // (unused currently)
  const { businessDetails } = useBusiness();

  const [activeTab, setActiveTab] = useState("all");
  const tabs = [
    { id: "all", label: "All", icon: <List size={16} /> },
    { id: "pending", label: "Pending", icon: <Clock size={16} /> },
    { id: "reserved", label: "Reserved", icon: <Check size={16} /> },
    { id: "checked-in", label: "Checked-in", icon: <LogIn size={16} /> },
    { id: "checked-out", label: "Checked-out", icon: <LogOut size={16} /> },
    { id: "canceled", label: "Canceled", icon: <XCircle size={16} /> },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<
    "day" | "week" | "month" | "year" | "all"
  >("all");
  const [selectedMonth, setSelectedMonth] = useState<number | "all">("all");
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );

  const [roomInfoById, setRoomInfoById] = useState<Record<string, string>>({});
  const [guestInfoById, setGuestInfoById] = useState<
    Record<string, { name: string; user_profile?: string }>
  >({});

  // State for checkout success alert
  const [checkoutAlertOpen, setCheckoutAlertOpen] = useState(false);
  const [checkoutGuestName, setCheckoutGuestName] = useState<string>("");

  // State for walk-in booking modal
  const [walkInModalOpen, setWalkInModalOpen] = useState(false);
  const [walkInSuccessOpen, setWalkInSuccessOpen] = useState(false);
  const [walkInGuestName, setWalkInGuestName] = useState<string>("");

  // Fetch room and guest info for all bookings
  useEffect(() => {
    const loadRoomsAndGuests = async () => {
      if (bookings.length === 0) return;

      const uniqueRoomIds = Array.from(
        new Set(
          bookings
            .map((b) => b.room_id)
            .filter(
              (id): id is string => typeof id === "string" && id.length > 0
            )
        )
      ).filter((id) => !roomInfoById[id]);

      const uniqueTouristIds = Array.from(
        new Set(
          bookings
            .map((b) => b.tourist_id)
            .filter(
              (id): id is string => typeof id === "string" && id.length > 0
            )
        )
      ).filter((id) => !guestInfoById[id]);

      const [roomsData, guestsData] = await Promise.all([
        uniqueRoomIds.length > 0 ? fetchRoomNumbersByIds(uniqueRoomIds) : {},
        uniqueTouristIds.length > 0
          ? fetchGuestInfoByIds(uniqueTouristIds)
          : {},
      ]);

      if (Object.keys(roomsData).length > 0) {
        setRoomInfoById((prev) => ({ ...prev, ...roomsData }));
      }
      if (Object.keys(guestsData).length > 0) {
        setGuestInfoById((prev) => ({ ...prev, ...guestsData }));
      }
    };

    loadRoomsAndGuests();
  }, [bookings, roomInfoById, guestInfoById]);

  // Fetch bookings for selected business
  useEffect(() => {
    const load = async () => {
      if (!businessDetails?.id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchBookingsByBusinessId(businessDetails.id);
        // Ensure numeric & string fields present with defaults
        setBookings(
          data.map((b) => ({
            ...b,
            pax: b.pax ?? 0,
            total_price: b.total_price ?? 0,
            balance: b.balance ?? 0,
            // Cast normalized status back into Booking union where possible
            booking_status: normalizeStatus(
              b.booking_status
            ) as Booking["booking_status"],
            trip_purpose: b.trip_purpose || "—",
          }))
        );

        console.log(data.map((b) => ({ id: b.id, status: b.booking_status })));
      } catch (e: any) {
        console.error("Failed to load bookings", e);
        setError(e?.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [businessDetails?.id]);

  // Updated Date Format to separate Date and Time
  const getDateTimeParts = (dateString: string | Date) => {
    const dateObj = new Date(dateString);
    return {
      date: dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: dateObj.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  // Extract available years from bookingData
  const years = useMemo(
    () =>
      Array.from(
        new Set(
          bookings
            .filter((r) => r.check_in_date)
            .map((row) => new Date(row.check_in_date as any).getFullYear())
        )
      ).sort((a, b) => b - a),
    [bookings]
  );

  const handleStatusChange = async (id: string, status: string) => {
    try {
      // Get booking info before update for notification
      const bookingToUpdate = bookings.find((b) => b.id === id);
      const guestName = bookingToUpdate?.tourist_id
        ? guestInfoById[bookingToUpdate.tourist_id]?.name || "Guest"
        : "Guest";

      // Optimistic update
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id
            ? { ...b, booking_status: status as Booking["booking_status"] }
            : b
        )
      );
      await updateBookingStatus(id, status);

      // Show checkout success alert when status changes to "Checked-Out"
      if (status === "Checked-Out") {
        setCheckoutGuestName(guestName);
        setCheckoutAlertOpen(true);
      }
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  const handleViewBooking = (id?: string | null) => {
    if (!id) return;
    setSelectedBookingId(id);
    setDetailsOpen(true);
  };

  const handleWalkInSuccess = async (guestName: string) => {
    setWalkInGuestName(guestName);
    setWalkInSuccessOpen(true);
    // Reload bookings to show the new walk-in booking
    if (businessDetails?.id) {
      try {
        const data = await fetchBookingsByBusinessId(businessDetails.id);
        setBookings(
          data.map((b) => ({
            ...b,
            pax: b.pax ?? 0,
            total_price: b.total_price ?? 0,
            balance: b.balance ?? 0,
            booking_status: normalizeStatus(
              b.booking_status
            ) as Booking["booking_status"],
            trip_purpose: b.trip_purpose || "—",
          }))
        );
      } catch (e) {
        console.error("Failed to reload bookings after walk-in", e);
      }
    }
  };

  const selectedBooking = useMemo(
    () => bookings.find((b) => b.id === selectedBookingId) || null,
    [bookings, selectedBookingId]
  );

  // Filtering Logic
  const filterByDateAndSearch = (data: Booking[]) => {
    const today = new Date();

    return data.filter((row) => {
      if (!row.check_in_date) return false; // skip invalid
      const date = new Date(row.check_in_date as any);

      // Search filter
      const matchesSearch =
        (row.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (row.trip_purpose || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (row.booking_status || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        String(row.pax ?? "").includes(searchTerm) ||
        String(row.total_price ?? "").includes(searchTerm) ||
        String(row.balance ?? "").includes(searchTerm);

      if (!matchesSearch) return false;

      // Month/Year filters
      if (selectedMonth !== "all" && date.getMonth() !== selectedMonth) {
        return false;
      }
      if (selectedYear !== "all" && date.getFullYear() !== selectedYear) {
        return false;
      }

      // Range filters
      switch (filter) {
        case "day":
          return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
          );
        case "week": {
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          return date >= startOfWeek && date <= endOfWeek;
        }
        case "month":
          return (
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
          );
        case "year":
          return date.getFullYear() === today.getFullYear();
        default:
          return true;
      }
    });
  };

  // (removed unused calcPercentage)

  const filteredData = useMemo(
    () =>
      filterByDateAndSearch(
        activeTab === "all"
          ? bookings
          : bookings.filter(
              (b) =>
                normalizeStatus(b.booking_status).toLowerCase() ===
                activeTab.toLowerCase()
            )
      ),
    [activeTab, bookings, searchTerm, filter, selectedMonth, selectedYear]
  );

  // Define columns for the custom Table component
  const columns: TableColumn<BookingRow>[] = useMemo(
    () => [
      {
        id: "guest",
        label: "Guest",
        minWidth: 180,
        render: (row) => {
          const info = guestInfoById[row.tourist_id as string];
          if (!info) return "—";

          const nameParts = info.name.split(" ");
          const guest: GuestInfo = {
            firstName: nameParts[0] || "",
            lastName: nameParts[nameParts.length - 1] || "",
            userProfile: info.user_profile,
          };

          return <GuestAvatar guest={guest} size={32} />;
        },
      },
      {
        id: "room",
        label: "Room",
        minWidth: 120,
        render: (row) => {
          const roomNumber = roomInfoById[row.room_id as string];

          return roomNumber || "—";
        },
      },
      {
        id: "pax",
        label: "Pax",
        minWidth: 60,
        align: "center",
      },
      {
        id: "trip_purpose",
        label: "Purpose",
        minWidth: 120,
      },
      // UPDATED: Check-in Column with Time
      {
        id: "check_in_date",
        label: "Check-in",
        minWidth: 160,
        render: (row) => {
          if (!row.check_in_date) return "—";
          const { date, time } = getDateTimeParts(row.check_in_date);
          return (
            <Box>
              <JoyTypography level="body-sm">{date}</JoyTypography>
              <JoyTypography level="body-xs" sx={{ color: "text.tertiary" }}>
                {time}
              </JoyTypography>
            </Box>
          );
        },
      },
      // UPDATED: Check-out Column with Time
      {
        id: "check_out_date",
        label: "Check-out",
        minWidth: 160,
        render: (row) => {
          if (!row.check_out_date) return "—";
          const { date, time } = getDateTimeParts(row.check_out_date);
          return (
            <Box>
              <JoyTypography level="body-sm">{date}</JoyTypography>
              <JoyTypography level="body-xs" sx={{ color: "text.tertiary" }}>
                {time}
              </JoyTypography>
            </Box>
          );
        },
      },
      {
        id: "total_price",
        label: "Total Price",
        minWidth: 120,
        align: "right",
        format: (value: number) => `₱${(value ?? 0).toLocaleString()}`,
      },
      {
        id: "balance",
        label: "Balance",
        minWidth: 120,
        align: "right",
        format: (value: number) => `₱${(value ?? 0).toLocaleString()}`,
      },
      {
        id: "booking_status",
        label: "Status",
        minWidth: 120,
        render: (row) => (
          <StatusChip status={normalizeStatus(row.booking_status)} />
        ),
      },
    ],
    [guestInfoById, roomInfoById, handleStatusChange, handleViewBooking]
  );

  return (
    <PageContainer>
      {/* Reservations */}
      <Container gap="0" padding="0" elevation={3}>
        <Container
          direction="row"
          justify="space-between"
          align="center"
          padding="16px 16px 0 16px"
        >
          <Typography.Header>Manage Reservation</Typography.Header>
          <Button
            colorScheme="primary"
            size="md"
            endDecorator={<UserPlus size={18} />}
            onClick={() => setWalkInModalOpen(true)}
          >
            Walk-In Booking
          </Button>
        </Container>

        {/* Search + Filters */}
        <Container
          padding="16px 16px 0 16px"
          direction="row"
          justify="space-between"
          align="center"
          gap="16px"
          style={{ flexWrap: "wrap" }}
        >
          <Input
            startDecorator={<Search />}
            placeholder="Search Reservations"
            size="lg"
            sx={{ flex: 1 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Range Filter */}
          <Select
            size="lg"
            defaultValue="all"
            onChange={(_, val) => setFilter(val as typeof filter)}
          >
            <Option value="all">All</Option>
            <Option value="day">Today</Option>
            <Option value="week">This Week</Option>
            <Option value="month">This Month</Option>
            <Option value="year">This Year</Option>
          </Select>

          {/* Month Filter */}
          <Select
            size="lg"
            defaultValue="all"
            onChange={(_, val) => setSelectedMonth(val as number | "all")}
          >
            <Option value="all">All Months</Option>
            {Array.from({ length: 12 }).map((_, i) => (
              <Option key={i} value={i}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </Option>
            ))}
          </Select>

          {/* Year Filter */}
          <Select
            size="lg"
            defaultValue="all"
            onChange={(_, val) => setSelectedYear(val as number | "all")}
          >
            <Option value="all">All Years</Option>
            {years.map((year) => (
              <Option key={year} value={year}>
                {year}
              </Option>
            ))}
          </Select>
        </Container>

        {/* Tabs */}
        <DynamicTab
          tabs={tabs}
          activeTabId={activeTab}
          onChange={(tabId) => setActiveTab(String(tabId))}
        />
      </Container>

      {/* Booking Table */}
      {error ? (
        <NoDataFound
          icon="database"
          title="Error Loading Bookings"
          message={error}
          size="medium"
        />
      ) : (
        <Table
          columns={columns}
          data={filteredData}
          rowsPerPage={10}
          loading={loading}
          emptyMessage={
            searchTerm.trim()
              ? `No bookings match "${searchTerm}". Try a different search term.`
              : "No bookings found."
          }
          rowKey="id"
          stickyHeader={true}
          maxHeight="600px"
          onRowClick={(row) => handleViewBooking(row.id)}
        />
      )}

      <BookingDetails
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        bookingId={selectedBookingId}
        booking={selectedBooking}
        onStatusChange={handleStatusChange}
      />

      {/* Checkout Success Alert */}
      <Alert
        open={checkoutAlertOpen}
        onClose={() => setCheckoutAlertOpen(false)}
        type="success"
        title="Booking Completed"
        message={`${checkoutGuestName} has been successfully checked out. A notification has been sent to the tourist thanking them for their stay.`}
        confirmText="OK"
        showCancel={false}
      />

      {/* Walk-In Booking Modal */}
      <WalkInBookingModal
        open={walkInModalOpen}
        onClose={() => setWalkInModalOpen(false)}
        businessId={businessDetails?.id || ""}
        onSuccess={handleWalkInSuccess}
      />

      {/* Walk-In Success Alert */}
      <Alert
        open={walkInSuccessOpen}
        onClose={() => setWalkInSuccessOpen(false)}
        type="success"
        title="Walk-In Booking Created"
        message={`Walk-in booking for ${walkInGuestName} has been successfully created.`}
        confirmText="OK"
        showCancel={false}
      />
    </PageContainer>
  );
};

export default Bookings;
