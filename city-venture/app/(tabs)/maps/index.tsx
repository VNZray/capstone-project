import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);

      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (loc) => {
          setUserLocation(loc.coords);
        }
      );
    })();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {Platform.OS === 'web' ? (
        <View style={[{ width: '100%', height: '100%' }]}>
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            Map view is not supported on the web.
          </Text>
        </View>
      ) : (
        <MapView
          style={{ width: '100%', height: '100%' }}
          showsUserLocation={true}
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
                  router.navigate(
                    `/(home)/(accommodations)/profile/${business.id}`
                  );
                  console.log('Navigating to business:', business.id);
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
