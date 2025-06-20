import { ShopColors } from '@/constants/ShopColors'; // Using ShopColors for consistency if needed
import { SpecialOffer } from '@/types/shop'; // Import the new SpecialOffer type
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

// Define props for the SpecialOfferCard
interface SpecialOfferCardProps {
  offer: SpecialOffer; // Use the new SpecialOffer type
  onPress: (offerId: string) => void; // Handler for when the card is pressed
}

const SpecialOfferCard: React.FC<SpecialOfferCardProps> = ({
  offer,
  onPress,
}) => {
  const cardWidth = 150;
  const cardHeight = 250;

  const styles = StyleSheet.create({
    card: {
      width: cardWidth,
      height: cardHeight,
      borderRadius: 12, // Consistent rounding
      overflow: 'hidden', // Ensures image respects border radius
      backgroundColor: ShopColors.border, // Fallback background
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    image: {
      width: '100%',
      height: '100%',
    },
  });

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(offer.id)}
      activeOpacity={0.8}
      accessible={true}
      accessibilityLabel={
        offer.title || offer.description || `Special offer ${offer.id}`
      }
      accessibilityRole="button"
    >
      <Image
        source={{ uri: offer.image }} // Use offer.image
        style={styles.image}
        contentFit="cover"
        transition={300}
        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**-oJ-pM|' }} // Keep placeholder or make it dynamic if needed
      />
    </TouchableOpacity>
  );
};

export default SpecialOfferCard;
