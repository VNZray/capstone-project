import React from 'react';
import {
  DimensionValue,
  Image,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  useColorScheme as useRNColorScheme,
} from 'react-native';
import StarRating from 'react-native-star-rating-widget';
import { ThemedText } from '../ThemedText';

const getShadowStyle = (elevation: number): ViewStyle => {
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
      shadowOpacity: 0.1,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
    },
    2: {
      shadowOpacity: 0.15,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    3: {
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
    },
    4: {
      shadowOpacity: 0.25,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    5: {
      shadowOpacity: 0.3,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
    },
  };

  return shadowStyles[elevation] ?? shadowStyles[1];
};

export function useColorScheme() {
  const scheme = useRNColorScheme();
}

type ReviewCardProps = {
  children?: React.ReactNode;
  background?: string;
  elevation?: number;
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  imageUri?: string;
  style?: StyleProp<ViewStyle>;
  reviewText?: string;
  reviewerName?: string;
  reviewDate?: string;
  profileImageUri?: string;
  rating?: number; // <- NEW
};

const ReviewCard: React.FC<ReviewCardProps> = ({
  children,
  elevation = 3,
  width = '100%',
  height,
  radius = 12,
  profileImageUri,
  reviewText = 'This is a sample review.',
  reviewerName = 'John Doe',
  reviewDate = 'May 24, 2025',
  style,
  rating = 5, // <- NEW
}) => {
  const theme = useColorScheme();
  const shadowStyle = getShadowStyle(elevation);

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: radius,
        } as ViewStyle,
        shadowStyle,
        style,
      ]}
    >
      <View style={styles.header}>
        <Image
          source={{
            uri:
              profileImageUri ??
              'https://www.gravatar.com/avatar/placeholder?d=mp',
          }}
          style={styles.avatar}
        />
        <View>
          <ThemedText darkColor="#000" style={styles.name}>
            {reviewerName}
          </ThemedText>
          <ThemedText darkColor="#000" style={styles.date}>
            {reviewDate}
          </ThemedText>
        </View>
        <View style={{ marginLeft: 'auto' }}>
          <StarRating
            rating={rating}
            onChange={() => {}}
            starSize={18}
            color="#FFD700"
            enableSwiping={false}
          />
        </View>
      </View>

      <View style={styles.content}>
        <ThemedText darkColor="#000" style={styles.reviewText}>
          {reviewText}
        </ThemedText>
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
  },
  date: {
    fontSize: 12,
  },
  content: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  reviewText: {
    fontSize: 14,
    marginBottom: 8,
  },
  viewMore: {
    color: '#007BFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ReviewCard;
