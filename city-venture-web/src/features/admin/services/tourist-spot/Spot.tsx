import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoAdd } from "react-icons/io5";
import { Star, Search, Landmark, Church, History, Trees, Building2, Eye, Edit, ListChecks } from "lucide-react";
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
import { MoreVert } from "@mui/icons-material";
import {
  Input,
  Chip,
  Stack,
  Select,
  Option,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
  ListItemDecorator,
} from "@mui/joy";
import Card from "@/src/components/Card";
import placeholderImage from "@/src/assets/images/placeholder-image.png";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import TableRowsRoundedIcon from "@mui/icons-material/TableRowsRounded";

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
  const [categoryTab, setCategoryTab] = useState<string>("All");
  const [categoryTabs, setCategoryTabs] = useState<Array<{ id: string; label: string; icon?: React.ReactNode }>>([{ id: "All", label: "All", icon: <Landmark size={16} /> }]);
  type DisplayMode = "cards" | "table";
  const [display, setDisplay] = useState<DisplayMode>("cards");
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | "all">("all");
  const navigate = useNavigate();
  const location = useLocation();

  const fetchSpotsAndCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const spotsData = await apiService.getTouristSpots();
      setSpots(spotsData);
      try {
        const { categories } = await apiService.getCategoriesAndTypes();
        const list = ["All", ...Array.from(new Set(categories.map((c: any) => c.category).filter(Boolean)))];
        setCategoryTabs(list.map((c) => ({ id: c, label: c, icon: categoryIconFor(c) })));
      } catch {
        const fromSpots = Array.from(new Set(
          spotsData.flatMap((s) => Array.isArray(s.categories) ? s.categories.map((c: any) => c.category || String(c)) : [])
        ));
        const list = ["All", ...fromSpots];
        setCategoryTabs(list.map((c) => ({ id: c, label: c, icon: categoryIconFor(c) })));
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
    if (n.includes("historic") || n.includes("historical")) return <History size={16} />;
    if (n.includes("nature") || n.includes("park") || n.includes("mountain")) return <Trees size={16} />;
    if (n.includes("urban")) return <Building2 size={16} />;
    return <Landmark size={16} />;
  };

  useEffect(() => {
    fetchSpotsAndCategories();
  }, [fetchSpotsAndCategories]);

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

    // Filter by category tab
    if (categoryTab && categoryTab !== "All") {
      filtered = filtered.filter((spot) =>
        Array.isArray(spot.categories)
          ? spot.categories.some((cat: any) => (cat.category || String(cat)) === categoryTab)
          : false
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((spot) =>
        spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spot.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((spot) => spot.spot_status?.toLowerCase() === statusFilter);
    }

    return filtered;
  }, [spots, searchQuery, categoryTab, statusFilter]);

  const getPrimaryImageUrl = (spot: TouristSpot): string => {
    const img = spot.images?.find((i) => i.is_primary) || spot.images?.[0];
    return (img?.file_url as string | undefined) || (spot as any).primary_image || (spot as any).image_url || placeholderImage;
  };

  const getAddressLine = (spot: TouristSpot): string => {
    const parts = [spot.barangay, spot.municipality].filter(Boolean);
    return parts.join(', ');
  };

  const [selectedEditStep, setSelectedEditStep] = useState<number>(0);


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
          </div>

            <Container direction="row" padding="0" gap="0.5rem" align="center">
            <IconButton
              size="sm"
              variant={display === "cards" ? "solid" : "soft"}
              colorScheme={display === "cards" ? "primary" : "secondary"}
              aria-label="Cards view"
              onClick={() => setDisplay("cards")}
            >
              {/* Dashboard icon substitute using Landmark */}
              <DashboardRoundedIcon />
            </IconButton>
            <IconButton
              size="sm"
              variant={display === "table" ? "solid" : "soft"}
              colorScheme={display === "table" ? "primary" : "secondary"}
              aria-label="Table view"
              onClick={() => setDisplay("table")}
            >
              {/* Table icon substitute */}
              <TableRowsRoundedIcon />
            </IconButton>
          </Container>

          <div
            style={{
              position: "fixed",
              bottom: 24,
              right: 24,
              display: "flex",
              gap: 12,
              alignItems: "center",
            }}
          >
            <Button
              variant="solid"
              colorScheme="secondary"
              size="lg"
              onClick={() => setFeaturedModalOpen(true)}
            >
              Manage Featured
            </Button>
            
            <IconButton
              onClick={() => setAddSpotModalVisible(true)}
              size="lg"
              variant="solid"
              colorScheme="primary"
              aria-label="Add tourist spot"
            >
              <IoAdd />
            </IconButton>
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

          {/* Status Filter */}
          <Select
            size="lg"
            value={statusFilter}
            onChange={(_, v) => setStatusFilter((v as any) ?? "all")}
            sx={{ ml: 1.5, minWidth: 160 }}
          >
            <Option value="all">All</Option>
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
        </Container>

        {/* Tabs */}
        <DynamicTab
          tabs={categoryTabs}
          activeTabId={categoryTab}
          onChange={(tabId) => setCategoryTab(String(tabId))}
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
          display === "table" ? (
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
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "20px",
              }}
            >
              {filteredSpots.map((spot) => (
                <Card
                  key={spot.id}
                  variant="grid"
                  image={getPrimaryImageUrl(spot)}
                  aspectRatio="16/9"
                  title={spot.name}
                  subtitle={getAddressLine(spot)}
                  size="default"
                  elevation={2}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Chip
                      size="sm"
                      color={spot.spot_status === "active" ? "success" : "neutral"}
                    >
                      {spot.spot_status}
                    </Chip>
                    <Dropdown>
                      <MenuButton
                        slots={{ root: IconButton }}
                        slotProps={{
                          root: {
                            variant: "plain",
                            size: "sm",
                            onClick: (e: React.MouseEvent) => e.stopPropagation(),
                          } as any,
                        }}
                      >
                        <MoreVert />
                      </MenuButton>
                      <Menu placement="bottom-end" onClick={(e) => e.stopPropagation()}>
                        <MenuItem onClick={(e) => { e.stopPropagation(); handleViewDetails(spot); }}>
                          <ListItemDecorator>
                            <Eye />
                          </ListItemDecorator>
                          View Details
                        </MenuItem>
                        <MenuItem onClick={(e) => { e.stopPropagation(); handleEditSpot(spot); }}>
                          <ListItemDecorator>
                            <Edit />
                          </ListItemDecorator>
                          Edit
                        </MenuItem>
                        <MenuItem onClick={(e) => { e.stopPropagation(); handleViewReviews(spot); }}>
                          <ListItemDecorator>
                            <ListChecks />
                          </ListItemDecorator>
                          Reviews
                        </MenuItem>
                      </Menu>
                    </Dropdown>
                  </div>
                </Card>
              ))}
            </div>
          )
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
