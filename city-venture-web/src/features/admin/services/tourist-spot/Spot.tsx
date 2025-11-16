import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoAdd } from "react-icons/io5";
import { ListChecks, MapPin, Mountain, Star, Search } from "lucide-react";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import TouristSpotForm from "@/src/features/admin/services/tourist-spot/components/TouristSpotForm";
import type { TouristSpot } from "@/src/types/TouristSpot";
import { apiService } from "@/src/utils/api";
import Container from "@/src/components/Container";
import FeaturedSpotsModal from "@/src/features/admin/services/tourist-spot/components/FeaturedSpotsModal";
import PageContainer from "@/src/components/PageContainer";
import Table, { type TableColumn } from "@/src/components/ui/Table";
import DynamicTab from "@/src/components/ui/DynamicTab";
import NoDataFound from "@/src/components/NoDataFound";
import IconButton from "@/src/components/IconButton";
import { Input, Chip, Stack } from "@mui/joy";

const Spot = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddSpotModalVisible, setAddSpotModalVisible] = useState(false);
  const [isEditSpotModalVisible, setEditSpotModalVisible] = useState(false);
  const [isFeaturedModalOpen, setFeaturedModalOpen] = useState(false);
  const [selectedSpotForEdit, setSelectedSpotForEdit] = useState<
    TouristSpot | undefined
  >(undefined);
  const [spots, setSpots] = useState<TouristSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();
  const location = useLocation();

  const fetchSpotsAndCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const spotsData = await apiService.getTouristSpots();
      setSpots(spotsData);
    } catch (error) {
      console.error("Error:", error);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpotsAndCategories();
  }, [fetchSpotsAndCategories]);

  const tabs = [
    { id: "all", label: "All", icon: <ListChecks size={16} /> },
    { id: "active", label: "Active", icon: <MapPin size={16} /> },
    { id: "inactive", label: "Inactive", icon: <Mountain size={16} /> },
    { id: "featured", label: "Featured", icon: <Star size={16} /> },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  const handleViewDetails = (spot: TouristSpot) => {
    navigate(`/tourism/services/tourist-spot/${spot.id}`);
  };

  const handleViewReviews = (spot: TouristSpot) => {
    navigate(`/tourism/services/tourist-spot/${spot.id}/reviews`);
  };

  const handleEditSpot = (spot: TouristSpot) => {
    setSelectedSpotForEdit(spot);
    setEditSpotModalVisible(true);
  };

  const handleCloseEditModal = () => {
    setEditSpotModalVisible(false);
    setSelectedSpotForEdit(undefined);
    setSelectedEditStep(0);
  };

  const handleSpotUpdated = () => {
    fetchSpotsAndCategories();
    setEditSpotModalVisible(false);
    setSelectedSpotForEdit(undefined);
    setSelectedEditStep(0);
  };

  const filteredSpots = useMemo(() => {
    let filtered = spots;

    // Filter by tab status
    if (activeTab === "active") {
      filtered = filtered.filter((spot) => spot.spot_status === "active");
    } else if (activeTab === "inactive") {
      filtered = filtered.filter((spot) => spot.spot_status === "inactive");
    } else if (activeTab === "featured") {
      filtered = filtered.filter((spot) => spot.is_featured === true);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((spot) =>
        spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spot.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [spots, searchQuery, activeTab]);

  const [selectedEditStep, setSelectedEditStep] = useState<number>(0);

  // Define table columns
  const columns: TableColumn<TouristSpot>[] = [
    {
      id: "name",
      label: "Name",
      minWidth: 300,
      render: (row) => (
        <Typography.Body weight="normal">
          {row.name}
        </Typography.Body>
      ),
    },
    {
      id: "description",
      label: "Description",
      minWidth: 300,
      render: (row) => (
        <Typography.Body sx={{ opacity: 0.85 }}>
          {row.description?.substring(0, 60)}{row.description?.length > 60 ? "..." : ""}
        </Typography.Body>
      ),
    },
    {
      id: "categories",
      label: "Categories",
      minWidth: 250,
      render: (row) => (
        <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap" }}>
          {Array.isArray(row.categories)
            ? row.categories.slice(0, 2).map((cat, idx) => (
                <Chip key={idx} color="primary" variant="soft" size="md">
                  {cat.category || String(cat)}
                </Chip>
              ))
            : null}
          {row.categories?.length > 2 && (
            <Chip color="neutral" variant="soft" size="sm">
              +{row.categories.length - 2}
            </Chip>
          )}
        </Stack>
      ),
    },
    {
      id: "spot_status",
      label: "Status",
      minWidth: 150,
      render: (row) => (
        <Chip
          color={row.spot_status === "active" ? "success" : "neutral"}
          variant="soft"
          size="md"
        >
          {row.spot_status}
        </Chip>
      ),
    },
    {
      id: "is_featured",
      label: "Featured",
      minWidth: 100,
      align: "center",
      render: (row) => (
        row.is_featured ? (
          <Star size={18} fill="gold" color="gold" />
        ) : null
      ),
    },
    {
      id: "actions",
      label: "Actions",
      minWidth: 200,
      render: (row) => (
        <Stack direction="row" spacing={0.75}>
          <Button
            variant="outlined"
            colorScheme="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEditSpot(row);
            }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            colorScheme="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleViewReviews(row);
            }}
          >
            Reviews
          </Button>
        </Stack>
      ),
    },
  ];

  // Handle navigation state coming from the details screen requesting to open edit modal
  useEffect(() => {
    const state = location.state as { editSpotId?: string; editStep?: number } | null;
    if (state?.editSpotId) {
      const openEdit = async () => {
        const { editSpotId, editStep = 0 } = state;
        if (!editSpotId) {
          navigate(".", { replace: true, state: {} });
          return;
        }
        try {
          // Prefer existing in-memory list, fallback to API
          let spotToEdit = spots.find((s) => s.id === editSpotId);
          if (!spotToEdit) {
            spotToEdit = await apiService.getTouristSpotById(editSpotId);
          }
          setSelectedSpotForEdit(spotToEdit);
          setSelectedEditStep(editStep);
          setEditSpotModalVisible(true);
        } catch (e) {
          console.error("Failed to prepare edit from details:", e);
          setSelectedSpotForEdit(undefined);
          setSelectedEditStep(editStep);
          setEditSpotModalVisible(true);
        } finally {
          // Clear state to avoid reopening on re-render/navigation
          navigate(".", { replace: true, state: {} });
        }
      };
      openEdit();
    }
  }, [location.state, spots, navigate]);

  return (
    <PageContainer>
      {/* Tourist Spot Management */}
      <Container gap="0" padding="0" elevation={3}>
        <Container
          direction="row"
          justify="space-between"
          align="center"
          padding="16px 16px 0 16px"
          style={{ flexWrap: "wrap", rowGap: 12, columnGap: 12 }}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              flex: 1,
              minWidth: 240,
            }}
          >
            <Typography.Header>Tourist Spot Management</Typography.Header>
            <Button
              startDecorator={<Star />}
              colorScheme="secondary"
              variant="solid"
              onClick={() => setFeaturedModalOpen(true)}
            >
              Featured
            </Button>
          </div>

          <IconButton
            onClick={() => setAddSpotModalVisible(true)}
            size="lg"
            floating
            floatPosition="bottom-right"
            hoverEffect="rotate"
          >
            <IoAdd />
          </IconButton>
        </Container>

        {/* Search */}
        <Container
          padding="20px 20px 0 20px"
          direction="row"
          justify="space-between"
          align="center"
        >
          <Input
            startDecorator={<Search />}
            placeholder="Search Tourist Spots"
            size="lg"
            fullWidth
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </Container>

        {/* Tabs */}
        <DynamicTab
          tabs={tabs}
          activeTabId={activeTab}
          onChange={(tabId) => {
            setActiveTab(String(tabId));
          }}
        />
      </Container>

      <Container background="transparent" padding="0">
        {loading ? (
          <Container
            align="center"
            justify="center"
            padding="4rem"
            style={{ minHeight: "400px" }}
          >
            <div className="loading-spinner" />
            <Typography.Body size="normal" sx={{ color: "#666", marginTop: "1rem" }}>
              Loading tourist spots...
            </Typography.Body>
          </Container>
        ) : error ? (
          <Container
            align="center"
            justify="center"
            padding="4rem"
            style={{ minHeight: "400px" }}
          >
            <Typography.Body size="normal" sx={{ color: "#ff4d4d" }}>
              Error: {error}
            </Typography.Body>
          </Container>
        ) : spots.length === 0 ? (
          <NoDataFound
            icon="database"
            title="No Tourist Spots Listed"
            message="No tourist spots yet. Add your first spot above."
          >
            <Button
              onClick={() => setAddSpotModalVisible(true)}
              startDecorator={<IoAdd size={20} />}
              colorScheme="primary"
              variant="solid"
              size="md"
            >
              Add Tourist Spot
            </Button>
          </NoDataFound>
        ) : filteredSpots.length === 0 && searchQuery.trim() !== "" ? (
          <NoDataFound
            icon="search"
            title="No Results Found"
            message={`No spots match "${searchQuery}". Try a different search term.`}
          />
        ) : (
          <Table
            columns={columns}
            data={filteredSpots}
            rowKey="id"
            onRowClick={(row) => handleViewDetails(row)}
            rowsPerPage={10}
            loading={loading}
            emptyMessage="No tourist spots found"
            stickyHeader
            maxHeight="600px"
          />
        )}
      </Container>

      <TouristSpotForm
        isVisible={isAddSpotModalVisible}
        onClose={() => setAddSpotModalVisible(false)}
        onSpotAdded={fetchSpotsAndCategories}
        mode="add"
      />

      <TouristSpotForm
        isVisible={isEditSpotModalVisible}
        onClose={handleCloseEditModal}
        onSpotUpdated={handleSpotUpdated}
        initialData={selectedSpotForEdit}
        initialStep={selectedEditStep}
        mode="edit"
      />

      <FeaturedSpotsModal
        open={isFeaturedModalOpen}
        onClose={() => setFeaturedModalOpen(false)}
      />
    </PageContainer>
  );
};

export default Spot;
