import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Typography,
  Stack,
  Box,
  Table,
  Sheet,
  CircularProgress,
  Snackbar,
  Select,
  Option,
  Input,
  Chip,
  Button,
  Tabs,
  TabList,
  Tab,
  Modal,
  ModalDialog,
  ModalClose,
  DialogTitle,
  DialogContent,
  FormControl,
  FormLabel,
} from "@mui/joy";
import {
  FiPackage,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiSearch,
  FiTruck,
  FiCreditCard,
  FiKey,
} from "react-icons/fi";
import PageContainer from "@/src/components/PageContainer";
import { useBusiness } from "@/src/context/BusinessContext";
import * as OrderService from "@/src/services/OrderService";
import type { Order, OrderStatus, PaymentStatus } from "@/src/types/Order";
import { useOrderSocket } from "@/src/hooks/useOrderSocket";

const orderStatuses: OrderStatus[] = [
  "pending",
  "accepted",
  "preparing",
  "ready_for_pickup",
  "picked_up",
  "cancelled_by_user",
  "cancelled_by_business",
];

const paymentStatuses: PaymentStatus[] = ["pending", "paid", "failed", "refunded"];

const paymentMethodLabels: Record<string, string> = {
  cash_on_pickup: "Cash on Pickup",
  card: "Card",
  digital_wallet: "Digital Wallet",
};

