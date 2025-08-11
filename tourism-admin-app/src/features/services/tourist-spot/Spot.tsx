import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { IoAdd } from 'react-icons/io5';
import Text from '../../../components/Text';
import SearchBar from '../../../components/SearchBar';
import CategoryFilter from '../../../components/touristSpot/CategoryFilter';
import Pagination from '../../../components/touristSpot/Pagination';
import TouristSpotTable from '../../../components/touristSpot/TouristSpotTable';
import AddSpotForm from '../../../components/touristSpot/AddSpotForm';
import type { TouristSpot, Category, Type } from '../../../types/TouristSpot';
import { apiService } from '../../../utils/api';
import './Spot.css';

const Spot = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddSpotModalVisible, setAddSpotModalVisible] = useState(false);
  const [spots, setSpots] = useState<TouristSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [types, setTypes] = useState<Type[]>([]);
  const spotsPerPage = 10;

  const fetchSpotsAndCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch categories and types
      const { categories: categoryData, types: typeData } = await apiService.getCategoriesAndTypes();
      
      const uniqueCategories = [
        'All',
        ...categoryData.map((cat) => cat.category),
      ];
      setCategories(uniqueCategories);
      setTypes(typeData);

      // Fetch spots
      const spotsData = await apiService.getTouristSpots();
      setSpots(spotsData);
    } catch (error) {
      console.error('Error:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpotsAndCategories();
  }, [fetchSpotsAndCategories]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleViewDetails = (spot: TouristSpot) => {
    // For now, just show an alert with spot details
    // In a real app, you'd navigate to a details page
    alert(`Viewing details for: ${spot.name}\nDescription: ${spot.description}\nCategory: ${spot.category}\nType: ${spot.type}\nHours: ${spot.opening_hour} - ${spot.closing_hour}`);
  };

  const filteredAndSearchedSpots = useMemo(() => {
    let filtered = spots;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((spot) => spot.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter((spot) =>
        spot.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [spots, selectedCategory, searchQuery]);

  const totalPages = Math.ceil(filteredAndSearchedSpots.length / spotsPerPage);

  const paginatedSpots = useMemo(() => {
    const startIndex = (currentPage - 1) * spotsPerPage;
    const endIndex = startIndex + spotsPerPage;
    return filteredAndSearchedSpots.slice(startIndex, endIndex);
  }, [filteredAndSearchedSpots, currentPage, spotsPerPage]);

  return (
    <div className="spot-container">
      <div className="filter-and-search-container">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategoryChange}
          categories={categories}
        />
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          onSearch={() => console.log('Performing search for:', searchQuery)}
          placeholder="Search tourist spots..."
          containerStyle={{ flex: 1, maxWidth: 300 }}
        />
        <button
          className="add-button"
          onClick={() => setAddSpotModalVisible(true)}
        >
          <IoAdd size={20} color="#FFF" />
          <Text variant="normal" color="white" className="add-button-text">
            Add
          </Text>
        </button>
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
          <TouristSpotTable
            spots={paginatedSpots}
            onViewDetails={handleViewDetails}
          />

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}

      <AddSpotForm
        isVisible={isAddSpotModalVisible}
        onClose={() => setAddSpotModalVisible(false)}
        onSpotAdded={fetchSpotsAndCategories}
      />
    </div>
  );
};

export default Spot;
