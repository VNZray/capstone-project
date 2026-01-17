import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Linking,
  Platform,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import EventProfileSkeleton from '@/components/skeleton/EventProfileSkeleton';
import { useEvent, useEventImages, useEventLocations } from '@/query/eventQuery';
import Container from '@/components/Container';
import Chip from '@/components/Chip';
import { MapView, Marker } from '@/components/map/MapWrapper';
import PageContainer from '@/components/PageContainer';
import { Tab, TabContainer } from '@/components/ui/Tabs';
import FeedbackService from '@/services/FeedbackService';
import EventRatings from './components/EventRatings';

type TabType = 'details' | 'ratings';

const formatTime = (t?: string | null) => {
  if (!t) return '';
  const [hStr, mStr] = t.split(':');
  const h24 = parseInt(hStr || '0', 10);
  const m = (mStr || '00').padStart(2, '0');
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${m} ${suffix}`;
};

const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return 'Date TBD';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDateRange = (startDate?: string, endDate?: string): string => {
  if (!startDate) return 'Date TBD';
  const start = formatDate(startDate);
  if (endDate && endDate !== startDate) return `${start} - ${formatDate(endDate)}`;
  return start;
};

const EventProfileScreen = () => {
  const params = useLocalSearchParams();
  const eventId = params.id as string;
  const navigation = useNavigation();
  const colors = Colors.light;

  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingsRefreshKey, setRatingsRefreshKey] = useState(0);

  const { data: event, isLoading } = useEvent(eventId);
  const { data: images = [] } = useEventImages(eventId);
  const { data: locations = [] } = useEventLocations(eventId);

  useEffect(() => {
    if (event?.name) navigation.setOptions({ headerTitle: event.name });
  }, [navigation, event?.name]);

  useEffect(() => {
    const fetchRating = async () => {
      if (eventId) {
        try {
          const avg = await FeedbackService.getAverageRating('event', eventId);
          const total = await FeedbackService.getTotalReviews('event', eventId);
          setAverageRating(avg);
          setTotalReviews(total);
        } catch (error) {
          console.error('Error fetching rating:', error);
        }
      }
    };
    fetchRating();
  }, [eventId, ratingsRefreshKey]);

  const primaryImage = useMemo(() => {
    if (images.length > 0) return images.find((img) => img.is_primary) || images[0];
    if (event?.images?.length) return event.images.find((img) => img.is_primary) || event.images[0];
    return null;
  }, [images, event?.images]);

  const otherImages = useMemo(() => {
    if (images.length > 0) return images.filter((img) => img.id !== primaryImage?.id);
    return [];
  }, [images, primaryImage?.id]);

  const primaryLocation = useMemo(() => {
    if (locations.length > 0) return locations.find((loc) => loc.is_primary) || locations[0];
    if (event?.latitude && event?.longitude) {
      return { venue_name: event.venue_name, latitude: event.latitude, longitude: event.longitude, municipality_name: event.municipality_name, province_name: event.province_name };
    }
    return null;
  }, [locations, event]);

  const latitude = primaryLocation?.latitude ? (typeof primaryLocation.latitude === 'string' ? parseFloat(primaryLocation.latitude) : primaryLocation.latitude) : undefined;
  const longitude = primaryLocation?.longitude ? (typeof primaryLocation.longitude === 'string' ? parseFloat(primaryLocation.longitude) : primaryLocation.longitude) : undefined;
  const hasCoords = latitude != null && !isNaN(latitude) && longitude != null && !isNaN(longitude);

  const handleTabChange = (tab: string) => setActiveTab(tab as TabType);
  const handleRatingsRefresh = () => {
    setRatingsRefreshKey((prev) => prev + 1);
    // Refresh rating stats
    if (eventId) {
      FeedbackService.getAverageRating('event', eventId).then(setAverageRating);
      FeedbackService.getTotalReviews('event', eventId).then(setTotalReviews);
    }
  };
  const handleDirections = () => latitude && longitude && Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`);
  const handleCall = () => event?.contact_phone && Linking.openURL(`tel:${event.contact_phone}`);
  const handleEmail = () => event?.contact_email && Linking.openURL(`mailto:${event.contact_email}`);
  const handleWebsite = () => event?.website && Linking.openURL(event.website.startsWith('http') ? event.website : `https://${event.website}`);
  const handleRegistration = () => event?.registration_url && Linking.openURL(event.registration_url.startsWith('http') ? event.registration_url : `https://${event.registration_url}`);

  if (isLoading) return <EventProfileSkeleton />;
  if (!event) return (
    <View style={styles.notFoundContainer}>
      <ThemedText type="title-large">Event not found.</ThemedText>
      <ThemedText type="sub-title-large" style={{ textAlign: 'center' }}>Please go back and select a valid event.</ThemedText>
    </View>
  );

  const imageUrl = primaryImage?.file_url || event.cover_image_url || 'https://via.placeholder.com/400x300?text=Event';
  const locationDisplay = [primaryLocation?.venue_name || event.venue_name, primaryLocation?.municipality_name || event.municipality_name, primaryLocation?.province_name || event.province_name].filter(Boolean).join(', ');

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        <Container padding={16} backgroundColor="#fff">
          <Container padding={0} backgroundColor="transparent" direction="row" justify="space-between">
            <View style={{ flex: 1, paddingRight: 12 }}>
              <ThemedText type="card-title-medium" weight="bold">{event.name}</ThemedText>
              <ThemedText type="body-small">{locationDisplay || 'Location TBD'}</ThemedText>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <ThemedText type="body-small">
                <MaterialCommunityIcons name="star" size={20} color={colors.accent} />
                {averageRating.toFixed(1)} ({totalReviews})
              </ThemedText>
            </View>
          </Container>
        </Container>
        <TabContainer backgroundColor="#fff" initialTab="details" onTabChange={handleTabChange}>
          <Tab tab="details" label="Details" />
          <Tab tab="ratings" label="Ratings" />
        </TabContainer>
        <View style={styles.tabContent}>
          {activeTab === 'details' ? (
            <PageContainer style={{ paddingTop: 0 }}>
              <Container elevation={2} style={styles.section}>
                <ThemedText type="card-title-small" weight="medium">Date & Time</ThemedText>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="calendar" size={18} color={colors.tint} />
                  <ThemedText type="body-small" style={{ flex: 1 }}>{formatDateRange(event.start_date, event.end_date)}</ThemedText>
                </View>
                {(event.start_time || event.end_time) && !event.is_all_day && (
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="clock-outline" size={18} color={colors.tint} />
                    <ThemedText type="body-small" style={{ flex: 1 }}>{formatTime(event.start_time)}{event.end_time ? ` - ${formatTime(event.end_time)}` : ''}</ThemedText>
                  </View>
                )}
                {event.is_all_day && <View style={styles.infoRow}><MaterialCommunityIcons name="clock-outline" size={18} color={colors.tint} /><ThemedText type="body-small" style={{ flex: 1 }}>All Day Event</ThemedText></View>}
              </Container>
              <Container elevation={2} style={styles.section}>
                <ThemedText type="card-title-small" weight="medium">Description</ThemedText>
                <ThemedText type="body-small" style={{ marginTop: 4 }}>{event.description || 'No description provided.'}</ThemedText>
              </Container>
              <Container elevation={2} style={styles.section}>
                <ThemedText type="card-title-small" weight="medium">Category</ThemedText>
                {event.category_name ? <View style={styles.chipRow}><Chip label={event.category_name} variant="solid" size="medium" /></View> : <ThemedText type="body-small" style={{ color: '#6A768E', marginTop: 4 }}>No category.</ThemedText>}
              </Container>
              <Container elevation={2} style={styles.section}>
                <ThemedText type="card-title-small" weight="medium">Event Details</ThemedText>
                <View style={{ marginTop: 4, gap: 8 }}>
                  <View style={styles.infoRow}><MaterialCommunityIcons name="ticket" size={18} color={colors.tint} /><ThemedText type="body-small" style={{ flex: 1 }}>{event.is_free ? 'Free Entry' : event.ticket_price ? `₱${event.ticket_price}` : 'Contact for pricing'}</ThemedText></View>
                  {event.max_capacity && <View style={styles.infoRow}><MaterialCommunityIcons name="account-group" size={18} color={colors.tint} /><ThemedText type="body-small" style={{ flex: 1 }}>Capacity: {event.max_capacity} people</ThemedText></View>}
                  {event.registration_url && <Pressable onPress={handleRegistration}><View style={styles.infoRow}><MaterialCommunityIcons name="link" size={18} color={colors.accent} /><ThemedText type="body-small" style={{ flex: 1, color: colors.accent }}>Register Now</ThemedText></View></Pressable>}
                </View>
              </Container>
              <Container elevation={2} style={styles.section}>
                <ThemedText type="card-title-small" weight="medium">Contact</ThemedText>
                <View style={{ marginTop: 4, gap: 10 }}>
                  {event.organizer_name && <View style={styles.infoRow}><FontAwesome5 name="user" size={14} color={colors.tint} /><ThemedText type="body-small">{event.organizer_name}</ThemedText></View>}
                  {event.contact_phone && <Pressable style={styles.infoRow} onPress={handleCall}><FontAwesome5 name="phone" size={14} color={colors.tint} /><ThemedText type="body-small">{event.contact_phone}</ThemedText></Pressable>}
                  {event.contact_email && <Pressable style={styles.infoRow} onPress={handleEmail}><FontAwesome5 name="envelope" size={14} color={colors.tint} /><ThemedText type="body-small">{event.contact_email}</ThemedText></Pressable>}
                  {event.website && <Pressable style={styles.infoRow} onPress={handleWebsite}><FontAwesome5 name="globe" size={14} color={colors.tint} /><ThemedText type="body-small" style={{ color: '#2563EB' }}>{event.website}</ThemedText></Pressable>}
                  {!event.contact_phone && !event.contact_email && !event.website && !event.organizer_name && <ThemedText type="body-small" style={{ color: '#6A768E' }}>No contact information available.</ThemedText>}
                </View>
              </Container>
              <Container elevation={2} style={styles.section}>
                <ThemedText type="card-title-small" weight="medium">Images</ThemedText>
                {otherImages.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }} contentContainerStyle={{ paddingRight: 8, gap: 12 }}>
                    {otherImages.map((img) => <Image key={img.id} source={{ uri: img.file_url }} style={{ width: 140, height: 100, borderRadius: 12 }} />)}
                  </ScrollView>
                ) : <ThemedText type="body-small" style={{ color: '#6A768E', marginTop: 4 }}>No additional images.</ThemedText>}
              </Container>
              <Container elevation={2} style={styles.section}>
                <ThemedText type="card-title-small" weight="medium">Location</ThemedText>
                {hasCoords ? (
                  <View style={{ marginTop: 8, borderRadius: 12, overflow: 'hidden' }}>
                    <MapView style={{ width: '100%', height: 220 }} initialRegion={{ latitude: latitude!, longitude: longitude!, latitudeDelta: 0.01, longitudeDelta: 0.01 }}>
                      <Marker coordinate={{ latitude: latitude!, longitude: longitude! }} title={event.name} />
                    </MapView>
                  </View>
                ) : <ThemedText type="body-small" style={{ color: '#6A768E', marginTop: 4 }}>No location coordinates available.</ThemedText>}
                {locationDisplay && <ThemedText type="body-small" style={{ marginTop: 8 }}>{locationDisplay}</ThemedText>}
                {hasCoords && (
                  <Pressable onPress={handleDirections} style={({ pressed }) => [styles.directionsButton, Platform.OS === 'android' && pressed && { opacity: 0.8 }]} android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }}>
                    <FontAwesome5 name="directions" size={14} color="#fff" />
                    <ThemedText type="label-medium" style={{ color: '#fff' }}>Get Directions</ThemedText>
                  </Pressable>
                )}
              </Container>
            </PageContainer>
          ) : (
            <EventRatings 
              eventId={eventId} 
              refreshKey={ratingsRefreshKey}
              onRefreshRequested={handleRatingsRefresh}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: { width: '100%', height: 280 },
  notFoundContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  tabContent: { flex: 1 },
  section: { marginBottom: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  directionsButton: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, backgroundColor: '#2563EB', alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, ...Platform.select({ android: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, elevation: 2 } }) },
});

export default EventProfileScreen;
