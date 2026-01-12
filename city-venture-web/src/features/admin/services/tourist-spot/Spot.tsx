import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoAdd } from "react-icons/io5";
import {
  Star,
  Search,
  Landmark,
  Church,
  History,
  Trees,
  Building2,
} from "lucide-react";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import TouristSpotForm from "@/src/features/admin/services/tourist-spot/components/TouristSpotForm";
import TouristSpotCard from "@/src/features/admin/services/tourist-spot/components/TouristSpotCard";
import type { TouristSpot } from "@/src/types/TouristSpot";
import type { Category } from "@/src/types/Category";
import { apiService } from "@/src/utils/api";
import Container from "@/src/components/Container";
import FeaturedSpotsModal from "@/src/features/admin/services/tourist-spot/components/FeaturedSpotsModal";
import MySubmissionsModal from "@/src/features/admin/services/tourist-spot/components/MySubmissionsModal";
import Alert from "@/src/components/Alert";
import PageContainer from "@/src/components/PageContainer";
import Table, { type TableColumn } from "@/src/components/ui/Table";
import DynamicTab from "@/src/components/ui/DynamicTab";
import NoDataFound from "@/src/components/NoDataFound";
import IconButton from "@/src/components/IconButton";
import { Input, Chip, Stack, Select, Option, Box } from "@mui/joy";
import placeholderImage from "@/src/assets/images/placeholder-image.png";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import TableRowsRoundedIcon from "@mui/icons-material/TableRowsRounded";

