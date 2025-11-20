import type { BusinessProfileView } from '@/components/shops/details/types';
import { ShopColors } from '@/constants/ShopColors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ShopDetailContactInfoProps {
  shop: BusinessProfileView;
  onDirectionsPress?: () => void;
}

const ShopDetailContactInfo: React.FC<ShopDetailContactInfoProps> = ({
  shop,
  onDirectionsPress,
}) => (
  <View style={styles.container}>
    {/* Contact & Location Section */}
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <Ionicons name="call" size={20} color={ShopColors.accent} />
        <Text style={styles.sectionTitle}>Contact & Location</Text>
      </View>

      {/* Phone Row */}
      {shop.contact && (
        <TouchableOpacity style={styles.contactRow}>
          <Ionicons name="call" size={18} color={ShopColors.textSecondary} />
          <Text style={styles.contactValue}>{shop.contact}</Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={ShopColors.textSecondary}
            style={styles.chevron}
          />
        </TouchableOpacity>
      )}

      {/* Email Row */}
      {shop.email && (
        <TouchableOpacity style={styles.contactRow}>
          <Ionicons name="mail" size={18} color={ShopColors.textSecondary} />
          <Text style={styles.contactValue}>{shop.email}</Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={ShopColors.textSecondary}
            style={styles.chevron}
          />
        </TouchableOpacity>
      )}
    </View>

    {/* Follow Section */}
    {shop.socialLinks && (
      <View style={styles.followCard}>
        <Text style={styles.followTitle}>Follow</Text>
        <View style={styles.socialLinksContainer}>
          {shop.socialLinks.facebook && (
            <TouchableOpacity style={styles.socialButton}>
              <MaterialCommunityIcons name="facebook" size={18} color="#1877F2" />
              <Text style={styles.socialButtonText}>Facebook</Text>
            </TouchableOpacity>
          )}
          {shop.socialLinks.instagram && (
            <TouchableOpacity style={styles.socialButton}>
              <MaterialCommunityIcons name="instagram" size={18} color="#E4405F" />
              <Text style={styles.socialButtonText}>Instagram</Text>
            </TouchableOpacity>
          )}
          {shop.socialLinks.website && (
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="globe" size={18} color={ShopColors.accent} />
              <Text style={styles.socialButtonText}>Website</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    )}

    {/* Location Section */}
    {shop.location && (
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Ionicons name="location" size={20} color={ShopColors.accent} />
          <Text style={styles.sectionTitle}>Location</Text>
        </View>

        <Text style={styles.locationText}>{shop.location}</Text>

        <TouchableOpacity style={styles.directionsButton} onPress={onDirectionsPress}>
          <Ionicons name="navigate" size={16} color="#FFFFFF" />
          <Text style={styles.directionsButtonText}>Get Directions</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 0,
    backgroundColor: 'rgba(0,0,0,0)',
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
    marginLeft: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: ShopColors.background,
  },
  contactRow_last: {
    borderBottomWidth: 0,
  },
  contactValue: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textPrimary,
    marginLeft: 12,
  },
  chevron: {
    marginLeft: 8,
  },
  followCard: {
    borderRadius: 16,
    borderWidth: 0,
    backgroundColor: ShopColors.cardBackground,
    padding: 16,
  },
  followTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textPrimary,
    marginBottom: 12,
  },
  socialLinksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  socialButtonText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textPrimary,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: ShopColors.accent,
    gap: 6,
  },
  directionsButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#FFFFFF',
  },
});

export default ShopDetailContactInfo;
