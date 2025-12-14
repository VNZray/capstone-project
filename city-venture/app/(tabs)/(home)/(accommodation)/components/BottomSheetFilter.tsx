import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from '@/components/ui/BottomSheetModal';
import { ThemedText } from '@/components/themed-text';
import Chip from '@/components/Chip';
import Button from '@/components/Button';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/color';
import { fetchAmenities } from '@/services/AmenityService';
import { fetchCategories } from '@/services/BusinessService';
import type { Amenity } from '@/types/Business';
import type { Category } from '@/types/Category';

// Rating options
const RATING_OPTIONS = [
  { value: 5, label: '5 Stars' },
  { value: 4, label: '4+ Stars' },
  { value: 3, label: '3+ Stars' },
  { value: 2, label: '2+ Stars' },
  { value: 1, label: '1+ Stars' },
];

export interface FilterState {
  categories: number[];
  minRating: number | null;
  priceRange: { min: number; max: number };
  amenities: number[];
}

interface BottomSheetFilterProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
}

const BottomSheetFilter: React.FC<BottomSheetFilterProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  initialFilters = {},
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const primaryColor = Colors.light.primary;
  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const secondaryTextColor = isDark ? '#9BA1A6' : '#6B7280';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const sectionBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';

  // Filter state
  const [selectedCategories, setSelectedCategories] = useState<number[]>(
    initialFilters.categories || []
  );
  const [selectedRating, setSelectedRating] = useState<number | null>(
    initialFilters.minRating || null
  );
  const [priceRange, setPriceRange] = useState({
    min: initialFilters.priceRange?.min || 0,
    max: initialFilters.priceRange?.max || 10000,
  });
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>(
    initialFilters.amenities || []
  );
  const [amenitiesList, setAmenitiesList] = useState<Amenity[]>([]);
  const [loadingAmenities, setLoadingAmenities] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [modalKey, setModalKey] = useState(0);

  // Reset modal key when opening to force clean state
  useEffect(() => {
    if (isOpen) {
      setModalKey((prev) => prev + 1);
    }
  }, [isOpen]);

  // Fetch categories and amenities on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch accommodation categories (level 2 - subcategories of Accommodation)
        setLoadingCategories(true);
        const allCategories = await fetchCategories({
          applicable_to: 'business',
          status: 'active',
        });
        // Filter to get only accommodation subcategories
        const accommodationParent = allCategories.find(
          (cat) => cat.alias === 'accommodation' && !cat.parent_category
        );
        if (accommodationParent) {
          const accommodationCategories = allCategories.filter(
            (cat) => cat.parent_category === accommodationParent.id
          );
          setCategories(accommodationCategories);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoadingCategories(false);
      }

      try {
        setLoadingAmenities(true);
        const amenities = await fetchAmenities();
        setAmenitiesList(amenities);
      } catch (error) {
        console.error('Failed to fetch amenities:', error);
      } finally {
        setLoadingAmenities(false);
      }
    };
    loadData();
  }, []);

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleAmenity = (amenityId: number) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId)
        ? prev.filter((id) => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleRatingSelect = (rating: number) => {
    setSelectedRating(selectedRating === rating ? null : rating);
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    setSelectedRating(null);
    setPriceRange({ min: 0, max: 10000 });
    setSelectedAmenities([]);
  };

  const handleApply = () => {
    onApplyFilters({
      categories: selectedCategories,
      minRating: selectedRating,
      priceRange,
      amenities: selectedAmenities,
    });
    onClose();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategories.length > 0) count++;
    if (selectedRating !== null) count++;
    if (priceRange.min > 0 || priceRange.max < 10000) count++;
    if (selectedAmenities.length > 0) count++;
    return count;
  };

  const activeCount = getActiveFiltersCount();

  return (
    <BottomSheet
      key={`filter-modal-${modalKey}`}
      isOpen={isOpen}
      onClose={onClose}
      headerTitle="Filters"
      headerSubtitle={
        activeCount > 0
          ? `${activeCount} filter${activeCount > 1 ? 's' : ''} active`
          : undefined
      }
      snapPoints={['92%']}
      closeButton={true}
      content={
        <View style={styles.container}>
          {/* Accommodation Category Section */}
          <View style={[styles.section, { borderBottomColor: borderColor }]}>
            <View style={styles.sectionHeader}>
              <ThemedText type="card-title-medium" weight="semi-bold">
                Accommodation Type
              </ThemedText>
              {selectedCategories.length > 0 && (
                <Pressable onPress={() => setSelectedCategories([])}>
                  <ThemedText type="body-small" style={{ color: primaryColor }}>
                    Clear
                  </ThemedText>
                </Pressable>
              )}
            </View>
            {loadingCategories ? (
              <View style={styles.loadingContainer}>
                <ThemedText
                  type="body-medium"
                  style={{ color: secondaryTextColor }}
                >
                  Loading categories...
                </ThemedText>
              </View>
            ) : (
              <View style={styles.chipContainer}>
                {categories.map((category) => (
                  <Chip
                    key={category.id}
                    label={category.title}
                    variant={
                      selectedCategories.includes(category.id)
                        ? 'solid'
                        : 'soft'
                    }
                    color={
                      selectedCategories.includes(category.id)
                        ? 'primary'
                        : 'neutral'
                    }
                    size="medium"
                    onPress={() => toggleCategory(category.id)}
                    style={styles.chip}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Rating Section */}
          <View style={[styles.section, { borderBottomColor: borderColor }]}>
            <View style={styles.sectionHeader}>
              <ThemedText type="card-title-medium" weight="semi-bold">
                Guest Rating
              </ThemedText>
              {selectedRating !== null && (
                <Pressable onPress={() => setSelectedRating(null)}>
                  <ThemedText type="body-small" style={{ color: primaryColor }}>
                    Clear
                  </ThemedText>
                </Pressable>
              )}
            </View>
            <View style={styles.ratingContainer}>
              {RATING_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.ratingOption,
                    {
                      borderColor:
                        selectedRating === option.value
                          ? primaryColor
                          : borderColor,
                      backgroundColor:
                        selectedRating === option.value
                          ? `${primaryColor}15`
                          : sectionBg,
                    },
                  ]}
                  onPress={() => handleRatingSelect(option.value)}
                >
                  <View style={styles.starsContainer}>
                    {[...Array(option.value)].map((_, idx) => (
                      <Ionicons
                        key={idx}
                        name="star"
                        size={16}
                        color="#FFC107"
                      />
                    ))}
                    {[...Array(5 - option.value)].map((_, idx) => (
                      <Ionicons
                        key={`empty-${idx}`}
                        name="star-outline"
                        size={16}
                        color={secondaryTextColor}
                      />
                    ))}
                  </View>
                  <ThemedText type="body-medium" style={{ marginLeft: 8 }}>
                    {option.label}
                  </ThemedText>
                  {selectedRating === option.value && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={primaryColor}
                      style={{ marginLeft: 'auto' }}
                    />
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          {/* Price Range Section */}
          <View style={[styles.section, { borderBottomColor: borderColor }]}>
            <View style={styles.sectionHeader}>
              <ThemedText type="card-title-medium" weight="semi-bold">
                Price Range (per night)
              </ThemedText>
              {(priceRange.min > 0 || priceRange.max < 10000) && (
                <Pressable
                  onPress={() => setPriceRange({ min: 0, max: 10000 })}
                >
                  <ThemedText type="body-small" style={{ color: primaryColor }}>
                    Clear
                  </ThemedText>
                </Pressable>
              )}
            </View>

            <View style={styles.priceInputContainer}>
              <View style={styles.priceInputWrapper}>
                <ThemedText
                  type="body-small"
                  style={{ color: secondaryTextColor, marginBottom: 8 }}
                >
                  Minimum
                </ThemedText>
                <View
                  style={[
                    styles.priceInput,
                    { borderColor, backgroundColor: sectionBg },
                  ]}
                >
                  <ThemedText type="body-medium" style={{ color: textColor }}>
                    ₱{priceRange.min.toLocaleString()}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.priceSeparator}>
                <View
                  style={[
                    styles.separatorLine,
                    { backgroundColor: borderColor },
                  ]}
                />
              </View>

              <View style={styles.priceInputWrapper}>
                <ThemedText
                  type="body-small"
                  style={{ color: secondaryTextColor, marginBottom: 8 }}
                >
                  Maximum
                </ThemedText>
                <View
                  style={[
                    styles.priceInput,
                    { borderColor, backgroundColor: sectionBg },
                  ]}
                >
                  <ThemedText type="body-medium" style={{ color: textColor }}>
                    ₱{priceRange.max.toLocaleString()}
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Price Range Quick Select */}
            <View style={styles.chipContainer}>
              {[
                { min: 0, max: 1000, label: 'Under ₱1,000' },
                { min: 1000, max: 3000, label: '₱1,000 - ₱3,000' },
                { min: 3000, max: 5000, label: '₱3,000 - ₱5,000' },
                { min: 5000, max: 10000, label: '₱5,000+' },
              ].map((range) => (
                <Chip
                  key={range.label}
                  label={range.label}
                  variant={
                    priceRange.min === range.min && priceRange.max === range.max
                      ? 'solid'
                      : 'soft'
                  }
                  color={
                    priceRange.min === range.min && priceRange.max === range.max
                      ? 'primary'
                      : 'neutral'
                  }
                  size="medium"
                  onPress={() => setPriceRange(range)}
                  style={styles.chip}
                />
              ))}
            </View>
          </View>

          {/* Amenities Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="card-title-medium" weight="semi-bold">
                Amenities
              </ThemedText>
              {selectedAmenities.length > 0 && (
                <Pressable onPress={() => setSelectedAmenities([])}>
                  <ThemedText type="body-small" style={{ color: primaryColor }}>
                    Clear ({selectedAmenities.length})
                  </ThemedText>
                </Pressable>
              )}
            </View>
            {loadingAmenities ? (
              <View style={styles.loadingContainer}>
                <ThemedText
                  type="body-medium"
                  style={{ color: secondaryTextColor }}
                >
                  Loading amenities...
                </ThemedText>
              </View>
            ) : (
              <View style={styles.chipContainer}>
                {amenitiesList.map((amenity) => (
                  <Chip
                    key={amenity.id}
                    label={amenity.name || 'Unknown'}
                    variant={
                      selectedAmenities.includes(amenity.id!) ? 'solid' : 'soft'
                    }
                    color={
                      selectedAmenities.includes(amenity.id!)
                        ? 'primary'
                        : 'neutral'
                    }
                    size="medium"
                    onPress={() => toggleAmenity(amenity.id!)}
                    style={styles.chip}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      }
      bottomActionButton={
        <View style={styles.actionButtons}>
          <Button
            label="Clear All"
            variant="outlined"
            color="primary"
            size="large"
            onPress={handleClearAll}
            style={{ flex: 1 }}
            disabled={activeCount === 0}
          />
          <Button
            label={`Apply Filters${activeCount > 0 ? ` (${activeCount})` : ''}`}
            variant="solid"
            color="primary"
            size="large"
            onPress={handleApply}
            style={{ flex: 1 }}
          />
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
  },
  section: {
    paddingBottom: 24,
    marginBottom: 24,
    borderBottomWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
  },
  chip: {
    marginBottom: 4,
  },
  ratingContainer: {
    gap: 12,
    paddingHorizontal: 20,
  },
  ratingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  priceInputWrapper: {
    flex: 1,
  },
  priceInput: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  priceSeparator: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  separatorLine: {
    width: 16,
    height: 2,
    borderRadius: 1,
  },
  loadingContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
  },
});

export default BottomSheetFilter;
