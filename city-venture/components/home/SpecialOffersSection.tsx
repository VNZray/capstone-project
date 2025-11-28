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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SPECIAL_OFFERS, type SpecialOffer } from '@/components/home/data';

type SpecialOffersSectionProps = {
  onPressOffer?: (offer: SpecialOffer) => void;
  style?: ViewStyle;
};

const SpecialOffersSection: React.FC<SpecialOffersSectionProps> = ({
  onPressOffer,
  style,
}) => {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const isDark = scheme === 'dark';

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <ThemedText type="sub-title-small" weight="bold">
          Special Offers
        </ThemedText>
        <Pressable
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          })}
        >
          <ThemedText
            type="label-small"
            lightColor={colors.primary}
            darkColor={colors.accent}
          >
            View All
          </ThemedText>
          <MaterialCommunityIcons
            name="arrow-right"
            size={16}
            color={colors.accent}
          />
        </Pressable>
      </View>

      <FlatList
        horizontal
        data={SPECIAL_OFFERS}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => onPressOffer?.(item)}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <LinearGradient
              colors={
                isDark
                  ? ['transparent', 'rgba(0,0,0,0.95)']
                  : ['transparent', 'rgba(0,0,0,0.85)']
              }
              style={styles.gradient}
            >
              {/* Discount Badge */}
              <View style={styles.discountBadge}>
                <ThemedText
                  type="label-small"
                  lightColor="#FFFFFF"
                  darkColor="#FFFFFF"
                  weight="bold"
                  style={styles.discountText}
                >
                  {item.discount}
                </ThemedText>
              </View>

              {/* Content */}
              <View style={styles.content}>
                <View style={styles.categoryBadge}>
                  <ThemedText
                    type="label-small"
                    lightColor="rgba(255,255,255,0.9)"
                    darkColor="rgba(255,255,255,0.9)"
                    style={styles.categoryText}
                  >
                    {item.category}
                  </ThemedText>
                </View>

                <ThemedText
                  type="sub-title-small"
                  weight="bold"
                  lightColor="#FFFFFF"
                  darkColor="#FFFFFF"
                  numberOfLines={2}
                  style={styles.title}
                >
                  {item.title}
                </ThemedText>

                <ThemedText
                  type="label-small"
                  lightColor="rgba(255,255,255,0.85)"
                  darkColor="rgba(255,255,255,0.85)"
                  numberOfLines={2}
                  style={styles.description}
                >
                  {item.description}
                </ThemedText>

                {/* CTA Button */}
                <Pressable
                  style={[styles.ctaButton, { backgroundColor: colors.accent }]}
                >
                  <ThemedText
                    type="label-small"
                    weight="bold"
                    lightColor="#FFFFFF"
                    darkColor="#FFFFFF"
                  >
                    {item.ctaText}
                  </ThemedText>
                </Pressable>

                {item.validUntil && (
                  <ThemedText
                    type="label-small"
                    lightColor="rgba(255,255,255,0.7)"
                    darkColor="rgba(255,255,255,0.7)"
                    style={styles.validUntil}
                  >
                    Valid until {item.validUntil}
                  </ThemedText>
                )}
              </View>
            </LinearGradient>
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
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  listContent: {
    paddingLeft: 24,
    paddingRight: 24,
  },
  card: {
    width: 280,
    height: 320,
    borderRadius: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },
  discountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 13,
    letterSpacing: 0.5,
  },
  content: {
    gap: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backdropFilter: 'blur(10px)',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  ctaButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  validUntil: {
    fontSize: 11,
    marginTop: 4,
  },
});

export default SpecialOffersSection;
