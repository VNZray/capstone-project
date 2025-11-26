import AccommodationCard from '@/components/accommodation/AccommodationCard';
import Button from '@/components/Button';
import Container from '@/components/Container';
import PageContainer from '@/components/PageContainer';
import ScrollableTab from '@/components/ScrollableTab';
import SearchBar from '@/components/SearchBar';
import { ThemedText } from '@/components/themed-text';
import { useAccommodation } from '@/context/AccommodationContext';
import { navigateToAccommodationProfile } from '@/routes/accommodationRoutes';
import { fetchAddress } from '@/services/AccommodationService';
import type { Business } from '@/types/Business';
import type { Tab } from '@/types/Tab';
import { FontAwesome5 } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import placeholder from '@/assets/images/placeholder.png';
import { Colors } from '@/constants/color';

// ---- Category constants and helpers (module scope) ----
const CATEGORY_ID_TO_KEY: Record<number, string> = {
  1: 'hotel',
  2: 'resort',
  10: 'hostel',
  11: 'inn',
  12: 'bed_and_breakfast',
  16: 'guesthouse',
  17: 'motel',
  18: 'serviced_apartment',
  19: 'villa',
  20: 'lodge',
  21: 'homestay',
  22: 'cottage',
  23: 'capsule_hotel',
  24: 'boutique_hotel',
  25: 'eco_resort',
};

const CATEGORY_KEY_TO_LABEL: Record<string, string> = {
  hotel: 'Hotel',
  resort: 'Resort',
  hostel: 'Hostel',
  inn: 'Inn',
  bed_and_breakfast: 'B&B',
  guesthouse: 'Guesthouse',
  motel: 'Motel',
  serviced_apartment: 'Serviced Apt.',
  villa: 'Villa',
  lodge: 'Lodge',
  homestay: 'Homestay',
  cottage: 'Cottage',
  capsule_hotel: 'Capsule Hotel',
  boutique_hotel: 'Boutique Hotel',
  eco_resort: 'Eco Resort',
};

const CATEGORY_KEY_TO_ICON: Record<string, string> = {
  hotel: 'hotel',
  resort: 'umbrella-beach',
  hostel: 'user-friends',
  inn: 'bed',
  bed_and_breakfast: 'coffee',
  guesthouse: 'home',
  motel: 'car',
  serviced_apartment: 'building',
  villa: 'landmark',
  lodge: 'house-user',
  homestay: 'home',
  cottage: 'tree',
  capsule_hotel: 'cube',
  boutique_hotel: 'gem',
  eco_resort: 'leaf',
};

const toLowerSafe = (v?: string | null) =>
  typeof v === 'string' ? v.toLowerCase() : '';
const getCategoryKey = (b: Business) =>
  b.business_category_id != null
    ? CATEGORY_ID_TO_KEY[b.business_category_id]
    : undefined;

