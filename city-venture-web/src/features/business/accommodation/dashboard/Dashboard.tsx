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
import TouristSummaryCards from "./components/TouristSummaryCards";
import TouristBarChart from "./components/TouristBarChart";
import TouristPieChart from "./components/TouristPieChart";
import TopRoomsCard from "./components/TopRoomsCard";
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
  MapPin,
  Globe,
  Plane,
} from "lucide-react";
import { getData } from "@/src/services/Service";
import { fetchBookingsByBusinessId } from "@/src/services/BookingService";
import { fetchPaymentsByBusinessId } from "@/src/services/PaymentService";
import { colors } from "@/src/utils/Colors";
import type { Room } from "@/src/types/Business";
import type { Booking } from "@/src/types/Booking";
import { useAuth } from "@/src/context/AuthContext";

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
  const { user } = useAuth();
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

  // Separate filter for Key Performance Metrics
  const [kpiFilterPeriod, setKpiFilterPeriod] = useState<
    "month" | "year" | "all"
  >("month");
  const [kpiSelectedMonth, setKpiSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [kpiSelectedYear, setKpiSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  // Separate filter for Booking Overview
  const [bookingFilterPeriod, setBookingFilterPeriod] = useState<
    "month" | "year" | "all"
  >("month");
  const [bookingSelectedMonth, setBookingSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [bookingSelectedYear, setBookingSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  // Separate filter for tourist demographics
  const [touristFilterPeriod, setTouristFilterPeriod] = useState<
    "week" | "month" | "year" | "all"
  >("month");
  const [touristSelectedMonth, setTouristSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [touristSelectedYear, setTouristSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

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

  // Calculate statistics for KPI section
  const kpiStats = useMemo(() => {
    const now = new Date();

    // Filter bookings based on KPI selected period
    const filteredBookings = bookings.filter((booking) => {
      const bookingDate = new Date(
        booking.created_at || booking.check_in_date || ""
      );

      if (kpiFilterPeriod === "month") {
        return (
          bookingDate.getMonth() === kpiSelectedMonth &&
          bookingDate.getFullYear() === kpiSelectedYear
        );
      } else if (kpiFilterPeriod === "year") {
        return bookingDate.getFullYear() === kpiSelectedYear;
      }
      return true; // all
    });

    // Calculate previous period for comparison
    let previousBookingsCount = 0;

    if (kpiFilterPeriod === "month") {
      const prevMonth = kpiSelectedMonth === 0 ? 11 : kpiSelectedMonth - 1;
      const prevYear =
        kpiSelectedMonth === 0 ? kpiSelectedYear - 1 : kpiSelectedYear;

      previousBookingsCount = bookings.filter((b) => {
        const d = new Date(b.created_at || b.check_in_date || "");
        return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
      }).length;
    } else if (kpiFilterPeriod === "year") {
      const prevYear = kpiSelectedYear - 1;

      previousBookingsCount = bookings.filter(
        (b) =>
          new Date(b.created_at || b.check_in_date || "").getFullYear() ===
          prevYear
      ).length;
    }

    const bookingsChange =
      previousBookingsCount > 0
        ? ((filteredBookings.length - previousBookingsCount) /
            previousBookingsCount) *
          100
        : 0;

    // Room statistics (always all-time)
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
      totalRooms: rooms.length,
      availableRooms,
      occupiedRooms,
      maintenanceRooms,
      occupancyRate,
      averageBookingValue,
    };
  }, [bookings, rooms, kpiFilterPeriod, kpiSelectedMonth, kpiSelectedYear]);

  // Calculate revenue statistics (uses KPI filter)
  const revenueStats = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();

    // Filter payments based on KPI selected period
    const filteredPayments = payments.filter((payment) => {
      const paymentDate = new Date(payment.created_at || "");

      if (kpiFilterPeriod === "month") {
        return (
          paymentDate.getMonth() === kpiSelectedMonth &&
          paymentDate.getFullYear() === kpiSelectedYear
        );
      } else if (kpiFilterPeriod === "year") {
        return paymentDate.getFullYear() === kpiSelectedYear;
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

    if (kpiFilterPeriod === "month") {
      const prevMonth = kpiSelectedMonth === 0 ? 11 : kpiSelectedMonth - 1;
      const prevYear =
        kpiSelectedMonth === 0 ? kpiSelectedYear - 1 : kpiSelectedYear;

      previousRevenue = payments
        .filter((p) => {
          const d = new Date(p.created_at || "");
          return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
        })
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    } else if (kpiFilterPeriod === "year") {
      const prevYear = kpiSelectedYear - 1;

      previousRevenue = payments
        .filter((p) => new Date(p.created_at || "").getFullYear() === prevYear)
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    }

    // Calculate changes
    const revenueChange =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    return {
      monthlyRevenue: kpiFilterPeriod === "month" ? currentRevenue : 0,
      monthlyRevenueChange: revenueChange,
      annualRevenue:
        kpiFilterPeriod === "year"
          ? currentRevenue
          : payments
              .filter(
                (p) =>
                  new Date(p.created_at || "").getFullYear() === currentYear
              )
              .reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
      annualRevenueChange: revenueChange,
    };
  }, [payments, kpiFilterPeriod, kpiSelectedMonth, kpiSelectedYear]);

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

  // Recent bookings (current week only)
  const recentBookings = useMemo(() => {
    const now = new Date();
    
    // Get the start of the week (Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Get the end of the week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return bookings
      .filter((booking) => {
        const bookingDate = new Date(booking.created_at || booking.check_in_date || "");
        return bookingDate >= startOfWeek && bookingDate <= endOfWeek;
      })
      .sort(
        (a, b) =>
          new Date(b.created_at || "").getTime() -
          new Date(a.created_at || "").getTime()
      )
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

  // Tourist Statistics (separate filter)
  const touristStats = useMemo(() => {
    const now = new Date();

    const filtered = bookings.filter((booking) => {
      if (touristFilterPeriod === "all") return true;

      const bookingDate = new Date(booking.created_at || "");

      if (touristFilterPeriod === "week") {
        // Last 7 days
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return bookingDate >= weekAgo && bookingDate <= now;
      } else if (touristFilterPeriod === "month") {
        return (
          bookingDate.getMonth() === touristSelectedMonth &&
          bookingDate.getFullYear() === touristSelectedYear
        );
      } else if (touristFilterPeriod === "year") {
        return bookingDate.getFullYear() === touristSelectedYear;
      }
      return true;
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
  }, [
    bookings,
    touristFilterPeriod,
    touristSelectedMonth,
    touristSelectedYear,
  ]);

  // Booking Status Statistics
  const bookingStatusStats = useMemo(() => {
    // Filter bookings based on booking overview selected period
    const filteredBookings = bookings.filter((booking) => {
      const bookingDate = new Date(
        booking.created_at || booking.check_in_date || ""
      );

      if (bookingFilterPeriod === "month") {
        return (
          bookingDate.getMonth() === bookingSelectedMonth &&
          bookingDate.getFullYear() === bookingSelectedYear
        );
      } else if (bookingFilterPeriod === "year") {
        return bookingDate.getFullYear() === bookingSelectedYear;
      }
      return true; // all
    });

    const reserved = filteredBookings.filter(
      (b) => b.booking_status === "Reserved"
    ).length;
    const checkedIn = filteredBookings.filter(
      (b) => b.booking_status === "Checked-In"
    ).length;
    const checkedOut = filteredBookings.filter(
      (b) => b.booking_status === "Checked-Out"
    ).length;
    const canceled = filteredBookings.filter(
      (b) => b.booking_status === "Canceled"
    ).length;

    return {
      reserved,
      checkedIn,
      checkedOut,
      canceled,
    };
  }, [
    bookings,
    bookingFilterPeriod,
    bookingSelectedMonth,
    bookingSelectedYear,
  ]);

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
      <Container
        gap="2px"
        elevation={2}
        padding="20px"
        style={{ marginBottom: 20 }}
      >
        <ResponsiveText type="card-title-medium" weight="bold">
          {businessDetails?.business_name} Dashboard
        </ResponsiveText>
        <ResponsiveText type="card-sub-title-small" weight="normal">
          Welcome{" "}
          <b>
            {user?.first_name} {user?.last_name}
          </b>{" "}
          to your accommodation dashboard.
        </ResponsiveText>
        {/* <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
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
          </Box> */}
      </Container>

      {/* Key Metrics Grid */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <BarChart3 size={24} style={{ color: colors.primary }} />
          <ResponsiveText type="label-large" weight="bold">
            Key Performance Metrics
          </ResponsiveText>
        </Box>

        {/* KPI Filters */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Select
            size="md"
            value={kpiFilterPeriod}
            onChange={(_, val) =>
              setKpiFilterPeriod(val as "month" | "year" | "all")
            }
            sx={{ minWidth: 120 }}
          >
            <Option value="month">Monthly</Option>
            <Option value="year">Yearly</Option>
            <Option value="all">All Time</Option>
          </Select>

          {kpiFilterPeriod === "month" && (
            <Select
              size="md"
              value={kpiSelectedMonth}
              onChange={(_, val) => setKpiSelectedMonth(val as number)}
              sx={{ minWidth: 130 }}
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

          {(kpiFilterPeriod === "month" || kpiFilterPeriod === "year") && (
            <Select
              size="md"
              value={kpiSelectedYear}
              onChange={(_, val) => setKpiSelectedYear(val as number)}
              sx={{ minWidth: 100 }}
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
      <Grid container spacing={2.5} sx={{ mb: 2 }}>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            icon={<Eye size={20} />}
            label="Profile Views"
            value={kpiStats.profileViews.toLocaleString()}
            change={kpiStats.profileViewsChange}
            period={
              kpiFilterPeriod === "month"
                ? "last month"
                : kpiFilterPeriod === "year"
                ? "last year"
                : ""
            }
            color="primary"
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            icon={<Calendar size={20} />}
            label="Total Bookings"
            value={kpiStats.totalBookings.toLocaleString()}
            change={kpiStats.totalBookingsChange}
            period={
              kpiFilterPeriod === "month"
                ? "last month"
                : kpiFilterPeriod === "year"
                ? "last year"
                : ""
            }
            color="success"
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            icon={<TrendingUp size={20} />}
            label="Occupancy Rate"
            value={`${kpiStats.occupancyRate.toFixed(1)}%`}
            change={5.2}
            period={
              kpiFilterPeriod === "month"
                ? "last month"
                : kpiFilterPeriod === "year"
                ? "last year"
                : ""
            }
            color="warning"
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            icon={<DollarSign size={20} />}
            label={
              kpiFilterPeriod === "month"
                ? "Monthly Revenue"
                : kpiFilterPeriod === "year"
                ? "Yearly Revenue"
                : "Total Revenue"
            }
            value={`₱${(kpiFilterPeriod === "month"
              ? revenueStats.monthlyRevenue
              : kpiFilterPeriod === "year"
              ? revenueStats.annualRevenue
              : payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
            ).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}`}
            change={revenueStats.monthlyRevenueChange}
            period={
              kpiFilterPeriod === "month"
                ? "last month"
                : kpiFilterPeriod === "year"
                ? "last year"
                : ""
            }
            color="success"
          />
        </Grid>
      </Grid>

      {/* Room Status and Statistics */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Hotel size={24} style={{ color: colors.warningLabel }} />
          <ResponsiveText type="label-large" weight="bold">
            Booking Overview
          </ResponsiveText>
        </Box>

        {/* Booking Filters */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Select
            size="md"
            value={bookingFilterPeriod}
            onChange={(_, val) =>
              setBookingFilterPeriod(val as "month" | "year" | "all")
            }
            sx={{ minWidth: 120 }}
          >
            <Option value="month">Monthly</Option>
            <Option value="year">Yearly</Option>
            <Option value="all">All Time</Option>
          </Select>

          {bookingFilterPeriod === "month" && (
            <Select
              size="md"
              value={bookingSelectedMonth}
              onChange={(_, val) => setBookingSelectedMonth(val as number)}
              sx={{ minWidth: 130 }}
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

          {(bookingFilterPeriod === "month" ||
            bookingFilterPeriod === "year") && (
            <Select
              size="md"
              value={bookingSelectedYear}
              onChange={(_, val) => setBookingSelectedYear(val as number)}
              sx={{ minWidth: 100 }}
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
      <Grid container spacing={2.5} sx={{ mb: 2 }}>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            icon={<Calendar size={20} />}
            label="Reserved"
            value={bookingStatusStats.reserved.toLocaleString()}
            change={0}
            color="warning"
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            icon={<Calendar size={20} />}
            label="Checked-In"
            value={bookingStatusStats.checkedIn.toLocaleString()}
            change={0}
            color="success"
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            icon={<Calendar size={20} />}
            label="Checked-Out"
            value={bookingStatusStats.checkedOut.toLocaleString()}
            change={0}
            color="primary"
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            icon={<Calendar size={20} />}
            label="Canceled"
            value={bookingStatusStats.canceled.toLocaleString()}
            change={0}
            color="danger"
          />
        </Grid>
      </Grid>
      <Grid container spacing={2.5} sx={{ mb: 2 }}>
        <Grid xs={12} md={6}>
          <BookingsList bookings={recentBookings} title="Recent Bookings" />
        </Grid>
        <Grid xs={6}>
          <PaymentsList payments={recentPayments} title="Recent Payments" />
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
          <TopRoomsCard
            rooms={topRoomsByBookings}
            title="Most Booked Rooms"
            type="bookings"
          />
        </Grid>
        <Grid xs={12} md={6}>
          <TopRoomsCard
            rooms={topRoomsByRevenue}
            title="Highest Revenue Rooms"
            type="revenue"
          />
        </Grid>
      </Grid>

      {/* Tourist Demographics */}
      <Box
        sx={{
          mt: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Users size={24} style={{ color: colors.primary }} />
          <ResponsiveText type="label-large" weight="bold">
            Tourist Demographics
          </ResponsiveText>
        </Box>

        {/* Tourist-specific filters */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Select
            size="md"
            value={touristFilterPeriod}
            onChange={(_, val) =>
              setTouristFilterPeriod(val as "week" | "month" | "year" | "all")
            }
            sx={{ minWidth: 120 }}
          >
            <Option value="week">Weekly</Option>
            <Option value="month">Monthly</Option>
            <Option value="year">Yearly</Option>
            <Option value="all">All Time</Option>
          </Select>

          {touristFilterPeriod === "month" && (
            <Select
              size="md"
              value={touristSelectedMonth}
              onChange={(_, val) => setTouristSelectedMonth(val as number)}
              sx={{ minWidth: 130 }}
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

          {(touristFilterPeriod === "month" ||
            touristFilterPeriod === "year") && (
            <Select
              size="md"
              value={touristSelectedYear}
              onChange={(_, val) => setTouristSelectedYear(val as number)}
              sx={{ minWidth: 100 }}
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

      {/* Summary Cards */}
      <Box sx={{ mb: 2 }}>
        <TouristSummaryCards
          local={touristStats.local}
          domestic={touristStats.domestic}
          foreign={touristStats.foreign}
          overseas={touristStats.overseas}
          total={touristStats.total}
        />
      </Box>

      {/* Charts Section */}
      <Grid container spacing={2.5} sx={{ mb: 2 }}>
        {/* Bar Chart */}
        <Grid xs={12} md={6}>
          <TouristBarChart
            local={touristStats.local}
            domestic={touristStats.domestic}
            foreign={touristStats.foreign}
            overseas={touristStats.overseas}
          />
        </Grid>

        {/* Pie Chart */}
        <Grid xs={12} md={6}>
          <TouristPieChart
            local={touristStats.local}
            domestic={touristStats.domestic}
            foreign={touristStats.foreign}
            overseas={touristStats.overseas}
          />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Dashboard;
