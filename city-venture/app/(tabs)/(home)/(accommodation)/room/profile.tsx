import { MaterialCommunityIcons } from '@expo/vector-icons';
// useNavigation: for setOptions (header customization)
// useRouter: for navigation actions (push, replace, back)
import { useNavigation, useRouter } from 'expo-router';
import { Routes } from '@/routes/mainRoutes';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '@/components/Button';
import Tabs from '@/components/Tabs';
import { ThemedText } from '@/components/themed-text';
import RoomProfileSkeleton from '@/components/skeleton/RoomProfileSkeleton';
import { useColorScheme } from '@/hooks/use-color-scheme';

import Container from '@/components/Container';
import PageContainer from '@/components/PageContainer';
import { background, colors } from '@/constants/color';
import { useAuth } from '@/context/AuthContext';
import { useRoom } from '@/context/RoomContext';
import useUserBookings from '@/hooks/use-user-bookings';
import { Tab } from '@/types/Tab';
import debugLogger from '@/utils/debugLogger';
import Details from './details';
import Photos from './photos';
import Ratings from './ratings';
import placeholder from '@/assets/images/room-placeholder.png';
import { getAverageRating, getTotalReviews } from '@/services/FeedbackService';
import {
  getFavoritesByTouristId,
  addFavorite,
  deleteFavorite,
} from '@/services/FavoriteService';
import * as PromotionService from '@/services/PromotionService';
import type { Promotion } from '@/types/Promotion';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const AccommodationProfile = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<string>('details');
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const { roomDetails } = useRoom();
  const { bookings } = useUserBookings();
  const [ratingsRefreshKey, setRatingsRefreshKey] = useState(0);
  const bg = colorScheme === 'dark' ? background.dark : background.light;
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [roomDiscount, setRoomDiscount] = useState<Promotion | null>(null);

  useEffect(() => {
    if (roomDetails?.room_type) {
      navigation.setOptions({ headerTitle: roomDetails.room_type });
    }
    debugLogger({ title: 'Booking Data', data: bookings });
  }, [navigation, roomDetails?.room_type, bookings]);

  const handleToggleFavorite = async () => {
    if (!user?.id || !roomDetails?.id) {
      alert('Please log in to add favorites');
      return;
    }

    // Optimistic UI update
    const wasOptimisticAdd = !isFavorite;
    const previousFavoriteId = favoriteId;

    setIsFavorite(!isFavorite);

    try {
      if (isFavorite && favoriteId) {
        // Remove favorite
        await deleteFavorite(favoriteId);
        setFavoriteId(null);
      } else {
        // Add favorite
        const result = await addFavorite(user.id, 'room', roomDetails.id);
        setFavoriteId(result.id);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      // Revert optimistic update on error
      setIsFavorite(!wasOptimisticAdd);
      setFavoriteId(previousFavoriteId);
      alert('Failed to update favorite. Please try again.');
    }
  };

  const formattedPrice = useMemo(() => {
    const raw = roomDetails?.room_price as any;
    console.log('[Room Profile] formattedPrice - raw price:', raw);
    console.log('[Room Profile] formattedPrice - roomDiscount:', roomDiscount);

    if (raw == null)
      return { original: '', discounted: '', hasDiscount: false };

    let price = 0;
    if (typeof raw === 'number') {
      price = raw;
    } else {
      const str = String(raw).trim();
      const numeric = str.replace(/[^0-9.]/g, '');
      if (!numeric)
        return { original: str, discounted: str, hasDiscount: false };
      const num = Number(numeric);
      if (isNaN(num))
        return { original: str, discounted: str, hasDiscount: false };
      price = num;
    }

    const formatPrice = (p: number) =>
      '₱' +
      p.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const original = formatPrice(price);

    if (roomDiscount && roomDiscount.discount_percentage) {
      const discountAmount = Math.floor(
        price * (roomDiscount.discount_percentage / 100)
      );
      const discountedPrice = price - discountAmount;
      console.log('[Room Profile] Applying discount:', {
        originalPrice: price,
        discountPercentage: roomDiscount.discount_percentage,
        discountAmount,
        discountedPrice,
      });
      return {
        original,
        discounted: formatPrice(discountedPrice),
        hasDiscount: true,
        discountPercentage: roomDiscount.discount_percentage,
      };
    }

    console.log('[Room Profile] No discount applied');
    return { original, discounted: original, hasDiscount: false };
  }, [roomDetails?.room_price, roomDiscount]);

  const TABS: Tab[] = [
    { key: 'details', label: 'Details', icon: '' },
    { key: 'photos', label: 'Photos', icon: '' },
    { key: 'ratings', label: 'Ratings', icon: '' },
  ];

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab.key);
  };

  const handleBookNow = () => {
    if (user?.id && roomDetails?.id) {
      router.push(Routes.accommodation.room.booking.index);
    } else {
      console.log('User or room details not available');
    }
  };

  const [headerRating, setHeaderRating] = useState<string>('0.0');
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const fetchRating = async () => {
    let isMounted = true;

    if (roomDetails?.id) {
      try {
        const rating = await getAverageRating('room', roomDetails.id);
        const totalReviews = await getTotalReviews('room', roomDetails.id);
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

  const fetchFavorites = useCallback(async () => {
    if (!user?.id || !roomDetails?.id) return;

    try {
      const favorites = await getFavoritesByTouristId(user.id);
      const roomFavorite = favorites.find(
        (fav) =>
          fav.favorite_type === 'room' && fav.my_favorite_id === roomDetails.id
      );

      if (roomFavorite) {
        setFavoriteId(roomFavorite.id);
        setIsFavorite(true);
      } else {
        setFavoriteId(null);
        setIsFavorite(false);
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    }
  }, [user?.id, roomDetails?.id]);

  const fetchPromotions = useCallback(async () => {
    if (!roomDetails?.business_id) {
      console.log('[Room Profile] No business_id available');
      return;
    }

    console.log(
      '[Room Profile] Fetching promotions for business:',
      roomDetails.business_id
    );

    try {
      const promos = await PromotionService.fetchPromotionsByBusinessId(
        roomDetails.business_id
      );
      console.log('[Room Profile] Fetched promotions:', promos);
      setPromotions(promos);

      // Find best room discount (type 2)
      const roomDiscounts = promos.filter(
        (p) => p.promo_type === 2 && p.discount_percentage
      );
      console.log('[Room Profile] Room discounts (type 2):', roomDiscounts);

      if (roomDiscounts.length > 0) {
        const bestDiscount = roomDiscounts.reduce((prev, current) =>
          (current.discount_percentage || 0) > (prev.discount_percentage || 0)
            ? current
            : prev
        );
        console.log('[Room Profile] Best room discount:', bestDiscount);
        setRoomDiscount(bestDiscount);
      } else {
        console.log('[Room Profile] No room discounts found');
        setRoomDiscount(null);
      }
    } catch (error) {
      console.error('[Room Profile] Failed to fetch promotions:', error);
    }
  }, [roomDetails?.business_id]);

  useEffect(() => {
    fetchRating();
    fetchFavorites();
    fetchPromotions();
  }, [roomDetails?.id, ratingsRefreshKey, fetchFavorites, fetchPromotions]);

  // Show skeleton while loading
  if (!roomDetails) {
    return <RoomProfileSkeleton />;
  }

  return (
    <PageContainer style={{ padding: 0 }}>
      <FlatList
        data={[]}
        keyExtractor={() => 'header'}
        renderItem={() => null}
        contentContainerStyle={{ paddingBottom: 140 }}
        ListHeaderComponent={
          <>
            <View style={styles.imageContainer}>
              <Image
                source={
                  roomDetails?.room_image
                    ? { uri: roomDetails.room_image }
                    : placeholder
                }
                style={styles.image}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  paddingTop: 40,
                  paddingBottom: 12,
                  paddingHorizontal: 16,
                }}
              >
                <Container
                  padding={0}
                  backgroundColor="transparent"
                  direction="row"
                  justify="space-between"
                >
                  <View>
                    <ThemedText
                      style={{ color: '#FFFFFF' }}
                      type="card-title-medium"
                      weight="bold"
                    >
                      Room {roomDetails?.room_number}
                    </ThemedText>
                    <ThemedText style={{ color: '#FFFFFF' }} type="body-small">
                      Size: {roomDetails?.floor}sqm
                    </ThemedText>

                    <View>
                      <ThemedText
                        type="body-medium"
                        style={{ color: '#FFFFFF' }}
                      >
                        <MaterialCommunityIcons
                          name="star"
                          size={20}
                          color="#FFB007"
                        />
                        {headerRating} ({totalReviews} reviews)
                      </ThemedText>
                    </View>
                  </View>

                  {formattedPrice.hasDiscount ? (
                    <View style={{ marginTop: 4 }}>
                      <ThemedText
                        type="body-small"
                        style={{
                          textDecorationLine: 'line-through',
                          opacity: 0.6,
                        }}
                      >
                        {formattedPrice.original}
                      </ThemedText>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <ThemedText
                          darkColor={colors.light}
                          weight="bold"
                          lightColor={colors.light}
                          type="sub-title-large"
                        >
                          {formattedPrice.discounted}
                        </ThemedText>
                        <View
                          style={{
                            backgroundColor: colors.warning,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 4,
                          }}
                        >
                          <ThemedText
                            type="label-extra-small"
                            weight="bold"
                            style={{ color: 'white' }}
                          >
                            {formattedPrice.discountPercentage}% OFF
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <ThemedText
                      darkColor={colors.light}
                      weight="medium"
                      lightColor={colors.light}
                      type="sub-title-large"
                      style={{ marginTop: 4 }}
                    >
                      {formattedPrice.original}
                    </ThemedText>
                  )}
                </Container>
              </LinearGradient>
            </View>

            <Container padding={16} backgroundColor={bg}>
              <Tabs tabs={TABS} onTabChange={handleTabChange} />
            </Container>

            <View style={styles.tabContent}>
              {activeTab === 'details' && <Details />}
              {activeTab === 'photos' && <Photos />}
              {activeTab === 'ratings' && <Ratings key={ratingsRefreshKey} />}
            </View>
          </>
        }
      />
      {activeTab !== 'ratings' && (
        <View
          style={[
            styles.fabBar,
            {
              paddingBottom: (Platform.OS === 'ios' ? 60 : 80) + insets.bottom,
            },
          ]}
        >
          {user?.role_name?.toLowerCase() === 'tourist' && (
            <Button
              icon
              variant="soft"
              color={isFavorite ? 'error' : 'secondary'}
              startIcon="heart"
              onPress={handleToggleFavorite}
            />
          )}
          <Button
            label="Book Now"
            fullWidth
            startIcon="calendar-check"
            color="primary"
            variant="solid"
            onPress={handleBookNow}
            elevation={3}
            style={{ flex: 1 }}
          />
        </View>
      )}
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    position: 'relative',
    width: width * 1,
    height: height * 0.4,
  },
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
    // subtle backdrop & blur alternative (blur not added by default RN)
  },
});

export default AccommodationProfile;
