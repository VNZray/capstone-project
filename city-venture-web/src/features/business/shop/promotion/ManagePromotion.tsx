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
  Divider,
} from "@mui/joy";
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiVolume2, 
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiSearch,
  FiRefreshCw,
  FiExternalLink,
  FiImage,
  FiGrid,
  FiList,
} from "react-icons/fi";
import PageContainer from "@/src/components/PageContainer";
import { useBusiness } from "@/src/context/BusinessContext";
import * as PromotionService from "@/src/services/PromotionService";
import PromotionCard from "@/src/features/business/shop/promotion/PromotionCard";
import type { Promotion } from "@/src/types/Promotion";

type PromotionFilter = "all" | "active" | "scheduled" | "expired";
type ViewType = "table" | "grid";

export default function ManagePromotion() {
  const navigate = useNavigate();
  const { businessDetails } = useBusiness();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<PromotionFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewType, setViewType] = useState<ViewType>("table");
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch promotions
  const fetchData = useCallback(async () => {
    if (!businessDetails?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const promotionsData = await PromotionService.fetchPromotionsByBusinessId(businessDetails.id);
      setPromotions(Array.isArray(promotionsData) ? promotionsData : []);
    } catch (err) {
      console.error("Error fetching promotions:", err);
      setError("Failed to load promotions. Please try again.");
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  }, [businessDetails?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter promotions based on active filter and search query
  const filteredPromotions = useMemo(() => {
    const now = new Date();

    return promotions.filter((promotion) => {
      const startDate = new Date(promotion.start_date);
      const endDate = promotion.end_date ? new Date(promotion.end_date) : null;

      const isExpired = !!endDate && endDate < now;
      const isScheduled = startDate > now;
      const isActive = promotion.is_active && !isExpired && !isScheduled;

      // Status filter logic
      let matchesStatus = false;
      switch (activeFilter) {
        case "all":
          matchesStatus = true;
          break;
        case "active":
          matchesStatus = isActive;
          break;
        case "scheduled":
          matchesStatus = isScheduled && promotion.is_active;
          break;
        case "expired":
          matchesStatus = isExpired || !promotion.is_active;
          break;
        default:
          matchesStatus = true;
      }

      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        promotion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        promotion.description?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [promotions, activeFilter, searchQuery]);

  // Get count for each filter
  const getFilterCount = (filter: PromotionFilter): number => {
    const now = new Date();

    switch (filter) {
      case "all":
        return promotions.length;

      case "active":
        return promotions.filter((p) => {
          const startDate = new Date(p.start_date);
          const endDate = p.end_date ? new Date(p.end_date) : null;
          const isExpired = !!endDate && endDate < now;
          const isScheduled = startDate > now;
          return p.is_active && !isExpired && !isScheduled;
        }).length;

      case "scheduled":
        return promotions.filter((p) => {
          const startDate = new Date(p.start_date);
          return startDate > now && p.is_active;
        }).length;

      case "expired":
        return promotions.filter((p) => {
          const endDate = p.end_date ? new Date(p.end_date) : null;
          const isExpired = !!endDate && endDate < now;
          return isExpired || !p.is_active;
        }).length;

      default:
        return 0;
    }
  };

  // Handle delete promotion
  const handleDelete = async (promotion: Promotion) => {
    if (!confirm(`Are you sure you want to delete "${promotion.title}"?`)) {
      return;
    }

    try {
      await PromotionService.deletePromotion(promotion.id);
      setSuccess("Promotion deleted successfully!");
      fetchData();
    } catch (err) {
      console.error("Error deleting promotion:", err);
      setError("Failed to delete promotion. Please try again.");
    }
  };

  // Handle open edit page
  const handleEdit = (promotion: Promotion) => {
  navigate(`/business/promotion/${promotion.id}/edit`);
  };

  // Handle open create page
  const handleCreate = () => {
  navigate("/business/promotion/create");
  };

  // Get effective status
  const getEffectiveStatus = (promotion: Promotion): string => {
    const now = new Date();
    const startDate = new Date(promotion.start_date);
    const endDate = promotion.end_date ? new Date(promotion.end_date) : null;
    
    if (!promotion.is_active) return "inactive";
    if (endDate && endDate < now) return "expired";
    if (startDate > now) return "scheduled";
    return "active";
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "expired":
        return "danger";
      case "scheduled":
        return "primary";
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
      case "scheduled":
        return <FiClock />;
      default:
        return <FiClock />;
    }
  };

  // Format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Check if business is selected
  if (!businessDetails?.id) {
    return (
      <PageContainer>
        <Alert color="warning" variant="soft" startDecorator={<FiAlertCircle />}>
          Please select a business to manage promotions.
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
          <Box>
            <Typography level="h2" fontWeight="bold">
              Promotion Management
            </Typography>
            <Typography level="body-md" textColor="text.secondary">
              Create and manage promotional announcements for your business
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Refresh promotions">
              <IconButton
                onClick={fetchData}
                loading={loading}
                color="neutral"
                variant="outlined"
                size="lg"
              >
                <FiRefreshCw />
              </IconButton>
            </Tooltip>
            <Button
              startDecorator={<FiPlus />}
              onClick={handleCreate}
              size="lg"
            >
              Create Promotion
            </Button>
          </Box>
        </Box>

        {/* Status Tabs */}
        {!loading && !error && promotions.length > 0 && (
          <Tabs
            value={activeFilter}
            onChange={(_, value) => setActiveFilter(value as PromotionFilter)}
          >
            <TabList>
              <Tab value="all">
                All ({getFilterCount("all")})
              </Tab>
              <Tab value="active">
                Active ({getFilterCount("active")})
              </Tab>
              <Tab value="scheduled">
                Scheduled ({getFilterCount("scheduled")})
              </Tab>
              <Tab value="expired">
                Expired ({getFilterCount("expired")})
              </Tab>
            </TabList>
          </Tabs>
        )}

        {/* Search */}
        {!loading && !error && promotions.length > 0 && (
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ alignItems: "center" }}>
            <Input
              placeholder="Search by promotion title or description..."
              startDecorator={<FiSearch />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flex: 1, minWidth: 250, maxWidth: 500 }}
            />
            <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
              <Tooltip title="Table view">
                <IconButton
                  variant={viewType === "table" ? "solid" : "outlined"}
                  color={viewType === "table" ? "primary" : "neutral"}
                  onClick={() => setViewType("table")}
                >
                  <FiList />
                </IconButton>
              </Tooltip>
              <Tooltip title="Card view">
                <IconButton
                  variant={viewType === "grid" ? "solid" : "outlined"}
                  color={viewType === "grid" ? "primary" : "neutral"}
                  onClick={() => setViewType("grid")}
                >
                  <FiGrid />
                </IconButton>
              </Tooltip>
            </Box>
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
        {!loading && !error && promotions.length === 0 && (
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
                <FiVolume2 size={32} />
              </Box>
              <Typography level="h4" fontWeight="bold">
                No Promotions Yet
              </Typography>
              <Typography level="body-md" textColor="text.secondary" sx={{ maxWidth: 400 }}>
                Create your first promotion to announce special offers, events, or updates to your customers
              </Typography>
              <Button
                startDecorator={<FiPlus />}
                onClick={handleCreate}
                size="lg"
              >
                Create Your First Promotion
              </Button>
            </Stack>
          </Card>
        )}

        {/* Filtered Empty State */}
        {!loading && !error && promotions.length > 0 && filteredPromotions.length === 0 && (
          <Card variant="outlined" sx={{ textAlign: "center", py: 6 }}>
            <Stack spacing={2} alignItems="center">
              <Typography level="h4" fontWeight="bold">
                No {activeFilter === "all" ? "" : activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Promotions
              </Typography>
              <Typography level="body-md" textColor="text.secondary">
                {activeFilter === "active" && "No promotions are currently active and running."}
                {activeFilter === "scheduled" && "No promotions are scheduled for the future."}
                {activeFilter === "expired" && "No promotions have expired yet."}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setActiveFilter("all")}
              >
                View All Promotions
              </Button>
            </Stack>
          </Card>
        )}

        {/* Promotions Table or Grid */}
        {!loading && !error && filteredPromotions.length > 0 && viewType === "table" && (
          <Card variant="outlined">
            <Box sx={{ overflow: "auto" }}>
              <Table>
                <thead>
                  <tr>
                    <th style={{ width: "35%" }}>Promotion</th>
                    <th style={{ width: "25%" }}>Valid Period</th>
                    <th style={{ width: "15%" }}>Media</th>
                    <th style={{ width: "10%" }}>Status</th>
                    <th style={{ width: "15%", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPromotions.map((promotion) => (
                    <tr key={promotion.id}>
                      <td>
                        <Stack spacing={0.5}>
                          <Typography level="title-sm" fontWeight="md">
                            {promotion.title}
                          </Typography>
                          {promotion.description && (
                            <Typography level="body-xs" textColor="text.secondary">
                              {promotion.description.length > 60
                                ? `${promotion.description.substring(0, 60)}...`
                                : promotion.description}
                            </Typography>
                          )}
                        </Stack>
                      </td>
                      <td>
                        <Stack spacing={0.5}>
                          <Typography level="body-xs" fontWeight="md">
                            {formatDateTime(promotion.start_date)}
                          </Typography>
                          <Typography level="body-xs" textColor="text.secondary">
                            {promotion.end_date
                              ? `to ${formatDateTime(promotion.end_date)}`
                              : "No end date"}
                          </Typography>
                        </Stack>
                      </td>
                      <td>
                        <Stack direction="row" spacing={0.5}>
                          {promotion.image_url && (
                            <Chip
                              variant="soft"
                              color="neutral"
                              size="sm"
                              startDecorator={<FiImage />}
                            >
                              Image
                            </Chip>
                          )}
                          {promotion.external_link && (
                            <Chip
                              variant="soft"
                              color="primary"
                              size="sm"
                              startDecorator={<FiExternalLink />}
                            >
                              Link
                            </Chip>
                          )}
                          {!promotion.image_url && !promotion.external_link && (
                            <Typography level="body-xs" textColor="text.tertiary">
                              None
                            </Typography>
                          )}
                        </Stack>
                      </td>
                      <td>
                        <Chip
                          variant="soft"
                          color={getStatusColor(getEffectiveStatus(promotion))}
                          startDecorator={getStatusIcon(getEffectiveStatus(promotion))}
                          size="sm"
                        >
                          {getEffectiveStatus(promotion)}
                        </Chip>
                      </td>
                      <td>
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Edit">
                            <IconButton
                              size="sm"
                              variant="plain"
                              color="neutral"
                              onClick={() => handleEdit(promotion)}
                            >
                              <FiEdit2 />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="sm"
                              variant="plain"
                              color="danger"
                              onClick={() => handleDelete(promotion)}
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

        {/* Promotions Card Grid View */}
        {!loading && !error && filteredPromotions.length > 0 && viewType === "grid" && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 2,
            }}
          >
            {filteredPromotions.map((promotion) => (
              <PromotionCard
                key={promotion.id}
                promotion={promotion}
                onEdit={handleEdit}
                onDelete={handleDelete}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
                getEffectiveStatus={getEffectiveStatus}
                formatDateTime={formatDateTime}
              />
            ))}
          </Box>
        )}

        {/* Summary Stats */}
        {!loading && !error && promotions.length > 0 && (
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }}>
            <Card variant="soft" color="primary">
              <Typography level="body-sm" textColor="text.secondary">
                Total Promotions
              </Typography>
              <Typography level="h3" fontWeight="bold">
                {promotions.length}
              </Typography>
            </Card>
            <Card variant="soft" color="success">
              <Typography level="body-sm" textColor="text.secondary">
                Active Promotions
              </Typography>
              <Typography level="h3" fontWeight="bold">
                {getFilterCount("active")}
              </Typography>
            </Card>
          </Box>
        )}
      </Stack>

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
