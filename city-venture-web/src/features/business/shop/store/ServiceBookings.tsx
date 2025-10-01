import { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Button,
  Stack,
  Box,
  Table,
  Sheet,
  CircularProgress,
  Snackbar,
  Select,
  Option,
  Input,
  Tabs,
  TabList,
  Tab,
} from "@mui/joy";
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiSearch,
} from "react-icons/fi";
import PageContainer from "@/src/components/PageContainer";
import { useBusiness } from "@/src/context/BusinessContext";
import * as ServiceApi from "@/src/services/ServiceApi";
import type { ServiceBooking } from "@/src/types/Service";

export default function ServiceBookings() {
  const { businessDetails } = useBusiness();
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!businessDetails?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await ServiceApi.fetchServiceBookingsByBusinessId(businessDetails.id);
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load bookings.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [businessDetails?.id]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      await ServiceApi.updateServiceBooking(bookingId, {
        status: newStatus as "pending" | "confirmed" | "completed" | "cancelled",
      });
      setSuccess("Booking status updated successfully!");
      await fetchBookings();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error updating booking status:", err);
      setError("Failed to update booking status.");
      setTimeout(() => setError(null), 5000);
    }
  };

  // Format date
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time
  const formatTime = (timeString: string | undefined): string => {
    if (!timeString) return "—";
    return timeString;
  };

  // Format price
  const formatPrice = (price: number | string | undefined): string => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return (numPrice || 0).toFixed(2);
  };

  const getStatusIcon = (status: string | undefined) => {
    if (!status) return null;
    if (status === "confirmed") return <FiCheckCircle />;
    if (status === "completed") return <FiCheckCircle />;
    if (status === "pending") return <FiClock />;
    if (status === "cancelled") return <FiXCircle />;
    return null;
  };

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus = selectedStatus === "all" || booking.status === selectedStatus;
    const matchesSearch =
      searchQuery === "" ||
      booking.service?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.user_email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Count bookings by status
  const statusCounts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  if (!businessDetails) {
    return (
      <PageContainer>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography level="body-lg" color="neutral">
            Please select a business to manage service bookings.
          </Typography>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
        >
          <Box>
            <Typography level="h2" fontWeight={700}>
              Service Bookings
            </Typography>
            <Typography level="body-sm" color="neutral">
              Manage customer service bookings and appointments
            </Typography>
          </Box>
        </Stack>

        {/* Status Tabs */}
        <Tabs
          value={selectedStatus}
          onChange={(_, value) => setSelectedStatus(value as string)}
        >
          <TabList>
            <Tab value="all">All ({statusCounts.all})</Tab>
            <Tab value="pending">Pending ({statusCounts.pending})</Tab>
            <Tab value="confirmed">Confirmed ({statusCounts.confirmed})</Tab>
            <Tab value="completed">Completed ({statusCounts.completed})</Tab>
            <Tab value="cancelled">Cancelled ({statusCounts.cancelled})</Tab>
          </TabList>
        </Tabs>

        {/* Search */}
        <Input
          placeholder="Search by service, customer name, or email..."
          startDecorator={<FiSearch />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ maxWidth: 400 }}
        />

        {/* Loading State */}
        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {/* Bookings Table */}
        {!loading && Array.isArray(filteredBookings) && filteredBookings.length > 0 && (
          <Sheet variant="outlined" sx={{ borderRadius: "sm", overflow: "hidden" }}>
            <Table>
              <thead>
                <tr>
                  <th style={{ width: "20%" }}>Service</th>
                  <th style={{ width: "15%" }}>Customer</th>
                  <th style={{ width: "12%" }}>Date</th>
                  <th style={{ width: "10%" }}>Time</th>
                  <th style={{ width: "10%" }}>Duration</th>
                  <th style={{ width: "8%" }}>People</th>
                  <th style={{ width: "10%" }}>Price</th>
                  <th style={{ width: "15%" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <Stack spacing={0.5}>
                        <Typography level="body-sm" fontWeight={600}>
                          {booking.service?.name || "Unknown Service"}
                        </Typography>
                        {booking.special_requests && (
                          <Typography level="body-xs" color="neutral" noWrap>
                            Note: {booking.special_requests}
                          </Typography>
                        )}
                      </Stack>
                    </td>
                    <td>
                      <Stack spacing={0.5}>
                        <Typography level="body-sm" fontWeight={600}>
                          {booking.user_name || "—"}
                        </Typography>
                        <Typography level="body-xs" color="neutral">
                          {booking.user_email || "—"}
                        </Typography>
                      </Stack>
                    </td>
                    <td>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <FiCalendar size={14} />
                        <Typography level="body-sm">
                          {formatDate(booking.booking_date)}
                        </Typography>
                      </Stack>
                    </td>
                    <td>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <FiClock size={14} />
                        <Typography level="body-sm">
                          {formatTime(booking.booking_time)}
                        </Typography>
                      </Stack>
                    </td>
                    <td>
                      <Typography level="body-sm">
                        {booking.duration_minutes ? `${booking.duration_minutes} min` : "—"}
                      </Typography>
                    </td>
                    <td>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <FiUser size={14} />
                        <Typography level="body-sm">
                          {booking.number_of_people || "—"}
                        </Typography>
                      </Stack>
                    </td>
                    <td>
                      <Typography level="body-sm" fontWeight={600}>
                        ₱{formatPrice(booking.total_price)}
                      </Typography>
                    </td>
                    <td>
                      <Select
                        value={booking.status}
                        onChange={(_, value) => {
                          if (value) handleStatusChange(booking.id, value);
                        }}
                        size="sm"
                        indicator={getStatusIcon(booking.status)}
                        sx={{ minWidth: 120 }}
                      >
                        <Option value="pending">Pending</Option>
                        <Option value="confirmed">Confirmed</Option>
                        <Option value="completed">Completed</Option>
                        <Option value="cancelled">Cancelled</Option>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Sheet>
        )}

        {/* Empty State - No Bookings at All */}
        {!loading && Array.isArray(bookings) && bookings.length === 0 && (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              px: 2,
            }}
          >
            <FiCalendar size={64} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Typography level="h4" mb={1}>
              No bookings yet
            </Typography>
            <Typography level="body-sm" color="neutral" mb={3}>
              Service bookings will appear here when customers make appointments
            </Typography>
          </Box>
        )}

        {/* Empty State - No Bookings in Filter */}
        {!loading && bookings.length > 0 && filteredBookings.length === 0 && (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              px: 2,
            }}
          >
            <FiSearch size={64} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Typography level="h4" mb={1}>
              No bookings found
            </Typography>
            <Typography level="body-sm" color="neutral" mb={3}>
              Try adjusting your filters or search query
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                onClick={() => {
                  setSelectedStatus("all");
                  setSearchQuery("");
                }}
              >
                Clear Filters
              </Button>
            </Stack>
          </Box>
        )}
      </Stack>

      {/* Toast Notifications */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        color="success"
        variant="soft"
        startDecorator={<FiCheckCircle />}
      >
        {success}
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        color="danger"
        variant="soft"
        startDecorator={<FiAlertCircle />}
      >
        {error}
      </Snackbar>
    </PageContainer>
  );
}
