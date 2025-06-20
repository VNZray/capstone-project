import { ShopColors } from '@/constants/ShopColors';
import type { ShopData } from '@/types/shop';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShopDetailPromotionCard } from '../elements';

interface ShopDetailPromotionsSectionProps {
  shop: ShopData;
}

const ShopDetailPromotionsSection: React.FC<
  ShopDetailPromotionsSectionProps
> = ({ shop }) => {
  const insets = useSafeAreaInsets();
  // Current date/time - UTC: 2025-06-03 16:48:11
  // Current user: malzafre
  const currentDate = new Date('2025-06-03T16:48:11Z');

  const activePromotions =
    shop.promotions?.filter((promo) => {
      if (!promo.isActive) return false;

      if (promo.validUntil) {
        try {
          const expiryDate = new Date(promo.validUntil);
          return expiryDate > currentDate;
        } catch (e) {
          console.error(
            'Invalid date format for promotion validUntil:',
            promo.validUntil,
            e
          );
          return false;
        }
      }

      return true;
    }) || [];

  // Empty state
  if (activePromotions.length === 0) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: Math.max(insets.bottom + 80, 100) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pricetag" size={20} color={ShopColors.accent} />
            <Text style={styles.sectionTitle}>Promotions</Text>
          </View>

          <View style={styles.emptyContainer}>
            <Ionicons
              name="pricetag-outline"
              size={48}
              color={ShopColors.textSecondary}
            />
            <Text style={styles.emptyTitle}>No Active Promotions</Text>
            <Text style={styles.emptyText}>
              Check back later for exciting deals and offers!
            </Text>
            <Text style={styles.lastUpdatedText}>
              Last checked:{' '}
              {currentDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  // REMOVED: expiringTodayCount and expiringSoonCount logic
  // const expiringTodayCount = activePromotions.filter((p) =>
  //   isExpiringToday(p.validUntil)
  // ).length;
  // const expiringSoonCount = activePromotions.filter(
  //   (p) => isExpiringSoon(p.validUntil) && !isExpiringToday(p.validUntil)
  // ).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: Math.max(insets.bottom + 80, 100) },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Section Header - Matches Info section style */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="pricetag" size={20} color={ShopColors.accent} />
          <Text style={styles.sectionTitle}>Promotions</Text>
          <View style={styles.headerRightContainer}>
            <Text style={styles.sectionCounter}>
              {activePromotions.length.toString()}
            </Text>
            <Text style={styles.lastUpdatedHeader}>
              {currentDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* REMOVED: Active promotions summary */}
        {/* 
        {(expiringTodayCount > 0 || expiringSoonCount > 0) && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>
              {expiringTodayCount > 0 &&
                `⚠️ ${expiringTodayCount} ending today`}
              {expiringTodayCount > 0 && expiringSoonCount > 0 && ' • '}
              {expiringSoonCount > 0 && `🔔 ${expiringSoonCount} ending soon`}
            </Text>
          </View>
        )}
        */}

        {/* Promotions List using ShopDetailPromotionCard */}
        <View style={styles.promotionsList}>
          {activePromotions.map((promotion) => (
            <ShopDetailPromotionCard
              key={promotion.id}
              promotion={promotion}
              currentDate={currentDate}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ShopColors.background || '#F4F5F7',
  },

  contentContainer: {
    flexGrow: 1,
  },

  // Section - matches Info section exactly
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },

  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textPrimary || '#1A1A1A',
  },

  headerRightContainer: {
    alignItems: 'flex-end',
    gap: 2,
  },

  sectionCounter: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.accent || '#007AFF',
  },

  lastUpdatedHeader: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
  },

  // REMOVED: summaryContainer style
  // summaryContainer: {
  //   marginBottom: 16,
  //   padding: 12,
  //   backgroundColor: ShopColors.accent + '10',
  //   borderRadius: 8,
  //   borderLeftWidth: 3,
  //   borderLeftColor: ShopColors.accent,
  // },

  // REMOVED: summaryText style
  // summaryText: {
  //   fontSize: 13,
  //   fontFamily: 'Poppins-Medium',
  //   color: ShopColors.textPrimary,
  //   lineHeight: 18,
  // },

  // Promotions List
  promotionsList: {
    // No additional styling needed, cards handle their own spacing
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textPrimary || '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary || '#555555',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },

  lastUpdatedText: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    textAlign: 'center',
  },
});

export default React.memo(ShopDetailPromotionsSection);