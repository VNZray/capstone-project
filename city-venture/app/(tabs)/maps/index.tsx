import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';

import { ThemedText } from '@/components/themed-text';
import { colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import * as Linking from 'expo-linking';
import { navigateToAccommodationProfile } from '@/routes/accommodationRoutes';

const Maps = () => {
  const colorScheme = useColorScheme();
  const color = colorScheme === 'dark' ? '#fff' : '#000';

  // ✅ Static businesses data
  const businesses = [
    {
      id: 1,
      business_name: 'Caramoan Beach Resort',
      barangay: 'Paniman',
      city: 'Caramoan',
      province: 'Camarines Sur',
      latitude: 13.7712,
      longitude: 123.8656,
      image_url:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Caramoan.jpg/320px-Caramoan.jpg',
    },
    {
      id: 2,
      business_name: 'Naga City Hotel',
      barangay: 'Peñafrancia',
      city: 'Naga City',
      province: 'Camarines Sur',
      latitude: 13.6217,
      longitude: 123.1948,
      image_url:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Naga_City_Hall.jpg/320px-Naga_City_Hall.jpg',
    },
  ];

  const [userLocation, setUserLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'checking' | 'granted' | 'denied'>('checking');
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
          setErrorMsg('Location permission was denied. Some features may be limited.');
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
      {Platform.OS === 'web' ? (
        <View style={[{ width: '100%', height: '100%' }]}>
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            Map view is not supported on the web.
          </Text>
        </View>
      ) : permissionStatus === 'checking' ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 12, color: '#6A768E' }}>Preparing map…</Text>
        </View>
      ) : permissionStatus === 'denied' ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Location permission denied</Text>
          <Text style={{ textAlign: 'center', color: '#6A768E' }}>
            {errorMsg || 'Please enable location permission in Settings to see your position on the map.'}
          </Text>
          <Pressable
            onPress={() => Linking.openSettings()}
            style={{ marginTop: 14, backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Open Settings</Text>
          </Pressable>
        </View>
      ) : (
        <MapView
          style={{ width: '100%', height: '100%' }}
          showsUserLocation={permissionStatus === 'granted'}
          followsUserLocation={false}
          initialRegion={{
            latitude: 13.6217,
            longitude: 123.1948,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {businesses.map((business) => (
            <Marker
              key={business.id}
              coordinate={{
                latitude: business.latitude,
                longitude: business.longitude,
              }}
              image={require('@/assets/pins/A-pin.png')}
            >
              <Callout
                onPress={() => {
                  navigateToAccommodationProfile();
                }}
              >
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>
                    {business.business_name}
                  </Text>
                  <Text
                    style={styles.calloutText}
                  >{`${business.barangay}, ${business.city}, ${business.province}`}</Text>
                  {business.image_url && (
                    <Image
                      source={{ uri: business.image_url }}
                      style={styles.calloutImage}
                    />
                  )}
                  <Pressable style={styles.viewMoreButton}>
                    <ThemedText style={styles.viewMoreText}>
                      View More
                    </ThemedText>
                  </Pressable>
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

      <Text
        style={{ position: 'absolute', bottom: 10, alignSelf: 'center', color }}
      >
        {colorScheme} Mode
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  calloutContainer: {
    width: 220,
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 4,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  calloutText: {
    marginVertical: 4,
    fontSize: 14,
  },
  calloutImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginTop: 5,
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
