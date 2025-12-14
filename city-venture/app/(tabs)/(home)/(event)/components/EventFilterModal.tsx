import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import Chip from '@/components/Chip';
import BottomSheet from '@/components/ui/BottomSheetModal';
import Button from '@/components/Button';
import Container from '@/components/Container';

type EventFilterModalProps = {
  visible: boolean;
  onClose: () => void;
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
  onClearAll: () => void;
  onApply: () => void;
};

const categories = [
  { id: 'all', label: 'All Events', icon: 'star-outline' },
  { id: 'music', label: 'Music', icon: 'music' },
  { id: 'food', label: 'Food & Dining', icon: 'food' },
  { id: 'festival', label: 'Festival', icon: 'party-popper' },
  { id: 'sports', label: 'Sports', icon: 'trophy' },
  { id: 'arts', label: 'Arts & Culture', icon: 'palette' },
  { id: 'business', label: 'Business', icon: 'briefcase' },
  { id: 'education', label: 'Education', icon: 'school' },
];

const EventFilterModal: React.FC<EventFilterModalProps> = ({
  visible,
  onClose,
  selectedCategories,
  onCategoryToggle,
  onClearAll,
  onApply,
}) => {
  const colors = Colors.light;

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

        <View style={styles.chipGrid}>
          {categories.map((category) => (
            <Chip
              key={category.id}
              label={category.label}
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
});

export default EventFilterModal;
