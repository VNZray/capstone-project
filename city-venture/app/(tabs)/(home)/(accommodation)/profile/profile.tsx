import { MaterialCommunityIcons } from '@expo/vector-icons';
// useNavigation is used for setOptions (header customization)
// For navigation actions, use useRouter or usePreventDoubleNavigation hook
import { useNavigation } from 'expo-router';
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  View,
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from 'react-native';

import Tabs from '@/components/Tabs';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import Container from '@/components/Container';
import { useAccommodation } from '@/context/AccommodationContext';
import { useAuth } from '@/context/AuthContext';
import { Tab } from '@/types/Tab';
import Details from './details';
import Ratings from './ratings';
import Rooms from './rooms';
import placeholder from '@/assets/images/placeholder.png';
import Button from '@/components/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AddReview from '@/components/reviews/AddReview';
import {
  createReview,
  getAverageRating,
  getTotalReviews,
} from '@/services/FeedbackService';
import Chip from '@/components/Chip';

const { width, height } = Dimensions.get('window');

const AccommodationProfile = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<string>('details');
  const colors = Colors.light;
  const { user } = useAuth();
  const {
    accommodationDetails,
    refreshAccommodation,
    refreshAllAccommodations,
  } = useAccommodation();
  const actionLabel = activeTab === 'ratings' ? 'Write a Review' : 'Book Now';
  const primaryIcon = activeTab === 'ratings' ? 'comment' : 'calendar-check';
  // Refresh & scroll state
  const [refreshing, setRefreshing] = useState(false);
  const lastOffset = useRef(0);
  const atTopRef = useRef(true);
  const wasScrollingUpRef = useRef(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Refresh the focused accommodation + optionally the list (safe no-op if not needed)
      await Promise.all([
        refreshAccommodation?.(),
        refreshAllAccommodations?.(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refreshAccommodation, refreshAllAccommodations]);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const prev = lastOffset.current;
      wasScrollingUpRef.current = y < prev;
      atTopRef.current = y <= 0; // treat <=0 as top
      lastOffset.current = y;
    },
    []
  );

  const handleScrollEndDrag = useCallback(() => {
    if (atTopRef.current && wasScrollingUpRef.current && !refreshing) {
      onRefresh();
    }
  }, [onRefresh, refreshing]);
  const insets = useSafeAreaInsets();
  const bg = colors.background;

  const [modalVisible, setModalVisible] = useState(false);
  const [ratingsRefreshKey, setRatingsRefreshKey] = useState(0);

  useEffect(() => {
    if (accommodationDetails?.business_name && accommodationDetails?.id) {
      navigation.setOptions({
        headerTitle: accommodationDetails.business_name,
      });
    }
  }, [
    navigation,
    accommodationDetails?.business_name,
    accommodationDetails?.id,
  ]);

  const [headerRating, setHeaderRating] = useState<string>('0.0');
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const fetchRating = async () => {
    let isMounted = true;

    if (accommodationDetails?.id) {
      try {
        const rating = await getAverageRating(
          'accommodation',
          accommodationDetails.id
        );
        const totalReviews = await getTotalReviews(
          'accommodation',
          accommodationDetails.id
        );
        if (isMounted) {
          // Always a number, format to 1 decimal place
          setHeaderRating(Number(rating).toFixed(1));
          setTotalReviews(Number(totalReviews));
        }
      } catch (error) {
        console.log('Error fetching header rating:', error);
        if (isMounted) setHeaderRating('0.0');
      }
    }
  };

  useEffect(() => {
    fetchRating();
  }, [accommodationDetails?.id, ratingsRefreshKey]);

  const TABS: Tab[] = [
    { key: 'details', label: 'Details', icon: '' },
    { key: 'rooms', label: 'Rooms', icon: '' },
    { key: 'ratings', label: 'Ratings', icon: '' },
  ];

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab.key);
    console.log('Filtering for:', tab.key);
  };

  if (!accommodationDetails) {
    return (
      <View style={styles.notFoundContainer}>
        <ThemedText type="title-large">Accommodation not found.</ThemedText>
        <ThemedText type="sub-title-large" style={{ textAlign: 'center' }}>
          Please go back and select a valid accommodation.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={[]}
        keyExtractor={() => 'header'}
        renderItem={() => null}
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={handleScroll}
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={32}
        ListHeaderComponent={
          <>
            <Image
              source={
                accommodationDetails?.business_image
                  ? { uri: accommodationDetails.business_image }
                  : placeholder
              }
              style={styles.image}
              resizeMode="cover"
            />

            <Container padding={16} backgroundColor={bg}>
              <Container
                padding={0}
                backgroundColor="transparent"
                direction="row"
                justify="space-between"
              >
                <View>
                  <Container
                    direction="row"
                    backgroundColor="transparent"
                    padding={0}
                  >
                    <ThemedText type="card-title-medium" weight="bold">
                      {accommodationDetails?.business_name}{' '}
                    </ThemedText>
                  </Container>
                  <ThemedText type="body-small">
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={16}
                      color={colors.accent}
                    />
                    {accommodationDetails?.address},{' '}
                    {/* {accommodationDetails?.barangay_name},{' '}
                    {accommodationDetails?.municipality_name} */}
                  </ThemedText>
                  <Chip
                    size="small"
                    variant="soft"
                    color="secondary"
                    style={{ marginTop: 8, alignItems: 'flex-start' }}
                    label={accommodationDetails?.category}
                    padding={0}
                  />
                </View>

                <View>
                  <ThemedText type="body-small">
                    <MaterialCommunityIcons
                      name="star"
                      size={20}
                      color={colors.accent}
                    />
                    {headerRating} ({totalReviews} reviews)
                  </ThemedText>
                </View>
              </Container>

              <Tabs tabs={TABS} onTabChange={handleTabChange} />
            </Container>

            <View style={styles.tabContent}>
              {activeTab === 'details' && <Details />}
              {activeTab === 'rooms' && <Rooms />}
              {activeTab === 'ratings' && <Ratings key={ratingsRefreshKey} />}
            </View>
          </>
        }
      />
      {!modalVisible &&
        (() => {
          const baseBottom = Platform.OS === 'ios' ? 60 : 80;
          // Only show "Write a Review" button if user is logged in and on ratings tab
          if (activeTab === 'ratings') {
            return (
              <View
                style={[
                  styles.fabBar,
                  { paddingBottom: baseBottom + insets.bottom },
                ]}
              >
                <Button
                  label={actionLabel}
                  fullWidth
                  startIcon={primaryIcon}
                  color="primary"
                  variant="solid"
                  onPress={() => setModalVisible(true)}
                  elevation={3}
                  style={{ flex: 1 }}
                />
              </View>
            );
          }
        })()}

      {user && (
        <AddReview
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={async (payload) => {
            try {
              await createReview(payload);
              setModalVisible(false);
              setRatingsRefreshKey((prev) => prev + 1);
            } catch (error) {
              console.error('Error submitting review:', error);
              throw error;
            }
          }}
          touristId={user.id || ''}
          reviewType="accommodation"
          reviewTypeId={accommodationDetails?.id || ''}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: width * 1,
    height: height * 0.4,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tabContent: {
    overflow: 'visible',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    padding: 16,
    backgroundColor: 'transparent',
    marginBottom: 80,
  },
  fabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});

export default AccommodationProfile;
