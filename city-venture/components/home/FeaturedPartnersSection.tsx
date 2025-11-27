import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  View,
  Pressable,
  useColorScheme,
  ViewStyle,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';

type FeaturedPartner = {
  id: string;
  name: string;
  category: string;
  image: string;
  rating: number;
  description: string;
};

const FEATURED_PARTNERS: FeaturedPartner[] = [
  {
    id: 'fp-1',
    name: 'Urban Grind',
    category: 'Coffee & Workspace',
    image:
      'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    description: 'Premium coffee for the modern creative.',
  },
  {
    id: 'fp-2',
    name: 'TechHaven',
    category: 'Electronics',
    image:
      'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    description: 'Latest gadgets and tech accessories.',
  },
  {
    id: 'fp-3',
    name: 'GreenLeaf',
    category: 'Organic Grocery',
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    description: 'Fresh, organic, and locally sourced.',
  },
  {
    id: 'fp-4',
    name: 'Zenith Yoga',
    category: 'Wellness',
    image:
      'https://images.unsplash.com/photo-1599447421405-0c30714298ac?auto=format&fit=crop&w=600&q=80',
    rating: 5.0,
    description: 'Find your inner peace and balance.',
  },
];

type FeaturedPartnersSectionProps = {
  onPressPartner?: (partner: FeaturedPartner) => void;
  style?: ViewStyle;
};

const FeaturedPartnersSection: React.FC<FeaturedPartnersSectionProps> = ({
  onPressPartner,
  style,
}) => {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View>
          <ThemedText type="sub-title-small" weight="bold">
            Featured Partners
          </ThemedText>
        </View>
        <Pressable>
          <ThemedText
            type="label-small"
            lightColor={colors.primary}
            darkColor={colors.accent}
          >
            View All {'>'}
          </ThemedText>
        </Pressable>
      </View>

      <FlatList
        horizontal
        data={FEATURED_PARTNERS}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ width: 24 }} />}
        renderItem={({ item }) => (
          <Pressable
            style={styles.itemContainer}
            onPress={() => onPressPartner?.(item)}
          >
            <View
              style={[
                styles.logoContainer,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  shadowColor: colors.shadow,
                },
              ]}
            >
              <Image source={{ uri: item.image }} style={styles.logo} />
            </View>

            <ThemedText
              type="label-small"
              weight="semi-bold"
              align="center"
              numberOfLines={1}
              style={styles.name}
            >
              {item.name}
            </ThemedText>
            <ThemedText
              type="label-small"
              lightColor={colors.textSecondary}
              darkColor={colors.textSecondary}
              align="center"
              numberOfLines={1}
              style={styles.category}
            >
              {item.category}
            </ThemedText>
          </Pressable>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: -24,
    marginRight: -24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  listContent: {
    paddingHorizontal: 24,
  },
  itemContainer: {
    alignItems: 'center',
    width: 80,
    gap: 8,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 12, // Circular
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 4,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 4,
  },
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  name: {
    fontSize: 12,
    lineHeight: 16,
  },
  category: {
    fontSize: 10,
    opacity: 0.7,
  },
});

export default FeaturedPartnersSection;
