import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import EventProfileSkeleton from '@/components/skeleton/EventProfileSkeleton';

type TabType = 'details' | 'ratings';

const EventProfileScreen = () => {
  const params = useLocalSearchParams();
  const colors = Colors.light;

  const [loading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('details');

  // Mock event data - replace with actual API call using params.id
  const eventData = {
    id: params.id as string,
    name: 'City Lights Music Fest',
    image:
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=700&q=80',
    date: 'Nov 24, 2024',
    time: '7:00 PM',
    location: 'Plaza Quezon, Naga City',
    category: 'Music Festival',
    organizer: 'Naga City Tourism Office',
    description:
      'Join us for an unforgettable evening of live music featuring local and international artists. Experience the best of city nightlife under the stars with food, drinks, and amazing performances.',
    price: 'Free Entry',
    capacity: '5,000 people',
    contact: '+63 123 456 7890',
    email: 'events@nagacity.gov.ph',
  };

  const handleShare = () => {
    console.log('Share event');
  };

  const handleDirections = () => {
    console.log('Get directions');
  };

  const handleCalendar = () => {
    console.log('Add to calendar');
  };

  const handleCall = () => {
    console.log('Call organizer');
  };

  if (loading) {
    return <EventProfileSkeleton />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Image */}
      <View style={styles.heroContainer}>
        <Image
          source={{ uri: eventData.image }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View
          style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
        />
      </View>

      {/* Event Info Card */}
      <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
        <ThemedText
          type="title-large"
          weight="bold"
          style={[styles.eventName, { color: colors.text }]}
        >
          {eventData.name}
        </ThemedText>

        <View style={styles.categoryBadge}>
          <MaterialCommunityIcons
            name="music"
            size={14}
            color={colors.accent}
          />
          <ThemedText
            type="label-small"
            style={[styles.categoryText, { color: colors.accent }]}
          >
            {eventData.category}
          </ThemedText>
        </View>

        {/* Date & Time Info */}
        <View style={styles.dateTimeContainer}>
          <View
            style={[styles.dateTimeCard, { backgroundColor: colors.surface }]}
          >
            <MaterialCommunityIcons
              name="calendar"
              size={20}
              color={colors.tint}
            />
            <View>
              <ThemedText
                type="label-small"
                style={{ color: colors.textSecondary }}
              >
                Date
              </ThemedText>
              <ThemedText
                type="card-sub-title-small"
                weight="medium"
                style={{ color: colors.text }}
              >
                {eventData.date}
              </ThemedText>
            </View>
          </View>

          <View
            style={[styles.dateTimeCard, { backgroundColor: colors.surface }]}
          >
            <MaterialCommunityIcons
              name="clock-outline"
              size={20}
              color={colors.tint}
            />
            <View>
              <ThemedText
                type="label-small"
                style={{ color: colors.textSecondary }}
              >
                Time
              </ThemedText>
              <ThemedText
                type="card-sub-title-small"
                weight="medium"
                style={{ color: colors.text }}
              >
                {eventData.time}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable
            style={[styles.actionButton, { backgroundColor: colors.accent }]}
            onPress={handleCalendar}
          >
            <MaterialCommunityIcons
              name="calendar-plus"
              size={20}
              color="#FFF"
            />
            <ThemedText type="label-small" style={{ color: '#FFF' }}>
              Add to Calendar
            </ThemedText>
          </Pressable>

          <Pressable
            style={[
              styles.iconButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={handleShare}
          >
            <MaterialCommunityIcons
              name="share-variant"
              size={20}
              color={colors.tint}
            />
          </Pressable>

          <Pressable
            style={[
              styles.iconButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={handleDirections}
          >
            <MaterialCommunityIcons
              name="directions"
              size={20}
              color={colors.tint}
            />
          </Pressable>

          <Pressable
            style={[
              styles.iconButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={handleCall}
          >
            <MaterialCommunityIcons
              name="phone"
              size={20}
              color={colors.tint}
            />
          </Pressable>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <Pressable
            style={[
              styles.tab,
              activeTab === 'details' && [
                styles.activeTab,
                { borderBottomColor: colors.accent },
              ],
            ]}
            onPress={() => setActiveTab('details')}
          >
            <ThemedText
              type="card-sub-title-small"
              weight={activeTab === 'details' ? 'bold' : 'normal'}
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === 'details'
                      ? colors.accent
                      : colors.textSecondary,
                },
              ]}
            >
              Details
            </ThemedText>
          </Pressable>

          <Pressable
            style={[
              styles.tab,
              activeTab === 'ratings' && [
                styles.activeTab,
                { borderBottomColor: colors.accent },
              ],
            ]}
            onPress={() => setActiveTab('ratings')}
          >
            <ThemedText
              type="card-sub-title-small"
              weight={activeTab === 'ratings' ? 'bold' : 'normal'}
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === 'ratings'
                      ? colors.accent
                      : colors.textSecondary,
                },
              ]}
            >
              Reviews
            </ThemedText>
          </Pressable>
        </View>

        {/* Tab Content */}
        {activeTab === 'details' ? (
          <View style={styles.tabContent}>
            {/* Description */}
            <View style={styles.section}>
              <ThemedText
                type="card-title-small"
                weight="bold"
                style={{ color: colors.text }}
              >
                About This Event
              </ThemedText>
              <ThemedText
                type="label-medium"
                style={[styles.description, { color: colors.textSecondary }]}
              >
                {eventData.description}
              </ThemedText>
            </View>

            {/* Location */}
            <View style={styles.section}>
              <ThemedText
                type="card-title-small"
                weight="bold"
                style={{ color: colors.text }}
              >
                Location
              </ThemedText>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={18}
                  color={colors.tint}
                />
                <ThemedText
                  type="label-medium"
                  style={{ color: colors.textSecondary, flex: 1 }}
                >
                  {eventData.location}
                </ThemedText>
              </View>
            </View>

            {/* Organizer */}
            <View style={styles.section}>
              <ThemedText
                type="card-title-small"
                weight="bold"
                style={{ color: colors.text }}
              >
                Organizer
              </ThemedText>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="account-group"
                  size={18}
                  color={colors.tint}
                />
                <ThemedText
                  type="label-medium"
                  style={{ color: colors.textSecondary, flex: 1 }}
                >
                  {eventData.organizer}
                </ThemedText>
              </View>
            </View>

            {/* Event Details */}
            <View style={styles.section}>
              <ThemedText
                type="card-title-small"
                weight="bold"
                style={{ color: colors.text }}
              >
                Event Details
              </ThemedText>
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons
                    name="ticket"
                    size={18}
                    color={colors.tint}
                  />
                  <View>
                    <ThemedText
                      type="label-small"
                      style={{ color: colors.textSecondary }}
                    >
                      Price
                    </ThemedText>
                    <ThemedText
                      type="label-medium"
                      weight="medium"
                      style={{ color: colors.text }}
                    >
                      {eventData.price}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <MaterialCommunityIcons
                    name="account-multiple"
                    size={18}
                    color={colors.tint}
                  />
                  <View>
                    <ThemedText
                      type="label-small"
                      style={{ color: colors.textSecondary }}
                    >
                      Capacity
                    </ThemedText>
                    <ThemedText
                      type="label-medium"
                      weight="medium"
                      style={{ color: colors.text }}
                    >
                      {eventData.capacity}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>

            {/* Contact */}
            <View style={styles.section}>
              <ThemedText
                type="card-title-small"
                weight="bold"
                style={{ color: colors.text }}
              >
                Contact Information
              </ThemedText>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="phone"
                  size={18}
                  color={colors.tint}
                />
                <ThemedText
                  type="label-medium"
                  style={{ color: colors.textSecondary, flex: 1 }}
                >
                  {eventData.contact}
                </ThemedText>
              </View>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="email"
                  size={18}
                  color={colors.tint}
                />
                <ThemedText
                  type="label-medium"
                  style={{ color: colors.textSecondary, flex: 1 }}
                >
                  {eventData.email}
                </ThemedText>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.tabContent}>
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="star-outline"
                size={48}
                color={colors.textSecondary}
              />
              <ThemedText
                type="label-medium"
                style={{ color: colors.textSecondary, marginTop: 12 }}
              >
                No reviews yet for this event
              </ThemedText>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroContainer: {
    width: '100%',
    height: 280,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  infoCard: {
    marginTop: -30,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingTop: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  eventName: {
    fontSize: 24,
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(197, 160, 89, 0.1)',
    gap: 6,
    marginBottom: 20,
  },
  categoryText: {
    fontSize: 12,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  dateTimeCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
  },
  tabContent: {
    gap: 20,
  },
  section: {
    gap: 12,
  },
  description: {
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
});

export default EventProfileScreen;
