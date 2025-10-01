import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Stack,
  Box,
  Card,
  Chip,
  Table,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/joy";
import { FiTrendingUp, FiDollarSign, FiShoppingCart, FiClock } from "react-icons/fi";
import * as DiscountService from "@/src/services/DiscountService";
import type { DiscountStats } from "@/src/types/Discount";

interface DiscountStatsModalProps {
  open: boolean;
  onClose: () => void;
  discountId: string;
  discountName: string;
}

export default function DiscountStatsModal({
  open,
  onClose,
  discountId,
  discountName,
}: DiscountStatsModalProps): React.ReactElement {
  const [stats, setStats] = useState<DiscountStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await DiscountService.fetchDiscountStats(discountId);
      setStats(data);
    } catch (err) {
      console.error("Error fetching discount stats:", err);
      setError("Failed to load discount statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && discountId) {
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, discountId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog size="lg" sx={{ maxWidth: 900, maxHeight: "90vh", overflow: "auto" }}>
        <ModalClose />
        <Typography level="h4" fontWeight="bold">
          Discount Statistics
        </Typography>
        <Typography level="body-md" color="neutral">
          {discountName}
        </Typography>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert color="danger" variant="soft">
            {error}
          </Alert>
        )}

        {!loading && !error && stats && (
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Summary Cards */}
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }}>
              <Card variant="soft" color="primary">
                <Stack spacing={1}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FiShoppingCart size={20} />
                    <Typography level="body-sm" textColor="text.secondary">
                      Total Orders
                    </Typography>
                  </Box>
                  <Typography level="h3" fontWeight="bold">
                    {stats.statistics.total_orders}
                  </Typography>
                </Stack>
              </Card>

              <Card variant="soft" color="success">
                <Stack spacing={1}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FiDollarSign size={20} />
                    <Typography level="body-sm" textColor="text.secondary">
                      Revenue Impact
                    </Typography>
                  </Box>
                  <Typography level="h3" fontWeight="bold">
                    {formatCurrency(stats.statistics.total_revenue_impact)}
                  </Typography>
                </Stack>
              </Card>

              <Card variant="soft" color="warning">
                <Stack spacing={1}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FiTrendingUp size={20} />
                    <Typography level="body-sm" textColor="text.secondary">
                      Avg Order Value
                    </Typography>
                  </Box>
                  <Typography level="h3" fontWeight="bold">
                    {formatCurrency(stats.statistics.average_order_value)}
                  </Typography>
                </Stack>
              </Card>

              <Card variant="soft" color="neutral">
                <Stack spacing={1}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FiClock size={20} />
                    <Typography level="body-sm" textColor="text.secondary">
                      Remaining Uses
                    </Typography>
                  </Box>
                  <Typography level="h3" fontWeight="bold">
                    {stats.statistics.remaining_uses !== null 
                      ? stats.statistics.remaining_uses 
                      : "Unlimited"}
                  </Typography>
                </Stack>
              </Card>
            </Box>

            <Divider />

            {/* Discount Details */}
            <Box>
              <Typography level="title-md" fontWeight="bold" sx={{ mb: 2 }}>
                Discount Details
              </Typography>
              <Stack spacing={1.5}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography level="body-sm" textColor="text.secondary">
                    Discount Type
                  </Typography>
                  <Chip size="sm" variant="soft">
                    {stats.discount.discount_type === "percentage" 
                      ? `${stats.discount.discount_value}%` 
                      : formatCurrency(stats.discount.discount_value)}
                  </Chip>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography level="body-sm" textColor="text.secondary">
                    Minimum Order
                  </Typography>
                  <Typography level="body-sm">
                    {formatCurrency(stats.discount.minimum_order_amount)}
                  </Typography>
                </Box>

                {stats.discount.maximum_discount_amount && (
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography level="body-sm" textColor="text.secondary">
                      Maximum Discount
                    </Typography>
                    <Typography level="body-sm">
                      {formatCurrency(stats.discount.maximum_discount_amount)}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography level="body-sm" textColor="text.secondary">
                    Valid From
                  </Typography>
                  <Typography level="body-sm">
                    {formatDate(stats.discount.start_datetime)}
                  </Typography>
                </Box>

                {stats.discount.end_datetime && (
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography level="body-sm" textColor="text.secondary">
                      Valid Until
                    </Typography>
                    <Typography level="body-sm">
                      {formatDate(stats.discount.end_datetime)}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography level="body-sm" textColor="text.secondary">
                    Current Usage
                  </Typography>
                  <Typography level="body-sm">
                    {stats.discount.current_usage_count}
                    {stats.discount.usage_limit ? ` / ${stats.discount.usage_limit}` : ""}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography level="body-sm" textColor="text.secondary">
                    Status
                  </Typography>
                  <Chip 
                    size="sm" 
                    variant="soft" 
                    color={
                      stats.discount.status === "active" ? "success" :
                      stats.discount.status === "expired" ? "danger" :
                      stats.discount.status === "paused" ? "warning" : "neutral"
                    }
                  >
                    {stats.discount.status}
                  </Chip>
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Recent Orders */}
            <Box>
              <Typography level="title-md" fontWeight="bold" sx={{ mb: 2 }}>
                Recent Orders ({stats.recent_orders.length})
              </Typography>

              {stats.recent_orders.length === 0 ? (
                <Alert color="neutral" variant="soft">
                  No orders have used this discount yet
                </Alert>
              ) : (
                <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: "sm", overflow: "hidden" }}>
                  <Table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Order Total</th>
                        <th>Discount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recent_orders.map((order) => (
                        <tr key={order.order_id}>
                          <td>
                            <Typography level="body-sm">
                              {formatDate(order.order_date)}
                            </Typography>
                          </td>
                          <td>
                            <Typography level="body-sm">
                              {order.customer_name || "Guest"}
                            </Typography>
                          </td>
                          <td>
                            <Typography level="body-sm" fontWeight="md">
                              {formatCurrency(order.order_total)}
                            </Typography>
                          </td>
                          <td>
                            <Typography level="body-sm" color="success">
                              -{formatCurrency(order.discount_amount)}
                            </Typography>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Box>
              )}
            </Box>
          </Stack>
        )}
      </ModalDialog>
    </Modal>
  );
}
