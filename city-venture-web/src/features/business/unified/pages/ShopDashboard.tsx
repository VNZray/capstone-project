/**
 * Shop Dashboard Component
 * Dashboard specifically for shop/store type businesses
 */

import React, { useState, useEffect } from 'react';
import Typography from '@/src/components/Typography';
import PageContainer from '@/src/components/PageContainer';
import Container from '@/src/components/Container';
import { useBusiness } from '@/src/context/BusinessContext';
import { useAuth } from '@/src/context/AuthContext';
import { Box, Grid, Select, Option, Card, CardContent } from '@mui/joy';
import {
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { colors } from '@/src/utils/Colors';
import Loading from '@/src/components/ui/Loading';
import NoDataFound from '@/src/components/NoDataFound';

// Simple stat card component for shop dashboard
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: number;
  period?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  change,
  period,
  color = 'primary',
}) => {
  const colorMap = {
    primary: colors.primary,
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
  };

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: '8px',
              backgroundColor: `${colorMap[color]}20`,
              color: colorMap[color],
            }}
          >
            {icon}
          </Box>
        </Box>
        <Typography.CardSubTitle>{label}</Typography.CardSubTitle>
        <Typography.CardTitle>
          {value}
        </Typography.CardTitle>
        {change !== undefined && period && (
          <Box
            sx={{
              color: change >= 0 ? '#22c55e' : '#ef4444',
              fontSize: '0.875rem',
            }}
          >
            {change >= 0 ? '+' : ''}
            {change.toFixed(1)}% vs {period}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

type FilterPeriod = 'month' | 'year' | 'all';

const ShopDashboard: React.FC = () => {
  const { businessDetails, loading: businessLoading } = useBusiness();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('month');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // TODO: Fetch actual shop dashboard data
  const [stats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });

  useEffect(() => {
    const loadDashboard = async () => {
      if (!businessDetails?.id) return;
      setLoading(true);
      try {
        // TODO: Implement shop dashboard data fetching
        // const data = await fetchShopDashboardData(businessDetails.id);
      } catch (error) {
        console.error('Failed to fetch shop dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [businessDetails?.id]);

  if (businessLoading || loading) {
    return (
      <PageContainer>
        <Loading showProgress title="Loading Dashboard..." variant="default" />
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
      <Container gap="2px" elevation={2} padding="20px" style={{ marginBottom: 20 }}>
        <Typography.Header>{businessDetails?.business_name} Dashboard</Typography.Header>
        <Typography.CardSubTitle>
          Welcome <b>{user?.first_name} {user?.last_name}</b> to your shop dashboard.
        </Typography.CardSubTitle>
      </Container>

      {/* Key Performance Metrics */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BarChart3 size={24} style={{ color: colors.primary }} />
          <Typography.CardTitle>Key Performance Metrics</Typography.CardTitle>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Select
            size="md"
            value={filterPeriod}
            onChange={(_, val) => setFilterPeriod(val as FilterPeriod)}
            sx={{ minWidth: 120 }}
          >
            <Option value="month">Monthly</Option>
            <Option value="year">Yearly</Option>
            <Option value="all">All Time</Option>
          </Select>

          {filterPeriod === 'month' && (
            <Select
              size="md"
              value={selectedMonth}
              onChange={(_, val) => setSelectedMonth(val as number)}
              sx={{ minWidth: 130 }}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <Option key={i} value={i}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </Option>
              ))}
            </Select>
          )}

          {(filterPeriod === 'month' || filterPeriod === 'year') && (
            <Select
              size="md"
              value={selectedYear}
              onChange={(_, val) => setSelectedYear(val as number)}
              sx={{ minWidth: 100 }}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
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
            icon={<Package size={20} />}
            label="Total Products"
            value={stats.totalProducts.toLocaleString()}
            color="primary"
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            icon={<ShoppingCart size={20} />}
            label="Total Orders"
            value={stats.totalOrders.toLocaleString()}
            color="success"
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            icon={<TrendingUp size={20} />}
            label="Pending Orders"
            value={stats.pendingOrders.toLocaleString()}
            color="warning"
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            icon={<DollarSign size={20} />}
            label="Total Revenue"
            value={`₱${stats.totalRevenue.toLocaleString()}`}
            color="success"
          />
        </Grid>
      </Grid>

      {/* Placeholder for more shop-specific content */}
      <Container elevation={2} padding="20px">
        <Typography.CardTitle>Recent Orders</Typography.CardTitle>
        <NoDataFound
          icon="inbox"
          title="No Orders Yet"
          message="Orders will appear here once customers start purchasing."
        />
      </Container>
    </PageContainer>
  );
};

export default ShopDashboard;
