import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoAdd } from "react-icons/io5";
import Text from "@/src/components/Text";
import SearchBar from "@/src/components/SearchBar";
import CategoryFilter from "@/src/components/Admin/touristSpot/CategoryFilter";
import Pagination from "@/src/components/Admin/touristSpot/Pagination";
import TouristSpotTable from "@/src/components/Admin/touristSpot/TouristSpotTable";
import TouristSpotForm from "@/src/components/Admin/touristSpot/TouristSpotForm";
import type { TouristSpot } from "@/src/types/TouristSpot";
import { apiService } from "@/src/utils/api";
import "./Spot.css";
import Container from "@/src/components/Container";
import { colors } from "@/src/utils/Colors";
import FeaturedSpotsModal from "@/src/components/Admin/touristSpot/FeaturedSpotsModal";

const Spot = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedType, setSelectedType] = useState("All");
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
  const [typeFilters, setTypeFilters] = useState<string[]>(["All"]);
  const navigate = useNavigate();
  const location = useLocation();
  const spotsPerPage = 10;

  const fetchSpotsAndCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { categories } = await apiService.getCategoriesAndTypes();
      const uniqueTypes = ["All", ...categories.map((c) => c.category)];
      setTypeFilters(uniqueTypes);
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

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setCurrentPage(1);
  };
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };
  const handleViewDetails = (spot: TouristSpot) => {
    navigate(`/tourism/services/tourist-spot/${spot.id}`);
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

  const filteredAndSearchedSpots = useMemo(() => {
    let filtered = spots;
    if (selectedType !== "All") {
      filtered = filtered.filter((spot) =>
        Array.isArray(spot.categories)
          ? spot.categories.some((cat) => cat.category === selectedType)
          : false
      );
    }
    if (searchQuery) {
      filtered = filtered.filter((spot) =>
        spot.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [spots, selectedType, searchQuery]);

  const totalPages = Math.ceil(filteredAndSearchedSpots.length / spotsPerPage);
  const paginatedSpots = useMemo(() => {
    const startIndex = (currentPage - 1) * spotsPerPage;
    return filteredAndSearchedSpots.slice(
      startIndex,
      startIndex + spotsPerPage
    );
  }, [filteredAndSearchedSpots, currentPage, spotsPerPage]);

  const [selectedEditStep, setSelectedEditStep] = useState<number>(0);

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
  }, [location.state]);

  return (
    <>
      <Container background={colors.background} elevation={2} className="spot-container">
          <div className="filter-and-search-container">
            <div className="filter">
              <CategoryFilter
                selectedCategory={selectedType}
                onCategorySelect={handleTypeChange}
                categories={typeFilters}
              />
            </div>
            <div className="search-and-add">
              <div className="search">
                <SearchBar
                  value={searchQuery}
                  onChangeText={handleSearch}
                  onSearch={() => console.log("Performing search for:", searchQuery)}
                  placeholder="Search tourist spots..."
                  containerStyle={{ flex: 1, maxWidth: 300 }}
                />
              </div>
              <div className="actions-inline">
                <div className="add">
                  <button
                    className="add-button"
                    onClick={() => setAddSpotModalVisible(true)}
                  >
                    <IoAdd size={20} color="#FFF" />
                    <Text variant="normal" color="white" className="add-button-text">Add Tourist Spot</Text>
                  </button>
                </div>
                <div className="add">
                  <button
                    className="add-button"
                    onClick={() => setFeaturedModalOpen(true)}
                  >
                    <Text variant="normal" color="white" className="add-button-text">Manage Featured</Text>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <Text variant="normal" color="text-color">Loading tourist spots...</Text>
            </div>
          ) : error ? (
            <div className="error-container">
              <Text variant="normal" color="red">Error: {error}</Text>
            </div>
          ) : (
            <div className="content">
              <TouristSpotTable spots={paginatedSpots} onViewDetails={handleViewDetails} onEdit={handleEditSpot} />
              {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              )}
            </div>
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

      <FeaturedSpotsModal open={isFeaturedModalOpen} onClose={() => setFeaturedModalOpen(false)} />
    </>
  );
};

export default Spot;
