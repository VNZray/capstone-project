import * as Location from 'expo-location';
import { useEffect, useRef, useState, useMemo } from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MapView, Callout, Marker } from '@/components/map/MapWrapper';
import placeholder from '@/assets/images/placeholder.png';

import { ThemedText } from '@/components/themed-text';
import { colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ActivityIndicator } from 'react-native';
import * as Linking from 'expo-linking';
import { navigateToAccommodationProfile } from '@/routes/accommodationRoutes';
import { useAccommodation } from '@/context/AccommodationContext';
import SearchBar from '@/components/SearchBar';
import ScrollableTab from '@/components/ScrollableTab';
import type { Tab } from '@/types/Tab';
import type { Business } from '@/types/Business';
import Container from '@/components/Container';
import Button from '@/components/Button';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

const TABS: Tab[] = [
  { key: 'all', label: 'All', icon: 'th-large' },
  { key: 'accommodation', label: 'Accommodation', icon: 'hotel' },
  { key: 'shop', label: 'Shop', icon: 'shopping-bag' },
  { key: 'event', label: 'Event', icon: 'calendar' },
  { key: 'tourist-spot', label: 'Tourist Spot', icon: 'map-marker-alt' },
];

const Maps = () => {
  const colorScheme = useColorScheme();
  const color = colorScheme === 'dark' ? '#fff' : '#000';

  // Context hooks
  const { allAccommodationDetails, setAccommodationId } = useAccommodation();

  // Filter state
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab.key);
  };

  // Filter and prepare businesses for map
  const filteredBusinesses = useMemo(() => {
    let businesses: Business[] = [];

    if (activeTab === 'all') {
      // Show both accommodations and shops
      businesses = (allAccommodationDetails || []).filter(
        (b) => b.hasBooking === true || b.hasBooking === false
      );
    } else if (activeTab === 'accommodation') {
      businesses = (allAccommodationDetails || []).filter(
        (b) => b.hasBooking === true
      );
    } else if (activeTab === 'shop') {
      businesses = (allAccommodationDetails || []).filter(
        (b) => b.hasBooking === false
      );
    } else {
      // For other tabs, fallback to all
      businesses = allAccommodationDetails || [];
    }

    // Filter by search term
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      businesses = businesses.filter(
        (b) =>
          b.business_name?.toLowerCase().includes(searchLower) ||
          b.address?.toLowerCase().includes(searchLower)
      );
    }

    // Only show businesses with valid coordinates and active/pending status
    return businesses.filter(
      (b) =>
        b.latitude &&
        b.longitude &&
        !isNaN(Number(b.latitude)) &&
        !isNaN(Number(b.longitude)) &&
        (b.status?.toLowerCase() === 'active' ||
          b.status?.toLowerCase() === 'pending')
    );
  }, [allAccommodationDetails, activeTab, search]);

  const handleBusinessPress = (business: Business) => {
    if (business.hasBooking === true) {
      // Accommodation
      setAccommodationId(business.id!);
      navigateToAccommodationProfile();
    }
    // Add more business types here when contexts are ready
  };

  const [userLocation, setUserLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<
    'checking' | 'granted' | 'denied'
  >('checking');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setPermissionStatus('checking');
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!mounted) return;
        if (status !== 'granted') {
          setPermissionStatus('denied');
          setErrorMsg(
            'Location permission was denied. Some features may be limited.'
          );
          return;
        }
        setPermissionStatus('granted');

        try {
          const location = await Location.getCurrentPositionAsync({});
          if (!mounted) return;
          setUserLocation(location.coords);
        } catch (err) {
          if (!mounted) return;
          setErrorMsg('Unable to fetch current location.');
        }

        try {
          const subscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 5000,
              distanceInterval: 10,
            },
            (loc) => {
              if (!mounted) return;
              setUserLocation(loc.coords);
            }
          );
          watchRef.current = subscription;
        } catch (err) {
          if (!mounted) return;
          setErrorMsg('Unable to start location updates.');
        }
      } catch (err) {
        if (!mounted) return;
        setPermissionStatus('denied');
        setErrorMsg('Unexpected error requesting location permission.');
      }
    })();

    return () => {
      mounted = false;
      if (watchRef.current) {
        watchRef.current.remove();
        watchRef.current = null;
      }
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {permissionStatus === 'checking' ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 12, color: '#6A768E' }}>
            Preparing map…
          </Text>
        </View>
      ) : permissionStatus === 'denied' ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24,
          }}
        >
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>
            Location permission denied
          </Text>
          <Text style={{ textAlign: 'center', color: '#6A768E' }}>
            {errorMsg ||
              'Please enable location permission in Settings to see your position on the map.'}
          </Text>
          <Pressable
            onPress={() => Linking.openSettings()}
            style={{
              marginTop: 14,
              backgroundColor: colors.primary,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>
              Open Settings
            </Text>
          </Pressable>
        </View>
      ) : (
        <MapView
          style={{ width: '100%', height: '100%' }}
          showsUserLocation={permissionStatus === 'granted'}
          followsUserLocation={false}
          initialRegion={{
            latitude: userLocation?.latitude || 13.6217,
            longitude: userLocation?.longitude || 123.1948,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          }}
        >
          {filteredBusinesses.map((business) => (
            <Marker
              key={business.id}
              coordinate={{
                latitude: Number(business.latitude),
                longitude: Number(business.longitude),
              }}
            >
              <View style={styles.markerContainer}>
                <View style={styles.markerImageWrapper}>
                  {business.business_image ? (
                    <Image
                      source={{ uri: business.business_image }}
                      style={styles.markerImage}
                    />
                  ) : (
                    <Image source={placeholder} style={styles.markerImage} />
                  )}
                </View>
                <View style={styles.markerArrow} />
              </View>
              <Callout
                tooltip={true}
                onPress={() => handleBusinessPress(business)}
              >
                <View style={styles.calloutContainer}>
                  {/* Image */}
                  {business.business_image ? (
                    <Image
                      source={{ uri: business.business_image }}
                      style={styles.calloutImage}
                    />
                  ) : (
                    <Image source={placeholder} style={styles.calloutImage} />
                  )}

                  <Text style={styles.calloutTitle}>
                    {business.business_name}
                  </Text>

                  {/* Address */}
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={14}
                      color="#666"
                    />
                    <Text style={styles.calloutText} numberOfLines={2}>
                      {business.address || 'No address available'}
                    </Text>
                  </View>

                  {/* Price Range */}
                  {(business.min_price || business.max_price) && (
                    <View style={styles.infoRow}>
                      <MaterialCommunityIcons
                        name="cash"
                        size={14}
                        color="#666"
                      />
                      <Text style={styles.priceText}>
                        ₱{business.min_price || 0} - ₱{business.max_price || 0}
                      </Text>
                    </View>
                  )}

                  {/* Rating */}
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons
                      name="star"
                      size={14}
                      color="#FFB007"
                    />
                    <Text style={styles.ratingText}>4.5</Text>
                    <Text style={styles.reviewCount}>(120 reviews)</Text>
                  </View>

                  {/* Status Badge */}
                  <View
                    style={[
                      styles.statusBadge,
                      business.status?.toLowerCase() === 'active'
                        ? styles.statusActive
                        : styles.statusPending,
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {business.status?.toUpperCase() || 'PENDING'}
                    </Text>
                  </View>

                  <Button
                    label="View More"
                    onPress={() => handleBusinessPress(business)}
                  />
                </View>
              </Callout>
            </Marker>
          ))}

          {userLocation && (
            <Marker
              coordinate={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              pinColor="blue"
            />
          )}
        </MapView>
      )}

      {/* Floating Search Bar and Tabs */}
      <View style={styles.searchContainer}>
        <Container
          gap={0}
          paddingBottom={0}
          backgroundColor="transparent"
          style={{ overflow: 'visible' }}
        >
          <SearchBar
            shape="square"
            containerStyle={{ flex: 1 }}
            value={search}
            onChangeText={(text) => setSearch(text)}
            onSearch={() => {}}
            placeholder={'Search location or business'}
          />
          <ScrollableTab
            tabs={TABS}
            onTabChange={handleTabChange}
            activeKey={activeTab}
          />
        </Container>
      </View>

      <Text
        style={{ position: 'absolute', bottom: 10, alignSelf: 'center', color }}
      >
        {colorScheme} Mode
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    position: 'absolute',
    zIndex: 1000,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerImageWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    padding: 3,
    borderWidth: 3,
    borderColor: colors.primary,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  markerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 27,
  },
  markerArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.primary,
    marginTop: -1,
  },
  calloutContainer: {
    width: 240,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 4,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
    color: '#333',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 6,
    gap: 4,
  },
  categoryText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  calloutText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  priceText: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '600',
  },
  ratingText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
    marginLeft: 2,
  },
  reviewCount: {
    fontSize: 11,
    color: '#999',
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  statusActive: {
    backgroundColor: '#E8F5E9',
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#333',
  },
  calloutImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  viewMoreButton: {
    marginTop: 8,
    backgroundColor: colors.primary,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewMoreText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default Maps;
