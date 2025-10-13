import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  Stack,
  Box,
  Card,
  Table,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Snackbar,
  Tooltip,
  Tabs,
  TabList,
  Tab,
  Input,
  Select,
  Option,
} from "@mui/joy";
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiPercent, 
  FiBarChart2,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiPause,
  FiSearch,
  FiFilter,
} from "react-icons/fi";
import PageContainer from "@/src/components/PageContainer";
import { useBusiness } from "@/src/context/BusinessContext";
import * as DiscountService from "@/src/services/DiscountService";
import DiscountStatsModal from "./components/DiscountStatsModal";
import type { Discount } from "@/src/types/Discount";

type DiscountFilter = "all" | "ongoing" | "scheduled" | "expired" | "inactive";

export default function DiscountManagement(): React.ReactElement {
  const navigate = useNavigate();
  const { businessDetails } = useBusiness();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<DiscountFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [discountTypeFilter, setDiscountTypeFilter] = useState<string>("all");
  
  // Modal states
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [selectedDiscountId, setSelectedDiscountId] = useState<string>("");
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch discounts
  const fetchData = useCallback(async () => {
    if (!businessDetails?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const discountsData = await DiscountService.fetchDiscountsByBusinessId(businessDetails.id);
      
      setDiscounts(Array.isArray(discountsData) ? discountsData : []);
    } catch (err) {
      console.error("Error fetching discounts:", err);
      setError("Failed to load discounts. Please try again.");
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  }, [businessDetails?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter discounts based on active filter, search query, and discount type
  const filteredDiscounts = useMemo(() => {
    const now = new Date();

    return discounts.filter((discount) => {
      const startDate = new Date(discount.start_datetime);
      const endDate = discount.end_datetime ? new Date(discount.end_datetime) : null;

      // Status filter logic
      let matchesStatus = false;
      switch (activeFilter) {
        case "all":
          matchesStatus = true;
          break;

        case "ongoing":
          // Active status AND currently within date range
          matchesStatus = (
            discount.status === "active" &&
            startDate <= now &&
            (!endDate || endDate >= now)
          );
          break;

        case "scheduled":
          // Active status BUT start date is in the future
          matchesStatus = discount.status === "active" && startDate > now;
          break;

        case "expired":
          // Expired status OR end date has passed
          matchesStatus = 
            discount.status === "expired" ||
            (!!endDate && endDate < now && discount.status !== "inactive");
          break;

        case "inactive":
          // Inactive or paused status
          matchesStatus = discount.status === "inactive" || discount.status === "paused";
          break;

        default:
          matchesStatus = true;
      }

      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        discount.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        discount.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Discount type filter
      const matchesType =
        discountTypeFilter === "all" ||
        discount.discount_type === discountTypeFilter;

      return matchesStatus && matchesSearch && matchesType;
    });
  }, [discounts, activeFilter, searchQuery, discountTypeFilter]);

  // Get count for each filter
  const getFilterCount = (filter: DiscountFilter): number => {
    const now = new Date();

    switch (filter) {
      case "all":
        return discounts.length;

      case "ongoing":
        return discounts.filter((d) => {
          const startDate = new Date(d.start_datetime);
          const endDate = d.end_datetime ? new Date(d.end_datetime) : null;
          return d.status === "active" && startDate <= now && (!endDate || endDate >= now);
        }).length;

      case "scheduled":
        return discounts.filter((d) => {
          const startDate = new Date(d.start_datetime);
          return d.status === "active" && startDate > now;
        }).length;

      case "expired":
        return discounts.filter((d) => {
          const endDate = d.end_datetime ? new Date(d.end_datetime) : null;
          return d.status === "expired" || (endDate && endDate < now && d.status !== "inactive");
        }).length;

      case "inactive":
        return discounts.filter((d) => d.status === "inactive" || d.status === "paused").length;

      default:
        return 0;
    }
  };

  // Handle delete discount
  const handleDelete = async (discount: Discount) => {
    if (!confirm(`Are you sure you want to delete "${discount.name}"?`)) {
      return;
    }

    try {
      await DiscountService.deleteDiscount(discount.id);
      setSuccess("Discount deleted successfully!");
      fetchData();
    } catch (err) {
      console.error("Error deleting discount:", err);
      setError("Failed to delete discount. Please try again.");
    }
  };

  // Handle open edit page
  const handleEdit = (discount: Discount) => {
    navigate(`/business/store/discount/${discount.id}/edit`);
  };

  // Handle open stats modal
  const handleViewStats = (discount: Discount) => {
    setSelectedDiscountId(discount.id);
    setStatsModalOpen(true);
  };

  // Handle open create page
  const handleCreate = () => {
    navigate("/business/store/discount/create");
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "expired":
        return "danger";
      case "paused":
        return "warning";
      default:
        return "neutral";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <FiCheckCircle />;
      case "expired":
        return <FiAlertCircle />;
      case "paused":
        return <FiPause />;
      default:
        return <FiClock />;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Check if business is selected
  if (!businessDetails?.id) {
    return (
      <PageContainer>
        <Alert color="warning" variant="soft" startDecorator={<FiAlertCircle />}>
          Please select a business to manage discounts.
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography level="h2" fontWeight="bold">
              Discount Management
            </Typography>
            <Typography level="body-md" textColor="text.secondary">
              Create and manage discounts for your products
            </Typography>
          </Box>
          <Button
            startDecorator={<FiPlus />}
            onClick={handleCreate}
            size="lg"
          >
            Create Discount
          </Button>
        </Box>

        {/* Status Tabs */}
        {!loading && !error && discounts.length > 0 && (
          <Tabs
            value={activeFilter}
            onChange={(_, value) => setActiveFilter(value as DiscountFilter)}
          >
            <TabList>
              <Tab value="all">
                All ({getFilterCount("all")})
              </Tab>
              <Tab value="ongoing">
                Ongoing ({getFilterCount("ongoing")})
              </Tab>
              <Tab value="scheduled">
                Scheduled ({getFilterCount("scheduled")})
              </Tab>
              <Tab value="expired">
                Expired ({getFilterCount("expired")})
              </Tab>
              <Tab value="inactive">
                Inactive ({getFilterCount("inactive")})
              </Tab>
            </TabList>
          </Tabs>
        )}

        {/* Search and Filters */}
        {!loading && !error && discounts.length > 0 && (
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <Input
              placeholder="Search by discount name or description..."
              startDecorator={<FiSearch />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flex: 1, minWidth: 250, maxWidth: 500 }}
            />
            <Select
              placeholder="Discount Type"
              value={discountTypeFilter}
              onChange={(_, value) => setDiscountTypeFilter(value as string)}
              startDecorator={<FiFilter />}
              sx={{ minWidth: 200 }}
            >
              <Option value="all">All Types</Option>
              <Option value="percentage">Percentage</Option>
              <Option value="fixed_amount">Fixed Amount</Option>
            </Select>
          </Stack>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Error State */}
        {error && !loading && (
          <Alert color="danger" variant="soft" startDecorator={<FiAlertCircle />}>
            {error}
          </Alert>
        )}

        {/* Empty State */}
        {!loading && !error && discounts.length === 0 && (
          <Card variant="outlined" sx={{ textAlign: "center", py: 8 }}>
            <Stack spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  bgcolor: "background.level2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FiPercent size={32} />
              </Box>
              <Typography level="h4" fontWeight="bold">
                No Discounts Yet
              </Typography>
              <Typography level="body-md" textColor="text.secondary" sx={{ maxWidth: 400 }}>
                Create your first discount to attract more customers and boost sales
              </Typography>
              <Button
                startDecorator={<FiPlus />}
                onClick={handleCreate}
                size="lg"
              >
                Create Your First Discount
              </Button>
            </Stack>
          </Card>
        )}

        {/* Filtered Empty State */}
        {!loading && !error && discounts.length > 0 && filteredDiscounts.length === 0 && (
          <Card variant="outlined" sx={{ textAlign: "center", py: 6 }}>
            <Stack spacing={2} alignItems="center">
              <Typography level="h4" fontWeight="bold">
                No {activeFilter === "all" ? "" : activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Discounts
              </Typography>
              <Typography level="body-md" textColor="text.secondary">
                {activeFilter === "ongoing" && "No discounts are currently active and running."}
                {activeFilter === "scheduled" && "No discounts are scheduled for the future."}
                {activeFilter === "expired" && "No discounts have expired yet."}
                {activeFilter === "inactive" && "No discounts are inactive or paused."}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setActiveFilter("all")}
              >
                View All Discounts
              </Button>
            </Stack>
          </Card>
        )}

        {/* Discounts Table */}
        {!loading && !error && filteredDiscounts.length > 0 && (
          <Card variant="outlined">
            <Box sx={{ overflow: "auto" }}>
              <Table>
                <thead>
                  <tr>
                    <th style={{ width: "25%" }}>Name</th>
                    <th style={{ width: "15%" }}>Type</th>
                    <th style={{ width: "15%" }}>Value</th>
                    <th style={{ width: "15%" }}>Valid Period</th>
                    <th style={{ width: "10%" }}>Usage</th>
                    <th style={{ width: "10%" }}>Status</th>
                    <th style={{ width: "10%", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDiscounts.map((discount) => (
                    <tr key={discount.id}>
                      <td>
                        <Stack spacing={0.5}>
                          <Typography level="title-sm" fontWeight="md">
                            {discount.name}
                          </Typography>
                          {discount.description && (
                            <Typography level="body-xs" textColor="text.secondary">
                              {discount.description.length > 50
                                ? `${discount.description.substring(0, 50)}...`
                                : discount.description}
                            </Typography>
                          )}
                        </Stack>
                      </td>
                      <td>
                        <Chip variant="soft" size="sm">
                          {discount.discount_type === "percentage" ? "Percentage" : "Fixed Amount"}
                        </Chip>
                      </td>
                      <td>
                        <Typography level="body-sm" fontWeight="md">
                          {discount.discount_type === "percentage"
                            ? `${discount.discount_value}%`
                            : formatCurrency(discount.discount_value)}
                        </Typography>
                        {discount.minimum_order_amount > 0 && (
                          <Typography level="body-xs" textColor="text.secondary">
                            Min: {formatCurrency(discount.minimum_order_amount)}
                          </Typography>
                        )}
                      </td>
                      <td>
                        <Stack spacing={0.5}>
                          <Typography level="body-xs">
                            {formatDate(discount.start_datetime)}
                          </Typography>
                          <Typography level="body-xs" textColor="text.secondary">
                            {discount.end_datetime
                              ? `to ${formatDate(discount.end_datetime)}`
                              : "No end date"}
                          </Typography>
                        </Stack>
                      </td>
                      <td>
                        <Typography level="body-sm">
                          {discount.current_usage_count}
                          {discount.usage_limit ? ` / ${discount.usage_limit}` : ""}
                        </Typography>
                      </td>
                      <td>
                        <Chip
                          variant="soft"
                          color={getStatusColor(discount.status)}
                          startDecorator={getStatusIcon(discount.status)}
                          size="sm"
                        >
                          {discount.status}
                        </Chip>
                      </td>
                      <td>
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="View Statistics">
                            <IconButton
                              size="sm"
                              variant="plain"
                              color="primary"
                              onClick={() => handleViewStats(discount)}
                            >
                              <FiBarChart2 />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="sm"
                              variant="plain"
                              color="neutral"
                              onClick={() => handleEdit(discount)}
                            >
                              <FiEdit2 />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="sm"
                              variant="plain"
                              color="danger"
                              onClick={() => handleDelete(discount)}
                            >
                              <FiTrash2 />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Box>
          </Card>
        )}

        {/* Summary Stats */}
        {!loading && !error && discounts.length > 0 && (
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }}>
            <Card variant="soft" color="primary">
              <Typography level="body-sm" textColor="text.secondary">
                Total Discounts
              </Typography>
              <Typography level="h3" fontWeight="bold">
                {discounts.length}
              </Typography>
            </Card>
            <Card variant="soft" color="success">
              <Typography level="body-sm" textColor="text.secondary">
                Active Discounts
              </Typography>
              <Typography level="h3" fontWeight="bold">
                {discounts.filter(d => d.status === "active").length}
              </Typography>
            </Card>
            <Card variant="soft" color="warning">
              <Typography level="body-sm" textColor="text.secondary">
                Total Usage
              </Typography>
              <Typography level="h3" fontWeight="bold">
                {discounts.reduce((sum, d) => sum + d.current_usage_count, 0)}
              </Typography>
            </Card>
          </Box>
        )}
      </Stack>

      {/* Modals */}
      <DiscountStatsModal
        open={statsModalOpen}
        onClose={() => {
          setStatsModalOpen(false);
          setSelectedDiscountId("");
        }}
        discountId={selectedDiscountId}
        discountName={discounts.find(d => d.id === selectedDiscountId)?.name || ""}
      />

      {/* Notifications */}
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
        color="success"
        variant="soft"
      >
        {success}
      </Snackbar>
    </PageContainer>
  );
}
