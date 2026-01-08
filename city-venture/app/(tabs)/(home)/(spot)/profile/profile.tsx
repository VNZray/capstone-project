import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, View, Alert, Platform } from 'react-native';
// useNavigation is used for setOptions (header customization)
// For navigation actions, use useRouter or usePreventDoubleNavigation hook
import Container from '@/components/Container';
import { ThemedText } from '@/components/themed-text';
import { Tab, TabContainer } from '@/components/ui/Tabs';
import { Colors } from '@/constants/color';
import { useTouristSpot } from '@/context/TouristSpotContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import Details from './details';
import Ratings from './ratings';
import FeedbackService, { createReview } from '@/services/FeedbackService';
import Button from '@/components/Button';
import { AddReview } from '@/components/reviews';
import { useAuth } from '@/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
type TabType = 'details' | 'ratings';

const TouristSpotProfile = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { selectedSpot, addressDetails } = useTouristSpot();
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [activeTab, setActiveTab] = useState('details');
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [ratingsRefreshKey, setRatingsRefreshKey] = useState(0);
  const colors = Colors.light;
  const bg = '#fff';

  useEffect(() => {
    if (selectedSpot?.name && selectedSpot?.id) {
      navigation.setOptions({ headerTitle: selectedSpot.name });
    }
  }, [navigation, selectedSpot?.name, selectedSpot?.id]);

  useEffect(() => {
    const fetchRating = async () => {
      if (selectedSpot?.id) {
        try {
          const avg = await FeedbackService.getAverageRating('tourist_spot', selectedSpot.id);
          const total = await FeedbackService.getTotalReviews('tourist_spot', selectedSpot.id);
          setAverageRating(avg);
          setTotalReviews(total);
        } catch (error) {
          console.error('Error fetching rating:', error);
        }
      }
    };
    fetchRating();
  }, [selectedSpot?.id]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabType);
  };

  const handleReviewSubmit = async (payload: any) => {
    try {
      await createReview(payload);
      setReviewModalVisible(false);
      setRatingsRefreshKey((prev) => prev + 1);
      Alert.alert('Thank You!', 'Your review has been submitted successfully.');
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    }
  };

  if (!selectedSpot) {
    return (
      <View style={styles.notFoundContainer}>
        <ThemedText type="title-large">Tourist spot not found.</ThemedText>
        <ThemedText type="sub-title-large" style={{ textAlign: 'center' }}>
          Please go back and select a valid tourist spot.
        </ThemedText>
      </View>
    );
  }

  const primaryImage =
    selectedSpot.images?.find(
      (i) => i.is_primary === 1 || i.is_primary === true
    ) || selectedSpot.images?.[0];

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={[]}
        keyExtractor={() => 'header'}
        renderItem={() => null}
        ListHeaderComponent={
          <>
            <Image
              source={{
                uri:
                  primaryImage?.file_url ||
                  'https://via.placeholder.com/400x300',
              }}
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
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <ThemedText type="card-title-medium" weight="bold">
                    {selectedSpot.name}
                  </ThemedText>
                  <ThemedText type="body-small">
                    {[
                      addressDetails?.barangay || selectedSpot?.barangay,
                      addressDetails?.municipality ||
                        selectedSpot?.municipality,
                      addressDetails?.province || selectedSpot?.province,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </ThemedText>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <ThemedText type="body-small">
                    <MaterialCommunityIcons
                      name="star"
                      size={20}
                      color={colors.accent}
                    />
                    {averageRating.toFixed(1)} ({totalReviews})
                  </ThemedText>
                </View>
              </Container>
            </Container>
            <TabContainer
              backgroundColor={bg}
              initialTab="details"
              onTabChange={handleTabChange}
            >
              <Tab tab="details" label="Details" />
              <Tab tab="ratings" label="Ratings" />
            </TabContainer>
            <View style={styles.tabContent}>
              {activeTab === 'details' && <Details />}
              {activeTab === 'ratings' && (
                <Ratings
                  refreshKey={ratingsRefreshKey}
                  onRefreshRequested={() => {
                    if (selectedSpot?.id) {
                      FeedbackService.getAverageRating(
                        'tourist_spot',
                        selectedSpot.id
                      ).then(setAverageRating);
                      FeedbackService.getTotalReviews(
                        'tourist_spot',
                        selectedSpot.id
                      ).then(setTotalReviews);
                    }
                  }}
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
        onClose={() => setReviewModalVisible(false)}
        onSubmit={handleReviewSubmit}
        touristId={user?.id || ''}
        reviewType="tourist_spot"
        reviewTypeId={selectedSpot?.id || ''}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  image: { width: width * 1, height: height * 0.4 },
  tabContent: { marginBottom: 150, overflow: 'visible', marginTop: 16 },
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
  },
});

export default TouristSpotProfile;
