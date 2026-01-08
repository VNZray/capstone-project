import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import { useEvent } from '@/context/EventContext';
import { usePreventDoubleNavigation } from '@/hooks/usePreventDoubleNavigation';
import { Routes } from '@/routes/mainRoutes';
import { Ionicons } from '@expo/vector-icons';
import type { Event } from '@/types/Event';

const EventsListScreen = () => {
  const { events, loading, refreshEvents } = useEvent();
  const { push } = usePreventDoubleNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshEvents();
    setRefreshing(false);
  };

  const handleEventPress = (event: Event) => {
    push(Routes.profile.events.detail(event.id));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return Colors.light.success;
      case 'upcoming':
        return Colors.light.primary;
      case 'cancelled':
        return Colors.light.error;
      case 'completed':
        return Colors.light.textSecondary;
      default:
        return Colors.light.textSecondary;
    }
  };

  // Get primary image URL - prioritize primary image from images array
  const getEventImageUrl = (event: Event): string | null => {
    // First, try to get primary image from images array
    if (event.images && event.images.length > 0) {
      const primaryImage = event.images.find(
        (img) => img.is_primary === true || (img as any).is_primary === 1
      );
      if (primaryImage?.file_url) {
        return primaryImage.file_url;
      }
      // Fallback to first image if no primary
      if (event.images[0]?.file_url) {
        return event.images[0].file_url;
      }
    }
    // Fallback to cover_image_url
    return event.cover_image_url || null;
  };

  const renderEventItem = ({ item }: { item: Event }) => {
    const imageUrl = getEventImageUrl(item);
    
    return (
      <Pressable
        style={styles.eventCard}
        onPress={() => handleEventPress(item)}
      >
        <View style={styles.eventImageContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.eventImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="calendar" size={32} color={Colors.light.textSecondary} />
            </View>
          )}
          {item.is_featured && (
            <View style={styles.featuredBadge}>
              <ThemedText type="label-small" style={styles.featuredText}>
                Featured
              </ThemedText>
            </View>
          )}
        </View>

      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <ThemedText
            type="body-large"
            weight="semibold"
            numberOfLines={2}
            style={styles.eventName}
          >
            {item.name}
          </ThemedText>
          {item.is_free ? (
            <View style={styles.freeBadge}>
              <ThemedText type="label-small" style={styles.freeText}>
                Free
              </ThemedText>
            </View>
          ) : item.ticket_price ? (
            <ThemedText type="body-medium" weight="semibold" style={styles.price}>
              ₱{item.ticket_price.toLocaleString()}
            </ThemedText>
          ) : null}
        </View>

        <View style={styles.eventDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={14} color={Colors.light.textSecondary} />
            <ThemedText type="body-small" style={styles.detailText}>
              {formatDate(item.start_date)}
              {item.end_date && item.end_date !== item.start_date && (
                <> - {formatDate(item.end_date)}</>
              )}
            </ThemedText>
          </View>

          {item.start_time && (
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={14} color={Colors.light.textSecondary} />
              <ThemedText type="body-small" style={styles.detailText}>
                {formatTime(item.start_time)}
                {item.end_time && <> - {formatTime(item.end_time)}</>}
              </ThemedText>
            </View>
          )}

          {item.venue_name && (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={14} color={Colors.light.textSecondary} />
              <ThemedText type="body-small" style={styles.detailText} numberOfLines={1}>
                {item.venue_name}
              </ThemedText>
            </View>
          )}

          {item.category_name && (
            <View style={styles.categoryBadge}>
              <ThemedText type="label-small" style={styles.categoryText}>
                {item.category_name}
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    </Pressable>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={64} color={Colors.light.textSecondary} />
      <ThemedText type="title-medium" weight="semibold" style={styles.emptyTitle}>
        No Events Found
      </ThemedText>
      <ThemedText type="body-medium" style={styles.emptyText}>
        There are no events available at the moment.{'\n'}
        Check back later for upcoming events!
      </ThemedText>
    </View>
  );

  if (loading && events.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <ThemedText type="body-medium" style={styles.loadingText}>
          Loading events...
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderEventItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.light.primary]}
            tintColor={Colors.light.primary}
          />
        }
      />
    </View>
  );
};

export default EventsListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
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
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  eventCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  eventImageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
  },
  eventImage: {
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
  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: Colors.light.warning,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featuredText: {
    color: '#fff',
    fontWeight: '600',
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventName: {
    flex: 1,
    marginRight: 12,
    color: Colors.light.text,
  },
  freeBadge: {
    backgroundColor: Colors.light.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  freeText: {
    color: '#fff',
    fontWeight: '600',
  },
  price: {
    color: Colors.light.primary,
  },
  eventDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: Colors.light.textSecondary,
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.light.primaryLight || '#EBF4FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  categoryText: {
    color: Colors.light.primary,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    marginTop: 16,
    color: Colors.light.text,
  },
  emptyText: {
    marginTop: 8,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
