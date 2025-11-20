import type { BusinessProfileView } from '@/components/shops/details/types';
import { ShopColors } from '@/constants/ShopColors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Linking, Alert } from 'react-native';

interface ShopDetailContactInfoProps {
  shop: BusinessProfileView;
  onDirectionsPress?: () => void;
}

const ShopDetailContactInfo: React.FC<ShopDetailContactInfoProps> = ({
  shop,
  onDirectionsPress,
}) => {
  const handleLinkPress = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `Cannot open link: ${url}`);
      }
    } catch (err) {
      console.error('An error occurred', err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Ionicons name="call" size={20} color={ShopColors.accent} />
          <Text style={styles.cardTitle}>Contact & Info</Text>
        </View>

        <View style={styles.contentList}>
          {/* Phone */}
          {shop.contact && (
            <TouchableOpacity 
              style={styles.infoRow}
              onPress={() => handleLinkPress(`tel:${shop.contact}`)}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="call-outline" size={20} color={ShopColors.accent} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{shop.contact}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={ShopColors.textSecondary} />
            </TouchableOpacity>
          )}

          {/* Email */}
          {shop.email && (
            <TouchableOpacity 
              style={styles.infoRow}
              onPress={() => handleLinkPress(`mailto:${shop.email}`)}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="mail-outline" size={20} color={ShopColors.accent} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{shop.email}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={ShopColors.textSecondary} />
            </TouchableOpacity>
          )}

          {/* Website */}
          {shop.socialLinks?.website && (
            <TouchableOpacity 
              style={styles.infoRow}
              onPress={() => handleLinkPress(shop.socialLinks!.website!)}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="globe-outline" size={20} color={ShopColors.accent} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Website</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{shop.socialLinks.website}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={ShopColors.textSecondary} />
            </TouchableOpacity>
          )}

          {/* Social Media */}
          {(shop.socialLinks?.facebook || shop.socialLinks?.instagram || shop.socialLinks?.x) && (
             <View style={styles.socialSection}>
               <Text style={styles.socialLabel}>Social Links</Text>
               <View style={styles.socialRow}>
                 {shop.socialLinks.facebook && (
                   <TouchableOpacity 
                     style={styles.socialButton}
                     onPress={() => handleLinkPress(shop.socialLinks!.facebook!)}
                   >
                     <MaterialCommunityIcons name="facebook" size={22} color="#1877F2" />
                     <Text style={styles.socialButtonText}>Facebook</Text>
                   </TouchableOpacity>
                 )}
                 {shop.socialLinks.instagram && (
                   <TouchableOpacity 
                     style={styles.socialButton}
                     onPress={() => handleLinkPress(shop.socialLinks!.instagram!)}
                   >
                     <MaterialCommunityIcons name="instagram" size={22} color="#E4405F" />
                     <Text style={styles.socialButtonText}>Instagram</Text>
                   </TouchableOpacity>
                 )}
                 {shop.socialLinks.x && (
                   <TouchableOpacity 
                     style={styles.socialButton}
                     onPress={() => handleLinkPress(shop.socialLinks!.x!)}
                   >
                     <MaterialCommunityIcons name="twitter" size={22} color="#1DA1F2" />
                     <Text style={styles.socialButtonText}>Twitter</Text>
                   </TouchableOpacity>
                 )}
               </View>
             </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
  },
  card: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
  },
  contentList: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textPrimary,
  },
  socialSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  socialLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textSecondary,
    marginBottom: 12,
  },
  socialRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    gap: 8,
  },
  socialButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textPrimary,
  },
});

export default ShopDetailContactInfo;
