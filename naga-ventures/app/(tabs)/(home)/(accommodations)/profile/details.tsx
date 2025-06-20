import Amenities from '@/components/Amenities';
import CardContainer from '@/components/CardContainer';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFonts } from 'expo-font';
import { Link } from 'expo-router';
import { Platform, View } from 'react-native';
import { Business } from '@/types/Business';
import { MapView, Marker } from '@/components/map/MapWrapper';

type DetailsProps = {
  business: Business;
};

const Details = ({ business }: DetailsProps) => {
  const colorScheme = useColorScheme();
  const color = colorScheme === 'dark' ? '#fff' : '#000';

  const [fontsLoaded] = useFonts({
    'Poppins-Black': require('@/assets/fonts/Poppins/Poppins-Black.ttf'),
    'Poppins-Regular': require('@/assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('@/assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('@/assets/fonts/Poppins/Poppins-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  if (!business) {
    return (
      <View style={{ padding: 16 }}>
        <ThemedText type="default">Accommodation not found.</ThemedText>
        <Link href={'/(home)/'}>
          <ThemedText type="link">Go Home</ThemedText>
        </Link>
      </View>
    );
  }

  return (
    <View style={{ padding: 16, paddingTop: 0 }}>
      <CardContainer
        elevation={2}
        style={{
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <ThemedText type="cardTitle">Description</ThemedText>
        <ThemedText type="default2">
          {business.description
            ? business.description.replace(/^"|"$/g, '').trim()
            : 'No description provided.'}
        </ThemedText>
      </CardContainer>

      <View style={{ marginTop: 16 }}>
        <ThemedText type="cardTitle">Amenities</ThemedText>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: 16,
            paddingLeft: 0,
            paddingRight: 0,
          }}
        >
          <Amenities title="Parking" icon="car" iconSize={32} color={color} textSize={14} />
          <Amenities title="WIFI" icon="wifi" iconSize={32} color={color} textSize={14} />
          <Amenities title="Laundry" icon="washing-machine" iconSize={32} color={color} textSize={14} />
          <Amenities title="AC" icon="air-conditioner" iconSize={32} color={color} textSize={14} />
          <Amenities title="Bar" icon="glass-wine" iconSize={32} color={color} textSize={14} />
        </View>
      </View>

      <View style={{ marginTop: 16 }}>
        <ThemedText type="cardTitle">Guide Map</ThemedText>

        <CardContainer
          style={{
            height: 400,
            borderRadius: 10,
            marginTop: 10,
            padding: 4,
          }}
        >
          {Platform.OS === 'web' ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ThemedText type="default">Map view is not supported on web.</ThemedText>
            </View>
          ) : business.latitude && business.longitude ? (
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude: business.latitude,
                longitude: business.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: business.latitude,
                  longitude: business.longitude,
                }}
                title={business.business_name}
                description={business.description}
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
              <ThemedText type="default">No coordinates available.</ThemedText>
            </View>
          )}
        </CardContainer>
      </View>
    </View>
  );
};

export default Details;
