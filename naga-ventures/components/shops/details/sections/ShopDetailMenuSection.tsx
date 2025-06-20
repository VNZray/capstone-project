import { ShopColors } from '@/constants/ShopColors';
import type { MenuItem, ShopData } from '@/types/shop';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ShopDetailMenuItemCard } from '../elements';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ShopDetailMenuSectionProps {
  shop: ShopData;
  onMenuItemPress: (item: MenuItem) => void;
}

const ShopDetailMenuSection: React.FC<ShopDetailMenuSectionProps> = ({
  shop,
  onMenuItemPress,
}) => {
  const [showFullMenuModal, setShowFullMenuModal] = useState(false);

  // Simple menu processing - only basic properties
  const allItems = useMemo(() => {
    if (!shop?.menu || !Array.isArray(shop.menu)) {
      return [];
    }

    // Simple filter - just check for basic required properties
    const validItems = shop.menu.filter((item) => {
      return item && typeof item === 'object' && item.item && item.price;
    });

    return validItems;
  }, [shop?.menu]);

  // Empty state
  if (!shop?.menu || shop.menu.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons
          name="storefront-outline"
          size={48}
          color={ShopColors.textSecondary}
        />
        <Text style={styles.emptyStateTitle}>No Offerings Available</Text>
        <Text style={styles.emptyStateText}>
          This business hasn&apos;t listed their offerings yet.
        </Text>
      </View>
    );
  }

  if (allItems.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="warning-outline" size={48} color={ShopColors.warning} />
        <Text style={styles.emptyStateTitle}>Menu Data Issue</Text>
        <Text style={styles.emptyStateText}>
          Unable to load menu items. Please try again later.
        </Text>
      </View>
    );
  }

  const renderItem = ({ item, index }: { item: MenuItem; index: number }) => {
    if (!item) {
      return null;
    }

    return <ShopDetailMenuItemCard item={item} onPress={onMenuItemPress} />;
  };

  const renderModalMenuItem = ({
    item,
    index,
  }: {
    item: MenuItem;
    index: number;
  }) => {
    if (!item) {
      return null;
    }

    const itemName = item.item || 'Unknown Item';
    const itemPrice = item.price || 'Price not available';
    const itemDescription = item.description || '';
    const itemImage = item.image;

    return (
      <View style={styles.modalMenuItem}>
        <View style={styles.modalItemContent}>
          {/* Image */}
          <View style={styles.modalImageContainer}>
            {itemImage ? (
              <Image
                source={{ uri: itemImage }}
                style={styles.modalItemImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.modalPlaceholderImage}>
                <Ionicons
                  name="restaurant-outline"
                  size={20}
                  color={ShopColors.textSecondary}
                />
              </View>
            )}
          </View>

          {/* Content */}
          <View style={styles.modalItemInfo}>
            <View style={styles.modalItemHeader}>
              <Text style={styles.modalItemName} numberOfLines={1}>
                {itemName}
              </Text>
              <Text style={styles.modalItemPrice}>{itemPrice}</Text>
            </View>

            {itemDescription ? (
              <Text style={styles.modalItemDescription} numberOfLines={2}>
                {itemDescription}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.offeringsSection}>
        {/* Header with Menu Button - FIXED ALIGNMENT */}
        <View style={styles.sectionHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.sectionTitle}>Our Curated Offers</Text>
            <Text style={styles.sectionSubtitle}>
              Handpicked selections from our menu ({allItems.length} items)
            </Text>
          </View>

          {/* CENTERED Menu Button */}
          <View style={styles.menuButtonContainer}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setShowFullMenuModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="restaurant" size={18} color="#FFFFFF" />
              <Text style={styles.menuButtonText}>MENU</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Items List */}
        <FlatList
          data={allItems}
          keyExtractor={(item, index) => item?.id || `menu-${index}`}
          scrollEnabled={false}
          contentContainerStyle={styles.listContainer}
          renderItem={renderItem}
          removeClippedSubviews={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      </View>

      {/* Full Menu Modal - IMPROVED LAYOUT */}
      <Modal
        visible={showFullMenuModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFullMenuModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header - CENTERED */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <View style={styles.modalTitleContainer}>
                  <Text style={styles.modalTitle}>Full Menu</Text>
                  <Text style={styles.modalSubtitle}>
                    {shop.name} • {allItems.length} items
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowFullMenuModal(false)}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={ShopColors.textPrimary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Menu Items in Modal - IMPROVED SPACING */}
            <ScrollView
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              <FlatList
                data={allItems}
                keyExtractor={(item, index) => `modal-${item?.id || index}`}
                scrollEnabled={false}
                contentContainerStyle={styles.modalListContainer}
                renderItem={renderModalMenuItem}
                ItemSeparatorComponent={() => (
                  <View style={styles.modalItemSeparator} />
                )}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ShopColors.background,
  },
  offeringsSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // Section Header with Menu Button - FIXED ALIGNMENT
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center', // Changed from 'flex-start' to 'center'
    justifyContent: 'space-between',
    marginBottom: 16,
    minHeight: 50, // Ensure consistent height
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
    justifyContent: 'center', // Center text vertically
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textPrimary,
    marginBottom: 4,
    lineHeight: 22, // Consistent line height
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    lineHeight: 18,
  },

  // CENTERED Menu Button Container
  menuButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButton: {
    backgroundColor: ShopColors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center content inside button
    paddingHorizontal: 16,
    paddingVertical: 12, // Slightly increased padding
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 80, // Minimum width for consistent size
  },
  menuButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    marginLeft: 6,
  },

  // List
  listContainer: {
    paddingBottom: 20,
  },

  // Empty States
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Modal Styles - IMPROVED LAYOUT
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: ShopColors.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.85,
    minHeight: screenHeight * 0.6,
  },

  // CENTERED Modal Header
  modalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: ShopColors.border,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center', // Center align items
    justifyContent: 'space-between',
  },
  modalTitleContainer: {
    flex: 1,
    alignItems: 'flex-start', // Keep text left-aligned but container centered
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
    marginBottom: 2,
    lineHeight: 24,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    lineHeight: 18,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: ShopColors.background,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },

  // IMPROVED Modal Content
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    flexGrow: 1,
  },
  modalListContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  // Modal Menu Items (Compact Style) - IMPROVED SPACING
  modalMenuItem: {
    backgroundColor: ShopColors.background,
    borderRadius: 10, // Slightly more rounded
    padding: 14, // Increased padding
    borderWidth: 1,
    borderColor: ShopColors.border,
  },
  modalItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalImageContainer: {
    width: 50, // Slightly larger
    height: 50,
    marginRight: 14, // More spacing
  },
  modalItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8, // More rounded
    backgroundColor: ShopColors.cardBackground,
  },
  modalPlaceholderImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: ShopColors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ShopColors.border,
  },
  modalItemInfo: {
    flex: 1,
  },
  modalItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6, // More spacing
  },
  modalItemName: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textPrimary,
    flex: 1,
    marginRight: 12,
    lineHeight: 20,
  },
  modalItemPrice: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.accent,
  },
  modalItemDescription: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    lineHeight: 16,
  },
  modalItemSeparator: {
    height: 10, // Increased separator height
  },
});

export default React.memo(ShopDetailMenuSection);
