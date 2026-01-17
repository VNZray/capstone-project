import { ShopColors } from '@/constants/color';
import React from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';

export type FeaturedTouristSpotCardProps = {
  image: string | ImageSourcePropType;
  name: string;
  categories?: string[];
  onPress?: () => void;
  width?: number;
  height?: number;
};

const FeaturedTouristSpotCard: React.FC<FeaturedTouristSpotCardProps> = ({
  image,
  name,
  categories,
  onPress,
  width = 260,
  height = 180,
}) => {
  const source = typeof image === 'string' ? { uri: image } : image;
  
  return (
    <Pressable 
      style={[styles.container, { width }]} 
      onPress={onPress}
    >
      <View style={[styles.imageContainer, { height }]}>
        <Image source={source} style={styles.image} resizeMode="cover" />
      </View>

      <View style={styles.contentContainer}>
        <ThemedText
          type="card-title-small"
          weight="bold"
          numberOfLines={1}
          style={styles.name}
        >
          {name}
        </ThemedText>
        
        {categories && categories.length > 0 && (
          <ThemedText 
            type="label-small" 
            numberOfLines={1} 
            style={styles.category}
          >
            {categories.join(', ')}
          </ThemedText>
        )}
      </View>
    </Pressable>
  );
};

export default FeaturedTouristSpotCard;

const styles = StyleSheet.create({
  container: {
    marginRight: 16,
    backgroundColor: 'transparent',
  },
  imageContainer: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: ShopColors.inputBackground,
    borderWidth: 1,
    borderColor: ShopColors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    paddingHorizontal: 0,
  },
  name: {
    color: ShopColors.textPrimary,
    fontSize: 16,
    marginBottom: 4,
  },
  category: {
    color: ShopColors.textSecondary,
    fontSize: 14,
  },
});
