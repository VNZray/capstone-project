import Chip from '@/components/Chip';
import Container from '@/components/Container';
import PageContainer from '@/components/PageContainer';
import { ThemedText } from '@/components/themed-text';
import { useAccommodation } from '@/context/AccommodationContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { fetchBusinessAmenities } from '@/services/AmenityService';
import type { BusinessSchedule } from '@/types/Business';
import { FontAwesome5 } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const Details = () => {
  const colorScheme = useColorScheme();
  const color = colorScheme === 'dark' ? '#fff' : '#000';
  const { accommodationDetails } = useAccommodation();
  const [amenities, setAmenities] = useState<{ id?: number; name: string }[]>(
    []
  );
  const [loadingAmenities, setLoadingAmenities] = useState(false);
  const [hours, setHours] = useState<BusinessSchedule>([]);
  const [loadingHours, setLoadingHours] = useState(false);
  const [rooms, setRooms] = useState<import('@/types/Business').Room[]>([]);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Helpers for hours rendering
  const dayOrder = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  const formatTime = (t?: string): string => {
    if (!t) return '';
    const parts = t.split(':');
    const h24 = parseInt(parts[0] || '0', 10);
    const m = (parts[1] || '00').padStart(2, '0');
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

  if (!accommodationDetails) {
    return (
      <View style={{ padding: 16 }}>
        <ThemedText type="body-small">Accommodation not found.</ThemedText>
        <Link href={'./(home)/(accommodation)'}>
          <ThemedText type="link-medium">Go Home</ThemedText>
        </Link>
      </View>
    );
  }

  // Load amenities for this business
  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!accommodationDetails?.id) return;
      try {
        setLoadingAmenities(true);
        const data = await fetchBusinessAmenities(accommodationDetails.id);
        if (isMounted) {
          setAmenities(data.map((a) => ({ id: a.id, name: a.name })));
        }
      } catch (e) {
        console.error('[Details] Failed to load amenities:', e);
      } finally {
        if (isMounted) setLoadingAmenities(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [accommodationDetails?.id]);

  // // Load business hours for this business
  // useEffect(() => {
  //   let isMounted = true;
  //   (async () => {
  //     if (!accommodationDetails?.id) return;
  //     try {
  //       setLoadingHours(true);
  //       const data = await fetchBusinessHoursByBusinessId(
  //         accommodationDetails.id
  //       );
  //       if (isMounted) setHours(data);
  //     } catch (e) {
  //       console.error('[Details] Failed to load business hours:', e);
  //     } finally {
  //       if (isMounted) setLoadingHours(false);
  //     }
  //   })();
  //   return () => {
  //     isMounted = false;
  //   };
  // }, [accommodationDetails?.id]);

  return (
    <PageContainer style={{ paddingTop: 0, paddingBottom: 100 }}>
      <Container elevation={2} style={androidStyles.container}>
        <ThemedText type="card-title-small" weight="medium">
          About
        </ThemedText>
        <ThemedText type="body-small">
          {(() => {
            const raw = accommodationDetails.description
              ? accommodationDetails.description.replace(/^"|"$/g, '').trim()
              : '';
            if (!raw) return 'No description provided.';
            if (aboutExpanded || raw.length <= 160) return raw;
            return `${raw.slice(0, 160)}…`;
          })()}
        </ThemedText>
        {accommodationDetails.description &&
        accommodationDetails.description.length > 160 ? (
          <Pressable onPress={() => setAboutExpanded((s) => !s)}>
            <ThemedText type="link-medium" style={{ marginTop: 6 }}>
              {aboutExpanded ? 'Show less' : 'Read more'}
            </ThemedText>
          </Pressable>
        ) : null}
      </Container>

      {/* Tags */}
      <View style={androidStyles.sectionContainer}>
        <ThemedText type="card-title-small" weight="medium">
          Tags
        </ThemedText>
        <View
          style={[
            {
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 8,
              paddingTop: 8,
            },
            androidStyles.tagContainer,
          ]}
        >
          {(() => {
            const tags: string[] = [];
            const amenityNames = amenities.map((a) => a.name.toLowerCase());
            if (amenityNames.includes('wifi') || amenityNames.includes('wi-fi'))
              tags.push('WiFi available');
            if (amenityNames.includes('parking')) tags.push('Parking');
            if (amenityNames.includes('pool')) tags.push('Pool');
            if (amenityNames.includes('restaurant')) tags.push('Restaurant');
            // 24/7 open detection
            const openAll =
              hours.length === 7 &&
              hours.every(
                (h) =>
                  h.is_open &&
                  h.open_time === '00:00:00' &&
                  h.close_time === '23:59:59'
              );
            if (openAll) tags.push('Open 24/7');

            if (tags.length === 0) {
              return (
                <ThemedText type="body-small" style={{ color: '#6A768E' }}>
                  No tags available.
                </ThemedText>
              );
            }
            return tags.map((t) => (
              <Chip
                color="primary"
                elevation={2}
                label={t}
                key={t}
                variant="solid"
                size="medium"
              />
            ));
          })()}
        </View>
      </View>

      <View style={androidStyles.sectionContainer}>
        <ThemedText type="card-title-small" weight="medium">
          Amenities
        </ThemedText>
        <View
          style={[
            {
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 8,
              paddingTop: 8,
            },
            androidStyles.amenitiesContainer,
          ]}
        >
          {loadingAmenities ? (
            <ThemedText type="body-small">Loading amenities…</ThemedText>
          ) : amenities.length > 0 ? (
            amenities.map((a, idx) => (
              <Chip
                color="secondary"
                elevation={2}
                label={a.name}
                key={a.id != null ? String(a.id) : `${a.name}-${idx}`}
                variant="soft"
                size="medium"
              />
            ))
          ) : (
            <ThemedText type="body-small" style={{ color: '#6A768E' }}>
              No amenities listed.
            </ThemedText>
          )}
        </View>
      </View>

      {hours.length > 0 && (
        <View style={androidStyles.sectionContainer}>
          <ThemedText type="card-title-small" weight="medium">
            Business Hours
          </ThemedText>
          <View
            style={[
              {
                flexDirection: 'column',
                gap: 6,
                paddingTop: 10,
              },
              androidStyles.hoursContainer,
            ]}
          >
            {loadingHours ? (
              <ThemedText type="body-small">Loading hours…</ThemedText>
            ) : hours.length > 0 ? (
              [...hours]
                .sort(
                  (a, b) =>
                    dayOrder.indexOf(a.day_of_week || '') -
                    dayOrder.indexOf(b.day_of_week || '')
                )
                .map((h, idx) => {
                  const isOpen = !!h.is_open;
                  const openStr = `${formatTime(h.open_time)} - ${formatTime(
                    h.close_time
                  )}`;
                  const text = isOpen
                    ? `${h.day_of_week}: ${openStr} - Open`
                    : `${h.day_of_week} - Closed`;
                  const color = isOpen ? '#16A34A' : '#DC2626';
                  const bg = colorScheme === 'dark' ? '#0B1220' : '#F9FAFF';
                  return (
                    <View
                      key={`${h.day_of_week}-${idx}`}
                      style={[
                        {
                          paddingVertical: 8,
                        },
                        androidStyles.hoursItem,
                      ]}
                    >
                      <ThemedText type="body-small" style={{ color }}>
                        {text}
                      </ThemedText>
                    </View>
                  );
                })
            ) : (
              <ThemedText type="body-small" style={{ color: '#6A768E' }}>
                No Business Hours listed.
              </ThemedText>
            )}
          </View>
        </View>
      )}

      {/* Contact Section */}
      <View style={androidStyles.sectionContainer}>
        <ThemedText type="card-title-small" weight="medium">
          Contact
        </ThemedText>
        <View
          style={[
            { flexDirection: 'column', gap: 8, paddingTop: 8 },
            androidStyles.contactContainer,
          ]}
        >
          {!accommodationDetails.email &&
          !accommodationDetails.phone_number &&
          !accommodationDetails.website_url ? (
            <ThemedText type="body-small" style={{ color: '#6A768E' }}>
              No contact info provided.
            </ThemedText>
          ) : (
            <>
              {accommodationDetails.email ? (
                <Pressable
                  onPress={() =>
                    Linking.openURL(`mailto:${accommodationDetails.email}`)
                  }
                  accessibilityRole="link"
                  style={({ pressed }) => [
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                    },
                    androidStyles.contactItem,
                    Platform.OS === 'android' && pressed && { opacity: 0.7 },
                  ]}
                  android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <FontAwesome5
                      name="envelope"
                      size={14}
                      color={colorScheme === 'dark' ? '#E5E7EB' : '#0A1B47'}
                    />
                    <ThemedText type="body-small">
                      {accommodationDetails.email}
                    </ThemedText>
                  </View>
                </Pressable>
              ) : null}

              {accommodationDetails.phone_number ? (
                <Pressable
                  onPress={() =>
                    Linking.openURL(
                      `tel:${String(accommodationDetails.phone_number).replace(
                        /\s+/g,
                        ''
                      )}`
                    )
                  }
                  accessibilityRole="link"
                  style={({ pressed }) => [
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                    },
                    androidStyles.contactItem,
                    Platform.OS === 'android' && pressed && { opacity: 0.7 },
                  ]}
                  android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <FontAwesome5
                      name="phone"
                      size={14}
                      color={colorScheme === 'dark' ? '#E5E7EB' : '#0A1B47'}
                    />
                    <ThemedText type="body-small">
                      {accommodationDetails.phone_number}
                    </ThemedText>
                  </View>
                </Pressable>
              ) : null}

              {accommodationDetails.website_url ? (
                <Pressable
                  onPress={() =>
                    Linking.openURL(
                      withScheme(accommodationDetails.website_url)
                    )
                  }
                  accessibilityRole="link"
                  style={({ pressed }) => [
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                    },
                    androidStyles.contactItem,
                    Platform.OS === 'android' && pressed && { opacity: 0.7 },
                  ]}
                  android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <FontAwesome5
                      name="globe"
                      size={14}
                      color={colorScheme === 'dark' ? '#E5E7EB' : '#0A1B47'}
                    />
                    <ThemedText type="link-small">
                      {accommodationDetails.website_url}
                    </ThemedText>
                  </View>
                </Pressable>
              ) : null}
            </>
          )}
        </View>
      </View>

      {/* Socials Section */}
      <View style={androidStyles.sectionContainer}>
        <ThemedText type="card-title-small" weight="medium">
          Socials
        </ThemedText>
        <View
          style={[
            {
              flexDirection: 'row',
              gap: 12,
              paddingTop: 8,
              alignItems: 'center',
              flexWrap: 'wrap',
            },
            androidStyles.socialsContainer,
          ]}
        >
          {(() => {
            const socials: Array<{ icon: any; url?: string; label: string }> = [
              {
                icon: 'facebook',
                url: accommodationDetails.facebook_url,
                label: 'Facebook',
              },
              { icon: 'twitter', url: accommodationDetails.x_url, label: 'X' },
              {
                icon: 'instagram',
                url: accommodationDetails.instagram_url,
                label: 'Instagram',
              },
            ];
            const present = socials.filter(
              (s) => !!s.url && s.url.trim() !== ''
            );
            if (present.length === 0) {
              return (
                <ThemedText type="body-small" style={{ color: '#6A768E' }}>
                  No socials provided.
                </ThemedText>
              );
            }
            return present.map((s, idx) => (
              <Chip
                key={`${s.icon}-${idx}`}
                size="large"
                startIconName={s.icon as any}
              />
            ));
          })()}
        </View>
      </View>

      <View style={androidStyles.sectionContainer}>
        <ThemedText type="card-title-small" weight="medium">
          Guide Map
        </ThemedText>

        <Container
          style={[
            {
              height: 400,
              borderRadius: 10,
              marginTop: 10,
              padding: 4,
            },
            androidStyles.mapContainer,
          ]}
        >
          {Platform.OS === 'web' ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ThemedText type="body-small">
                Map view is not supported on web.
              </ThemedText>
            </View>
          ) : accommodationDetails.latitude &&
            accommodationDetails.longitude ? (
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude: Number(accommodationDetails.latitude),
                longitude: Number(accommodationDetails.longitude),
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: Number(accommodationDetails.latitude),
                  longitude: Number(accommodationDetails.longitude),
                }}
                title={accommodationDetails.business_name}
                description={accommodationDetails.description}
              />
            </MapView>
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ThemedText type="body-small">
                No coordinates available.
              </ThemedText>
            </View>
          )}
        </Container>

        {/* Directions button */}
        {accommodationDetails.latitude && accommodationDetails.longitude ? (
          <View style={{ marginTop: 8 }}>
            <Pressable
              onPress={() => {
                const lat = Number(accommodationDetails.latitude);
                const lng = Number(accommodationDetails.longitude);
                const label = encodeURIComponent(
                  accommodationDetails.business_name || 'Destination'
                );
                const url = Platform.select({
                  ios: `http://maps.apple.com/?daddr=${lat},${lng}&q=${label}`,
                  android: `google.navigation:q=${lat},${lng}`,
                  default: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${label}`,
                });
                if (url) Linking.openURL(url);
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
                androidStyles.directionsButton,
                Platform.OS === 'android' && pressed && { opacity: 0.8 },
              ]}
              android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }}
            >
              <FontAwesome5 name="directions" size={14} color="#fff" />
              <ThemedText type="label-medium" style={{ color: '#fff' }}>
                Get Directions
              </ThemedText>
            </Pressable>
          </View>
        ) : null}
      </View>

      {/* Gallery */}
      <View style={[{ marginTop: 16 }, androidStyles.galleryContainer]}>
        <ThemedText type="card-title-small" weight="medium">
          Gallery
        </ThemedText>
        {(() => {
          const media: string[] = [];
          if (accommodationDetails.business_image)
            media.push(accommodationDetails.business_image);
          rooms.forEach((r) => {
            if (r.room_image) media.push(r.room_image);
          });
          const unique = Array.from(new Set(media));
          if (unique.length === 0)
            return (
              <ThemedText
                type="body-small"
                style={{ color: '#6A768E', paddingTop: 8 }}
              >
                No media available.
              </ThemedText>
            );
          return (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8,
                paddingTop: 10,
              }}
            >
              {unique.map((src, idx) => (
                <Pressable
                  key={`${src}-${idx}`}
                  onPress={() => {
                    setLightboxImage(src);
                    setLightboxVisible(true);
                  }}
                  style={({ pressed }) => [
                    {
                      width: '31.5%',
                      aspectRatio: 1,
                      borderRadius: 10,
                      overflow: 'hidden',
                      backgroundColor: '#e5e7eb',
                    },
                    androidStyles.galleryImageContainer,
                    Platform.OS === 'android' && pressed && { opacity: 0.8 },
                  ]}
                  android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
                >
                  <Image
                    source={{ uri: src }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </Pressable>
              ))}
            </View>
          );
        })()}
      </View>

      {/* Lightbox Modal */}
      <Modal
        transparent
        visible={lightboxVisible}
        animationType="fade"
        onRequestClose={() => setLightboxVisible(false)}
      >
        <Pressable
          onPress={() => setLightboxVisible(false)}
          style={[
            {
              flex: 1,
              backgroundColor: '#000000cc',
              alignItems: 'center',
              justifyContent: 'center',
            },
            androidStyles.modalContainer,
          ]}
        >
          {lightboxImage ? (
            <Image
              source={{ uri: lightboxImage }}
              style={[
                { width: '90%', height: '70%', borderRadius: 12 },
                androidStyles.modalImage,
              ]}
              resizeMode="contain"
            />
          ) : null}
        </Pressable>
      </Modal>
    </PageContainer>
  );
};

export default Details;

// Android-specific styles
const androidStyles = StyleSheet.create({
  container: {
    ...Platform.select({
      android: {
        paddingHorizontal: 16,
        paddingVertical: 12,
      },
    }),
  },
  sectionContainer: {
    ...Platform.select({
      android: {
        marginBottom: 20,
        paddingVertical: 8,
      },
    }),
  },
  tagContainer: {
    ...Platform.select({
      android: {
        paddingTop: 12,
        marginBottom: 4,
      },
    }),
  },
  amenitiesContainer: {
    ...Platform.select({
      android: {
        paddingTop: 12,
        marginBottom: 4,
      },
    }),
  },
  hoursContainer: {
    ...Platform.select({
      android: {
        paddingTop: 12,
        marginBottom: 4,
      },
    }),
  },
  hoursItem: {
    ...Platform.select({
      android: {
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderRadius: 6,
        marginVertical: 2,
      },
    }),
  },
  contactContainer: {
    ...Platform.select({
      android: {
        paddingTop: 12,
        marginBottom: 4,
      },
    }),
  },
  contactItem: {
    ...Platform.select({
      android: {
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
        marginVertical: 2,
      },
    }),
  },
  socialsContainer: {
    ...Platform.select({
      android: {
        paddingTop: 12,
        marginBottom: 4,
      },
    }),
  },
  mapContainer: {
    ...Platform.select({
      android: {
        elevation: 4,
        borderRadius: 12,
        overflow: 'hidden',
      },
    }),
  },
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
  galleryContainer: {
    ...Platform.select({
      android: {
        paddingTop: 12,
        marginTop: 20,
      },
    }),
  },
  galleryImageContainer: {
    ...Platform.select({
      android: {
        borderRadius: 12,
        elevation: 2,
        overflow: 'hidden',
      },
    }),
  },
  modalContainer: {
    ...Platform.select({
      android: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
      },
    }),
  },
  modalImage: {
    ...Platform.select({
      android: {
        borderRadius: 16,
        elevation: 8,
      },
    }),
  },
});
