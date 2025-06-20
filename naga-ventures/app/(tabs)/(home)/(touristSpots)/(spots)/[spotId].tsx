// Main tourist spot details page that displays comprehensive information about a specific tourist spot
// This page includes details, reviews, and interactive elements like maps and image galleries

import TabSwitcher from '@/components/TabSwitcherComponent';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ReviewForm from '@/components/touristSpot/ReviewForm';
import SpotDetailsSection from '@/components/touristSpot/SpotDetailsSection';
import SpotLocationRow from '@/components/touristSpot/SpotLocationRow';
import SpotMapSection from '@/components/touristSpot/SpotMapSection';
import SpotMoreImages from '@/components/touristSpot/SpotMoreImages';
import SpotReviewsSection from '@/components/touristSpot/SpotReviewsSection';
import SpotTitleRow from '@/components/touristSpot/SpotTitleRow';
import { Colors } from '@/constants/Colors';
import { useTouristSpots } from '@/context/TouristSpotContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { JSX, useLayoutEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

// Define the structure for tab navigation
interface Tab {
  key: string;
  label: string;
}

const TouristSpotDetails: React.FC = () => {
  const { spotId } = useLocalSearchParams<{ spotId: string }>();
  const navigation = useNavigation();
  const colorScheme = useColorScheme() ?? 'light';
  const [activeTab, setActiveTab] = useState<string>('details');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { getSpotWithRatings } = useTouristSpots();
  const spot = spotId ? getSpotWithRatings(spotId) : null;
  const textColor = Colors[colorScheme].text;
  const activeBackground = '#0A1B47';
  const insets = useSafeAreaInsets();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: spot?.name,
    });
  }, [navigation, spot?.name]);

  if (!spot) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <ThemedView
          style={[
            styles.container,
            { justifyContent: 'center', alignItems: 'center' },
          ]}
        >
          <ThemedText type="title" style={{ marginBottom: 10 }}>
            Tourist Spot Not Found
          </ThemedText>
          <TouchableOpacity onPress={() => router.back()}>
            <ThemedText type="link">Back to Previous Screen</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    );
  }

  // Helper function to render star ratings
  const renderStars = (rating: number): JSX.Element => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={16}
          color={i <= rating ? '#FFD700' : 'gray'}
        />
      );
    }
    return <View style={{ flexDirection: 'row' }}>{stars}</View>;
  };

  // Define available tabs for navigation
  const tabs: Tab[] = [
    { key: 'details', label: 'Details' },
    { key: 'reviews', label: 'Reviews' },
  ];

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <ThemedView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }} // Add padding for the fixed button
        >
          <Image source={{ uri: spot.image }} style={styles.image} />
          <View style={[styles.detailsContainer]}>
            <SpotTitleRow
              name={spot.name}
              onFavorite={() => {}}
              isFavorite={false}
              textColor={textColor}
            />
            <SpotLocationRow
              location={spot.location}
              iconColor={Colors[colorScheme].icon}
            />
            <TabSwitcher
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              color={textColor}
              active={activeBackground}
            />
            <View style={styles.tabContent}>
              {activeTab === 'details' && (
                <View style={styles.detailsTab}>
                  <SpotDetailsSection title="Description">
                    <ThemedText type="default2" style={styles.sectionText}>
                      {spot.description}
                    </ThemedText>
                  </SpotDetailsSection>
                  {spot.contact && (
                    <SpotDetailsSection title="Contact">
                      <View style={styles.contactItem}>
                        <Ionicons
                          name="call-outline"
                          size={20}
                          color={Colors[colorScheme].icon}
                        />
                        <ThemedText type="default2" style={styles.contactText}>
                          {spot.contact}
                        </ThemedText>
                      </View>
                    </SpotDetailsSection>
                  )}
                  {spot.openingHours && (
                    <SpotDetailsSection title="Opening Hours">
                      <View style={styles.contactItem}>
                        <Ionicons
                          name="time-outline"
                          size={20}
                          color={Colors[colorScheme].icon}
                        />
                        <ThemedText type="default2" style={styles.contactText}>
                          {spot.openingHours}
                        </ThemedText>
                      </View>
                    </SpotDetailsSection>
                  )}
                  {spot.admissionFee && (
                    <SpotDetailsSection title="Admission Fee">
                      <ThemedText
                        type="defaultSemiBold"
                        style={styles.admissionFee}
                      >
                        {spot.admissionFee}
                      </ThemedText>
                    </SpotDetailsSection>
                  )}
                  <SpotMoreImages
                    images={spot.additionalImages}
                    onSeeAll={() =>
                      router.push({
                        pathname:
                          '/(tabs)/(home)/(touristSpots)/(categories)/AllImages',
                        params: { images: spot.additionalImages.join(',') },
                      })
                    }
                  />

                  <SpotMapSection
                    mapLocation={spot.mapLocation}
                    address={spot.location}
                    iconColor={Colors[colorScheme].icon}
                  />
                </View>
              )}
              {activeTab === 'reviews' && (
                <View style={styles.reviewsSection}>
                  <SpotReviewsSection
                    spotId={spotId}
                    rating={spot.rating}
                    ratingCount={spot.ratingCount}
                    renderStars={renderStars}
                    iconColor={Colors[colorScheme].icon}
                  />
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Fixed Write Review Button */}
        {activeTab === 'reviews' && !showReviewForm && (
          <View
            style={[
              styles.fixedButtonContainer,
              { bottom: insets.bottom + 80 },
            ]}
          >
            <TouchableOpacity
              style={styles.fixedAddReviewButton}
              onPress={() => setShowReviewForm(true)}
            >
              <Ionicons name="add-circle" size={24} color="#fff" />
              <ThemedText style={styles.addReviewButtonText}>
                Write a Review
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Review Form Modal */}
        {showReviewForm && (
          <View style={styles.reviewFormModal}>
            <View
              style={[
                styles.reviewFormContent,
                { paddingBottom: insets.bottom + 24 },
              ]}
            >
              <View style={styles.reviewFormHeader}>
                <ThemedText type="subtitle">Write a Review</ThemedText>
                <TouchableOpacity
                  onPress={() => setShowReviewForm(false)}
                  style={styles.closeButton}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={Colors[colorScheme].text}
                  />
                </TouchableOpacity>
              </View>
              <ReviewForm
                spotId={spotId}
                spotName={spot?.name || ''}
                onSubmitSuccess={() => setShowReviewForm(false)}
              />
            </View>
          </View>
        )}
      </ThemedView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 350,
  },
  detailsContainer: {
    flex: 1,
    paddingTop: 5,
    padding: 20,
  },
  tabContent: {
    flex: 1,
  },
  detailsTab: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: 'gray',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    marginLeft: 10,
    fontSize: 16,
    color: 'gray',
  },
  admissionFee: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  reviewsSection: {
    paddingTop: 1,
    paddingBottom: 20,
  },
  fixedButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
  },
  fixedAddReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A1B47',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  addReviewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  reviewFormModal: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  reviewFormContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 32,
    paddingHorizontal: 20,
    minHeight: 470,
  },
  reviewFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  closeButton: {
    padding: 4,
  },
});

export default TouristSpotDetails;
