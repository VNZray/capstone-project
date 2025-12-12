import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface FavoriteHeaderProps {
  favoritesCount: number;
  colors: typeof Colors.light;
}

export const FavoriteHeader: React.FC<FavoriteHeaderProps> = ({
  favoritesCount,
  colors,
}) => {
  return (
    <View style={styles.header}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {/* Back Button */}
        <Pressable
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push('/(tabs)/(home)');
            }
          }}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
            padding: 4,
          })}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={colors.text}
          />
        </Pressable>

        <View>
          <ThemedText
            type="title-medium"
            weight="bold"
            style={styles.headerTitle}
          >
            My Collection
          </ThemedText>
          <ThemedText
            type="label-medium"
            style={{ color: colors.textSecondary }}
          >
            {favoritesCount} saved places
          </ThemedText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
  },
});
