import { useState, useEffect, useMemo } from "react";
import Typography from "@/src/components/Typography";
import PageContainer from "@/src/components/PageContainer";
import Container from "@/src/components/Container";
import { Box, Select, Option, Grid } from "@mui/joy";
import { useAuth } from "@/src/context/AuthContext";
import StatCard from "./components/StatCard";
import NewRegistrationsTable from "./components/NewRegistrationsTable";
import SubscriptionPaymentsTable from "./components/SubscriptionPaymentsTable";
import TouristStatsCards from "./components/TouristStatsCards";
import TouristCharts from "./components/TouristCharts";
import {
  Building2,
  Store,
  Home,
  MapPin,
  DollarSign,
  TrendingUp,
  BarChart3,
  Users,
  Crown,
  UserCheck,
} from "lucide-react";
import { colors } from "@/src/utils/Colors";
import {
  fetchTourismDashboardData,
  calculateBusinessStats,
  calculateTouristStatsFromBookings,
  getRecentRegistrations,
  getRecentPayments,
  calculateRevenueStats,
  type TourismDashboardData,
  type FilterPeriod,
} from "@/src/services/dashboard/TourismDashboardService";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<TourismDashboardData>({
    businesses: [],
    registrations: [],
    payments: [],
    tourists: [],
    touristSpots: [],
    bookings: [],
  });
  const [loading, setLoading] = useState(true);

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
      setLoading(true);
      try {
        const dashboardData = await fetchTourismDashboardData();
        setData(dashboardData);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // Calculate statistics
  const businessStats = useMemo(
    () => calculateBusinessStats(data.businesses),
    [data.businesses]
  );

  const touristFilter = useMemo<FilterPeriod>(
    () => ({
      period: touristFilterPeriod,
      month: touristSelectedMonth,
      year: touristSelectedYear,
    }),
    [touristFilterPeriod, touristSelectedMonth, touristSelectedYear]
  );

  const touristStats = useMemo(
    () => calculateTouristStatsFromBookings(data.bookings, touristFilter),
    [data.bookings, touristFilter]
  );

  const recentRegistrations = useMemo(
    () => getRecentRegistrations(data.registrations, 10),
    [data.registrations]
  );

  const recentPayments = useMemo(
    () => getRecentPayments(data.payments, 10),
    [data.payments]
  );

  const revenueStats = useMemo(
    () => calculateRevenueStats(data.payments),
    [data.payments]
  );

  if (loading) {
    return (
      <PageContainer>
        <Container>
          <Typography.Title>Loading Dashboard...</Typography.Title>
        </Container>
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
        <Typography.Header>Tourism Admin Dashboard</Typography.Header>
        <Typography.CardSubTitle>
          Welcome{" "}
          <b>
            {user?.first_name} {user?.last_name}
          </b>{" "}
          to the tourism administration dashboard.
        </Typography.CardSubTitle>
        <Typography.CardSubTitle>Draft lang ni</Typography.CardSubTitle>
      </Container>

      {/* Key Metrics */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 2,
        }}
      >
        <BarChart3 size={24} style={{ color: colors.primary }} />
        <Typography.CardTitle>Key Metrics</Typography.CardTitle>
      </Box>
      <Grid container spacing={2.5} sx={{ mb: 2 }}>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            icon={<Building2 size={20} />}
            label="Total Businesses"
            value={businessStats.total}
            color="primary"
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            icon={<Home size={20} />}
            label="Accommodations"
            value={businessStats.accommodations}
            color="success"
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            icon={<Store size={20} />}
            label="Shops"
            value={businessStats.shops}
            color="warning"
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            icon={<MapPin size={20} />}
            label="Tourist Spots"
            value={data.touristSpots.length}
            color="danger"
          />
        </Grid>
      </Grid>

      {/* Revenue & Status */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid xs={12} sm={6} md={4}>
          <StatCard
            icon={<DollarSign size={20} />}
            label="Monthly Revenue"
            value={`₱${revenueStats.monthlyRevenue.toLocaleString()}`}
            color="success"
          />
        </Grid>
        <Grid xs={12} sm={6} md={4}>
          <StatCard
            icon={<TrendingUp size={20} />}
            label="Active Businesses"
            value={businessStats.active}
            color="success"
          />
        </Grid>
        <Grid xs={12} sm={6} md={4}>
          <StatCard
            icon={<Building2 size={20} />}
            label="Pending Approvals"
            value={businessStats.pending}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Subscription Stats */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 2,
        }}
      >
        <Crown size={24} style={{ color: colors.primary }} />
        <Typography.CardTitle>Subscription Overview</Typography.CardTitle>
      </Box>
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid xs={12} sm={6} md={4}>
          <StatCard
            icon={<UserCheck size={20} />}
            label="Free Subscriptions"
            value={businessStats.freeSubscriptions}
            color="primary"
          />
        </Grid>
        <Grid xs={12} sm={6} md={4}>
          <StatCard
            icon={<Crown size={20} />}
            label="Premium Subscriptions"
            value={businessStats.premiumSubscriptions}
            color="warning"
          />
        </Grid>
        <Grid xs={12} sm={6} md={4}>
          <StatCard
            icon={<TrendingUp size={20} />}
            label="Premium Rate"
            value={`${businessStats.total > 0 ? ((businessStats.premiumSubscriptions / businessStats.total) * 100).toFixed(1) : 0}%`}
            color="success"
          />
        </Grid>
      </Grid>

      {/* Recent Tables */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid xs={12} lg={6}>
          <NewRegistrationsTable registrations={recentRegistrations} />
        </Grid>
        <Grid xs={12} lg={6}>
          <SubscriptionPaymentsTable payments={recentPayments} />
        </Grid>
      </Grid>

      {/* Tourist Demographics */}
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
          <Users size={24} style={{ color: colors.primary }} />
          <Typography.CardTitle>Tourist Demographics</Typography.CardTitle>
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
        <TouristStatsCards
          local={touristStats.local}
          domestic={touristStats.domestic}
          foreign={touristStats.foreign}
          overseas={touristStats.overseas}
          total={touristStats.total}
        />
      </Box>

      <TouristCharts
        local={touristStats.local}
        domestic={touristStats.domestic}
        foreign={touristStats.foreign}
        overseas={touristStats.overseas}
      />
    </PageContainer>
  );
};

export default Dashboard;
