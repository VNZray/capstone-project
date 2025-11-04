import { useState, useEffect, useMemo } from "react";
import ResponsiveText from "@/src/components/ResponsiveText";
import PageContainer from "@/src/components/PageContainer";
import Container from "@/src/components/Container";
import { useBusiness } from "@/src/context/BusinessContext";
import { Box, Select, Option, Grid } from "@mui/joy";
import StatCard from "./components/StatCard";
import RevenueCard from "./components/RevenueCard";
import BookingsList from "./components/BookingsList";
import PaymentsList from "./components/PaymentsList";
import RoomStatusCard from "./components/RoomStatusCard";
import RoomRankingCard from "./components/RoomRankingCard";
import OccupancyPieChart from "./components/OccupancyPieChart";
import NoDataFound from "@/src/components/NoDataFound";
import TouristStatsCard from "./components/TouristStatsCard";
import {
  DollarSign,
  Eye,
  Calendar,
  TrendingUp,
  BarChart3,
  Hotel,
  Award,
  CreditCard,
  Users,
} from "lucide-react";
import { getData } from "@/src/services/Service";
import { fetchBookingsByBusinessId } from "@/src/services/BookingService";
import { fetchPaymentsByBusinessId } from "@/src/services/PaymentService";
import { colors } from "@/src/utils/Colors";
import type { Room } from "@/src/types/Business";
import type { Booking } from "@/src/types/Booking";

interface DashboardStats {
  profileViews: number;
  profileViewsChange: number;
  totalBookings: number;
  totalBookingsChange: number;
  monthlyRevenue: number;
  monthlyRevenueChange: number;
  annualRevenue: number;
  annualRevenueChange: number;
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  maintenanceRooms: number;
  occupancyRate: number;
  averageBookingValue: number;
}

