import React, { useEffect, useState, useMemo } from "react";
// Avatar cell for guest info
import type { FC } from "react";
interface GuestInfo {
  name: string;
  user_profile?: string;
}
interface GuestAvatarCellProps {
  info?: GuestInfo;
}
const GuestAvatarCell: FC<GuestAvatarCellProps> = ({ info }) => {
  const [error, setError] = useState(false);
  // Normalize image URL
  const avatarSrc = useMemo(() => {
    const raw = (info?.user_profile ?? "").toString().trim();
    if (!raw) return undefined;
    if (/^(?:https?:|data:)/i.test(raw)) return raw;
    const base = (api || "").replace(/\/?api\/?$/, "").replace(/\/$/, "");
    const path = raw.startsWith("/") ? raw : `/${raw}`;
    return `${base}${path}`;
  }, [info?.user_profile]);
  // Initials fallback
  const initials = useMemo(() => {
    if (!info?.name) return "?";
    const parts = info.name.split(" ").filter(Boolean);
    return parts.map((p) => p[0]).join("").toUpperCase() || "?";
  }, [info?.name]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {avatarSrc && !error ? (
        <img
          width={30}
          height={30}
          style={{ borderRadius: "50%", objectFit: "cover" }}
          src={avatarSrc}
          alt={info?.name || "Guest"}
          onError={() => setError(true)}
        />
      ) : (
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "#eee",
            color: "#888",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          {initials}
        </div>
      )}
      <div>{info?.name || "—"}</div>
    </div>
  );
};
import Text from "@/src/components/Text";
import PageContainer from "@/src/components/PageContainer";
import { colors } from "@/src/utils/Colors";
import { Search, Eye, Check, XCircle } from "lucide-react";
import BookingDetails from "./components/BookingDetails";
import {
  Input,
  Button,
  CircularProgress,
} from "@mui/joy";
import Container from "@/src/components/Container";
import Tabs from "./components/Tabs";
import { Select, Option } from "@mui/joy";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Chip, TableHead } from "@mui/material";
import { useBusiness } from "@/src/context/BusinessContext";
import {
  fetchBookingsByBusinessId,
  fetchTourist,
  updateBookingStatus,
} from "@/src/services/BookingService";
import { fetchUserData } from "@/src/services/AuthService";
import api from "@/src/services/api";
import type { Booking } from "@/src/types/Booking";

// Booking columns
interface Column {
  id:
    | "guest"
    | "pax"
    | "trip_purpose"
    | "check_in_date"
    | "check_out_date"
    | "total_price"
    | "balance"
    | "booking_status"
    | "actions";
  label: string;
  minWidth?: number;
  align?: "center" | "right" | "left";
  format?: (value: number) => string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Pending":
      return "default";
    case "Reserved":
      return "success";
    case "Checked-in":
      return "warning";
    case "Checked-out":
      return "info";
    case "Canceled":
      return "error";
    default:
      return "primary"; // fallback
  }
};

