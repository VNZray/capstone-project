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
import Container from '@/components/Container';
import CustomMarker from './components/CustomMarker';
import LocationBottomSheet from './components/LocationBottomSheet';
import { usePreventDoubleNavigation } from '@/hooks/usePreventDoubleNavigation';
import { Routes } from '@/routes/mainRoutes';
import placeholder from '@/assets/images/placeholder.png';
import MapView, { Callout, MapMarker, Marker } from 'react-native-maps';

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

  // Combine all locations - safely handle undefined/null
  const allLocations = useMemo(() => {
    const locations: { data: LocationData; type: LocationType }[] = [];

    console.log('[Maps] allAccommodationDetails:', {
      exists: !!allAccommodationDetails,
      isArray: Array.isArray(allAccommodationDetails),
      length: allAccommodationDetails?.length,
      sample: allAccommodationDetails?.[0],
    });

    // Add accommodations
    if (allAccommodationDetails && Array.isArray(allAccommodationDetails)) {
      const accommodations = allAccommodationDetails
        .filter((b) => b.hasBooking === true || b.hasBooking === 1)
        .map((b) => ({ data: b, type: 'accommodation' as LocationType }));

      console.log('[Maps] Accommodations found:', {
        total: allAccommodationDetails.length,
        withBooking: accommodations.length,
        sampleHasBooking: allAccommodationDetails[0]?.hasBooking,
      });

      locations.push(...accommodations);

      // Add shops
      const shops = allAccommodationDetails
        .filter((b) => b.hasBooking === false || b.hasBooking === 0)
        .map((b) => ({ data: b, type: 'shop' as LocationType }));

      console.log('[Maps] Shops found:', {
        total: allAccommodationDetails.length,
        withoutBooking: shops.length,
      });

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

    console.log(
      '[Maps] Final locations with valid coords:',
      withValidCoords.length
    );
    return withValidCoords;
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
          push(Routes.accommodation.profile(id) as any);
          break;
        case 'shop':
          push(Routes.modals.businessProfile(id));
          break;
        case 'tourist-spot':
          setSpotId(id);
          push(Routes.spot.profile(id) as any);
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
          showsBuildings={false}
          showsIndoors={false}
          showsMyLocationButton={true}
          showsScale={false}
          showsCompass={true}
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
                    latitude: Number(loc.data.latitude) || 0,
                    longitude: Number(loc.data.longitude) || 0,
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
