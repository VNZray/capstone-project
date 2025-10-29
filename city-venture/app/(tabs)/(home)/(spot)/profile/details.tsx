import React, { useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Linking,
  Image,
  Platform,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import PageContainer from '@/components/PageContainer';
import Container from '@/components/Container';
import Chip from '@/components/Chip';
import { useTouristSpot } from '@/context/TouristSpotContext';
import MapView, { Marker } from 'react-native-maps';

const dayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

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

const withScheme = (url?: string | null) => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const Details = () => {
  const { selectedSpot, schedules, images, addressDetails } = useTouristSpot();
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const description = useMemo(() => {
    const raw = selectedSpot?.description?.replace(/^"|"$/g, '').trim() || '';
    if (!raw) return 'No description provided.';
    if (aboutExpanded || raw.length <= 160) return raw;
    return `${raw.slice(0, 160)}…`;
  }, [selectedSpot?.description, aboutExpanded]);

  if (!selectedSpot) {
    return (
      <View style={{ padding: 16 }}>
        <ThemedText type="body-small">No spot selected.</ThemedText>
      </View>
    );
  }

  const primaryImage =
    images.find((i) => i.is_primary === 1 || i.is_primary === true) ||
    images[0];
  const otherImages = images.filter((i) => i.id !== primaryImage?.id);
  const latitude = selectedSpot.latitude
    ? parseFloat(selectedSpot.latitude)
    : undefined;
  const longitude = selectedSpot.longitude
    ? parseFloat(selectedSpot.longitude)
    : undefined;
  const hasCoords =
    latitude != null &&
    !isNaN(latitude) &&
    longitude != null &&
    !isNaN(longitude);

  return (
    <PageContainer style={{ paddingTop: 0 }}>
      {/* Description */}
      <Container elevation={2} style={styles.section}>
        <ThemedText type="card-title-small" weight="medium">
          Description
        </ThemedText>
        <ThemedText type="body-small" style={{ marginTop: 4 }}>
          {description}
        </ThemedText>
        {selectedSpot.entry_fee ? (
          <ThemedText type="body-small" style={{ marginTop: 6 }}>
            Entry Fee: {selectedSpot.entry_fee}
          </ThemedText>
        ) : null}
        {selectedSpot.description && selectedSpot.description.length > 160 && (
          <Pressable onPress={() => setAboutExpanded((s) => !s)}>
            <ThemedText type="link-medium" style={{ marginTop: 6 }}>
              {aboutExpanded ? 'Show less' : 'Read more'}
            </ThemedText>
          </Pressable>
        )}
      </Container>

      {/* Category */}
      <Container elevation={2} style={styles.section}>
        <ThemedText type="card-title-small" weight="medium">
          Category
        </ThemedText>
        {selectedSpot.categories && selectedSpot.categories.length > 0 ? (
          <View style={styles.chipRow}>
            {selectedSpot.categories.map((c) => (
              <Chip
                key={c.id}
                label={c.category}
                variant="solid"
                size="medium"
              />
            ))}
          </View>
        ) : (
          <ThemedText
            type="body-small"
            style={{ color: '#6A768E', marginTop: 4 }}
          >
            No categories.
          </ThemedText>
        )}
      </Container>

      {/* Socials */}
      <Container elevation={2} style={styles.section}>
        <ThemedText type="card-title-small" weight="medium">
          Socials
        </ThemedText>
        <View style={{ marginTop: 4, gap: 10 }}>
          {selectedSpot.contact_phone ? (
            <Pressable
              style={styles.socialRow}
              onPress={() =>
                Linking.openURL(`tel:${selectedSpot.contact_phone}`)
              }
            >
              <FontAwesome5 name="phone" size={14} />
              <ThemedText type="body-small">
                {selectedSpot.contact_phone}
              </ThemedText>
            </Pressable>
          ) : null}
          {selectedSpot.contact_email ? (
            <Pressable
              style={styles.socialRow}
              onPress={() =>
                Linking.openURL(`mailto:${selectedSpot.contact_email}`)
              }
            >
              <FontAwesome5 name="envelope" size={14} />
              <ThemedText type="body-small">
                {selectedSpot.contact_email}
              </ThemedText>
            </Pressable>
          ) : null}
          {selectedSpot.website ? (
            <Pressable
              style={styles.socialRow}
              onPress={() => Linking.openURL(withScheme(selectedSpot.website))}
            >
              <FontAwesome5 name="globe" size={14} />
              <ThemedText type="body-small" style={{ color: '#2563EB' }}>
                {selectedSpot.website}
              </ThemedText>
            </Pressable>
          ) : null}
          {!selectedSpot.contact_phone &&
            !selectedSpot.contact_email &&
            !selectedSpot.website && (
              <ThemedText type="body-small" style={{ color: '#6A768E' }}>
                No socials available.
              </ThemedText>
            )}
        </View>
      </Container>

      {/* Schedule */}
      <Container elevation={2} style={styles.section}>
        <ThemedText type="card-title-small" weight="medium">
          Schedule
        </ThemedText>
        <View style={styles.scheduleTable}>
          {schedules && schedules.length > 0 ? (
            [...schedules]
              .sort((a, b) => (a.day_of_week || 0) - (b.day_of_week || 0))
              .map((s) => {
                const closed = s.is_closed === 1 || s.is_closed === true;
                const label = dayNames[s.day_of_week] || `Day ${s.day_of_week}`;
                const time =
                  closed || !s.open_time || !s.close_time
                    ? 'Closed'
                    : `${formatTime(s.open_time)} - ${formatTime(s.close_time)}`;
                return (
                  <View key={s.id || label} style={styles.scheduleRow}>
                    <ThemedText type="body-small" style={[styles.scheduleDay]}>
                      {label}
                    </ThemedText>
                    <ThemedText type="body-small" style={{ flex: 1 }}>
                      {time}
                    </ThemedText>
                  </View>
                );
              })
          ) : (
            <ThemedText type="body-small" style={{ color: '#6A768E' }}>
              No schedule listed.
            </ThemedText>
          )}
        </View>
      </Container>

      {/* Images (More Images) */}
      <Container elevation={2} style={styles.section}>
        <ThemedText type="card-title-small" weight="medium">
          Images
        </ThemedText>
        {otherImages.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 8 }}
            contentContainerStyle={{ paddingRight: 8, gap: 12 }}
          >
            {otherImages.map((img) => (
              <Image
                key={img.id}
                source={{ uri: img.file_url }}
                style={{ width: 140, height: 100, borderRadius: 12 }}
              />
            ))}
          </ScrollView>
        ) : (
          <ThemedText
            type="body-small"
            style={{ color: '#6A768E', marginTop: 4 }}
          >
            No additional images.
          </ThemedText>
        )}
      </Container>

      {/* Map */}
      <Container elevation={2} style={styles.section}>
        <ThemedText type="card-title-small" weight="medium">
          Map
        </ThemedText>
        {hasCoords ? (
          <View style={{ marginTop: 8, borderRadius: 12, overflow: 'hidden' }}>
            <MapView
              style={{ width: '100%', height: 220 }}
              initialRegion={{
                latitude: latitude!,
                longitude: longitude!,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{ latitude: latitude!, longitude: longitude! }}
                title={selectedSpot.name}
              />
            </MapView>
          </View>
        ) : (
          <ThemedText
            type="body-small"
            style={{ color: '#6A768E', marginTop: 4 }}
          >
            No location coordinates.
          </ThemedText>
        )}
        {addressDetails ? (
          <ThemedText type="body-small" style={{ marginTop: 8 }}>
            {[
              addressDetails.barangay || selectedSpot.barangay,
              addressDetails.municipality || selectedSpot.municipality,
              addressDetails.province || selectedSpot.province,
            ]
              .filter(Boolean)
              .join(', ')}
          </ThemedText>
        ) : null}
        <Pressable
          onPress={() => {
            if (latitude && longitude) {
              const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
              Linking.openURL(url);
            }
          }}
          style={({ pressed }) => [
            {
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 10,
              backgroundColor: '#2563EB',
              alignSelf: 'flex-start',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            },
            styles.directionsButton,
            Platform.OS === 'android' && pressed && { opacity: 0.8 },
          ]}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }}
        >
          <FontAwesome5 name="directions" size={14} color="#fff" />
          <ThemedText type="label-medium" style={{ color: '#fff' }}>
            Get Directions
          </ThemedText>
        </Pressable>
      </Container>
    </PageContainer>
  );
};

export default Details;

const styles = StyleSheet.create({
  section: { marginBottom: 2 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  socialRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  scheduleTable: { marginTop: 6, gap: 2 },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  scheduleDay: { minWidth: 100, fontWeight: '500', marginRight: 12 },
  directionsButton: {
    ...Platform.select({
      android: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        elevation: 2,
        marginTop: 12,
      },
    }),
  },
});
