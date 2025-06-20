import { events } from '@/Controller/EventData';
import { reviews } from '@/Controller/ReviewData';
import { ThemedText } from '@/components/ThemedText';
import { MapView, Marker } from '@/components/map/MapWrapper';

import { useColorScheme } from '@/hooks/useColorScheme';
import { FontAwesome5 } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
const { width } = Dimensions.get('window');

const PREVIEW_IMAGE_WIDTH = width * 0.3;

type EventImageProps = {
  source: any; // You can replace 'any' with ImageSourcePropType for stricter typing
  style?: object;
};

const EventImage: React.FC<EventImageProps> = ({ source, style }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <View
      style={[
        style,
        {
          backgroundColor: '#f0f0f0',
          justifyContent: 'center',
          alignItems: 'center',
        },
      ]}
    >
      {isLoading && <ActivityIndicator size="small" color="#0A2342" />}
      {hasError ? (
        <FontAwesome5 name="image" size={24} color="#666" />
      ) : (
        <Image
          source={source}
          style={[style, { position: 'absolute' }]}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
          resizeMode="cover"
          fadeDuration={300}
        />
      )}
    </View>
  );
};

const EventDetails = () => {
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('details');
  const colorScheme = useColorScheme();
  const color = colorScheme === 'dark' ? '#fff' : '#000';
  const backgroundColor = colorScheme === 'dark' ? '#1c1c1c' : '#fff';
  const router = useRouter();

  // Ensure id is a string and not an array
  const eventId = Array.isArray(id) ? id[0] : id;
  const event = events.find((e) => e.id.toString() === eventId);
  const eventReviews = reviews[eventId as unknown as keyof typeof reviews];

  if (!event) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
          <ThemedText>Event not found</ThemedText>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <EventImage
        source={{ uri: event.image.src }}
        style={styles.headerImage}
      />
      <View style={styles.headerOverlay} />
      <View style={styles.headerContent}>
        <ThemedText style={styles.title}>{event.name}</ThemedText>
        <View style={styles.locationContainer}>
          <FontAwesome5 name="map-marker-alt" size={14} color="#fff" />
          <ThemedText style={styles.location}>{event.location}</ThemedText>
        </View>
        <View style={styles.ratingContainer}>
          <FontAwesome5 name="star" size={14} color="#FFD700" solid />
          <ThemedText style={styles.rating}>
            {eventReviews?.averageRating || 0}
          </ThemedText>
          <ThemedText style={styles.ratingCount}>
            ({eventReviews?.totalReviews || 0})
          </ThemedText>
        </View>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabs}>
      <Pressable
        style={[
          styles.tab,
          activeTab === 'details' && styles.activeTab,
          { marginRight: 8 },
        ]}
        onPress={() => setActiveTab('details')}
      >
        <ThemedText
          style={[
            styles.tabText,
            activeTab === 'details' && styles.activeTabText,
          ]}
        >
          Details
        </ThemedText>
      </Pressable>
      <Pressable
        style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
        onPress={() => setActiveTab('reviews')}
      >
        <ThemedText
          style={[
            styles.tabText,
            activeTab === 'reviews' && styles.activeTabText,
          ]}
        >
          Reviews
        </ThemedText>
      </Pressable>
    </View>
  );

  interface RatingBarProps {
    rating: string | number;
    percentage: number;
  }

  const renderRatingBar = (
    rating: RatingBarProps['rating'],
    percentage: RatingBarProps['percentage']
  ) => (
    <View style={styles.ratingBarContainer}>
      <ThemedText style={styles.ratingNumber}>{rating}</ThemedText>
      <View style={styles.ratingBarWrapper}>
        <View style={[styles.ratingBar, { width: `${percentage}%` }]} />
      </View>
      <ThemedText style={styles.ratingPercentage}>{percentage}%</ThemedText>
    </View>
  );

  const renderReviews = () => {
    if (!eventReviews) {
      return (
        <View style={styles.detailsContainer}>
          <ThemedText>No reviews yet</ThemedText>
        </View>
      );
    }

    return (
      <View style={styles.detailsContainer}>
        <View style={styles.reviewsSummary}>
          <View style={styles.overallRating}>
            <ThemedText style={styles.averageRating}>
              {eventReviews.averageRating}
            </ThemedText>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <FontAwesome5
                  key={star}
                  name="star"
                  size={16}
                  color="#FFD700"
                  solid
                />
              ))}
            </View>
            <ThemedText style={styles.totalReviews}>
              {eventReviews.totalReviews} reviews
            </ThemedText>
          </View>
          <View style={styles.ratingDistribution}>
            {Object.entries(eventReviews.ratingDistribution)
              .reverse()
              .map(([rating, percentage]) =>
                renderRatingBar(rating, percentage)
              )}
          </View>
        </View>

        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Pressable style={styles.filterButton}>
              <ThemedText>All</ThemedText>
            </Pressable>
            {[5, 4, 3, 2, 1].map((rating) => (
              <Pressable key={rating} style={styles.filterButton}>
                <ThemedText>{rating}</ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.reviewsList}>
          {eventReviews.reviews.map((review) => (
            <View key={review.id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Image
                  source={{ uri: review.profilePic }}
                  style={styles.profilePic}
                />
                <View style={styles.reviewHeaderText}>
                  <ThemedText style={styles.reviewUsername}>
                    {review.username}
                  </ThemedText>
                  <ThemedText style={styles.reviewDate}>
                    {review.date}
                  </ThemedText>
                </View>
                <View style={styles.reviewRating}>
                  {[...Array(review.rating)].map((_, i) => (
                    <FontAwesome5
                      key={i}
                      name="star"
                      size={12}
                      color="#FFD700"
                      solid
                    />
                  ))}
                </View>
              </View>
              <ThemedText style={styles.reviewComment}>
                {review.comment}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderDetails = () => (
    <View style={styles.detailsContainer}>
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Description</ThemedText>
        <ThemedText style={styles.description}>{event.description}</ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Contacts</ThemedText>
        <View style={styles.contactItem}>
          <ThemedText style={styles.contactLabel}>Contact Number:</ThemedText>
          <ThemedText style={styles.contactValue}>N/A</ThemedText>
        </View>
        <View style={styles.contactItem}>
          <ThemedText style={styles.contactLabel}>Social Media:</ThemedText>
          <ThemedText style={styles.contactValue}>N/A</ThemedText>
        </View>
        <View style={styles.contactItem}>
          <ThemedText style={styles.contactLabel}>Website:</ThemedText>
          <ThemedText style={styles.contactValue}>N/A</ThemedText>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Start/End Time</ThemedText>
        <ThemedText style={styles.timeValue}>09:00 AM - 10:00 PM</ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>
          ENTRANCE /ADMISSION FEE:
        </ThemedText>
        <ThemedText style={styles.feeValue}>Free</ThemedText>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionTitleContainer}>
          <ThemedText style={styles.sectionTitle}>More Images</ThemedText>
          <Pressable
            onPress={() =>
              router.push(
                `/(tabs)/(home)/(events)/images?id=${event.id}`
              )
            }
          >
            <ThemedText style={styles.seeAllButton}>See All</ThemedText>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imageGallery}
        >
          {[event.image.src, event.image.src, event.image.src].map(
            (img, index) => (
              <Pressable
                key={index}
                onPress={() =>
                  router.push(
                    `/(tabs)/(home)/(events)/images?id=${event.id}`
                  )
                }
                style={styles.galleryImageContainer}
              >
                <EventImage
                  source={{
                    uri: img,
                    width: PREVIEW_IMAGE_WIDTH * 2,
                    height: PREVIEW_IMAGE_WIDTH * 2,
                    cache: 'force-cache',
                  }}
                  style={styles.galleryImage}
                />
              </Pressable>
            )
          )}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Guide Map</ThemedText>
        <View style={styles.mapContainer}>
          {Platform.OS === 'web' ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text>Map view is not supported on web.</Text>
            </View>
          ) : (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: event.coordinates.latitude,
                longitude: event.coordinates.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: event.coordinates.latitude,
                  longitude: event.coordinates.longitude,
                }}
                title={event.coordinates.venue}
                description={event.location}
              />
            </MapView>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <ScrollView>
          {renderHeader()}
          {renderTabs()}
          {activeTab === 'details' ? renderDetails() : renderReviews()}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 250,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
  },
  ratingCount: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 14,
  },
  tabs: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
  },
  tab: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#0A1B47',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  detailsContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  contactLabel: {
    fontSize: 14,
  },
  contactValue: {
    fontSize: 14,
    opacity: 0.8,
  },
  timeValue: {
    fontSize: 14,
  },
  feeValue: {
    fontSize: 14,
  },
  imageGallery: {
    flexDirection: 'row',
  },
  galleryImageContainer: {
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  galleryImage: {
    width: PREVIEW_IMAGE_WIDTH,
    height: PREVIEW_IMAGE_WIDTH,
    borderRadius: 8,
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  reviewsSummary: {
    marginBottom: 24,
  },
  overallRating: {
    alignItems: 'center',
    marginBottom: 16,
  },
  averageRating: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  totalReviews: {
    fontSize: 14,
    opacity: 0.7,
  },
  ratingDistribution: {
    gap: 8,
  },
  ratingBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingNumber: {
    width: 20,
  },
  ratingBarWrapper: {
    flex: 1,
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
  },
  ratingBar: {
    height: '100%',
    backgroundColor: '#0A2342',
    borderRadius: 4,
  },
  ratingPercentage: {
    width: 40,
    textAlign: 'right',
  },
  filterContainer: {
    marginBottom: 24,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  reviewsList: {
    gap: 24,
  },
  reviewItem: {
    gap: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewHeaderText: {
    flex: 1,
  },
  reviewUsername: {
    fontWeight: '600',
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllButton: {
    color: '#0A2342',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default EventDetails;
