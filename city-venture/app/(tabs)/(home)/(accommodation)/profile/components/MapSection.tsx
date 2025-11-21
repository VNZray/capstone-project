import React from 'react';
import { View, Pressable, Linking, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import Container from '@/components/Container';
import { FontAwesome5 } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MapView, { Marker } from 'react-native-maps';
import Divider from '@/components/Divider';

interface MapSectionProps {
  latitude?: string | number;
  longitude?: string | number;
  businessName?: string;
  description?: string;
}

export default function MapSection({
  latitude,
  longitude,
  businessName,
  description,
}: MapSectionProps) {
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#E5E7EB' : '#0A1B47';

  const lat = latitude ? Number(latitude) : null;
  const lng = longitude ? Number(longitude) : null;
  const hasCoordinates =
    lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng);

  const handleGetDirections = () => {
    if (!hasCoordinates) return;

    const label = encodeURIComponent(businessName || 'Destination');
    const url = Platform.select({
      ios: `http://maps.apple.com/?daddr=${lat},${lng}&q=${label}`,
      android: `google.navigation:q=${lat},${lng}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${label}`,
    });

    if (url) Linking.openURL(url);
  };

  return (
    <Container
      style={[
        { padding: 16, marginVertical: 8 },
        Platform.OS === 'android' && {
          elevation: 2,
          shadowColor: '#000',
        },
        Platform.OS === 'ios' && {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <FontAwesome5 name="map-marker-alt" size={16} color={iconColor} />
        <ThemedText type="card-title-small" weight="medium">
          Location
        </ThemedText>
      </View>


      <Container
        style={{
          height: 300,
          borderRadius: 10,
          overflow: 'hidden',
          padding: 0,
        }}
      >
        {Platform.OS === 'web' ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#F3F4F6',
            }}
          >
            <FontAwesome5
              name="map"
              size={32}
              color="#9CA3AF"
              style={{ marginBottom: 8 }}
            />
            <ThemedText type="body-small" style={{ color: '#6B7280' }}>
              Map view is not supported on web.
            </ThemedText>
          </View>
        ) : hasCoordinates ? (
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: lat!,
              longitude: lng!,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{
                latitude: lat!,
                longitude: lng!,
              }}
              title={businessName}
              description={description}
            />
          </MapView>
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#F3F4F6',
            }}
          >
            <FontAwesome5
              name="map-marked-alt"
              size={32}
              color="#9CA3AF"
              style={{ marginBottom: 8 }}
            />
            <ThemedText type="body-small" style={{ color: '#6B7280' }}>
              No coordinates available.
            </ThemedText>
          </View>
        )}
      </Container>

      {hasCoordinates && (
        <Pressable
          onPress={handleGetDirections}
          style={({ pressed }) => [
            {
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 10,
              backgroundColor: '#2563EB',
              marginTop: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            },
            Platform.OS === 'android' && pressed && { opacity: 0.8 },
          ]}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }}
        >
          <FontAwesome5 name="directions" size={16} color="#fff" />
          <ThemedText type="label-medium" style={{ color: '#fff' }}>
            Get Directions
          </ThemedText>
        </Pressable>
      )}
    </Container>
  );
}