const columns: readonly Column[] = [
  { id: "guest", label: "Guest", minWidth: 120 },
  { id: "pax", label: "Pax", minWidth: 50, align: "center" },
  { id: "trip_purpose", label: "Purpose", minWidth: 120 },
  { id: "check_in_date", label: "Check-in", minWidth: 120 },
  { id: "check_out_date", label: "Check-out", minWidth: 120 },
  {
    id: "total_price",
    label: "Total Price",
    minWidth: 120,
    align: "right",
    format: (value: number) => `₱${value.toLocaleString()}`,
  },
  {
    id: "balance",
    label: "Balance",
    minWidth: 120,
    align: "right",
    format: (value: number) => `₱${value.toLocaleString()}`,
  },
  { id: "booking_status", label: "Status", minWidth: 120 },
  { id: "actions", label: "Actions", minWidth: 150, align: "center" },
];

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
  const [activeTab, setActiveTab] = useState<
    "All" | "Pending" | "Reserved" | "Checked-in" | "Checked-out" | "Canceled"
  >("All");

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
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

  const bookingCount = bookings.length;
  const pendingCount = useMemo(
    () =>
      bookings.filter((b) => normalizeStatus(b.booking_status) === "Pending")
        .length,
    [bookings]
  );
  const reservedCount = useMemo(
    () =>
      bookings.filter((b) => normalizeStatus(b.booking_status) === "Reserved")
        .length,
    [bookings]
  );
  const checkedInCount = useMemo(
    () =>
      bookings.filter((b) => normalizeStatus(b.booking_status) === "Checked-in")
        .length,
    [bookings]
  );
  const checkedOutCount = useMemo(
    () =>
      bookings.filter(
        (b) => normalizeStatus(b.booking_status) === "Checked-out"
      ).length,
    [bookings]
  );
  const canceledCount = useMemo(
    () =>
      bookings.filter((b) => normalizeStatus(b.booking_status) === "Canceled")
        .length,
    [bookings]
  );
  // Prefetch guest info (name and user_profile) for all visible bookings
  const [guestInfoById, setGuestInfoById] = useState<Record<string, { name: string; user_profile?: string }>>({});
  useEffect(() => {
    const loadGuests = async () => {
      const uniqueIds = Array.from(
        new Set(
          bookings
            .map((b) => b.tourist_id)
            .filter((id): id is string => typeof id === "string" && id.length > 0)
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
              name: [tourist?.first_name, tourist?.last_name].filter(Boolean).join(" ") || "—",
              user_profile: userData?.user_profile,
            };
          } catch {
            return { name: "—" };
          }
        })
      );
      const mapUpdates: Record<string, { name: string; user_profile?: string }> = {};
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
      } catch (e: any) {
        console.error("Failed to load bookings", e);
        setError(e?.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [businessDetails?.id]);

  // No longer using dummy effect counters (computed via useMemo above)

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

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

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
      // Optionally refetch or revert (for now just log)
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
        activeTab === "All"
          ? bookings
          : bookings.filter(
              (b) => normalizeStatus(b.booking_status) === activeTab
            )
      ),
    [activeTab, bookings, searchTerm, filter, selectedMonth, selectedYear]
  );

  return (
    <>
      <PageContainer>
        {/* Reservations */}
        <Container gap="0" padding="0" elevation={3}>
          <Container
            direction="row"
            justify="space-between"
            align="center"
            padding="16px 16px 0 16px"
          >
            <Text variant="header-title">Manage Reservation</Text>
          </Container>

          {/* Search + Filters */}
          <Container
            padding="16px 16px 0 16px"
            direction="row"
            justify="space-between"
            align="center"
            gap="16px"
          >
            <Input
              startDecorator={<Search />}
              placeholder="Search Reservations"
              size="lg"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // 👈 bind state
            />

            {/* Range Filter */}
            <Select
              size="lg"
              defaultValue="all"
              onChange={(_, val) => setFilter(val as typeof filter)}
              sx={{ minWidth: 160 }}
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
              sx={{ minWidth: 160 }}
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
              sx={{ minWidth: 140 }}
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
          <Tabs active={activeTab} onChange={setActiveTab} />

          {/* Booking Table */}
          <Container>
            <Paper
              elevation={1}
              sx={{ width: "100%", overflow: "hidden", borderRadius: 2 }}
            >
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table size="small" stickyHeader aria-label="booking table">
                  <TableHead>
                    <TableRow>
                      {columns.map((column) => (
                        <TableCell
                          size="medium"
                          key={column.id}
                          align={column.align}
                          style={{
                            minWidth: column.minWidth,
                            backgroundColor: colors.primary,
                            color: colors.white,
                            fontFamily: "poppins",
                            fontWeight: 600,
                          }}
                        >
                          {column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading && (
                      <TableRow>
                        <TableCell colSpan={columns.length} align="center">
                          <CircularProgress size="sm" /> Loading bookings...
                        </TableCell>
                      </TableRow>
                    )}
                    {!loading && error && (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          align="center"
                          sx={{ color: "red" }}
                        >
                          {error}
                        </TableCell>
                      </TableRow>
                    )}
                    {!loading && !error && filteredData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={columns.length} align="center">
                          No bookings found.
                        </TableCell>
                      </TableRow>
                    )}
                    {!loading &&
                      !error &&
                      filteredData
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((row, index) => (
                          <TableRow
                            role="checkbox"
                            tabIndex={-1}
                            key={row.id}
                            sx={{
                              backgroundColor:
                                index % 2 === 0 ? "#fff" : "#D3D3D3",
                            }}
                          >
                            <TableCell>
                              <GuestAvatarCell info={guestInfoById[row.tourist_id as string]} />
                            </TableCell>
                            <TableCell align="center">{row.pax}</TableCell>
                            <TableCell>{row.trip_purpose}</TableCell>
                            <TableCell>
                              {row.check_in_date
                                ? formatDate(String(row.check_in_date))
                                : "—"}
                            </TableCell>
                            <TableCell>
                              {row.check_out_date
                                ? formatDate(String(row.check_out_date))
                                : "—"}
                            </TableCell>
                            <TableCell align="right">
                              ₱{(row.total_price ?? 0).toLocaleString()}
                            </TableCell>
                            <TableCell align="right">
                              ₱{(row.balance ?? 0).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Chip
                                color={getStatusColor(
                                  normalizeStatus(row.booking_status)
                                )}
                                label={normalizeStatus(row.booking_status)}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Button
                                size="sm"
                                variant="outlined"
                                color="neutral"
                                startDecorator={<Eye size={16} />}
                                sx={{ mr: 1 }}
                                onClick={() => handleViewBooking(row.id)}
                              >
                                View
                              </Button>
                              {normalizeStatus(row.booking_status) ===
                                "Pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="solid"
                                    color="primary"
                                    sx={{ mr: 1 }}
                                    startDecorator={<Check size={16} />}
                                    onClick={() =>
                                      row.id &&
                                      handleStatusChange(row.id, "Reserved")
                                    }
                                  >
                                    Confirm
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outlined"
                                    color="danger"
                                    startDecorator={<XCircle size={16} />}
                                    onClick={() =>
                                      row.id &&
                                      handleStatusChange(row.id, "Canceled")
                                    }
                                  >
                                    Cancel
                                  </Button>
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={filteredData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          </Container>
        </Container>
      </PageContainer>
      <BookingDetails
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        bookingId={selectedBookingId}
        booking={selectedBooking}
        onStatusChange={handleStatusChange}
      />
    </>
  );
};

export default Bookings;
