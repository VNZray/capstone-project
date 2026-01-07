import * as Location from 'expo-location';
import { useEffect, useRef, useState, useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Linking from 'expo-linking';
import { useAccommodation } from '@/context/AccommodationContext';
import { useTouristSpot } from '@/context/TouristSpotContext';
import { useAuth } from '@/context/AuthContext';
import SearchBar from '@/components/SearchBar';
import ScrollableTab from '@/components/ScrollableTab';
import type { Tab } from '@/types/Tab';
import type { Business } from '@/types/Business';
import type { TouristSpot } from '@/types/TouristSpot';
import type { EmergencyFacility } from '@/types/EmergencyFacility';
import Container from '@/components/Container';
import CustomMarker from './components/CustomMarker';
import LocationBottomSheet from './components/LocationBottomSheet';
import EmergencyFacilityMarker from './components/EmergencyFacilityMarker';
import EmergencyFacilityBottomSheet from './components/EmergencyFacilityBottomSheet';
import { fetchActiveEmergencyFacilities } from '@/services/EmergencyFacilityService';
import { usePreventDoubleNavigation } from '@/hooks/usePreventDoubleNavigation';
import { Routes } from '@/routes/mainRoutes';
import placeholder from '@/assets/images/placeholder.png';
import MapView, { Callout, MapMarker, Marker } from 'react-native-maps';
import { AppHeader } from '@/components/header/AppHeader';

type LocationData = Business | TouristSpot;
type LocationType = 'accommodation' | 'shop' | 'tourist-spot';

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
  const { push } = usePreventDoubleNavigation();

  // Context hooks
  const { allAccommodationDetails, setAccommodationId } = useAccommodation();
  const { spots, setSpotId } = useTouristSpot();
  const { user } = useAuth();

  // Filter state
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');

  // Emergency facilities state
  const [emergencyFacilities, setEmergencyFacilities] = useState<
    EmergencyFacility[]
  >([]);
  const [selectedEmergencyFacility, setSelectedEmergencyFacility] =
    useState<EmergencyFacility | null>(null);
  const [isEmergencyBottomSheetOpen, setIsEmergencyBottomSheetOpen] =
    useState(false);

  // Load emergency facilities
  useEffect(() => {
    const loadEmergencyFacilities = async () => {
      try {
        const data = await fetchActiveEmergencyFacilities();
        setEmergencyFacilities(data);
        console.log('[Maps] Emergency facilities loaded:', data.length);
      } catch (error) {
        console.error('[Maps] Error loading emergency facilities:', error);
      }
    };
    loadEmergencyFacilities();
  }, []);

  // Bottom sheet state
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    null
  );
  const [selectedLocationType, setSelectedLocationType] =
    useState<LocationType | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab.key);
  };

  // Handle emergency facility marker press
  const handleEmergencyMarkerPress = (facility: EmergencyFacility) => {
    if (isEmergencyBottomSheetOpen) {
      setIsEmergencyBottomSheetOpen(false);
      setTimeout(() => {
        setSelectedEmergencyFacility(facility);
        setIsEmergencyBottomSheetOpen(true);
      }, 300);
    } else {
      setSelectedEmergencyFacility(facility);
      setIsEmergencyBottomSheetOpen(true);
    }
  };

  const handleCloseEmergencyBottomSheet = () => {
    setIsEmergencyBottomSheetOpen(false);
    setTimeout(() => {
      setSelectedEmergencyFacility(null);
    }, 300);
  };

  // Combine all locations - safely handle undefined/null
  const allLocations = useMemo(() => {
    const locations: { data: LocationData; type: LocationType }[] = [];

    console.log('[Maps] allAccommodationDetails:', {
      exists: !!allAccommodationDetails,
      isArray: Array.isArray(allAccommodationDetails),
      length: allAccommodationDetails?.length,
      sample: allAccommodationDetails?.[0],
    });

    // Add all businesses (accommodations and shops)
    if (allAccommodationDetails && Array.isArray(allAccommodationDetails)) {
      console.log(
        '[Maps] Total businesses from context:',
        allAccommodationDetails.length
      );

      // Log each business's hasBooking value for debugging
      allAccommodationDetails.forEach((b, i) => {
        console.log(
          `[Maps] Business ${i}: ${b.business_name}, hasBooking: ${
            b.hasBooking
          } (${typeof b.hasBooking}), lat: ${b.latitude}, lng: ${b.longitude}`
        );
      });

      // Accommodations: businesses with booking capability (hasBooking is truthy: true or 1)
      const accommodations = allAccommodationDetails
        .filter((b) => b.hasBooking === true || b.hasBooking === 1)
        .map((b) => ({ data: b, type: 'accommodation' as LocationType }));

      console.log('[Maps] Accommodations found:', accommodations.length);
      locations.push(...accommodations);

      // Shops: businesses without booking capability (hasBooking is false, 0, null, or undefined)
      const shops = allAccommodationDetails
        .filter((b) => b.hasBooking !== true && b.hasBooking !== 1)
        .map((b) => ({ data: b, type: 'shop' as LocationType }));

      console.log('[Maps] Shops found:', shops.length);
      locations.push(...shops);
    }

    // Add tourist spots - safely handle if context fails to load
    if (spots && Array.isArray(spots)) {
      const touristSpots = spots.map((s) => ({
        data: s,
        type: 'tourist-spot' as LocationType,
      }));
      console.log('[Maps] Tourist spots found:', touristSpots.length);
      locations.push(...touristSpots);
    }

    console.log('[Maps] Total locations:', locations.length);
    return locations;
  }, [allAccommodationDetails, spots]);

  // Filter locations based on active tab and search
  const filteredLocations = useMemo(() => {
    let filtered = allLocations;

    console.log('[Maps] Filtering - Initial count:', filtered.length);

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter((loc) => loc.type === activeTab);
      console.log(
        '[Maps] After tab filter (' + activeTab + '):',
        filtered.length
      );
    }

    // Filter by search term
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((loc) => {
        const isBusiness = 'business_name' in loc.data;
        const name = isBusiness
          ? (loc.data as Business).business_name
          : (loc.data as TouristSpot).name;
        const address = isBusiness
          ? (loc.data as Business).address
          : `${(loc.data as TouristSpot).barangay || ''} ${
              (loc.data as TouristSpot).municipality || ''
            }`;

        return (
          name?.toLowerCase().includes(searchLower) ||
          address?.toLowerCase().includes(searchLower)
        );
      });
      console.log('[Maps] After search filter:', filtered.length);
    }

    // Only show locations with valid coordinates
    const withValidCoords = filtered.filter((loc) => {
      const lat = Number(loc.data.latitude);
      const lng = Number(loc.data.longitude);
      const hasValidCoords = lat && lng && !isNaN(lat) && !isNaN(lng);

      if (!hasValidCoords) {
        console.log('[Maps] Invalid coords for:', {
          type: loc.type,
          name:
            'business_name' in loc.data
              ? loc.data.business_name
              : (loc.data as TouristSpot).name,
          lat: loc.data.latitude,
          lng: loc.data.longitude,
        });
      }

      return hasValidCoords;
    });

    // Apply small offset to markers at same coordinates to prevent overlap
    const coordMap = new Map<string, number>();
    const withOffset = withValidCoords.map((loc) => {
      const lat = Number(loc.data.latitude);
      const lng = Number(loc.data.longitude);
      const coordKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;

      // Count how many markers are at this location
      const count = coordMap.get(coordKey) || 0;
      coordMap.set(coordKey, count + 1);

      // Apply offset if there are duplicates (offset by ~50 meters)
      const offset = count * 0.0005;
      const offsetLat = lat + offset;
      const offsetLng = lng + offset;

      return {
        ...loc,
        displayCoords: {
          latitude: offsetLat,
          longitude: offsetLng,
        },
      };
    });

    console.log('[Maps] Final locations with valid coords:', withOffset.length);
    return withOffset;
  }, [allLocations, activeTab, search]);

  const handleMarkerPress = (location: LocationData, type: LocationType) => {
    // Close any existing bottom sheet first
    if (isBottomSheetOpen) {
      setIsBottomSheetOpen(false);
      // Wait for animation to complete before opening new one
      setTimeout(() => {
        setSelectedLocation(location);
        setSelectedLocationType(type);
        setIsBottomSheetOpen(true);
      }, 300);
    } else {
      setSelectedLocation(location);
      setSelectedLocationType(type);
      setIsBottomSheetOpen(true);
    }
  };

  const handleCloseBottomSheet = () => {
    setIsBottomSheetOpen(false);
    // Clear selection after animation completes
    setTimeout(() => {
      setSelectedLocation(null);
      setSelectedLocationType(null);
    }, 300);
  };

  const handleViewMore = () => {
    if (!selectedLocation || !selectedLocationType) return;

    setIsBottomSheetOpen(false);

    const isBusiness = 'business_name' in selectedLocation;
    const id = isBusiness
      ? (selectedLocation as Business).id
      : (selectedLocation as TouristSpot).id;

    if (!id) return;

    setTimeout(() => {
      switch (selectedLocationType) {
        case 'accommodation':
          setAccommodationId(id);
          // Use correct path: profile/profile matches Stack.Screen name
          push({
            pathname: '/(tabs)/(home)/(accommodation)/profile/profile',
            params: { id },
          } as any);
          break;
        case 'shop':
          push(Routes.modals.businessProfile(id));
          break;
        case 'tourist-spot':
          setSpotId(id);
          // Use correct path: profile/profile matches Stack.Screen name
          push({
            pathname: '/(tabs)/(home)/(spot)/profile/profile',
            params: { id },
          } as any);
          break;
      }
    }, 300);
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
        } catch {
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
        } catch {
          if (!mounted) return;
          setErrorMsg('Unable to start location updates.');
        }
      } catch {
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
          rotateEnabled
          showsTraffic
          showsBuildings={true}
          showsIndoors={true}
          showsMyLocationButton={true}
          showsScale={false}
          showsCompass={false}
          showsIndoorLevelPicker={false}
          showsPointsOfInterest={false}
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
          <AppHeader
            title="Interactive Map"
            background="primary"
            bottomComponent={
              <>
                <SearchBar
                  placeholder="Search locations..."
                  value={search}
                  onChangeText={setSearch}
                  variant="plain"
                  shape="square"
                />
              </>
            }
          />

          {/* Render all location markers */}
          {Platform.OS === 'ios' ? (
            <>
              {filteredLocations.map((loc, index) => (
                <CustomMarker
                  key={`${loc.type}-${
                    'business_name' in loc.data
                      ? (loc.data as Business).id
                      : (loc.data as TouristSpot).id
                  }-${index}`}
                  location={loc.data}
                  locationType={loc.type}
                  displayCoords={loc.displayCoords}
                  onPress={() => handleMarkerPress(loc.data, loc.type)}
                />
              ))}
            </>
          ) : (
            <>
              {filteredLocations.map((loc, index) => (
                <MapMarker
                  key={`${loc.type}-${
                    'business_name' in loc.data
                      ? (loc.data as Business).id
                      : (loc.data as TouristSpot).id
                  }-${index}`}
                  coordinate={{
                    latitude: loc.displayCoords.latitude,
                    longitude: loc.displayCoords.longitude,
                  }}
                  pinColor={
                    loc.type === 'accommodation'
                      ? colors.secondary
                      : loc.type === 'shop'
                      ? '#FF6B35'
                      : colors.success
                  }
                  onPress={() => handleMarkerPress(loc.data, loc.type)}
                />
              ))}
            </>
          )}

          {/* User location marker */}
          {userLocation && (
            <>
              {Platform.OS === 'android' ? (
                <Marker
                  coordinate={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                  }}
                  pinColor={colors.primary}
                />
              ) : (
                <Marker
                  coordinate={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                  }}
                >
                  <View style={styles.userMarkerContainer}>
                    <View style={styles.userMarkerImageWrapper}>
                      {user?.user_profile ? (
                        <Image
                          source={{ uri: user.user_profile }}
                          style={styles.userMarkerImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <Image
                          source={placeholder}
                          style={styles.userMarkerImage}
                          resizeMode="cover"
                        />
                      )}
                    </View>
                    {/* Pulsing circle effect */}
                    <View style={styles.userMarkerPulse} />
                  </View>
                </Marker>
              )}
            </>
          )}

          {/* Emergency Facility Markers - Always visible regardless of filter */}
          {emergencyFacilities
            .filter((facility) => {
              // Only show facilities with valid coordinates
              const lat = Number(facility.latitude);
              const lng = Number(facility.longitude);
              return lat && lng && !isNaN(lat) && !isNaN(lng);
            })
            .map((facility) => (
              <EmergencyFacilityMarker
                key={`emergency-${facility.id}`}
                facility={facility}
                onPress={() => handleEmergencyMarkerPress(facility)}
              />
            ))}
        </MapView>
      )}

      {/* Location Bottom Sheet */}
      <LocationBottomSheet
        key={
          selectedLocation
            ? 'business_name' in selectedLocation
              ? (selectedLocation as Business).id
              : (selectedLocation as TouristSpot).id
            : 'empty'
        }
        isOpen={isBottomSheetOpen}
        onClose={handleCloseBottomSheet}
        location={selectedLocation}
        locationType={selectedLocationType}
        onViewMore={handleViewMore}
      />

      {/* Emergency Facility Bottom Sheet */}
      <EmergencyFacilityBottomSheet
        key={selectedEmergencyFacility?.id || 'emergency-empty'}
        isOpen={isEmergencyBottomSheetOpen}
        onClose={handleCloseEmergencyBottomSheet}
        facility={selectedEmergencyFacility}
      />

      {/* Floating Search Bar and Tabs */}
      <View style={styles.searchContainer}>
        <Container
          gap={0}
          paddingBottom={0}
          backgroundColor="transparent"
          style={{ overflow: 'visible' }}
        >
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
    marginTop: 160,
  },
  userMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerImageWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    padding: 2,
    borderWidth: 3,
    borderColor: '#4A90E2',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  userMarkerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 19,
  },
  userMarkerPulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(74, 144, 226, 0.5)',
    zIndex: -1,
  },
  markerImage: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
  },
});

export default Maps;
