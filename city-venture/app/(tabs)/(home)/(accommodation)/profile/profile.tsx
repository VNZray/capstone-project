import { MaterialCommunityIcons } from '@expo/vector-icons';
// useNavigation is used for setOptions (header customization)
// For navigation actions, use useRouter or usePreventDoubleNavigation hook
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import placeholder from '@/assets/images/placeholder.png';
import Container from '@/components/Container';
import Tabs from '@/components/Tabs';
import { ThemedText } from '@/components/themed-text';
import AccommodationProfileSkeleton from '@/components/skeleton/AccommodationProfileSkeleton';
import { Colors } from '@/constants/color';
import { useAccommodation } from '@/context/AccommodationContext';
import { useAuth } from '@/context/AuthContext';
import { Tab } from '@/types/Tab';
import { ActivityIndicator } from 'react-native';
import Details from './details';
import Ratings from './ratings';
import Rooms from './rooms';
import { AppHeader } from '@/components/header/AppHeader';
import HeaderButton from '@/components/header/HeaderButton';
import Button from '@/components/Button';
import { AddReview } from '@/components/reviews';
import { createReview } from '@/services/FeedbackService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const AccommodationProfile = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<string>('details');
  const insets = useSafeAreaInsets();

  const colors = Colors.light;
  const { user } = useAuth();
  const {
    accommodationDetails,
    loading,
    refreshAccommodation,
    refreshAllAccommodations,
  } = useAccommodation();
  const [favorite, setFavorite] = React.useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  // Refresh & scroll state
  const [refreshing, setRefreshing] = useState(false);
  const lastOffset = useRef(0);
  const atTopRef = useRef(true);
  const wasScrollingUpRef = useRef(false);

  const toggleFavorite = () => {
    setFavorite(!favorite);
  };

  const onRefresh = useCallback(async () => {
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
  const bg = colors.background;

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

  const TABS: Tab[] = [
    { key: 'details', label: 'Details', icon: '' },
    { key: 'rooms', label: 'Rooms', icon: '' },
    { key: 'ratings', label: 'Ratings', icon: '' },
  ];

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab.key);
    console.log('Filtering for:', tab.key);
  };

  // Show skeleton while fetching data
  if (loading && !accommodationDetails) {
    return <AccommodationProfileSkeleton />;
  }

  if (!accommodationDetails) {
    return <AccommodationProfileSkeleton />;
  }

  return (
    <View style={{ flex: 1 }}>
      <AppHeader
        backButton
        title={accommodationDetails?.business_name}
        background="transparent"
        rightComponent={
          <Container
            padding={0}
            direction="row"
            backgroundColor="transparent"
            align="center"
            justify="flex-end"
            gap={8}
          >
            <HeaderButton
              onPress={toggleFavorite}
              icon={favorite ? 'heart' : 'heart-outline'}
            />

            <HeaderButton icon="share-social" />
          </Container>
        }
      />
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
            <View style={styles.imageContainer}>
              <Image
                source={
                  accommodationDetails?.business_image
                    ? { uri: accommodationDetails.business_image }
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
                  direction="row"
                  backgroundColor="transparent"
                  padding={0}
                  align="center"
                  gap={4}
                >
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={20}
                    color={colors.accent}
                  />
                  <ThemedText
                    type="body-large"
                    weight="semi-bold"
                    style={{ color: '#FFFFFF' }}
                  >
                    {accommodationDetails?.address}
                  </ThemedText>
                </Container>
                <Container
                  direction="row"
                  backgroundColor="transparent"
                  padding={0}
                  align="center"
                  gap={4}
                >
                  <MaterialCommunityIcons
                    name="star"
                    size={20}
                    color={colors.accent}
                  />
                  <ThemedText
                    type="body-medium"
                    weight="normal"
                    style={{ color: '#FFFFFF' }}
                  >
                    {accommodationDetails.ratings} (
                    {accommodationDetails.reviews})
                  </ThemedText>
                </Container>
              </LinearGradient>
            </View>

            <Container padding={16} backgroundColor={bg}>
              {/* <Container
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
                    {accommodationDetails?.address}
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
                  <Container
                    direction="row"
                    backgroundColor="transparent"
                    padding={0}
                    align="center"
                    gap={4}
                  >
                    <MaterialCommunityIcons
                      name="star"
                      size={20}
                      color={colors.accent}
                    />
                    <ThemedText type="body-small">
                      {accommodationDetails.ratings} (
                      {accommodationDetails.reviews})
                    </ThemedText>
                  </Container>
                </View>
              </Container> */}

              <Tabs tabs={TABS} onTabChange={handleTabChange} />
            </Container>

            <View style={styles.tabContent}>
              {activeTab === 'details' && <Details />}
              {activeTab === 'rooms' && <Rooms />}
              {activeTab === 'ratings' && (
                <Ratings
                  key={ratingsRefreshKey}
                  onRefreshRequested={() =>
                    setRatingsRefreshKey((prev) => prev + 1)
                  }
                />
              )}
            </View>
          </>
        }
      />

      {activeTab === 'ratings' && (
        <View
          style={[
            styles.fabBar,
            {
              paddingBottom: (Platform.OS === 'ios' ? 60 : 80) + insets.bottom,
            },
          ]}
        >
          <Button
            label="Leave a Review"
            fullWidth
            color="primary"
            variant="solid"
            onPress={() => setReviewModalVisible(true)}
            elevation={3}
            style={{ flex: 1 }}
          />
        </View>
      )}

      <AddReview
        visible={reviewModalVisible}
        onClose={() => {
          setReviewModalVisible(false);
        }}
        onSubmit={async (payload) => {
          try {
            await createReview(payload);

            setReviewModalVisible(false);
            setRatingsRefreshKey((prev) => prev + 1);
            Alert.alert(
              'Thank You!',
              'Your review has been submitted successfully.'
            );
          } catch (error) {
            console.error('Error submitting review:', error);
            throw error;
          }
        }}
        touristId={user?.id || ''}
        reviewType="accommodation"
        reviewTypeId={accommodationDetails.id || ''}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    position: 'relative',
    width: width * 1,
    height: height * 0.4,
  },
  image: {
    width: '100%',
    height: '100%',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
