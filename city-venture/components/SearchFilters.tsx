import { Colors, Brand } from '@/constants/color';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from './Button';
import Chip from './Chip';
import { ThemedText } from './themed-text';

type SortOption = 'recommended' | 'price_low' | 'price_high' | 'rating';

export type FilterState = {
  sortBy: SortOption;
  priceRange: [number, number];
  rating: number | null;
  amenities: string[];
};

type SearchFiltersProps = {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
};

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'price_low', label: 'Price: Low to High' },
  { id: 'price_high', label: 'Price: High to Low' },
  { id: 'rating', label: 'Highest Rated' },
];

const AMENITIES = [
  'Free Wi-Fi',
  'Pool',
  'Parking',
  'Gym',
  'Restaurant',
  'Air Conditioning',
  'Pet Friendly',
];

export const SearchFilters = ({
  visible,
  onClose,
  onApply,
  initialFilters,
}: SearchFiltersProps) => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [sortBy, setSortBy] = useState<SortOption>(
    initialFilters?.sortBy || 'recommended'
  );
  const [priceRange, setPriceRange] = useState<[number, number]>(
    initialFilters?.priceRange || [0, 1000]
  );
  const [rating, setRating] = useState<number | null>(
    initialFilters?.rating || null
  );
  const [amenities, setAmenities] = useState<string[]>(
    initialFilters?.amenities || []
  );

  const handleApply = () => {
    onApply({ sortBy, priceRange, rating, amenities });
  };

  const handleReset = () => {
    setSortBy('recommended');
    setPriceRange([0, 1000]);
    setRating(null);
    setAmenities([]);
  };

  const toggleAmenity = (amenity: string) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter((a) => a !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View
          style={[
            styles.sheet,
            {
              paddingBottom: insets.bottom + 16,
              maxHeight: height * 0.9,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <ThemedText type="header-small" weight="semi-bold">
                Filters
              </ThemedText>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={Colors.light.icon} />
              </TouchableOpacity>
            </View>
            <View style={styles.divider} />
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {/* Sort By */}
            <View style={styles.section}>
              <ThemedText type="sub-title-medium" weight="medium" mb={12}>
                Sort by
              </ThemedText>
              <View style={styles.optionsContainer}>
                {SORT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.radioOption,
                      sortBy === option.id && styles.radioOptionSelected,
                    ]}
                    onPress={() => setSortBy(option.id)}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        sortBy === option.id && styles.radioCircleSelected,
                      ]}
                    >
                      {sortBy === option.id && <View style={styles.radioDot} />}
                    </View>
                    <ThemedText
                      type="body-medium"
                      lightColor={
                        sortBy === option.id
                          ? Colors.light.text
                          : Colors.light.textSecondary
                      }
                    >
                      {option.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.sectionDivider} />

            {/* Price Range */}
            <View style={styles.section}>
              <ThemedText type="sub-title-medium" weight="medium" mb={12}>
                Price Range
              </ThemedText>
              <View style={styles.priceInputs}>
                <View style={styles.priceInputContainer}>
                  <ThemedText
                    type="label-small"
                    lightColor={Colors.light.textSecondary}
                  >
                    Min
                  </ThemedText>
                  <View style={styles.priceInput}>
                    <ThemedText type="body-medium">$</ThemedText>
                    <ThemedText type="body-medium" style={{ marginLeft: 4 }}>
                      {priceRange[0]}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.priceSeparator} />
                <View style={styles.priceInputContainer}>
                  <ThemedText
                    type="label-small"
                    lightColor={Colors.light.textSecondary}
                  >
                    Max
                  </ThemedText>
                  <View style={styles.priceInput}>
                    <ThemedText type="body-medium">$</ThemedText>
                    <ThemedText type="body-medium" style={{ marginLeft: 4 }}>
                      {priceRange[1]}+
                    </ThemedText>
                  </View>
                </View>
              </View>
              {/* Note: A slider would go here, using a simple placeholder for now */}
              <View style={styles.sliderTrack}>
                <View style={styles.sliderFill} />
                <View style={[styles.sliderThumb, { left: 0 }]} />
                <View style={[styles.sliderThumb, { right: 0 }]} />
              </View>
            </View>

            <View style={styles.sectionDivider} />

            {/* Rating */}
            <View style={styles.section}>
              <ThemedText type="sub-title-medium" weight="medium" mb={12}>
                Rating
              </ThemedText>
              <View style={styles.ratingContainer}>
                {[5, 4, 3, 2, 1].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.ratingOption,
                      rating === r && styles.ratingOptionSelected,
                    ]}
                    onPress={() => setRating(rating === r ? null : r)}
                  >
                    <Ionicons
                      name="star"
                      size={16}
                      color={rating === r ? '#fff' : Brand.solarGold}
                    />
                    <ThemedText
                      type="body-small"
                      style={{
                        marginLeft: 6,
                        color: rating === r ? '#fff' : Colors.light.text,
                      }}
                    >
                      {r} & up
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.sectionDivider} />

            {/* Amenities */}
            <View style={styles.section}>
              <ThemedText type="sub-title-medium" weight="medium" mb={12}>
                Amenities
              </ThemedText>
              <View style={styles.amenitiesContainer}>
                {AMENITIES.map((amenity) => {
                  const isSelected = amenities.includes(amenity);
                  return (
                    <Chip
                      key={amenity}
                      label={amenity}
                      variant={isSelected ? 'solid' : 'soft'}
                      color={isSelected ? 'primary' : 'neutral'}
                      size="medium"
                      onPress={() => toggleAmenity(amenity)}
                      style={{ marginRight: 4, marginBottom: 4 }}
                    />
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Button
              label="Reset"
              variant="soft"
              color="neutral"
              onPress={handleReset}
              style={{ flex: 1, marginRight: 12 }}
            />
            <Button
              label="Show Results"
              variant="solid"
              color="primary"
              onPress={handleApply}
              style={{ flex: 2 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    paddingTop: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
  },
  content: {
    paddingHorizontal: 20,
  },
  section: {
    paddingVertical: 20,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: Colors.light.border,
  },
  optionsContainer: {
    gap: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOptionSelected: {},
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.light.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: Brand.deepNavy,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Brand.deepNavy,
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  priceInputContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  priceSeparator: {
    width: 16,
    height: 1,
    backgroundColor: Colors.light.border,
    marginHorizontal: 12,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: Colors.light.border,
    borderRadius: 2,
    position: 'relative',
    marginHorizontal: 10,
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: Brand.deepNavy,
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    top: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ratingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  ratingOptionSelected: {
    backgroundColor: Brand.deepNavy,
    borderColor: Brand.deepNavy,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  amenityChipSelected: {
    backgroundColor: Brand.deepNavy,
    borderColor: Brand.deepNavy,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
});
