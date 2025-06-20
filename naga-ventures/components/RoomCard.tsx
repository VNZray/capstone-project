import { ThemedView } from '@/components/ThemedView';
import React from 'react';
import {
  DimensionValue,
  Image,
  Platform,
  StyleProp,
  View,
  ViewStyle,
  useColorScheme as useRNColorScheme,
} from 'react-native';
import { ThemedText } from './ThemedText';

export function useColorScheme() {
  const scheme = useRNColorScheme();
  return scheme === 'dark' ? 'dark' : 'light';
}

type RoomCardProps = {
  roomNumber: string | number;
  status: string;
  capacity: string;
  roomPrice: string;
  background?: string;
  elevation?: number;
  ratings?: number;
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  imageUri?: string;
  style?: StyleProp<ViewStyle>;
};

const getShadowStyle = (elevation: number, isDarkMode: boolean): ViewStyle => {
  if (elevation === 0) {
    return {
      shadowColor: 'transparent',
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 0 },
    };
  }

  const shadowStyles: Record<number, ViewStyle> = {
    1: {
      shadowColor: isDarkMode ? '#fff' : '#000',
      shadowOpacity: 0.1,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
    },
    2: {
      shadowColor: isDarkMode ? '#fff' : '#000',
      shadowOpacity: 0.15,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    3: {
      shadowColor: isDarkMode ? '#fff' : '#000',
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
    },
    4: {
      shadowColor: isDarkMode ? '#fff' : '#000',
      shadowOpacity: 0.25,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    5: {
      shadowColor: isDarkMode ? '#fff' : '#000',
      shadowOpacity: 0.3,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
    },
  };

  return shadowStyles[elevation] ?? shadowStyles[1];
};

const RoomCard: React.FC<RoomCardProps> = ({
  roomNumber,
  status,
  capacity,
  roomPrice,
  ratings,
  elevation = 1,
  radius = 10,
  imageUri,
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const shadowStyle =
    Platform.OS === 'ios' ? getShadowStyle(elevation, isDarkMode) : {};

  return (
    <ThemedView
      style={[
        {
          width: '100%',
          borderRadius: radius,
          elevation: Platform.OS === 'android' ? elevation : 0,
          display: 'flex',
          flexDirection: 'row',
        } as ViewStyle,
        shadowStyle,
        style,
      ]}
    >
      {imageUri && (
        <View style={{ overflow: 'hidden', borderEndStartRadius: radius, borderTopLeftRadius: radius }}>
          <Image
            source={{ uri: imageUri }}
            resizeMode="cover"
            style={{
              width: 150,
              height: 150,
            }}
          />
        </View>
      )}
      <ThemedView style={{ borderRadius: radius, position: 'relative', flex: 1, height: 150, justifyContent: 'space-between' }}>
        <View style={{ padding: 10, borderRadius: radius, }}>
          <ThemedText type="cardBoldSubTitle">Room {roomNumber}</ThemedText>
          <ThemedText type="cardSubTitle">Status: {status}</ThemedText>
          <ThemedText type="cardSubTitle">Capacity: {capacity}</ThemedText>
          <ThemedText type="cardSubTitle">Ratings: {ratings}</ThemedText>

        </View>

        <View style={{
          backgroundColor: isDarkMode ? '#0A1B47' : '#0A1B47',
          width: '100%', position: 'relative', borderBottomEndRadius: radius, display: 'flex', alignItems: 'center', paddingVertical: 10
        }}>
          <ThemedText lightColor='#fff' type="cardSubTitle">Price: ₱{Number(roomPrice)}</ThemedText>
        </View>
      </ThemedView>

    </ThemedView>
  );
};

export default RoomCard;