const AccommodationDirectory = () => {
  const colors = Colors.light;
  const bg = colors.background;

  const {
    loading,
    allAccommodationDetails,
    setAccommodationId,
    refreshAllAccommodations,
  } = useAccommodation();
  const [cardView, setCardView] = useState('card');
  const [refreshing, setRefreshing] = useState(false);
  const lastScrollOffset = useRef(0);
  const atTopRef = useRef(true);
  const wasScrollingUpRef = useRef(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshAllAccommodations();
    } finally {
      setRefreshing(false);
    }
  }, [refreshAllAccommodations]);

  // Track scroll direction only
  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = e.nativeEvent.contentOffset.y;
      const prev = lastScrollOffset.current;
      wasScrollingUpRef.current = offsetY < prev;
      atTopRef.current = offsetY <= 0; // near/at top
      lastScrollOffset.current = offsetY;
    },
    []
  );

  // Trigger refresh only after user releases the scroll (end drag) while scrolling up at top
  const handleScrollEndDrag = useCallback(() => {
    if (
      atTopRef.current &&
      wasScrollingUpRef.current &&
      !refreshing &&
      !loading
    ) {
      onRefresh();
    }
  }, [loading, onRefresh, refreshing]);

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const handleResetFilters = () => {
    setSearch('');
    setActiveTab('all');
  };

  // Local UI state
  // Tabs: only categories present for business_type_id === 1; keep 'All'
  const dynamicTabs: Tab[] = useMemo(() => {
    const ids = new Set<number>();
    (allAccommodationDetails || []).forEach((b: Business) => {
      if (
        b.business_type_id === 1 &&
        typeof b.business_category_id === 'number'
      ) {
        ids.add(b.business_category_id);
      }
    });
    const tabs = Array.from(ids)
      .map((id) => {
        const key = CATEGORY_ID_TO_KEY[id];
        if (!key) return undefined;
        return {
          key,
          label: CATEGORY_KEY_TO_LABEL[key],
          icon: CATEGORY_KEY_TO_ICON[key] || 'hotel',
        } as Tab;
      })
      .filter((t): t is Tab => !!t)
      .sort((a, b) => a.label.localeCompare(b.label));
    return [{ key: 'all', label: 'All', icon: 'th-large' }, ...tabs];
  }, [allAccommodationDetails]);
  // Use dynamicTabs instead of TABS below

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab.key);
    console.log('Filtering for:', tab.key);
  };

  const handleAccommodationSelect = (id: string) => {
    setAccommodationId(id);
    navigateToAccommodationProfile();
  };

  // Cache of resolved address parts per barangay_id
  const [addressPartsByBarangay, setAddressPartsByBarangay] = useState<
    Record<number, string[]>
  >({});

  const getBarangayName = useCallback(
    (barangay_id?: number) => {
      if (barangay_id == null) return '';
      const arr = addressPartsByBarangay[barangay_id];
      return Array.isArray(arr) && arr.length > 0 ? arr[0] : '';
    },
    [addressPartsByBarangay]
  );

  const formatSubtitle = (b: Business) => {
    const barangay = getBarangayName(b.barangay_id);
    return barangay ? `${b.address}, ${barangay}` : b.address ?? '';
  };

  // Filter: type=1, search (name/address/barangay), status, tab
  const filteredAccommodations = useMemo(() => {
    if (!Array.isArray(allAccommodationDetails)) return [];
    const term = toLowerSafe(search.trim());
    return allAccommodationDetails.filter((b: Business) => {
      if (b.business_type_id !== 1) return false;
      const name = toLowerSafe(b.business_name);
      const addr = toLowerSafe(b.address);
      const brgy = toLowerSafe(getBarangayName(b.barangay_id));
      const matchesSearch =
        !term ||
        name.includes(term) ||
        addr.includes(term) ||
        brgy.includes(term);

      const categoryKey = getCategoryKey(b);
      const matchesTab = activeTab === 'all' || categoryKey === activeTab;

      const status = toLowerSafe(b.status);
      const isVisibleStatus = status === 'active' || status === 'pending';

      return matchesSearch && matchesTab && isVisibleStatus;
    });
  }, [allAccommodationDetails, search, activeTab, getBarangayName]);

  // Return array: [barangay_name, municipality_name, province_name]
  const fetchBusinessAddress = async (
    barangay_id: number
  ): Promise<string[]> => {
    try {
      const address = await fetchAddress(barangay_id);
      if (!address) return [];
      const parts: string[] = [];
      if (address.barangay_name) parts.push(address.barangay_name);
      if (address.municipality_name) parts.push(address.municipality_name);
      if (address.province_name) parts.push(address.province_name);
      return parts;
    } catch (error) {
      console.error('Error fetching address:', error);
      return [];
    }
  };

  // Prefetch address parts for visible accommodations
  useEffect(() => {
    const load = async () => {
      const ids = Array.from(
        new Set(
          filteredAccommodations
            .map((b: Business) => b.barangay_id)
            .filter((id): id is number => typeof id === 'number' && id > 0)
        )
      );
      const missing = ids.filter((id) => !(id in addressPartsByBarangay));
      if (missing.length === 0) return;
      const entries = await Promise.all(
        missing.map(
          async (id) =>
            [id, await fetchBusinessAddress(id)] as [number, string[]]
        )
      );
      setAddressPartsByBarangay((prev) => {
        const next = { ...prev } as Record<number, string[]>;
        entries.forEach(([id, parts]) => (next[id] = parts));
        return next;
      });
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredAccommodations]);

  return (
    <PageContainer padding={0} gap={0} style={{ backgroundColor: bg }}>
      <Container gap={0} paddingBottom={0} backgroundColor="transparent">
        <View style={styles.SearchContainer}>
          <SearchBar
            shape="square"
            containerStyle={{ flex: 1 }}
            value={search}
            onChangeText={(text) => setSearch(text)}
            onSearch={() => {}}
            placeholder={'Search Accommodation or Location'}
          />
          <Button
            elevation={2}
            color="white"
            startIcon={cardView === 'card' ? 'list' : 'th-large'}
            icon
            onPress={() => setCardView(cardView === 'card' ? 'list' : 'card')}
          />
        </View>
        <ScrollableTab
          tabs={dynamicTabs}
          onTabChange={handleTabChange}
          activeKey={activeTab}
        />
      </Container>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 0,
          paddingBottom: 100,
          paddingHorizontal: 16,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={handleScroll}
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={32}
      >
        <View style={styles.cardWrapper}>
          {loading ? (
            <ThemedText
              type="card-title-medium"
              weight="bold"
              style={{ textAlign: 'center', marginTop: 20 }}
            >
              Loading...
            </ThemedText>
          ) : filteredAccommodations.length > 0 ? (
            filteredAccommodations.map((business) => (
              <AccommodationCard
                elevation={2}
                key={business.id}
                title={business.business_name}
                subTitle={formatSubtitle(business)}
                pricing={
                  business.min_price && business.max_price
                    ? `${business.min_price} - ${business.max_price}`
                    : 'N/A'
                }
                image={
                  business.business_image
                    ? { uri: business.business_image }
                    : placeholder
                }
                ratings={4.5}
                view={cardView}
                favorite={false}
                onClick={() => handleAccommodationSelect(business.id!)}
              />
            ))
          ) : (
            <PageContainer
              padding={16}
              align="center"
              justify="center"
              height={450}
            >
              <View style={styles.illustrationInner}>
                <FontAwesome5 name="map-pin" size={36} color="#FFB007" />
              </View>
              <ThemedText
                type="title-medium"
                weight="bold"
                align="center"
                mt={8}
              >
                No accommodations found
              </ThemedText>
              <ThemedText
                type="body-small"
                align="center"
                mt={6}
                style={{ color: '#6A768E' }}
              >
                Try adjusting your search or clearing filters to see more
                places.
              </ThemedText>

              <Button
                label="Clear Filters"
                variant="soft"
                color="secondary"
                size="medium"
                fullWidth
                radius={14}
                startIcon="redo"
                onPress={handleResetFilters}
              />
            </PageContainer>
          )}
        </View>
      </ScrollView>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  SearchContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    overflow: 'visible',
  },
  cardWrapper: {
    gap: 16,
    overflow: 'visible',
  },
  notFoundWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
  },
  notFoundCard: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    ...shadow(2),
  },
  illustrationInner: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  notFoundActions: {
    width: '100%',
    marginTop: 12,
  },
});

// soft shadow helper (inline, compact)
function shadow(level: 1 | 2 | 3) {
  switch (level) {
    case 1:
      return {
        shadowColor: '#1e1e1e',
        shadowOpacity: 0.1,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
      } as const;
    case 2:
    default:
      return {
        shadowColor: '#1e1e1e',
        shadowOpacity: 0.15,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      } as const;
  }
}

export default AccommodationDirectory;
