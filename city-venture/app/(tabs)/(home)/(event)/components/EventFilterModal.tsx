import React, { useMemo } from 'react';
import { View, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import Chip from '@/components/Chip';
import BottomSheet from '@/components/ui/BottomSheetModal';
import Button from '@/components/Button';
import { useEventCategories } from '@/query/eventQuery';

type EventFilterModalProps = {
  visible: boolean;
  onClose: () => void;
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
  onClearAll: () => void;
  onApply: () => void;
};

const EventFilterModal: React.FC<EventFilterModalProps> = ({
  visible,
  onClose,
  selectedCategories,
  onCategoryToggle,
  onClearAll,
  onApply,
}) => {
  const colors = Colors.light;
  
  // Fetch real categories from API
  const { data: apiCategories = [], isLoading } = useEventCategories();
  
  // Build categories list with "All Events" as first option
  const categories = useMemo(() => {
    const allOption = { id: 'all', name: 'All Events' };
    return [allOption, ...apiCategories.map(cat => ({ id: String(cat.id), name: cat.name }))];
  }, [apiCategories]);

  const filterContent = (
    <View style={styles.contentContainer}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText
            type="card-title-small"
            weight="bold"
            style={{ color: colors.text }}
          >
            Categories
          </ThemedText>
          <Pressable onPress={onClearAll}>
            <ThemedText type="label-small" style={{ color: colors.accent }}>
              Clear All
            </ThemedText>
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.accent} />
            <ThemedText type="label-small" style={{ color: colors.textSecondary, marginLeft: 8 }}>
              Loading categories...
            </ThemedText>
          </View>
        ) : (
          <View style={styles.chipGrid}>
            {categories.map((category) => (
              <Chip
                key={category.id}
                label={category.name}
                variant={
                  selectedCategories.includes(category.id) ? 'solid' : 'outlined'
                }
                onPress={() => onCategoryToggle(category.id)}
                color={
                  selectedCategories.includes(category.id) ? 'primary' : 'neutral'
                }
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );

  const actionButton = (
    <View>
      <Button
        label="Apply Filters"
        onPress={onApply}
        variant="soft"
        size="large"
        width={'100%'}
      />
    </View>
  );

  return (
    <BottomSheet
      isOpen={visible}
      onClose={onClose}
      headerTitle="Filter Events"
      content={filterContent}
      bottomActionButton={actionButton}
      snapPoints={['60%']}
      enablePanDownToClose
      closeButton
    />
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: 8,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
});

export default EventFilterModal;
