import { ShopColors } from '@/constants/ShopColors';
import type { ShopPromotion } from '@/types/shop';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface ShopDetailPromotionCardProps {
  promotion: ShopPromotion;
  currentDate?: Date;
}

const ShopDetailPromotionCard: React.FC<ShopDetailPromotionCardProps> = ({
  promotion,
  currentDate = new Date('2025-06-03T16:48:11Z'), // Current UTC time
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Invalid date provided to formatDate:', dateString);
        return dateString;
      }
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      console.error('Error formatting date:', dateString, e);
      return dateString;
    }
  };

  const getDaysRemaining = (dateString?: string) => {
    if (!dateString) return null;

    try {
      const expiryDate = new Date(dateString);
      if (isNaN(expiryDate.getTime())) return null;
      const diffTime = expiryDate.getTime() - currentDate.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return null;
    }
  };

  const isExpiringToday = (dateString?: string) => {
    if (!dateString) return false;

    try {
      const expiryDate = new Date(dateString);
      if (isNaN(expiryDate.getTime())) return false;
      const diffTime = expiryDate.getTime() - currentDate.getTime();
      const diffHours = diffTime / (1000 * 60 * 60);
      return diffHours > 0 && diffHours <= 24;
    } catch {
      return false;
    }
  };

  const isExpiringSoon = (dateString?: string) => {
    if (!dateString) return false;

    try {
      const expiryDate = new Date(dateString);
      if (isNaN(expiryDate.getTime())) return false;
      const diffTime = expiryDate.getTime() - currentDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 7;
    } catch {
      return false;
    }
  };

  const daysRemaining = getDaysRemaining(promotion.validUntil);
  const expiringToday = isExpiringToday(promotion.validUntil);
  const expiringSoon = isExpiringSoon(promotion.validUntil);

  return (
    <View
      style={[styles.promotionCard, expiringToday && styles.expiringTodayCard]}
    >
      {/* Header */}
      <View style={styles.promotionHeader}>
        <View style={styles.promotionTitleContainer}>
          <View style={styles.promotionIconContainer}>
            <Ionicons name="pricetag" size={16} color={ShopColors.accent} />
          </View>
          <Text
            style={styles.promotionTitle}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {promotion.title || 'Special Promotion'}
          </Text>
        </View>

        {/* Discount Badge */}
        {typeof promotion.discountPercent === 'number' &&
          promotion.discountPercent > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                {`${promotion.discountPercent.toString()}% OFF`}
              </Text>
            </View>
          )}
      </View>

      {/* Urgent Badge */}
      {expiringToday && (
        <View style={styles.urgentBadge}>
          <Ionicons name="warning" size={14} color="#FFFFFF" />
          <Text style={styles.urgentText}>ENDS TODAY!</Text>
        </View>
      )}

      {/* Promotion Image */}
      {promotion.image && (
        <View style={styles.promotionImageContainer}>
          <Image
            source={{ uri: promotion.image }}
            style={styles.promotionImage}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Description */}
      <Text
        style={styles.promotionDescription}
        numberOfLines={3}
        ellipsizeMode="tail"
      >
        {promotion.description ||
          'Special promotion available now! Check details.'}
      </Text>

      {/* Details Section */}
      <View style={styles.promotionDetails}>
        {/* Validity */}
        {promotion.validUntil && (
          <View style={styles.detailRow}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={
                expiringToday
                  ? ShopColors.error
                  : expiringSoon
                    ? ShopColors.warning
                    : ShopColors.textSecondary
              }
            />
            <View style={styles.validityContainer}>
              <Text
                style={[
                  styles.detailText,
                  expiringToday && styles.expiringTodayText,
                  expiringSoon && !expiringToday && styles.expiringSoonText,
                ]}
              >
                Valid until {formatDate(promotion.validUntil)}
              </Text>

              {/* Days remaining */}
              {daysRemaining !== null &&
                daysRemaining >= 0 &&
                daysRemaining <= 7 && (
                  <Text
                    style={[
                      styles.daysRemainingText,
                      expiringToday && styles.expiringTodayText,
                      expiringSoon && !expiringToday && styles.expiringSoonText,
                    ]}
                  >
                    {daysRemaining === 0
                      ? 'Expires today!'
                      : daysRemaining === 1
                        ? 'Expires tomorrow!'
                        : `${daysRemaining.toString()} days left`}
                  </Text>
                )}
            </View>
          </View>
        )}

        {/* Terms */}
        {promotion.terms && (
          <View style={styles.detailRow}>
            <Ionicons
              name="information-circle-outline"
              size={14}
              color={ShopColors.textSecondary}
            />
            <Text
              style={styles.detailText}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {promotion.terms}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  promotionCard: {
    backgroundColor: ShopColors.cardBackground || '#FFFFFF',
    borderRadius: 12,
    // borderWidth: 1, // Removed border
    // borderColor: ShopColors.border || '#E0E0E0', // Removed border color
    overflow: 'hidden',
    // shadowColor: '#000', // Removed shadow
    // shadowOffset: { width: 0, height: 1 }, // Removed shadow
    // shadowOpacity: 0.05, // Removed shadow
    // shadowRadius: 2, // Removed shadow
    // elevation: 2, // Removed elevation for Android
    marginBottom: 16,
    borderBottomWidth: 1, // Added a subtle bottom border for separation
    borderBottomColor: ShopColors.border || '#E0E0E0', // Subtle bottom border color
  },
  expiringTodayCard: {
    borderColor: ShopColors.error || '#D32F2F', // Keep border for emphasis if expiring today
    borderWidth: 2, // Keep border for emphasis if expiring today
    borderBottomWidth: 2, // Ensure bottom border is also emphasized
    borderBottomColor: ShopColors.error || '#D32F2F',
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ShopColors.error || '#D32F2F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  urgentText: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  promotionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 12,
  },
  promotionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    gap: 8,
  },
  promotionIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: (ShopColors.accent || '#007AFF') + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promotionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textPrimary || '#1A1A1A',
    flex: 1,
  },
  discountBadge: {
    backgroundColor: ShopColors.error || '#D32F2F',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  discountText: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  promotionImageContainer: {
    // Full width image container
  },
  promotionImage: {
    width: '100%',
    height: 150,
  },
  promotionDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textPrimary || '#333333',
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  promotionDetails: {
    // Removed top border as the main card border is now primarily bottom
    // borderTopWidth: 1, 
    // borderTopColor: ShopColors.border || '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  validityContainer: {
    flex: 1,
  },
  detailText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary || '#555555',
    lineHeight: 18,
  },
  daysRemainingText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    marginTop: 4,
  },
  expiringSoonText: {
    color: ShopColors.warning || '#FFA000',
  },
  expiringTodayText: {
    color: ShopColors.error || '#D32F2F',
  },
});

export default React.memo(ShopDetailPromotionCard);