export default function Orders(): React.ReactElement {
  const { businessDetails } = useBusiness();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Arrival code verification modal
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [arrivalCodeInput, setArrivalCodeInput] = useState("");
  const [verifying, setVerifying] = useState(false);

  // Real-time socket connection for order updates
  useOrderSocket(businessDetails?.id || null, {
    onNewOrder: (order) => {
      console.log('[Orders] New order received via socket:', order);
      setOrders((prevOrders) => [order, ...prevOrders]);
      setSuccess(`New order received: ${order.order_number}`);
      setTimeout(() => setSuccess(null), 5000);
    },
    onOrderUpdated: (order) => {
      console.log('[Orders] Order updated via socket:', order);
      setOrders((prevOrders) =>
        prevOrders.map((o) => (o.id === order.id ? order : o))
      );
    },
  });

  const fetchOrders = useCallback(async () => {
    if (!businessDetails?.id) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await OrderService.fetchOrdersByBusinessId(businessDetails.id);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('[Orders] Error fetching orders:', err);
      
      const errorMessage = err.response?.data?.message || err.message || "Failed to load orders.";
      const errorDetails = err.response?.data;
      
      if (err.response?.status === 403) {
        setError(`Access denied: ${errorMessage}${errorDetails?.required ? ` (Required: ${errorDetails.required.join(', ')}, Current: ${errorDetails.current})` : ''}`);
      } else {
        setError(errorMessage);
      }
      
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [businessDetails?.id]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await OrderService.updateOrderStatus(orderId, newStatus as OrderStatus);
      setSuccess("Order status updated successfully!");
      await fetchOrders();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error updating order status:", err);
      setError("Failed to update order status.");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handlePaymentStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await OrderService.updatePaymentStatus(orderId, newStatus as PaymentStatus);
      setSuccess("Payment status updated successfully!");
      await fetchOrders();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error updating payment status:", err);
      setError("Failed to update payment status.");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleVerifyArrivalCode = async () => {
    if (!businessDetails?.id || !arrivalCodeInput.trim()) {
      setError("Please enter an arrival code.");
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const result = await OrderService.verifyArrivalCode(
        businessDetails.id,
        arrivalCodeInput.trim()
      );
      
      if (result.found && result.order) {
        // Automatically mark as picked up
        await OrderService.updateOrderStatus(result.order.id, "picked_up");
        setSuccess(`Order ${result.order.order_number} marked as picked up!`);
        setVerifyModalOpen(false);
        setArrivalCodeInput("");
        await fetchOrders();
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError("Invalid arrival code. Please check and try again.");
        setTimeout(() => setError(null), 5000);
      }
    } catch (err: any) {
      console.error("Error verifying arrival code:", err);
      setError(err.response?.data?.message || "Failed to verify arrival code.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setVerifying(false);
    }
  };

  const formatCurrency = (value: number | string | undefined): string => {
    const amount = typeof value === "string" ? parseFloat(value) : value ?? 0;
    return `₱${amount.toFixed(2)}`;
  };

  const formatPickupDate = (datetime: string | null | undefined): string => {
    if (!datetime) return "—";
    const date = new Date(datetime);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatPickupTime = (datetime: string | null | undefined): string => {
    if (!datetime) return "—";
    const date = new Date(datetime);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatStatusLabel = (status: string): string => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Get action buttons based on order status (state machine)
  const getOrderActions = (order: Order) => {
    switch (order.status) {
      case "pending":
        return (
          <Stack direction="row" spacing={1}>
            <Button
              size="sm"
              color="success"
              onClick={() => handleStatusChange(order.id, "accepted")}
            >
              Accept Order
            </Button>
            <Button
              size="sm"
              variant="outlined"
              color="danger"
              onClick={() => handleStatusChange(order.id, "cancelled_by_business")}
            >
              Reject
            </Button>
          </Stack>
        );
      
      case "accepted":
        return (
          <Stack direction="row" spacing={1}>
            <Button
              size="sm"
              color="primary"
              onClick={() => handleStatusChange(order.id, "preparing")}
            >
              Start Preparing
            </Button>
            <Button
              size="sm"
              variant="outlined"
              color="danger"
              onClick={() => handleStatusChange(order.id, "cancelled_by_business")}
            >
              Cancel
            </Button>
          </Stack>
        );
      
      case "preparing":
        return (
          <Stack direction="row" spacing={1}>
            <Button
              size="sm"
              color="success"
              onClick={() => handleStatusChange(order.id, "ready_for_pickup")}
            >
              Mark Ready
            </Button>
            <Button
              size="sm"
              variant="outlined"
              color="danger"
              onClick={() => handleStatusChange(order.id, "cancelled_by_business")}
            >
              Cancel
            </Button>
          </Stack>
        );
      
      case "ready_for_pickup":
        return (
          <Stack direction="row" spacing={1}>
            <Button
              size="sm"
              color="success"
              onClick={() => handleStatusChange(order.id, "picked_up")}
            >
              Mark Picked Up
            </Button>
            <Button
              size="sm"
              variant="outlined"
              color="danger"
              onClick={() => handleStatusChange(order.id, "cancelled_by_business")}
            >
              Cancel
            </Button>
          </Stack>
        );
      
      case "picked_up":
      case "cancelled_by_user":
      case "cancelled_by_business":
      case "failed_payment":
        // Terminal states - no actions
        return (
          <Chip
            size="sm"
            variant="soft"
            color={getStatusChipColor(order.status)}
          >
            {formatStatusLabel(order.status)}
          </Chip>
        );
      
      default:
        return <Typography level="body-sm">{formatStatusLabel(order.status)}</Typography>;
    }
  };

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case "accepted":
      case "picked_up":
        return <FiCheckCircle />;
      case "preparing":
        return <FiPackage />;
      case "ready_for_pickup":
        return <FiTruck />;
      case "pending":
        return <FiClock />;
      case "cancelled_by_user":
      case "cancelled_by_business":
      case "failed_payment":
        return <FiXCircle />;
      default:
        return undefined;
    }
  };

  const getStatusChipColor = (status: string | undefined) => {
    switch (status) {
      case "pending":
        return "warning" as const;
      case "accepted":
      case "preparing":
        return "primary" as const;
      case "ready_for_pickup":
        return "success" as const;
      case "picked_up":
        return "success" as const;
      case "cancelled_by_user":
      case "cancelled_by_business":
      case "failed_payment":
        return "danger" as const;
      default:
        return "neutral" as const;
    }
  };

  const getPaymentChipColor = (method: string | undefined) => {
    switch (method) {
      case "cash_on_pickup":
        return "success" as const;
      case "digital_wallet":
        return "primary" as const;
      case "card":
      default:
        return "neutral" as const;
    }
  };

  const statusCounts = useMemo(
    () => ({
      all: orders.length,
      pending: orders.filter((order) => order.status === "pending").length,
      accepted: orders.filter((order) => order.status === "accepted").length,
      preparing: orders.filter((order) => order.status === "preparing").length,
      ready_for_pickup: orders.filter((order) => order.status === "ready_for_pickup").length,
      picked_up: orders.filter((order) => order.status === "picked_up").length,
      cancelled: orders.filter((order) => order.status.startsWith("cancelled_") || order.status === "failed_payment").length,
    }),
    [orders]
  );

  const filteredOrders = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();

    return orders.filter((order) => {
      let matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
      
      // Handle "cancelled" tab matching any cancelled variant
      if (selectedStatus === "cancelled") {
        matchesStatus = order.status.startsWith("cancelled_") || order.status === "failed_payment";
      }

      if (!trimmedQuery) {
        return matchesStatus;
      }

      const haystack = [
        order.order_number,
        order.user_email,
        order.arrival_code,
        order.payment_method,
        order.payment_status,
        order.special_instructions,
      ]
        .map((value) => (value ? String(value).toLowerCase() : ""))
        .join(" ");

      return matchesStatus && haystack.includes(trimmedQuery);
    });
  }, [orders, selectedStatus, searchQuery]);

  if (!businessDetails) {
    return (
      <PageContainer>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography level="body-lg" color="neutral">
            Please select a business to manage product orders.
          </Typography>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
        >
          <Box>
            <Typography level="h2" fontWeight={700}>
              Orders
            </Typography>
            <Typography level="body-sm" color="neutral">
              Manage your product orders, payments, and pickup statuses
            </Typography>
          </Box>
          
          <Button
            startDecorator={<FiKey />}
            onClick={() => setVerifyModalOpen(true)}
            variant="solid"
            color="primary"
          >
            Verify Arrival Code
          </Button>
        </Stack>

        <Tabs value={selectedStatus} onChange={(_, value) => setSelectedStatus(value as string)}>
          <TabList>
            <Tab value="all">All ({statusCounts.all})</Tab>
            <Tab value="pending">Pending ({statusCounts.pending})</Tab>
            <Tab value="accepted">Accepted ({statusCounts.accepted})</Tab>
            <Tab value="preparing">Preparing ({statusCounts.preparing})</Tab>
            <Tab value="ready_for_pickup">Ready ({statusCounts.ready_for_pickup})</Tab>
            <Tab value="picked_up">Picked Up ({statusCounts.picked_up})</Tab>
            <Tab value="cancelled">Cancelled ({statusCounts.cancelled})</Tab>
          </TabList>
        </Tabs>

        <Input
          placeholder="Search by order number, customer email, or arrival code..."
          startDecorator={<FiSearch />}
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          sx={{ maxWidth: 400 }}
        />

        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {!loading && filteredOrders.length > 0 && (
          <Sheet variant="outlined" sx={{ borderRadius: "sm", overflow: "hidden" }}>
            <Table>
              <thead>
                <tr>
                  <th style={{ width: "22%" }}>Order</th>
                  <th style={{ width: "16%" }}>Customer</th>
                  <th style={{ width: "12%" }}>Pickup Date</th>
                  <th style={{ width: "12%" }}>Pickup Time</th>
                  <th style={{ width: "8%" }}>Items</th>
                  <th style={{ width: "12%" }}>Total</th>
                  <th style={{ width: "10%" }}>Payment</th>
                  <th style={{ width: "18%" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <Stack spacing={0.75}>
                        <Typography level="body-sm" fontWeight={600}>
                          {order.order_number}
                        </Typography>
                        {order.arrival_code && (
                          <Chip
                            size="sm"
                            variant="soft"
                            color="primary"
                            startDecorator={<FiCheckCircle size={12} />}
                          >
                            Arrival Code: {order.arrival_code}
                          </Chip>
                        )}
                        {order.special_instructions && (
                          <Typography level="body-xs" color="neutral" noWrap>
                            Note: {order.special_instructions}
                          </Typography>
                        )}
                      </Stack>
                    </td>
                    <td>
                      <Stack spacing={0.5}>
                        <Typography level="body-sm" fontWeight={600}>
                          {order.user_email || "—"}
                        </Typography>
                        {order.discount_name && (
                          <Chip size="sm" variant="soft" color="neutral">
                            Discount: {order.discount_name}
                          </Chip>
                        )}
                      </Stack>
                    </td>
                    <td>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <FiCalendar size={14} />
                        <Typography level="body-sm">
                          {formatPickupDate(order.pickup_datetime)}
                        </Typography>
                      </Stack>
                    </td>
                    <td>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <FiClock size={14} />
                        <Typography level="body-sm">
                          {formatPickupTime(order.pickup_datetime)}
                        </Typography>
                      </Stack>
                    </td>
                    <td>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <FiPackage size={14} />
                        <Typography level="body-sm">
                          {order.item_count ?? 0}
                        </Typography>
                      </Stack>
                    </td>
                    <td>
                      <Stack spacing={0.25}>
                        <Typography level="body-sm" fontWeight={600}>
                          {formatCurrency(order.total_amount)}
                        </Typography>
                        <Typography level="body-xs" color="neutral">
                          Subtotal: {formatCurrency(order.subtotal)}
                        </Typography>
                        {Number(order.discount_amount ?? 0) > 0 ? (
                          <Typography level="body-xs" color="danger">
                            −{formatCurrency(order.discount_amount)} discount
                          </Typography>
                        ) : null}
                      </Stack>
                    </td>
                    <td>
                      <Stack spacing={0.75}>
                        <Chip
                          size="sm"
                          variant="soft"
                          color={getPaymentChipColor(order.payment_method)}
                          startDecorator={<FiCreditCard size={12} />}
                        >
                          {paymentMethodLabels[order.payment_method ?? ""] ?? "Unknown"}
                        </Chip>
                        <Select
                          size="sm"
                          value={order.payment_status}
                          onChange={(_, value) => {
                            if (value) {
                              handlePaymentStatusChange(order.id, value);
                            }
                          }}
                        >
                          {paymentStatuses.map((status) => (
                            <Option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Option>
                          ))}
                        </Select>
                      </Stack>
                    </td>
                    <td>
                      {getOrderActions(order)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Sheet>
        )}

        {!loading && orders.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8, px: 2 }}>
            <FiPackage size={64} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Typography level="h4" mb={1}>
              No orders yet
            </Typography>
            <Typography level="body-sm" color="neutral">
              Product orders will appear here once customers start purchasing.
            </Typography>
          </Box>
        )}

        {!loading && orders.length > 0 && filteredOrders.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8, px: 2 }}>
            <FiSearch size={64} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Typography level="h4" mb={1}>
              No orders found
            </Typography>
            <Typography level="body-sm" color="neutral" mb={3}>
              Try adjusting your filters or search query.
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

      {/* Arrival Code Verification Modal */}
      <Modal open={verifyModalOpen} onClose={() => setVerifyModalOpen(false)}>
        <ModalDialog>
          <ModalClose />
          <DialogTitle>
            <Stack direction="row" spacing={1} alignItems="center">
              <FiKey size={20} />
              <span>Verify Arrival Code</span>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Typography level="body-sm" mb={2}>
              Enter the 6-digit arrival code shown by the customer
            </Typography>
            <FormControl>
              <FormLabel>Arrival Code</FormLabel>
              <Input
                placeholder="Enter 6-digit code"
                value={arrivalCodeInput}
                onChange={(e) => setArrivalCodeInput(e.target.value.toUpperCase())}
                slotProps={{
                  input: {
                    maxLength: 6,
                    style: {
                      letterSpacing: '8px',
                      fontSize: '24px',
                      textAlign: 'center',
                      fontWeight: 600,
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleVerifyArrivalCode();
                  }
                }}
                autoFocus
              />
            </FormControl>
            <Stack direction="row" spacing={2} mt={3}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setVerifyModalOpen(false);
                  setArrivalCodeInput("");
                }}
                disabled={verifying}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                onClick={handleVerifyArrivalCode}
                loading={verifying}
                disabled={arrivalCodeInput.length !== 6}
              >
                Verify & Mark Picked Up
              </Button>
            </Stack>
          </DialogContent>
        </ModalDialog>
      </Modal>
    </PageContainer>
  );
}
