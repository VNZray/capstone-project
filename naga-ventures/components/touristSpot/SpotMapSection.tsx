// Component that displays an interactive map showing the location of a tourist spot
// Uses Google Maps to show the exact location with a marker and address

import { MapView, Marker, PROVIDER_GOOGLE } from '@/components/map/MapWrapper';
import { ThemedText } from '@/components/ThemedText';
import { MapLocation } from '@/context/TouristSpotContext';
import { StyleSheet, View } from 'react-native';
interface SpotMapSectionProps {
  mapLocation: MapLocation | null;
  address?: string;
  iconColor: string;
}

export default function SpotMapSection({
  mapLocation,
  address,
  iconColor,
}: SpotMapSectionProps) {
  // Don't render if no location data is available
  if (!mapLocation) return null;

  return (
    <View style={styles.section}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Location
      </ThemedText>
      <View style={styles.mapContainer}>
        {/* Google Maps component with initial region centered on the spot */}
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: mapLocation.latitude,
            longitude: mapLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
        >
          {/* Marker showing the exact spot location */}
          <Marker
            coordinate={{
              latitude: mapLocation.latitude,
              longitude: mapLocation.longitude,
            }}
            title={address}
            description="Tourist Spot Location"
          />
        </MapView>
      </View>
      {/* Display the address below the map if available */}
      {address && (
        <ThemedText type="default2" style={styles.addressText}>
          {address}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  map: {
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
  },
});
