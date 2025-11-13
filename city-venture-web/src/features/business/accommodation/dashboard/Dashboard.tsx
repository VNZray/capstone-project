import { useState, useEffect, useMemo } from "react";
import Typography from "@/src/components/Typography";
import PageContainer from "@/src/components/PageContainer";
import Container from "@/src/components/Container";
import { useBusiness } from "@/src/context/BusinessContext";
import { Box, Select, Option, Grid } from "@mui/joy";
import StatCard from "./components/StatCard";
import BookingsList from "./components/BookingsList";
import PaymentsList from "./components/PaymentsList";
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
  Users,
} from "lucide-react";
import { colors } from "@/src/utils/Colors";
import { useAuth } from "@/src/context/AuthContext";
import {
  fetchDashboardData,
  calculateKPIStats,
  calculateRevenueStats,
  calculateBookingStatusStats,
  calculateTouristStats,
  getRecentBookings,
  getRecentPayments,
  getTopRoomsByBookings,
  getTopRoomsByRevenue,
  type DashboardData,
  type FilterPeriod,
} from "@/src/services/dashboard/AccommodationDashboardServices";

const Dashboard = () => {
  const { businessDetails, loading: businessLoading } = useBusiness();
  const { user } = useAuth();

  const [data, setData] = useState<DashboardData>({
    rooms: [],
    bookings: [],
    payments: [],
  });
  const [loading, setLoading] = useState(true);

  // KPI (Key Performance Indicator) Filters
  const [kpiFilterPeriod, setKpiFilterPeriod] =
    useState<FilterPeriod["period"]>("month");
  const [kpiSelectedMonth, setKpiSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [kpiSelectedYear, setKpiSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  // Booking Overview Filters
  const [bookingFilterPeriod, setBookingFilterPeriod] =
    useState<FilterPeriod["period"]>("month");
  const [bookingSelectedMonth, setBookingSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [bookingSelectedYear, setBookingSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  // Tourist Demographics Filters
  const [touristFilterPeriod, setTouristFilterPeriod] =
    useState<FilterPeriod["period"]>("month");
  const [touristSelectedMonth, setTouristSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [touristSelectedYear, setTouristSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  // Fetch all data
  useEffect(() => {
    const loadDashboard = async () => {
      if (!businessDetails?.id) return;

      setLoading(true);
      try {
        const dashboardData = await fetchDashboardData(businessDetails.id);
        setData(dashboardData);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [businessDetails?.id]);

  // Calculate all statistics using services
  const kpiFilter = useMemo<FilterPeriod>(
    () => ({
      period: kpiFilterPeriod,
      month: kpiSelectedMonth,
      year: kpiSelectedYear,
    }),
    [kpiFilterPeriod, kpiSelectedMonth, kpiSelectedYear]
  );

  const bookingFilter = useMemo<FilterPeriod>(
    () => ({
      period: bookingFilterPeriod,
      month: bookingSelectedMonth,
      year: bookingSelectedYear,
    }),
    [bookingFilterPeriod, bookingSelectedMonth, bookingSelectedYear]
  );

  const touristFilter = useMemo<FilterPeriod>(
    () => ({
      period: touristFilterPeriod,
      month: touristSelectedMonth,
      year: touristSelectedYear,
    }),
    [touristFilterPeriod, touristSelectedMonth, touristSelectedYear]
  );

  const kpiStats = useMemo(
    () => calculateKPIStats(data, kpiFilter),
    [data, kpiFilter]
  );
  const revenueStats = useMemo(
    () => calculateRevenueStats(data.payments, kpiFilter),
    [data.payments, kpiFilter]
  );
  const bookingStatusStats = useMemo(
    () => calculateBookingStatusStats(data.bookings, bookingFilter),
    [data.bookings, bookingFilter]
  );
  const touristStats = useMemo(
    () => calculateTouristStats(data.bookings, touristFilter),
    [data.bookings, touristFilter]
  );

  const recentBookings = useMemo(
    () => getRecentBookings(data.bookings, data.rooms),
    [data.bookings, data.rooms]
  );
  const recentPayments = useMemo(
    () => getRecentPayments(data.payments),
    [data.payments]
  );

  const topRoomsByBookings = useMemo(
    () => getTopRoomsByBookings(data.bookings, data.rooms),
    [data.bookings, data.rooms]
  );
  const topRoomsByRevenue = useMemo(
    () => getTopRoomsByRevenue(data.bookings, data.rooms),
    [data.bookings, data.rooms]
  );

  if (businessLoading || loading) {
    return (
      <PageContainer>
        <Container>
          <Typography.Title>Loading Dashboard...</Typography.Title>
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
      {/* Header */}
      <Container
        gap="2px"
        elevation={2}
        padding="20px"
        style={{ marginBottom: 20 }}
      >
        <Typography.Header>
          {businessDetails?.business_name} Dashboard
        </Typography.Header>
        <Typography.CardSubTitle>
          Welcome{" "}
          <b>
            {user?.first_name} {user?.last_name}
          </b>{" "}
          to your accommodation dashboard.
        </Typography.CardSubTitle>
      </Container>

      {/* Key Performance Metrics */}
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
          <Typography.CardTitle>Key Performance Metrics</Typography.CardTitle>
        </Box>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Select
            size="md"
            value={kpiFilterPeriod}
            onChange={(_, val) =>
              setKpiFilterPeriod(val as FilterPeriod["period"])
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
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
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
            change={kpiStats.occupancyRateChange}
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
              : data.payments.reduce(
                  (sum, p) => sum + (Number(p.amount) || 0),
                  0
                )
            ).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
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

      {/* Booking Overview */}
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
          <Typography.CardTitle
            startDecorator={<Hotel style={{ color: colors.warningLabel }} />}
          >
            Booking Overview
          </Typography.CardTitle>
        </Box>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Select
            size="md"
            value={bookingFilterPeriod}
            onChange={(_, val) =>
              setBookingFilterPeriod(val as FilterPeriod["period"])
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
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
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
        <Grid xs={12} md={12} lg={6}>
          <BookingsList bookings={recentBookings} title="Recent Bookings" />
        </Grid>
        <Grid xs={12} md={12} lg={6}>
          <PaymentsList payments={recentPayments} title="Recent Payments" />
        </Grid>
      </Grid>

      {/* Top Performing Rooms */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography.CardTitle
          startDecorator={<Award style={{ color: "#FFD700" }} />}
        >
          Top Performing Rooms
        </Typography.CardTitle>
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
          <Typography.CardTitle startDecorator={<Users />}>
            Tourist Demographics
          </Typography.CardTitle>
        </Box>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Select
            size="md"
            value={touristFilterPeriod}
            onChange={(_, val) =>
              setTouristFilterPeriod(val as FilterPeriod["period"])
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
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
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

      <Box sx={{ mb: 2 }}>
        <TouristSummaryCards
          local={touristStats.local}
          domestic={touristStats.domestic}
          foreign={touristStats.foreign}
          overseas={touristStats.overseas}
          total={touristStats.total}
        />
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 2 }}>
        <Grid xs={12} md={6}>
          <TouristBarChart
            local={touristStats.local}
            domestic={touristStats.domestic}
            foreign={touristStats.foreign}
            overseas={touristStats.overseas}
          />
        </Grid>
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
