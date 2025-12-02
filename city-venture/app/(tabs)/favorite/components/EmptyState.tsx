import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  colors: typeof Colors.light;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ colors }) => {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="heart-outline" size={64} color={colors.textSecondary} />
      <ThemedText
        type="card-title-medium"
        weight="semi-bold"
        style={{ marginTop: 16, color: colors.text }}
      >
        No Favorites Yet
      </ThemedText>
      <ThemedText
        type="body-medium"
        style={{
          marginTop: 8,
          color: colors.textSecondary,
          textAlign: 'center',
        }}
      >
        Start adding places to your favorites to see them here!
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
});
