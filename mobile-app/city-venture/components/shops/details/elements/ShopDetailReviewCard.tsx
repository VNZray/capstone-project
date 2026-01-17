import type { BusinessProfileReview } from '@/components/shops/details/types';
import { ShopColors } from '@/constants/color';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ShopDetailReviewCardProps {
  review: BusinessProfileReview;
  onHelpfulPress?: (reviewId: string) => void;
  onImagePress?: (imageUrl: string) => void;
}

const ShopDetailReviewCard: React.FC<ShopDetailReviewCardProps> = ({
  review,
  onHelpfulPress,
  onImagePress,
}) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <View style={styles.userInfo}>
        {review.userAvatar ? (
          <Image source={{ uri: review.userAvatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{review.userName.charAt(0)}</Text>
          </View>
        )}
        <View>
          <Text style={styles.userName}>{review.userName}</Text>
          <View style={styles.metaRow}>
            <View style={styles.ratingContainer}>
               {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.round(review.rating) ? 'star' : 'star-outline'}
                  size={10}
                  color={ShopColors.warning}
                />
              ))}
            </View>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.reviewDate}>{review.date}</Text>
          </View>
        </View>
      </View>
      
      {review.isVerifiedPurchase && (
        <View style={styles.verifiedBadge}>
           <Ionicons name="checkmark-circle" size={12} color={ShopColors.accent} />
           <Text style={styles.verifiedText}>Verified</Text>
        </View>
      )}
    </View>

    <Text style={styles.comment}>{review.comment}</Text>

    {review.images?.length ? (
      <View style={styles.imageRow}>
        {review.images.map((image) => (
          <TouchableOpacity key={image} onPress={() => onImagePress?.(image)}>
            <Image source={{ uri: image }} style={styles.reviewImage} />
          </TouchableOpacity>
        ))}
      </View>
    ) : null}

    <View style={styles.footer}>
      <TouchableOpacity
        style={styles.helpfulButton}
        onPress={() => onHelpfulPress?.(review.id)}
      >
        <Ionicons name="thumbs-up-outline" size={14} color={ShopColors.textSecondary} />
        <Text style={styles.helpfulText}>
          Helpful ({review.helpfulCount ?? 0})
        </Text>
      </TouchableOpacity>
    </View>

    {review.response && (
      <View style={styles.responseContainer}>
        <View style={styles.responseHeader}>
          <Text style={styles.responseLabel}>Owner Response</Text>
          <Text style={styles.responseDate}>{review.response.date}</Text>
        </View>
        <Text style={styles.responseMessage}>{review.response.message}</Text>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarInitial: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.accent,
  },
  userName: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 1,
  },
  separator: {
    marginHorizontal: 6,
    color: ShopColors.disabled,
    fontSize: 12,
  },
  reviewDate: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.accent,
  },
  comment: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textPrimary,
    lineHeight: 22,
    marginBottom: 12,
  },
  imageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 12,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    margin: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  helpfulText: {
    marginLeft: 6,
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textSecondary,
  },
  responseContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  responseLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textPrimary,
  },
  responseDate: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
  },
  responseMessage: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    lineHeight: 20,
  },
});

export default ShopDetailReviewCard;
