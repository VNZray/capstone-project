import AccommodationCard from '@/components/AccommodationCard';
import Button from '@/components/Button';
import Container from '@/components/Container';
import PageContainer from '@/components/PageContainer';
import ScrollableTab from '@/components/ScrollableTab';
import SearchBar from '@/components/SearchBar';
import { ThemedText } from '@/components/themed-text';
import { background } from '@/constants/color';
import { useAccommodation } from '@/context/AccommodationContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { navigateToAccommodationProfile } from '@/routes/accommodationRoutes';
import type { Business } from '@/types/Business';
import { Tab } from '@/types/Tab';
import { FontAwesome5 } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

const AccommodationDirectory = () => {
  const colorScheme = useColorScheme();
  const bg = colorScheme === 'dark' ? background.dark : background.light;

  const { loading, allAccommodationDetails, setAccommodationId } =
    useAccommodation();
  const [cardView, setCardView] = useState('card');
  // Use the first accommodation's ids (if present) to resolve category/type meta

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const handleResetFilters = () => {
    setSearch('');
    setActiveTab('all');
  };

  const TABS: Tab[] = [
    { key: 'all', label: 'All', icon: 'th-large' },

    { key: 'hotel', label: 'Hotel', icon: 'hotel' },
    { key: 'resort', label: 'Resort', icon: 'umbrella-beach' },
    { key: 'hostel', label: 'Hostel', icon: 'user-friends' },
    { key: 'inn', label: 'Inn', icon: 'bed' },
    { key: 'bed_and_breakfast', label: 'B&B', icon: 'coffee' },
    { key: 'guesthouse', label: 'Guesthouse', icon: 'home' },
    { key: 'motel', label: 'Motel', icon: 'car' },
    { key: 'serviced_apartment', label: 'Serviced Apt.', icon: 'building' },
    { key: 'villa', label: 'Villa', icon: 'landmark' },
    { key: 'lodge', label: 'Lodge', icon: 'house-user' },
    { key: 'homestay', label: 'Homestay', icon: 'home' },
    { key: 'cottage', label: 'Cottage', icon: 'tree' },
    { key: 'capsule_hotel', label: 'Capsule Hotel', icon: 'cube' },
    { key: 'boutique_hotel', label: 'Boutique Hotel', icon: 'gem' },
    { key: 'eco_resort', label: 'Eco Resort', icon: 'leaf' },
  ];

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

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab.key);
    console.log('Filtering for:', tab.key);
  };

  const handleAccommodationSelect = (id: string) => {
    setAccommodationId(id);
    navigateToAccommodationProfile();
  };

  // Combined search + tab filter logic (pure, non-mutating)
  const filteredAccommodations = allAccommodationDetails.filter(
    (business: Business) => {
      const term = search.trim().toLowerCase();
      const matchesSearch =
        term.length === 0 ||
        business.business_name.toLowerCase().includes(term) ||
        business.address!.toLowerCase().includes(term);

      const categoryKey =
        business.business_category_id != null
          ? CATEGORY_ID_TO_KEY[business.business_category_id]
          : undefined;
      const matchesTab = activeTab === 'all' || categoryKey === activeTab;
      const status = business.status.toLowerCase() === 'pending';

      return matchesSearch && matchesTab && status;
    }
  );

  return (
    <PageContainer padding={0} style={{ backgroundColor: bg }}>
      <Container
        style={{ overflow: 'visible' }}
        backgroundColor="transparent"
        gap={16}
        paddingBottom={0}
      >
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
          tabs={TABS}
          onTabChange={handleTabChange}
          activeKey={activeTab}
        />
      </Container>

      {/**Tab Filter */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 0,
          paddingBottom: 100,
          paddingHorizontal: 16,
        }}
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
                subTitle={business.address}
                pricing={
                  business.min_price && business.max_price
                    ? `${business.min_price} - ${business.max_price}`
                    : 'N/A'
                }
                image={
                  business.business_image
                    ? { uri: business.business_image }
                    : require('@/assets/images/gcash.png') // fallback
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

              <View style={styles.notFoundActions}>
                <Button
                  label="Clear Filters"
                  startIcon="redo"
                  variant="soft"
                  color="secondary"
                  size="large"
                  fullWidth
                  radius={14}
                  elevation={1}
                  textSize={16}
                  onPress={handleResetFilters}
                />
              </View>
            </PageContainer>
          )}
        </View>
      </ScrollView>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  SearchContainer: {
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
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
