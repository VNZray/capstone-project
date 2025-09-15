import Button from '@/components/Button';
import SearchBar from '@/components/SearchBar';
import { ThemedText } from '@/components/themed-text';
import { colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FontAwesome5 } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import React, { useLayoutEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

type FavItem = {
  id: string;
  title: string;
  subtitle: string;
  image: any;
};

const TABS = [
  { key: 'accommodation', label: 'Accommodation', icon: 'hotel' as const, emoji: '🏨' },
  { key: 'spots', label: 'Tourist Spots', icon: 'map-marker-alt' as const, emoji: '📍' },
  { key: 'shops', label: 'Shops', icon: 'shopping-bag' as const, emoji: '🛍️' },
  { key: 'events', label: 'Events', icon: 'calendar-alt' as const, emoji: '🎉' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Favorite = () => {
  const navigation = useNavigation();
  const scheme = useColorScheme();
  const bg = scheme === 'dark' ? '#0F1222' : '#F6F7FA';
  const card = scheme === 'dark' ? '#161A2E' : '#FFFFFF';
  const textMuted = scheme === 'dark' ? '#A9B2D0' : '#6A768E';

  // Header right: small settings button
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'My Favorites',
      headerRight: () => (
        <Pressable onPress={() => router.push('/(tabs)/(profile)/(settings)')} style={{ paddingHorizontal: 12 }}>
          <FontAwesome5 name="cog" size={18} color={scheme === 'dark' ? '#fff' : '#1F2A44'} />
        </Pressable>
      ),
    });
  }, [navigation, scheme]);

  // Search
  const [query, setQuery] = useState('');

  // Data per tab (seeded with placeholder data for demo)
  const [favByTab, setFavByTab] = useState<Record<TabKey, FavItem[]>>({
    accommodation: [
      {
        id: 'a1',
        title: 'Sunrise Beach Resort',
        subtitle: 'Affordable beachfront stay in Naga City',
        image: require('@/assets/images/android-icon-foreground.png'),
      },
    ],
    spots: [
      {
        id: 's1',
        title: 'Plaza Quince Martires',
        subtitle: 'Historic city landmark and plaza',
        image: require('@/assets/images/partial-react-logo.png'),
      },
    ],
    shops: [
      {
        id: 'sh1',
        title: 'Local Souvenir Shop',
        subtitle: 'Handcrafted goods and delicacies',
        image: require('@/assets/images/react-logo.png'),
      },
    ],
    events: [
      {
        id: 'e1',
        title: 'Peñafrancia Festival',
        subtitle: 'Cultural parade and celebration',
        image: require('@/assets/images/react-logo.png'),
      },
    ],
  });

  // Swipeable tabs
  const [tabIndex, setTabIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const onTabPress = (index: number) => {
    setTabIndex(index);
    scrollRef.current?.scrollTo({ x: SCREEN_WIDTH * index, animated: false });
  };

  // Pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  };

  // Filtered items by search query for the current tab
  const filteredFor = (key: TabKey) => {
    const q = query.trim().toLowerCase();
    const arr = favByTab[key] ?? [];
    if (!q) return arr;
    return arr.filter((i) => i.title.toLowerCase().includes(q) || i.subtitle.toLowerCase().includes(q));
  };

  // Remove from favorites with small animation
  const removeFav = (key: TabKey, id: string) => {
    setFavByTab((prev) => ({ ...prev, [key]: (prev[key] || []).filter((i) => i.id !== id) }));
  };

  // Animated indicator for tabs
  const indicatorTranslateX = scrollX.interpolate({
    inputRange: TABS.map((_, i) => i * SCREEN_WIDTH),
    outputRange: TABS.map((_, i) => (i * (SCREEN_WIDTH - 40)) / TABS.length),
    extrapolate: 'clamp',
  });

  const renderCard = (item: FavItem, key: TabKey) => (
    <View style={[styles.card, { backgroundColor: card }, shadow(2)]}>
      <Image source={item.image} style={styles.thumb} />
      <View style={{ flex: 1, marginHorizontal: 12 }}>
        <ThemedText type="body-medium" weight="semi-bold" numberOfLines={1}>
          {item.title}
        </ThemedText>
        <ThemedText type="label-small" style={{ color: textMuted }} numberOfLines={2}>
          {item.subtitle}
        </ThemedText>
      </View>
      <HeartButton onPress={() => removeFav(key, item.id)} />
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: bg }]}> 
      {/* Search */}
      <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onSearch={() => {}}
          placeholder="Search favorites…"
        />
      </View>

      {/* Tabs */}
      <View style={{ paddingHorizontal: 20, marginTop: 14 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
        >
          {TABS.map((t, i) => (
            <Button
              startIcon={t.icon}
              key={t.key}
              onPress={() => onTabPress(i)}
              label={t.label}
              size='medium'
              textSize={11}
              iconSize={14}
              padding={11}
              variant={tabIndex === i ? 'solid' : 'soft'}
              color={tabIndex === i ? 'primary' : 'secondary'}
            />
          ))}
        </ScrollView>
      </View>

      {/* Pages */}
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          listener: (e: { nativeEvent: { contentOffset: { x: number } } }) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            if (idx !== tabIndex) setTabIndex(idx);
          },
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
        style={{ marginTop: 10 }}
      >
        {TABS.map((t) => {
          const key = t.key as TabKey;
          const data = filteredFor(key);
          const isEmpty = data.length === 0;
          return (
            <View key={t.key} style={{ width: SCREEN_WIDTH, paddingHorizontal: 20 }}>
              {isEmpty ? (
                <EmptyState />
              ) : (
                <FlatList
                  data={data}
                  keyExtractor={(it) => it.id}
                  renderItem={({ item }) => renderCard(item, key)}
                  contentContainerStyle={{ paddingVertical: 14, gap: 12 }}
                  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
};

export default Favorite;

// Heart button with tiny pop animation
const HeartButton = ({ onPress }: { onPress: () => void }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.2, duration: 120, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start(() => onPress());
  };
  return (
    <Pressable onPress={handlePress} accessibilityRole="button" accessibilityLabel="Remove from favorites">
      <Animated.View style={{ transform: [{ scale }] }}>
        <FontAwesome5 name="heart" size={32} color={colors.primary} solid />
      </Animated.View>
    </Pressable>
  );
};

// Empty state component
const EmptyState = () => (
  <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 10 }}>
    <View style={[styles.illustration, shadow(3)]}>
      <FontAwesome5 name="map" size={36} color={colors.secondary} />
      <FontAwesome5 name="search-location" size={18} color="#7C89B6" style={{ position: 'absolute', right: 16, bottom: 14 }} />
    </View>
    <ThemedText type="sub-title-medium" weight="bold" align="center">No favorites yet</ThemedText>
    <ThemedText type="label-medium" align="center" style={{ color: '#6A768E' }}>
      Start exploring and add places you love!
    </ThemedText>
    <View style={{ width: '70%', marginTop: 6 }}>
      <Button
        label="Explore Now"
        startIcon="compass"
        variant="solid"
        color="primary"
        size="large"
        fullWidth
        radius={14}
        onPress={() => router.push('/(tabs)/(home)')}
      />
    </View>
  </View>
);

// Styles
const styles = StyleSheet.create({
  screen: { flex: 1 },
  tabRow: { flexDirection: 'row', alignItems: 'center', gap: 8},
  tabBtn: {
    flex: 1,
    backgroundColor: '#EEF4FF',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorTrack: { height: 3, backgroundColor: '#E1E8F5', marginTop: 8, borderRadius: 2 },
  indicator: { height: 3, backgroundColor: colors.secondary, borderRadius: 2 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 12,
  },
  thumb: { width: 64, height: 64, borderRadius: 14, backgroundColor: '#EAEFF7' },
  illustration: {
    width: 140,
    height: 90,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

function shadow(level: 1 | 2 | 3) {
  switch (level) {
    case 1:
      return { shadowColor: '#1e1e1e', shadowOpacity: 0.08, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 } as const;
    case 2:
      return { shadowColor: '#1e1e1e', shadowOpacity: 0.12, shadowRadius: 3, shadowOffset: { width: 0, height: 2 }, elevation: 2 } as const;
    default:
      return { shadowColor: '#1e1e1e', shadowOpacity: 0.16, shadowRadius: 4, shadowOffset: { width: 0, height: 3 }, elevation: 3 } as const;
  }
}