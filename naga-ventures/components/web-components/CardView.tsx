import { ThemedView } from '@/components/ThemedView';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  useColorScheme as useRNColorScheme,
  View,
  ViewStyle,
} from 'react-native';
import { ThemedText } from '../ThemedText';
export function useColorScheme() {
  const scheme = useRNColorScheme();
  return scheme === 'dark' ? 'dark' : 'light';
}

type CardViewProps = {
  imageUri: string;
  title: string;
  subtitle: string;
  status: string;
  width?: number;
  height?: number;
  radius?: number;
  elevation?: number;
  data?: {};
};

const CardView: React.FC<CardViewProps> = ({
  imageUri,
  title,
  subtitle,
  status,
  width,
  height,
  radius,
  elevation,
  data,
}) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const backgroundColor = isDarkMode ? '#151718' : '#FFFFFF';

  return (
    <ThemedView
      style={[
        styles.card,
        {
          maxWidth: 397,
          width: (width ?? Dimensions.get('window').width) * 1,
          height: (height ?? Dimensions.get('window').height) * 0.9,
          borderRadius: radius,
          elevation,
        } as ViewStyle,
      ]}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <View
        style={[
          styles.cardTextContainer,
          {
            backgroundColor:
              Platform.OS === 'web' ? '#FFFFFF' : backgroundColor,
            shadowColor: isDarkMode ? '#f3f3f3' : '#000000',
            shadowOpacity: isDarkMode ? 0 : 0.3,
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 4,
          },
        ]}
      >
        <ThemedText
          darkColor={Platform.OS === 'web' ? '#000' : '#000'}
          type="cardTitle"
        >
          {title}
        </ThemedText>
        <ThemedText
          darkColor={Platform.OS === 'web' ? '#000' : '#000'}
          type="cardSubTitle"
        >
          <MaterialCommunityIcons name="map-marker" size={14} color="#FFB007" />{' '}
          {subtitle}
        </ThemedText>
        <ThemedText
          type="cardBoldSubTitle"
          style={[
            styles.status,
            {
              color:
                status.toLowerCase() === 'active'
                  ? 'green'
                  : status.toLowerCase() === 'inactive'
                  ? 'red'
                  : 'gray',
            },
          ]}
        >
          {status}
        </ThemedText>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  card: {
    shadowRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    flex: 1,
  },
  imageWrapper: {
    width: '100%',
    height: '88%',
    borderRadius: 10,
    position: 'absolute',
    top: 0,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  cardTextContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    borderRadius: 10,
    padding: 16,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  status: {
    color: '#FFB007',
  },
  favoriteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    margin: 0,
    borderRadius: '50%',
  },
});

export default CardView;
