import React, { useEffect, useState, useMemo } from "react";
import Typography from "@/src/components/Typography";
import NoDataFound from "@/src/components/NoDataFound";
import PageContainer from "@/src/components/PageContainer";
import {
  Search,
  Eye,
  Check,
  XCircle,
  List,
  Clock,
  LogIn,
  LogOut,
} from "lucide-react";
import BookingDetails from "./components/BookingDetails";
import { Input, Box } from "@mui/joy";
import Container from "@/src/components/Container";
import Button from "@/src/components/Button";
import { Select, Option } from "@mui/joy";
import { useBusiness } from "@/src/context/BusinessContext";
import {
  fetchBookingsByBusinessId,
  fetchTourist,
  updateBookingStatus,
} from "@/src/services/BookingService";
import { fetchUserData } from "@/src/services/auth/AuthService";
import api from "@/src/services/api";
import type { Booking } from "@/src/types/Booking";
import DynamicTab from "@/src/components/ui/DynamicTab";
import Table, {
  type TableColumn,
  GuestAvatar,
  StatusChip,
  type GuestInfo,
} from "@/src/components/ui/Table";

// Extend Booking type to include guest info
interface BookingRow extends Booking {
  guest?: GuestInfo;
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

  // removed unused booking counters to satisfy lint
  // Prefetch guest info (name and user_profile) for all visible bookings
  const [guestInfoById, setGuestInfoById] = useState<
    Record<string, { name: string; user_profile?: string }>
  >({});
  useEffect(() => {
    const loadGuests = async () => {
      const uniqueIds = Array.from(
        new Set(
          bookings
            .map((b) => b.tourist_id)
            .filter(
              (id): id is string => typeof id === "string" && id.length > 0
            )
        )
      );
      if (uniqueIds.length === 0) return;
      // Avoid refetching already known info
      const toFetch = uniqueIds.filter((id) => !guestInfoById[id]);
      if (toFetch.length === 0) return;
      const results = await Promise.allSettled(
        toFetch.map(async (id) => {
          try {
            const tourist = await fetchTourist(id);
            // fetchUserData expects user_id, which is tourist.user_id
            let userData = undefined;
            if (tourist?.user_id) {
              userData = await fetchUserData(tourist.user_id);
            }
            return {
              name:
                [tourist?.first_name, tourist?.last_name]
                  .filter(Boolean)
                  .join(" ") || "—",
              user_profile: userData?.user_profile,
            };
          } catch {
            return { name: "—" };
          }
        })
      );
      const mapUpdates: Record<
        string,
        { name: string; user_profile?: string }
      > = {};
      results.forEach((res, idx) => {
        const id = toFetch[idx];
        if (res.status === "fulfilled" && res.value) {
          mapUpdates[id] = res.value;
        } else {
          mapUpdates[id] = { name: "—" };
        }
      });
      setGuestInfoById((prev) => ({ ...prev, ...mapUpdates }));
    };
    loadGuests();
  }, [bookings]);

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

  // format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
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
      // Optimistic update
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id
            ? { ...b, booking_status: status as Booking["booking_status"] }
            : b
        )
      );
      await updateBookingStatus(id, status);
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  const handleViewBooking = (id?: string | null) => {
    if (!id) return;
    setSelectedBookingId(id);
    setDetailsOpen(true);
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
      {
        id: "check_in_date",
        label: "Check-in",
        minWidth: 140,
        format: (value: string) => (value ? formatDate(String(value)) : "—"),
      },
      {
        id: "check_out_date",
        label: "Check-out",
        minWidth: 140,
        format: (value: string) => (value ? formatDate(String(value)) : "—"),
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
    [guestInfoById, formatDate, handleStatusChange, handleViewBooking]
  );

  return (
    <PageContainer >
      {/* Reservations */}
      <Container gap="0" padding="0" elevation={3}>
        <Container
          direction="row"
          justify="space-between"
          align="center"
          padding="16px 16px 0 16px"
        >
          <Typography.Header>Manage Reservation</Typography.Header>
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
            onChange={(e) => setSearchTerm(e.target.value)} // 👈 bind state
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
    </PageContainer>
  );
};

export default Bookings;