const Spot = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddSpotModalVisible, setAddSpotModalVisible] = useState(false);
  const [isEditSpotModalVisible, setEditSpotModalVisible] = useState(false);
  const [isFeaturedModalOpen, setFeaturedModalOpen] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedSpotForEdit, setSelectedSpotForEdit] = useState<
    TouristSpot | undefined
  >(undefined);
  const [spots, setSpots] = useState<TouristSpot[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mainCategoryTab, setMainCategoryTab] = useState<string>("All");
  const [subCategoryTab, setSubCategoryTab] = useState<string>("All");
  const [isMySubmissionsModalOpen, setMySubmissionsModalOpen] = useState(false);

  type DisplayMode = "cards" | "table";
  const [display, setDisplay] = useState<DisplayMode>("cards");
  const [statusFilter, setStatusFilter] = useState<
    "active" | "inactive" | "all"
  >("all");
  const navigate = useNavigate();
  const location = useLocation();

  const fetchSpotsAndCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const spotsData = await apiService.getTouristSpots();
      setSpots(spotsData);
      try {
        const { categories, types } = await apiService.getCategoriesAndTypes();
        // Merge root categories (types) and subcategories
        setAllCategories([...(types as unknown as Category[]), ...categories]);
      } catch {
        console.warn(
          "Failed to fetch full category tree, filtering might be limited."
        );
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  // Map category string to an icon for dynamic tabs
  const categoryIconFor = (name?: string): React.ReactNode => {
    const n = String(name || "").toLowerCase();
    if (n.includes("museum")) return <Landmark size={16} />;
    if (n.includes("church")) return <Church size={16} />;
    if (n.includes("historic") || n.includes("historical"))
      return <History size={16} />;
    if (n.includes("nature") || n.includes("park") || n.includes("mountain"))
      return <Trees size={16} />;
    if (n.includes("urban")) return <Building2 size={16} />;
    return <Landmark size={16} />;
  };

  useEffect(() => {
    fetchSpotsAndCategories();
  }, [fetchSpotsAndCategories]);

  // Compute available Main Categories based on existing spots
  const mainTabs = useMemo(() => {
    const usedMainIds = new Set<number>();

    spots.forEach((spot) => {
      spot.categories?.forEach((cat) => {
        // Find the category definition
        const def = allCategories.find((c) => c.id === Number(cat.category_id));
        if (def) {
          if (def.parent_category) {
            usedMainIds.add(def.parent_category);
          } else {
            usedMainIds.add(def.id);
          }
        }
      });
    });

    const tabs = Array.from(usedMainIds)
      .map((id) => {
        const cat = allCategories.find((c) => c.id === id);
        return cat
          ? {
              id: String(cat.id),
              label: cat.title,
              icon: categoryIconFor(cat.title),
            }
          : null;
      })
      .filter(
        (t): t is { id: string; label: string; icon: React.ReactNode } =>
          t !== null
      );

    return [
      { id: "All", label: "All", icon: <Landmark size={16} /> },
      ...tabs.sort((a, b) => a.label.localeCompare(b.label)),
    ];
  }, [spots, allCategories]);

  // Compute available Subcategories based on selected Main Category and existing spots
  const subTabs = useMemo(() => {
    if (mainCategoryTab === "All") return [];

    const mainId = Number(mainCategoryTab);
    const usedSubIds = new Set<number>();

    spots.forEach((spot) => {
      spot.categories?.forEach((cat) => {
        const def = allCategories.find((c) => c.id === Number(cat.category_id));
        // Check if this category is a child of the selected main category
        if (def && def.parent_category === mainId) {
          usedSubIds.add(def.id);
        }
      });
    });

    const tabs = Array.from(usedSubIds)
      .map((id) => {
        const cat = allCategories.find((c) => c.id === id);
        return cat
          ? {
              id: String(cat.id),
              label: cat.title,
              icon: categoryIconFor(cat.title),
            }
          : null;
      })
      .filter(
        (t): t is { id: string; label: string; icon: React.ReactNode } =>
          t !== null
      );

    if (tabs.length === 0) return [];

    return [
      { id: "All", label: "All", icon: <Landmark size={16} /> },
      ...tabs.sort((a, b) => a.label.localeCompare(b.label)),
    ];
  }, [spots, allCategories, mainCategoryTab]);

  // Reset subcategory when main category changes
  useEffect(() => {
    setSubCategoryTab("All");
  }, [mainCategoryTab]);

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

  const handleDeleteSpot = (spot: TouristSpot) => {
    setSelectedSpotForEdit(spot);
    setShowDelete(true);
  };

  const doDeleteSpot = async () => {
    if (!selectedSpotForEdit) return;
    setDeleteLoading(true);
    try {
      await apiService.deleteTouristSpot(selectedSpotForEdit.id);
      setShowDelete(false);
      setSelectedSpotForEdit(undefined);
      fetchSpotsAndCategories();
    } catch (e: any) {
      console.error("Failed to delete spot", e);
    } finally {
      setDeleteLoading(false);
    }
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

    // Filter by Main Category
    if (mainCategoryTab && mainCategoryTab !== "All") {
      const mainId = Number(mainCategoryTab);
      filtered = filtered.filter((spot) =>
        Array.isArray(spot.categories)
          ? spot.categories.some((cat) => {
              const def = allCategories.find(
                (c) => c.id === Number(cat.category_id)
              );
              // Match if category is the main category OR its parent is the main category
              return (
                def && (def.id === mainId || def.parent_category === mainId)
              );
            })
          : false
      );
    }

    // Filter by Subcategory
    if (subCategoryTab && subCategoryTab !== "All") {
      const subId = Number(subCategoryTab);
      filtered = filtered.filter((spot) =>
        Array.isArray(spot.categories)
          ? spot.categories.some((cat) => Number(cat.category_id) === subId)
          : false
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (spot) =>
          spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          spot.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (spot) => spot.spot_status?.toLowerCase() === statusFilter
      );
    }

    return filtered;
  }, [
    spots,
    searchQuery,
    mainCategoryTab,
    subCategoryTab,
    statusFilter,
    allCategories,
  ]);

  const getPrimaryImageUrl = (spot: TouristSpot): string => {
    const img = spot.images?.find((i) => i.is_primary) || spot.images?.[0];
    return (
      (img?.file_url as string | undefined) ||
      (spot as any).primary_image ||
      (spot as any).image_url ||
      placeholderImage
    );
  };

  const getAddressLine = (spot: TouristSpot): string => {
    const parts = [spot.barangay, spot.municipality].filter(Boolean);
    return parts.join(", ");
  };

  const [selectedEditStep, setSelectedEditStep] = useState<number>(0);

  const columns: TableColumn<TouristSpot>[] = [
    {
      id: "name",
      label: "Name",
      minWidth: 300,
      render: (row) => (
        <Typography.Body weight="normal">{row.name}</Typography.Body>
      ),
    },
    {
      id: "description",
      label: "Description",
      minWidth: 300,
      render: (row) => (
        <Typography.Body sx={{ opacity: 0.85 }}>
          {row.description?.substring(0, 60)}
          {row.description?.length > 60 ? "..." : ""}
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
                  {cat.category_title || String(cat)}
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
      render: (row) =>
        row.is_featured ? <Star size={18} fill="gold" color="gold" /> : null,
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
          <Button
            variant="outlined"
            colorScheme="error"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteSpot(row);
            }}
          >
            Delete
          </Button>
        </Stack>
      ),
    },
  ];

  useEffect(() => {
    const state = location.state as {
      editSpotId?: string;
      editStep?: number;
    } | null;
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
          </div>

          <div
            style={{
              position: "fixed",
              bottom: 24,
              right: 24,
              display: "flex",
              gap: 12,
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <Button
              variant="outlined"
              colorScheme="primary"
              size="lg"
              onClick={() => setMySubmissionsModalOpen(true)}
            >
              My Submissions
            </Button>

            <Button
              variant="solid"
              colorScheme="secondary"
              size="lg"
              onClick={() => setFeaturedModalOpen(true)}
            >
              Manage Featured
            </Button>

            <Button
              onClick={() => setAddSpotModalVisible(true)}
              size="lg"
              variant="solid"
              colorScheme="primary"
              startDecorator={<IoAdd />}
            >
              Add Spot
            </Button>
          </div>
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
            placeholder="Search accommodations by name, address, or location"
            size="lg"
            fullWidth
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            sx={{ flex: 1 }}
          />
          <Select
            value={statusFilter}
            size="lg"
            onChange={(_, v) => setStatusFilter((v as any) ?? "all")}
            sx={{ ml: 1.5, minWidth: 160 }}
          >
            <Option value="all">All</Option>
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>

          <Container direction="row" padding="0" gap="0.5rem" align="center">
            <IconButton
              size="lg"
              variant={display === "cards" ? "solid" : "soft"}
              colorScheme={display === "cards" ? "primary" : "secondary"}
              aria-label="Cards view"
              onClick={() => setDisplay("cards")}
            >
              {/* Dashboard icon substitute using Landmark */}
              <DashboardRoundedIcon />
            </IconButton>
            <IconButton
              size="lg"
              variant={display === "table" ? "solid" : "soft"}
              colorScheme={display === "table" ? "primary" : "secondary"}
              aria-label="Table view"
              onClick={() => setDisplay("table")}
            >
              {/* Table icon substitute */}
              <TableRowsRoundedIcon />
            </IconButton>
          </Container>
        </Container>

        {/* Tabs */}
        <Container padding="0">
          <Stack spacing={0} sx={{ width: "100%" }}>
            <DynamicTab
              tabs={mainTabs}
              activeTabId={mainCategoryTab}
              onChange={(tabId) => setMainCategoryTab(String(tabId))}
              padding="16px 20px 20px 20px"
            />

            {subTabs.length > 0 && (
              <DynamicTab
                tabs={subTabs}
                activeTabId={subCategoryTab}
                onChange={(tabId) => setSubCategoryTab(String(tabId))}
                padding="4px 20px 16px 48px"
              />
            )}
          </Stack>
        </Container>
      </Container>

      {loading ? (
        <Container
          align="center"
          justify="center"
          padding="4rem"
          style={{ minHeight: "400px" }}
        >
          <div className="loading-spinner" />
          <Typography.Body
            size="normal"
            sx={{ color: "#666", marginTop: "1rem" }}
          >
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
      ) : display === "table" ? (
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
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px",
            maxHeight: "680px",
          }}
        >
          {filteredSpots.map((spot) => (
            <TouristSpotCard
              key={spot.id}
              spot={spot}
              imageUrl={getPrimaryImageUrl(spot)}
              addressLine={getAddressLine(spot)}
              onView={() => handleViewDetails(spot)}
              onEdit={() => handleEditSpot(spot)}
              onDelete={() => handleDeleteSpot(spot)}
              onViewReviews={() => handleViewReviews(spot)}
            />
          ))}
        </Box>
      )}

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

      <MySubmissionsModal
        open={isMySubmissionsModalOpen}
        onClose={() => setMySubmissionsModalOpen(false)}
      />

      <Alert
        open={showDelete}
        type="warning"
        title="Delete Tourist Spot"
        message={`Are you sure you want to delete "${selectedSpotForEdit?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={deleteLoading}
        onClose={() => setShowDelete(false)}
        onConfirm={doDeleteSpot}
      />
    </PageContainer>
  );
};

export default Spot;
