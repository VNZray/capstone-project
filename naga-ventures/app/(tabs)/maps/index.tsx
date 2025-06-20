import { Callout, MapView, Marker } from '@/components/map/MapWrapper';
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

import { ThemedText } from '@/components/ThemedText';
import { accommodations } from '@/Controller/AccommodationData';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
const Maps = () => {
  const colorScheme = useColorScheme();
  const color = colorScheme === 'dark' ? '#fff' : '#000';

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
          {accommodations.map((acc) => (
            <Marker
              key={acc.id}
              coordinate={{
                latitude: acc.latitude,
                longitude: acc.longitude,
              }}
              image={require('@/assets/pins/A-pin.png')}
            >
              <Callout
                onPress={() =>
                  router.navigate(
                    `/(home)/(accommodations)/profile/${acc.id}`
                  )
                }
              >
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{acc.name}</Text>
                  <Text style={styles.calloutText}>{acc.location}</Text>
                  {acc.imageUri && (
                    <Image
                      source={{ uri: acc.imageUri }}
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
    backgroundColor: '#007bff',
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
