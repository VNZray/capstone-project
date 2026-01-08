import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  Pressable,
  Linking,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import { useEvent } from '@/context/EventContext';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/Button';
import { MapView, Marker } from '@/components/map/MapWrapper';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const EventDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    selectedEvent,
    selectedEventImages,
    selectedEventLocations,
    loadingEvent,
    setEventId,
    clearEventId,
  } = useEvent();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      setEventId(id);
    }
    return () => {
      clearEventId();
    };
  }, [id, setEventId, clearEventId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const handleCallPress = () => {
    if (selectedEvent?.contact_phone) {
      Linking.openURL(`tel:${selectedEvent.contact_phone}`);
    }
  };

  const handleEmailPress = () => {
    if (selectedEvent?.contact_email) {
      Linking.openURL(`mailto:${selectedEvent.contact_email}`);
    }
  };

  const handleWebsitePress = () => {
    if (selectedEvent?.website) {
      Linking.openURL(selectedEvent.website);
    }
  };

  const handleRegisterPress = () => {
    if (selectedEvent?.registration_url) {
      Linking.openURL(selectedEvent.registration_url);
    }
  };

  const handleMapPress = () => {
    if (selectedEvent?.latitude && selectedEvent?.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${selectedEvent.latitude},${selectedEvent.longitude}`;
      Linking.openURL(url);
    }
  };

  // Get images from event or from selectedEventImages
  const images = selectedEvent?.images?.length
    ? selectedEvent.images
    : selectedEventImages;

  // Get primary image or cover image
  const displayImages = images?.length
    ? images.map((img) => img.file_url)
    : selectedEvent?.cover_image_url
    ? [selectedEvent.cover_image_url]
    : [];

  if (loadingEvent) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <ThemedText type="body-medium" style={styles.loadingText}>
          Loading event details...
        </ThemedText>
      </View>
    );
  }

  if (!selectedEvent) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.light.error} />
        <ThemedText type="title-medium" weight="semibold" style={styles.errorTitle}>
          Event Not Found
        </ThemedText>
        <ThemedText type="body-medium" style={styles.errorText}>
          The event you're looking for doesn't exist or has been removed.
        </ThemedText>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Image Gallery */}
      <View style={styles.imageContainer}>
        {displayImages.length > 0 ? (
          <>
            <Image
              source={{ uri: displayImages[currentImageIndex] }}
              style={styles.coverImage}
              resizeMode="cover"
            />
            {displayImages.length > 1 && (
              <View style={styles.imageIndicators}>
                {displayImages.map((_, index) => (
                  <Pressable
                    key={index}
                    onPress={() => setCurrentImageIndex(index)}
                    style={[
                      styles.indicator,
                      index === currentImageIndex && styles.indicatorActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="calendar" size={64} color={Colors.light.textSecondary} />
          </View>
        )}

        {/* Badges */}
        <View style={styles.badgeContainer}>
          {selectedEvent.is_featured && (
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={12} color="#fff" />
              <ThemedText type="label-small" style={styles.badgeText}>
                Featured
              </ThemedText>
            </View>
          )}
          {selectedEvent.is_free && (
            <View style={styles.freeBadge}>
              <ThemedText type="label-small" style={styles.badgeText}>
                Free Entry
              </ThemedText>
            </View>
          )}
        </View>
      </View>

      {/* Event Content */}
      <View style={styles.content}>
        {/* Title & Price */}
        <View style={styles.titleSection}>
          <ThemedText type="title-large" weight="bold" style={styles.title}>
            {selectedEvent.name}
          </ThemedText>
          {!selectedEvent.is_free && selectedEvent.ticket_price && (
            <View style={styles.priceContainer}>
              <ThemedText type="body-small" style={styles.priceLabel}>
                Ticket Price
              </ThemedText>
              <ThemedText type="title-medium" weight="bold" style={styles.price}>
                ₱{selectedEvent.ticket_price.toLocaleString()}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Category */}
        {selectedEvent.category_name && (
          <View style={styles.categoryBadge}>
            {selectedEvent.category_icon && (
              <ThemedText type="body-small">{selectedEvent.category_icon}</ThemedText>
            )}
            <ThemedText type="label-medium" style={styles.categoryText}>
              {selectedEvent.category_name}
            </ThemedText>
          </View>
        )}

        {/* Date & Time Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={20} color={Colors.light.primary} />
            <ThemedText type="body-large" weight="semibold" style={styles.sectionTitle}>
              Date & Time
            </ThemedText>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.infoRow}>
              <ThemedText type="body-medium" weight="medium" style={styles.infoLabel}>
                Start Date
              </ThemedText>
              <ThemedText type="body-medium" style={styles.infoValue}>
                {formatDate(selectedEvent.start_date)}
              </ThemedText>
            </View>
            {selectedEvent.end_date && selectedEvent.end_date !== selectedEvent.start_date && (
              <View style={styles.infoRow}>
                <ThemedText type="body-medium" weight="medium" style={styles.infoLabel}>
                  End Date
                </ThemedText>
                <ThemedText type="body-medium" style={styles.infoValue}>
                  {formatDate(selectedEvent.end_date)}
                </ThemedText>
              </View>
            )}
            {selectedEvent.is_all_day ? (
              <View style={styles.infoRow}>
                <ThemedText type="body-medium" weight="medium" style={styles.infoLabel}>
                  Duration
                </ThemedText>
                <ThemedText type="body-medium" style={styles.infoValue}>
                  All Day Event
                </ThemedText>
              </View>
            ) : (
              selectedEvent.start_time && (
                <View style={styles.infoRow}>
                  <ThemedText type="body-medium" weight="medium" style={styles.infoLabel}>
                    Time
                  </ThemedText>
                  <ThemedText type="body-medium" style={styles.infoValue}>
                    {formatTime(selectedEvent.start_time)}
                    {selectedEvent.end_time && ` - ${formatTime(selectedEvent.end_time)}`}
                  </ThemedText>
                </View>
              )
            )}
            {selectedEvent.is_recurring && selectedEvent.recurrence_pattern && (
              <View style={styles.infoRow}>
                <ThemedText type="body-medium" weight="medium" style={styles.infoLabel}>
                  Recurrence
                </ThemedText>
                <ThemedText type="body-medium" style={styles.infoValue}>
                  {selectedEvent.recurrence_pattern.charAt(0).toUpperCase() +
                    selectedEvent.recurrence_pattern.slice(1)}
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Location Section */}
        {(selectedEvent.venue_name || selectedEventLocations.length > 0) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location" size={20} color={Colors.light.primary} />
              <ThemedText type="body-large" weight="semibold" style={styles.sectionTitle}>
                Location
              </ThemedText>
            </View>
            <View style={styles.sectionContent}>
              {selectedEvent.venue_name && (
                <ThemedText type="body-medium" weight="medium" style={styles.venueName}>
                  {selectedEvent.venue_name}
                </ThemedText>
              )}
              {selectedEvent.venue_address && (
                <ThemedText type="body-medium" style={styles.venueAddress}>
                  {selectedEvent.venue_address}
                </ThemedText>
              )}
              {(selectedEvent.barangay_name || selectedEvent.municipality_name) && (
                <ThemedText type="body-small" style={styles.venueLocation}>
                  {[
                    selectedEvent.barangay_name,
                    selectedEvent.municipality_name,
                    selectedEvent.province_name,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </ThemedText>
              )}
              
              {/* Map with Marker */}
              {selectedEvent.latitude && selectedEvent.longitude && (
                <View style={styles.mapContainer}>
                  <MapView
                    style={styles.map}
                    initialRegion={{
                      latitude: parseFloat(String(selectedEvent.latitude)),
                      longitude: parseFloat(String(selectedEvent.longitude)),
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                  >
                    <Marker
                      coordinate={{
                        latitude: parseFloat(String(selectedEvent.latitude)),
                        longitude: parseFloat(String(selectedEvent.longitude)),
                      }}
                      title={selectedEvent.venue_name || selectedEvent.name}
                    />
                  </MapView>
                  <Pressable style={styles.mapButton} onPress={handleMapPress}>
                    <Ionicons name="navigate-outline" size={16} color={Colors.light.primary} />
                    <ThemedText type="body-small" style={styles.mapButtonText}>
                      Get Directions
                    </ThemedText>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Capacity Section */}
        {selectedEvent.max_capacity && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="people" size={20} color={Colors.light.primary} />
              <ThemedText type="body-large" weight="semibold" style={styles.sectionTitle}>
                Capacity
              </ThemedText>
            </View>
            <View style={styles.sectionContent}>
              <View style={styles.infoRow}>
                <ThemedText type="body-medium" weight="medium" style={styles.infoLabel}>
                  Max Capacity
                </ThemedText>
                <ThemedText type="body-medium" style={styles.infoValue}>
                  {selectedEvent.max_capacity.toLocaleString()} attendees
                </ThemedText>
              </View>
              {selectedEvent.current_attendees !== undefined && (
                <View style={styles.infoRow}>
                  <ThemedText type="body-medium" weight="medium" style={styles.infoLabel}>
                    Current Attendees
                  </ThemedText>
                  <ThemedText type="body-medium" style={styles.infoValue}>
                    {selectedEvent.current_attendees.toLocaleString()}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Description Section */}
        {selectedEvent.description && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={20} color={Colors.light.primary} />
              <ThemedText type="body-large" weight="semibold" style={styles.sectionTitle}>
                About This Event
              </ThemedText>
            </View>
            <View style={styles.sectionContent}>
              <ThemedText type="body-medium" style={styles.description}>
                {selectedEvent.description}
              </ThemedText>
            </View>
          </View>
        )}

        {/* Organizer Section */}
        {selectedEvent.organizer_name && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="business" size={20} color={Colors.light.primary} />
              <ThemedText type="body-large" weight="semibold" style={styles.sectionTitle}>
                Organizer
              </ThemedText>
            </View>
            <View style={styles.sectionContent}>
              <ThemedText type="body-medium" weight="medium">
                {selectedEvent.organizer_name}
              </ThemedText>
              {selectedEvent.organizer_type && (
                <ThemedText type="body-small" style={styles.organizerType}>
                  {selectedEvent.organizer_type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </ThemedText>
              )}
            </View>
          </View>
        )}

        {/* Contact Section */}
        {(selectedEvent.contact_phone || selectedEvent.contact_email || selectedEvent.website) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="call" size={20} color={Colors.light.primary} />
              <ThemedText type="body-large" weight="semibold" style={styles.sectionTitle}>
                Contact Information
              </ThemedText>
            </View>
            <View style={styles.contactButtons}>
              {selectedEvent.contact_phone && (
                <Pressable style={styles.contactButton} onPress={handleCallPress}>
                  <Ionicons name="call-outline" size={20} color={Colors.light.primary} />
                  <ThemedText type="body-small" style={styles.contactButtonText}>
                    Call
                  </ThemedText>
                </Pressable>
              )}
              {selectedEvent.contact_email && (
                <Pressable style={styles.contactButton} onPress={handleEmailPress}>
                  <Ionicons name="mail-outline" size={20} color={Colors.light.primary} />
                  <ThemedText type="body-small" style={styles.contactButtonText}>
                    Email
                  </ThemedText>
                </Pressable>
              )}
              {selectedEvent.website && (
                <Pressable style={styles.contactButton} onPress={handleWebsitePress}>
                  <Ionicons name="globe-outline" size={20} color={Colors.light.primary} />
                  <ThemedText type="body-small" style={styles.contactButtonText}>
                    Website
                  </ThemedText>
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* Registration Button */}
        {selectedEvent.registration_url && (
          <View style={styles.registerSection}>
            <Button
              label="Register for Event"
              variant="solid"
              color="primary"
              size="large"
              fullWidth
              radius={12}
              onPress={handleRegisterPress}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default EventDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  loadingText: {
    marginTop: 12,
    color: Colors.light.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    paddingHorizontal: 32,
  },
  errorTitle: {
    marginTop: 16,
    color: Colors.light.text,
  },
  errorText: {
    marginTop: 8,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 280,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  indicatorActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  badgeContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    gap: 8,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.light.warning,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  freeBadge: {
    backgroundColor: Colors.light.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    flex: 1,
    color: Colors.light.text,
    marginRight: 16,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    color: Colors.light.textSecondary,
  },
  price: {
    color: Colors.light.primary,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: Colors.light.primaryLight || '#EBF4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 20,
  },
  categoryText: {
    color: Colors.light.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    color: Colors.light.text,
  },
  sectionContent: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  infoLabel: {
    color: Colors.light.textSecondary,
  },
  infoValue: {
    color: Colors.light.text,
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  venueName: {
    color: Colors.light.text,
    marginBottom: 4,
  },
  venueAddress: {
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  venueLocation: {
    color: Colors.light.textSecondary,
    marginBottom: 12,
  },
  mapContainer: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  mapButtonText: {
    color: Colors.light.primary,
    fontWeight: '500',
  },
  description: {
    color: Colors.light.text,
    lineHeight: 24,
  },
  organizerType: {
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.surface,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  contactButtonText: {
    color: Colors.light.primary,
    fontWeight: '500',
  },
  registerSection: {
    marginTop: 8,
  },
});
