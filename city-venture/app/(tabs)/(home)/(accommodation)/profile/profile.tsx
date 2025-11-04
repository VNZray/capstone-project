import { MaterialCommunityIcons } from '@expo/vector-icons';
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
import { useColorScheme } from '@/hooks/use-color-scheme';

import Container from '@/components/Container';
import { background } from '@/constants/color';
import { useAccommodation } from '@/context/AccommodationContext';
import { useAuth } from '@/context/AuthContext';
import { Tab } from '@/types/Tab';
import Details from './details';
import Ratings from './ratings';
import Rooms from './rooms';
import placeholder from '@/assets/images/placeholder.png';
import Button from '@/components/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AddReview from '@/components/reviews/Addeview';
import FeedbackService from '@/services/FeedbackService';

const { width, height } = Dimensions.get('window');

const AccommodationProfile = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<string>('details');
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const {
    accommodationDetails,
    refreshAccommodation,
    refreshAllAccommodations,
  } = useAccommodation();

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

  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [ratingsRefreshKey, setRatingsRefreshKey] = useState(0);
  const bg = colorScheme === 'dark' ? background.dark : background.light;

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

  const [averageAccommodationReviews, setAverageAccommodationReviews] =
    useState(0);

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
                  <ThemedText type="card-title-medium" weight="bold">
                    {accommodationDetails?.business_name}
                  </ThemedText>
                  <ThemedText type="body-small">
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={16}
                      color="#FFB007"
                    />
                    {accommodationDetails?.address},{' '}
                    {accommodationDetails?.barangay_name},{' '}
                    {accommodationDetails?.municipality_name}
                  </ThemedText>

                  <ThemedText type="body-medium" style={{ marginTop: 4 }}>
                    {accommodationDetails?.category}
                  </ThemedText>
                </View>
                <View>
                  <ThemedText type="body-small">
                    <MaterialCommunityIcons
                      name="star"
                      size={20}
                      color="#FFB007"
                    />
                    {averageAccommodationReviews.toFixed(1) || '0.0'}
                  </ThemedText>
                </View>
              </Container>

              <Tabs tabs={TABS} onTabChange={handleTabChange} />
            </Container>

            <View style={styles.tabContent}>
              {activeTab === 'details' && <Details />}
              {activeTab === 'rooms' && <Rooms />}
              {activeTab === 'ratings' && <Ratings />}
            </View>
          </>
        }
      />
      {!modalVisible && (() => {
        const baseBottom = Platform.OS === 'ios' ? 60 : 80;
        return (
          <View
            style={[
              styles.fabBar,
              { paddingBottom: baseBottom + insets.bottom },
            ]}
          >
            {activeTab === 'ratings' && user?.role_name?.toLowerCase() === 'tourist' && (
              <Button
                label={'Leave a Review'}
                fullWidth
                startIcon={'comment'}
                color="primary"
                variant="solid"
                onPress={() => {
                  setReviewError(null);
                  setModalVisible(true);
                }}
                elevation={3}
                style={{ flex: 1 }}
              />
            )}
          </View>
        );
      })()}

      {/* AddReview modal */}
      <AddReview
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        submitting={reviewSubmitting}
        error={reviewError}
        title="Write a review"
        onSubmit={async ({ rating, message }) => {
          if (!accommodationDetails?.id) {
            setReviewError('Missing accommodation ID.');
            return;
          }
          if (user?.role_name?.toLowerCase() !== 'tourist') {
            setReviewError('Only tourists can write reviews.');
            return;
          }
          try {
            setReviewSubmitting(true);
            await FeedbackService.createReview({
              review_type: 'Accommodation',
              review_type_id: String(accommodationDetails.id),
              rating,
              message,
              tourist_id: String(user.id || ''),
            });
            setReviewSubmitting(false);
            setModalVisible(false);
            setRatingsRefreshKey((k) => k + 1);
          } catch (e) {
            setReviewSubmitting(false);
            setReviewError('Failed to submit review. Please try again.');
          }
        }}
      />
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
