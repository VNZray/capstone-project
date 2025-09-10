import { useCallback, useEffect, useMemo, useState } from "react";
import { IoAdd } from "react-icons/io5";
import Text from "../../../components/Text";
import SearchBar from "../../../components/SearchBar";
import CategoryFilter from "../../../components/touristSpot/CategoryFilter";
import Pagination from "../../../components/touristSpot/Pagination";
import TouristSpotTable from "../../../components/touristSpot/TouristSpotTable";
import TouristSpotDetails from "../../../components/touristSpot/TouristSpotDetails";
import TouristSpotForm from "../../../components/touristSpot/TouristSpotForm";
import type { TouristSpot } from "../../../types/TouristSpot";
import { apiService } from "../../../utils/api";
import "./Spot.css";
import Container from "@/src/components/Container";
import { colors } from "@/src/utils/Colors";

const Spot = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedType, setSelectedType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddSpotModalVisible, setAddSpotModalVisible] = useState(false);
  const [isEditSpotModalVisible, setEditSpotModalVisible] = useState(false);
  const [selectedSpotForEdit, setSelectedSpotForEdit] = useState<
    TouristSpot | undefined
  >(undefined);
  const [spots, setSpots] = useState<TouristSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilters, setTypeFilters] = useState<string[]>(["All"]);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
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
    setSelectedSpotId(spot.id);
  };

  const handleBack = () => setSelectedSpotId(null);

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

  const handleEditFromDetails = async (step: number = 0) => {
    // Try to find the spot in the currently loaded list
    let spotToEdit = spots.find((spot) => spot.id === selectedSpotId);

    // If not found (e.g. different page/filter), fetch it from the API
    if (!spotToEdit && selectedSpotId) {
      try {
        spotToEdit = await apiService.getTouristSpotById(selectedSpotId);
      } catch (e) {
        console.error("Failed to load spot for editing:", e);
      }
    }

    if (spotToEdit) {
      setSelectedSpotForEdit(spotToEdit);
      setSelectedEditStep(step);
      setEditSpotModalVisible(true);
    } else {
      // Fallback: still open the modal in edit mode but without initial data
      setSelectedSpotForEdit(undefined);
      setSelectedEditStep(step);
      setEditSpotModalVisible(true);
    }
  };

  return (
    <>
      {selectedSpotId ? (
        <TouristSpotDetails
          spotId={selectedSpotId}
          onBack={handleBack}
          onEdit={handleEditFromDetails}
        />
      ) : (
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
              <div className="add">
                <button
                  className="add-button"
                  onClick={() => setAddSpotModalVisible(true)}
                >
                  <IoAdd size={20} color="#FFF" />
                  <Text variant="normal" color="white" className="add-button-text">Add</Text>
                </button>
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
    </>
  );
};

export default Spot;