const Dashboard = () => {
  const { businessDetails, loading: businessLoading } = useBusiness();
  const [filterPeriod, setFilterPeriod] = useState<"month" | "year" | "all">(
    "month"
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      if (!businessDetails?.id) return;

      setLoading(true);
      try {
        const [roomsData, bookingsData, paymentsData] = await Promise.all([
          getData("room"),
          fetchBookingsByBusinessId(businessDetails.id),
          fetchPaymentsByBusinessId(String(businessDetails.id)),
        ]);

        const filteredRooms = Array.isArray(roomsData)
          ? roomsData.filter((room) => room.business_id === businessDetails.id)
          : [];

        setRooms(filteredRooms);
        setBookings(bookingsData || []);
        setPayments(paymentsData || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [businessDetails?.id]);

  // Calculate statistics based on filter
  const stats: DashboardStats = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();

    // Filter bookings based on selected period
    const filteredBookings = bookings.filter((booking) => {
      const bookingDate = new Date(
        booking.created_at || booking.check_in_date || ""
      );

      if (filterPeriod === "month") {
        return (
          bookingDate.getMonth() === selectedMonth &&
          bookingDate.getFullYear() === selectedYear
        );
      } else if (filterPeriod === "year") {
        return bookingDate.getFullYear() === selectedYear;
      }
      return true; // all
    });

    // Filter payments based on selected period
    const filteredPayments = payments.filter((payment) => {
      const paymentDate = new Date(payment.created_at || "");

      if (filterPeriod === "month") {
        return (
          paymentDate.getMonth() === selectedMonth &&
          paymentDate.getFullYear() === selectedYear
        );
      } else if (filterPeriod === "year") {
        return paymentDate.getFullYear() === selectedYear;
      }
      return true; // all
    });

    // Calculate revenue
    const currentRevenue = filteredPayments.reduce(
      (sum, payment) => sum + (Number(payment.amount) || 0),
      0
    );

    // Calculate previous period for comparison
    let previousRevenue = 0;
    let previousBookingsCount = 0;

    if (filterPeriod === "month") {
      const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
      const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;

      previousRevenue = payments
        .filter((p) => {
          const d = new Date(p.created_at || "");
          return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
        })
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      previousBookingsCount = bookings.filter((b) => {
        const d = new Date(b.created_at || b.check_in_date || "");
        return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
      }).length;
    } else if (filterPeriod === "year") {
      const prevYear = selectedYear - 1;

      previousRevenue = payments
        .filter((p) => new Date(p.created_at || "").getFullYear() === prevYear)
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      previousBookingsCount = bookings.filter(
        (b) =>
          new Date(b.created_at || b.check_in_date || "").getFullYear() ===
          prevYear
      ).length;
    }

    // Calculate changes
    const revenueChange =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    const bookingsChange =
      previousBookingsCount > 0
        ? ((filteredBookings.length - previousBookingsCount) /
            previousBookingsCount) *
          100
        : 0;

    // Room statistics
    const availableRooms = rooms.filter((r) => r.status === "Available").length;
    const occupiedRooms = rooms.filter((r) => r.status === "Occupied").length;
    const maintenanceRooms = rooms.filter(
      (r) => r.status === "Maintenance"
    ).length;
    const occupancyRate =
      rooms.length > 0 ? (occupiedRooms / rooms.length) * 100 : 0;

    // Average booking value
    const averageBookingValue =
      filteredBookings.length > 0
        ? filteredBookings.reduce(
            (sum, b) => sum + (Number(b.total_price) || 0),
            0
          ) / filteredBookings.length
        : 0;

    // Mock profile views (would come from analytics API)
    const profileViews = Math.floor(Math.random() * 5000) + 1000;

    return {
      profileViews,
      profileViewsChange: Math.floor(Math.random() * 40) - 10,
      totalBookings: filteredBookings.length,
      totalBookingsChange: bookingsChange,
      monthlyRevenue: filterPeriod === "month" ? currentRevenue : 0,
      monthlyRevenueChange: revenueChange,
      annualRevenue:
        filterPeriod === "year"
          ? currentRevenue
          : payments
              .filter(
                (p) =>
                  new Date(p.created_at || "").getFullYear() === currentYear
              )
              .reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
      annualRevenueChange: revenueChange,
      totalRooms: rooms.length,
      availableRooms,
      occupiedRooms,
      maintenanceRooms,
      occupancyRate,
      averageBookingValue,
    };
  }, [bookings, payments, rooms, filterPeriod, selectedMonth, selectedYear]);

  // Recent bookings (last 5)
  const recentBookings = useMemo(() => {
    return bookings
      .sort(
        (a, b) =>
          new Date(b.created_at || "").getTime() -
          new Date(a.created_at || "").getTime()
      )
      .slice(0, 5)
      .map((booking) => ({
        id: booking.id || "",
        guestName: `Guest ${booking.tourist_id?.substring(0, 8) || "Unknown"}`,
        roomNumber: booking.room_id?.substring(0, 6) || "N/A",
        checkIn: String(booking.check_in_date || ""),
        checkOut: String(booking.check_out_date || ""),
        status: (booking.booking_status || "Pending") as
          | "Pending"
          | "Reserved"
          | "Checked-in"
          | "Checked-out"
          | "Canceled",
        amount: Number(booking.total_price) || 0,
      }));
  }, [bookings]);

  // Recent payments (last 5)
  const recentPayments = useMemo(() => {
    return payments
      .sort(
        (a, b) =>
          new Date(b.created_at || "").getTime() -
          new Date(a.created_at || "").getTime()
      )
      .slice(0, 5)
      .map((payment) => ({
        id: payment.payment_id || payment.id || "",
        guestName:
          [payment.first_name, payment.last_name].filter(Boolean).join(" ") ||
          "Unknown Guest",
        bookingId: String(payment.booking_id || "N/A"),
        amount: Number(payment.amount) || 0,
        date: payment.created_at || "",
        method: payment.payment_method || "N/A",
        status: (payment.status === "Completed" ||
        payment.status === "completed"
          ? "Completed"
          : "Pending") as "Completed" | "Pending" | "Failed",
      }));
  }, [payments]);

  // Room Rankings by Bookings
  const topRoomsByBookings = useMemo(() => {
    const roomBookingCount: Record<
      string,
      { count: number; revenue: number; roomType: string }
    > = {};

    bookings.forEach((booking) => {
      const roomId = booking.room_id;
      if (!roomId) return;

      if (!roomBookingCount[roomId]) {
        const room = rooms.find((r) => r.id === roomId);
        roomBookingCount[roomId] = {
          count: 0,
          revenue: 0,
          roomType: room?.room_type || "Unknown",
        };
      }

      roomBookingCount[roomId].count++;
      roomBookingCount[roomId].revenue += Number(booking.total_price) || 0;
    });

    return Object.entries(roomBookingCount)
      .map(([roomId, data]) => {
        const room = rooms.find((r) => r.id === roomId);
        return {
          roomNumber: room?.room_number || roomId.substring(0, 6),
          roomType: data.roomType,
          bookings: data.count,
          revenue: data.revenue,
          rank: 0,
        };
      })
      .sort((a, b) => b.bookings - a.bookings)
      .map((room, index) => ({ ...room, rank: index + 1 }))
      .slice(0, 5);
  }, [bookings, rooms]);

  // Room Rankings by Revenue
  const topRoomsByRevenue = useMemo(() => {
    const roomBookingCount: Record<
      string,
      { count: number; revenue: number; roomType: string }
    > = {};

    bookings.forEach((booking) => {
      const roomId = booking.room_id;
      if (!roomId) return;

      if (!roomBookingCount[roomId]) {
        const room = rooms.find((r) => r.id === roomId);
        roomBookingCount[roomId] = {
          count: 0,
          revenue: 0,
          roomType: room?.room_type || "Unknown",
        };
      }

      roomBookingCount[roomId].count++;
      roomBookingCount[roomId].revenue += Number(booking.total_price) || 0;
    });

    return Object.entries(roomBookingCount)
      .map(([roomId, data]) => {
        const room = rooms.find((r) => r.id === roomId);
        return {
          roomNumber: room?.room_number || roomId.substring(0, 6),
          roomType: data.roomType,
          bookings: data.count,
          revenue: data.revenue,
          rank: 0,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .map((room, index) => ({ ...room, rank: index + 1 }))
      .slice(0, 5);
  }, [bookings, rooms]);

  // Tourist Statistics
  const touristStats = useMemo(() => {
    const filtered = bookings.filter((booking) => {
      if (filterPeriod === "all") return true;
      const bookingDate = new Date(booking.created_at || "");

      if (filterPeriod === "month") {
        return (
          bookingDate.getMonth() === selectedMonth &&
          bookingDate.getFullYear() === selectedYear
        );
      }

      return bookingDate.getFullYear() === selectedYear;
    });

    const local = filtered.reduce(
      (sum, b) => sum + (Number(b.local_counts) || 0),
      0
    );
    const domestic = filtered.reduce(
      (sum, b) => sum + (Number(b.domestic_counts) || 0),
      0
    );
    const foreign = filtered.reduce(
      (sum, b) => sum + (Number(b.foreign_counts) || 0),
      0
    );
    const overseas = filtered.reduce(
      (sum, b) => sum + (Number(b.overseas_counts) || 0),
      0
    );

    return {
      local,
      domestic,
      foreign,
      overseas,
      total: local + domestic + foreign + overseas,
    };
  }, [bookings, filterPeriod, selectedMonth, selectedYear]);

  if (businessLoading || loading) {
    return (
      <PageContainer>
        <Container>
          <ResponsiveText type="label-large" weight="bold">
            Loading Dashboard...
          </ResponsiveText>
        </Container>
      </PageContainer>
    );
  }

  if (!businessDetails) {
    return (
      <PageContainer>
        <NoDataFound
          icon="database"
          title="No Business Found"
          message="Please set up your business profile first."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header with Filters */}
      <Container elevation={2} padding="20px" style={{ marginBottom: 20 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <ResponsiveText type="card-title-medium" weight="bold">
            {businessDetails?.business_name} Dashboard
          </ResponsiveText>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Select
              size="lg"
              value={filterPeriod}
              onChange={(_, val) =>
                setFilterPeriod(val as "month" | "year" | "all")
              }
              sx={{ minWidth: 150 }}
            >
              <Option value="month">Monthly</Option>
              <Option value="year">Yearly</Option>
              <Option value="all">All Time</Option>
            </Select>

            {filterPeriod === "month" && (
              <Select
                size="lg"
                value={selectedMonth}
                onChange={(_, val) => setSelectedMonth(val as number)}
                sx={{ minWidth: 150 }}
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <Option key={i} value={i}>
                    {new Date(0, i).toLocaleString("default", {
                      month: "long",
                    })}
                  </Option>
                ))}
              </Select>
            )}

            {(filterPeriod === "month" || filterPeriod === "year") && (
              <Select
                size="lg"
                value={selectedYear}
                onChange={(_, val) => setSelectedYear(val as number)}
                sx={{ minWidth: 120 }}
              >
                {Array.from(
                  { length: 5 },
                  (_, i) => new Date().getFullYear() - i
                ).map((year) => (
                  <Option key={year} value={year}>
                    {year}
                  </Option>
                ))}
              </Select>
            )}
          </Box>
        </Box>
      </Container>

      {/* Key Metrics Grid */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <BarChart3 size={24} style={{ color: colors.primary }} />
        <ResponsiveText type="label-large" weight="bold">
          Key Performance Metrics
        </ResponsiveText>
      </Box>
      <Grid container spacing={2.5} sx={{ mb: 2 }}>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            icon={<Eye size={20} />}
            label="Profile Views"
            value={stats.profileViews.toLocaleString()}
            change={stats.profileViewsChange}
            period={filterPeriod === "month" ? "last month" : "last year"}
            color="primary"
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            icon={<Calendar size={20} />}
            label="Total Bookings"
            value={stats.totalBookings.toLocaleString()}
            change={stats.totalBookingsChange}
            period={filterPeriod === "month" ? "last month" : "last year"}
            color="success"
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            icon={<TrendingUp size={20} />}
            label="Occupancy Rate"
            value={`${stats.occupancyRate.toFixed(1)}%`}
            change={5.2}
            period="last period"
            color="warning"
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            icon={<BarChart3 size={20} />}
            label="Avg. Booking Value"
            value={`₱${stats.averageBookingValue.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}`}
            change={8.3}
            period="last period"
            color="primary"
          />
        </Grid>
      </Grid>

      {/* Revenue Cards */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <DollarSign size={24} style={{ color: colors.success }} />
        <ResponsiveText type="label-large" weight="bold">
          Revenue Overview
        </ResponsiveText>
      </Box>
      <Grid container spacing={2.5} sx={{ mb: 2 }}>
        <Grid xs={12} md={6}>
          <RevenueCard
            title="Monthly Revenue"
            amount={
              filterPeriod === "month"
                ? stats.monthlyRevenue
                : stats.annualRevenue / 12
            }
            change={stats.monthlyRevenueChange}
            period="last month"
            icon={<DollarSign size={20} />}
          />
        </Grid>
        <Grid xs={12} md={6}>
          <RevenueCard
            title="Annual Revenue"
            amount={stats.annualRevenue}
            change={stats.annualRevenueChange}
            period="last year"
            icon={<TrendingUp size={20} />}
          />
        </Grid>
      </Grid>

      {/* Room Status and Statistics */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Hotel size={24} style={{ color: colors.warningLabel }} />
        <ResponsiveText type="label-large" weight="bold">
          Room Management
        </ResponsiveText>
      </Box>
      <Grid container spacing={2.5} sx={{ mb: 2 }}>
        <Grid xs={12} md={4}>
          <OccupancyPieChart
            totalRooms={stats.totalRooms}
            available={stats.availableRooms}
            occupied={stats.occupiedRooms}
            maintenance={stats.maintenanceRooms}
          />
        </Grid>
        <Grid xs={12} md={4}>
          <RoomStatusCard
            totalRooms={stats.totalRooms}
            available={stats.availableRooms}
            occupied={stats.occupiedRooms}
            maintenance={stats.maintenanceRooms}
          />
        </Grid>
        <Grid xs={12} md={4}>
          <BookingsList bookings={recentBookings} title="Recent Bookings" />
        </Grid>
      </Grid>

      {/* Room Rankings */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Award size={24} style={{ color: "#FFD700" }} />
        <ResponsiveText type="label-large" weight="bold">
          Top Performing Rooms
        </ResponsiveText>
      </Box>
      <Grid container spacing={2.5} sx={{ mb: 2 }}>
        <Grid xs={12} md={6}>
          <RoomRankingCard
            rooms={topRoomsByBookings}
            title="Most Booked Rooms"
            type="bookings"
          />
        </Grid>
        <Grid xs={12} md={6}>
          <RoomRankingCard
            rooms={topRoomsByRevenue}
            title="Highest Revenue Rooms"
            type="revenue"
          />
        </Grid>
      </Grid>

      {/* Tourist Demographics */}
      <Box sx={{ mt: 3, display: "flex", alignItems: "center", gap: 1 }}>
        <Users size={24} style={{ color: colors.primary }} />
        <ResponsiveText type="label-large" weight="bold">
          Tourist Demographics
        </ResponsiveText>
      </Box>
      <Grid container spacing={2.5} sx={{ mb: 2 }}>
        <Grid xs={12} md={6}>
          <TouristStatsCard
            local={touristStats.local}
            domestic={touristStats.domestic}
            foreign={touristStats.foreign}
            overseas={touristStats.overseas}
            totalBookings={touristStats.total}
          />
        </Grid>
        <Grid xs={12} md={6}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <StatCard
              icon={<Users size={20} />}
              label="Total Tourists"
              value={touristStats.total.toLocaleString()}
              change={0}
              period={
                filterPeriod === "month"
                  ? "this month"
                  : filterPeriod === "year"
                  ? "this year"
                  : "all time"
              }
              color="primary"
            />
            <Box
              sx={{
                p: 2.5,
                borderRadius: 12,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.surface",
              }}
            >
              <ResponsiveText
                type="body-medium"
                weight="medium"
                style={{ marginBottom: 12 }}
              >
                Tourist Breakdown
              </ResponsiveText>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <ResponsiveText type="body-small">
                    Local Tourists:
                  </ResponsiveText>
                  <ResponsiveText type="body-small" weight="bold">
                    {touristStats.local.toLocaleString()}
                  </ResponsiveText>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <ResponsiveText type="body-small">
                    Domestic Tourists:
                  </ResponsiveText>
                  <ResponsiveText type="body-small" weight="bold">
                    {touristStats.domestic.toLocaleString()}
                  </ResponsiveText>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <ResponsiveText type="body-small">
                    Foreign Tourists:
                  </ResponsiveText>
                  <ResponsiveText type="body-small" weight="bold">
                    {touristStats.foreign.toLocaleString()}
                  </ResponsiveText>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <ResponsiveText type="body-small">
                    Overseas Tourists:
                  </ResponsiveText>
                  <ResponsiveText type="body-small" weight="bold">
                    {touristStats.overseas.toLocaleString()}
                  </ResponsiveText>
                </Box>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Recent Payments */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <CreditCard size={24} style={{ color: colors.secondary }} />
        <ResponsiveText type="label-large" weight="bold">
          Recent Transactions
        </ResponsiveText>
      </Box>
      <Grid container spacing={2.5}>
        <Grid xs={12}>
          <PaymentsList payments={recentPayments} title="Recent Payments" />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Dashboard;
