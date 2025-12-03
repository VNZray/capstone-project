import { ShopColors } from '@/constants/color';
import type { BusinessProfileMenuItem, BusinessProfileView } from '@/components/shops/details/types';
import {
  ShopDetailInfoSection,
  ShopDetailMenuSection,
  ShopDetailPhotosSection,
  ShopDetailPromotionsSection,
  ShopDetailReviewsSection,
} from '@/components/shops/details/sections';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '@/context/CartContext';
import { usePreventDoubleNavigation } from '@/hooks/usePreventDoubleNavigation';
import { Routes } from '@/routes/mainRoutes';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const HERO_HEIGHT = 280;
const COLLAPSED_HEADER_HEIGHT = 60;

interface TabContentItem {
  key: string;
  content: React.ReactNode;
}

interface ShopDetailProps {
  shop: BusinessProfileView;
  onFavoriteToggle?: () => void;
  onShare?: () => void;
  onCall?: () => void;
  onDirections?: () => void;
  onWebsite?: () => void;
}

const ShopDetail: React.FC<ShopDetailProps> = ({
  shop,
  onFavoriteToggle,
  onShare,
  onCall,
  onDirections,
  onWebsite,
}) => {
  const { addToCart, getTotalItems } = useCart();
  const { push, back, isNavigating } = usePreventDoubleNavigation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState<BusinessProfileMenuItem | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'menu', title: 'Offers' },
    { key: 'promotions', title: 'Promos' },
    { key: 'info', title: 'Info' },
    { key: 'reviews', title: 'Reviews' },
    { key: 'photos', title: 'Photos' },
  ]);

  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isCollapsedHeaderVisible, setIsCollapsedHeaderVisible] = useState(false);
  const [isFavorited, setIsFavorited] = useState(shop.isFavorited ?? false);

  const handleFavoriteToggle = useCallback(() => {
    setIsFavorited((prev) => !prev);
    onFavoriteToggle?.();
  }, [onFavoriteToggle]);

  const handleShare = useCallback(() => onShare?.(), [onShare]);
  const handleCall = useCallback(() => onCall?.(), [onCall]);
  const handleDirections = useCallback(() => onDirections?.(), [onDirections]);
  const handleWebsite = useCallback(() => onWebsite?.(), [onWebsite]);

  const handleMenuItemPress = useCallback((item: BusinessProfileMenuItem) => {
    setSelectedMenuItem(item);
    setQuantity(1);
    setSpecialRequests('');
  }, []);

  const handleQuantityChange = useCallback((delta: number) => {
    if (!selectedMenuItem?.productData) return;
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= selectedMenuItem.productData.current_stock) {
      setQuantity(newQuantity);
    }
  }, [quantity, selectedMenuItem]);

  const handleAddToCart = useCallback(() => {
    if (!selectedMenuItem?.productData) return;

    const productData = selectedMenuItem.productData;

    if (!selectedMenuItem.isAvailable || productData.is_unavailable) {
      Alert.alert('Unavailable', 'This product is currently not available for ordering.');
      return;
    }

    try {
      // Create a Product object compatible with CartContext
      const product = {
        id: selectedMenuItem.id,
        business_id: productData.business_id,
        name: productData.name,
        price: productData.price,
        status: productData.status as 'active' | 'inactive' | 'out_of_stock',
        current_stock: productData.current_stock,
        image_url: productData.image_url || null,
        is_unavailable: productData.is_unavailable,
        description: selectedMenuItem.description || null,
        product_category_id: undefined,
        created_at: '',
        updated_at: '',
      };

      addToCart(product, quantity, specialRequests || undefined);

      Alert.alert(
        'Added to Cart',
        `${quantity}x ${selectedMenuItem.item} added to your cart`,
        [
          { text: 'Continue Shopping', style: 'cancel', onPress: () => setSelectedMenuItem(null) },
          {
            text: 'View Cart',
            onPress: () => {
              setSelectedMenuItem(null);
              push(Routes.shop.cart);
            },
          },
        ]
      );

      setQuantity(1);
      setSpecialRequests('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add to cart');
    }
  }, [selectedMenuItem, quantity, specialRequests, addToCart]);

  const handleImagePress = useCallback((imageUrl: string) => {
    setSelectedImage(imageUrl);
  }, []);

  const handleReviewHelpful = useCallback((reviewId: string) => {
    console.log(`Review ${reviewId} marked as helpful`);
  }, []);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT - 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const collapsedHeaderOpacity = scrollY.interpolate({
    inputRange: [HERO_HEIGHT - 100, HERO_HEIGHT],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const collapsedHeaderTranslateY = scrollY.interpolate({
    inputRange: [HERO_HEIGHT - 100, HERO_HEIGHT],
    outputRange: [-COLLAPSED_HEADER_HEIGHT, 0],
    extrapolate: 'clamp',
  });

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setIsCollapsedHeaderVisible(offsetY > HERO_HEIGHT - 100);
      },
    }
  );

  const renderTabContent = useCallback(() => {
    switch (index) {
      case 0:
        return (
          <ShopDetailMenuSection
            shop={shop}
            onMenuItemPress={handleMenuItemPress}
          />
        );
      case 1:
        return <ShopDetailPromotionsSection shop={shop} />;
      case 2:
        return (
          <ShopDetailInfoSection
            shop={shop}
            onDirectionsPress={handleDirections}
          />
        );
      case 3:
        return (
          <ShopDetailReviewsSection
            shop={shop}
            onImagePress={handleImagePress}
            onHelpfulPress={handleReviewHelpful}
          />
        );
      case 4:
        return (
          <ShopDetailPhotosSection shop={shop} onImagePress={handleImagePress} />
        );
      default:
        return <View />;
    }
  }, [handleDirections, handleImagePress, handleMenuItemPress, handleReviewHelpful, index, shop]);

  const renderListHeader = useMemo(
    () => (
      <>
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: shop.coverImage || shop.image || 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200' }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.shopInfoOverlay}
          >
            <View style={styles.shopMainInfo}>
              <View style={styles.shopTitleContainer}>
                <Text style={styles.shopName}>{shop.name}</Text>
                {shop.tagline && <Text style={styles.shopTagline}>{shop.tagline}</Text>}
              </View>
            </View>

            <View style={styles.shopMetrics}>
              <View style={styles.metric}>
                <Ionicons name="star" size={16} color={ShopColors.warning} />
                <Text style={styles.metricText}>
                  {shop.rating.toFixed(1)} ({shop.ratingCount})
                </Text>
              </View>

              {typeof shop.distance === 'number' && shop.distance > 0 && (
                <View style={styles.metric}>
                  <Ionicons name="location" size={16} color="#FFFFFF" />
                  <Text style={styles.metricText}>{shop.distance.toFixed(1)} km</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </View>

        <View style={styles.quickActionsBar}>
          {shop.contact && (
            <TouchableOpacity style={styles.quickActionButton} onPress={handleCall}>
              <Ionicons name="call" size={20} color={ShopColors.accent} />
              <Text style={styles.quickActionText}>Call</Text>
            </TouchableOpacity>
          )}

          {shop.mapLocation && (
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={handleDirections}
            >
              <Ionicons name="navigate" size={20} color={ShopColors.accent} />
              <Text style={styles.quickActionText}>Directions</Text>
            </TouchableOpacity>
          )}

          {shop.socialLinks?.website && (
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={handleWebsite}
            >
              <Ionicons name="globe" size={20} color={ShopColors.accent} />
              <Text style={styles.quickActionText}>Website</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.quickActionButton} onPress={handleShare}>
            <Ionicons name="share-social" size={20} color={ShopColors.accent} />
            <Text style={styles.quickActionText}>Share</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabNavigation}>
          {routes.map((route, i) => (
            <TouchableOpacity
              key={route.key}
              style={[styles.tabButton, index === i && styles.tabButtonActive]}
              onPress={() => setIndex(i)}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  index === i && styles.tabButtonTextActive,
                ]}
              >
                {route.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </>
    ),
    [handleCall, handleDirections, handleShare, handleWebsite, index, routes, shop]
  );

  const flatListData: TabContentItem[] = useMemo(
    () => [{ key: 'tabContent', content: renderTabContent() }],
    [renderTabContent]
  );

  const renderFlatListItem = ({ item }: { item: TabContentItem }) => (
    <View style={styles.tabContentContainer}>{item.content}</View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={flatListData}
        keyExtractor={(item) => item.key}
        renderItem={renderFlatListItem}
        ListHeaderComponent={renderListHeader}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
        contentContainerStyle={styles.flatListContent}
      />

      <Animated.View
        style={[
          styles.fixedHeaderActions,
          {
            opacity: headerOpacity,
            top: insets.top + 10,
          },
        ]}
      >
        <TouchableOpacity style={styles.headerButton} onPress={() => back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerRightActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => push(Routes.shop.cart)}
            disabled={isNavigating}
          >
            <Ionicons name="cart-outline" size={24} color="#FFFFFF" />
            {getTotalItems() > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{getTotalItems()}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleFavoriteToggle}>
            <Ionicons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorited ? ShopColors.error : '#FFFFFF'}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.collapsedHeader,
          {
            opacity: collapsedHeaderOpacity,
            transform: [{ translateY: collapsedHeaderTranslateY }],
          },
        ]}
        pointerEvents={isCollapsedHeaderVisible ? 'auto' : 'none'}
      >
        <SafeAreaView edges={['top']} style={styles.collapsedHeaderSafeArea}>
          <View style={styles.collapsedHeaderContent}>
            <TouchableOpacity
              style={styles.collapsedBackButton}
              onPress={() => back()}
            >
              <Ionicons name="arrow-back" size={24} color={ShopColors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.collapsedShopInfo}>
              <Text style={styles.collapsedShopName} numberOfLines={1}>
                {shop.name}
              </Text>
            </View>

            <View style={styles.collapsedActions}>
              <TouchableOpacity
                style={styles.collapsedActionButton}
                onPress={handleShare}
              >
                <Ionicons
                  name="share-outline"
                  size={20}
                  color={ShopColors.textSecondary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.collapsedActionButton}
                onPress={() => push(Routes.shop.cart)}
                disabled={isNavigating}
              >
                <Ionicons
                  name="cart-outline"
                  size={20}
                  color={ShopColors.textSecondary}
                />
                {getTotalItems() > 0 && (
                  <View style={styles.cartBadgeSmall}>
                    <Text style={styles.cartBadgeTextSmall}>{getTotalItems()}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.collapsedActionButton}
                onPress={handleFavoriteToggle}
              >
                <Ionicons
                  name={isFavorited ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isFavorited ? ShopColors.error : ShopColors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>

      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.imageModalContainer}>
          <TouchableOpacity
            style={styles.imageModalClose}
            onPress={() => setSelectedImage(null)}
          >
            <Ionicons name="close" size={32} color="#FFFFFF" />
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.imageModalImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      <Modal
        visible={!!selectedMenuItem}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedMenuItem(null)}
      >
        <View style={styles.menuModalContainer}>
          <View style={styles.menuModalContent}>
            <TouchableOpacity
              style={styles.menuModalClose}
              onPress={() => setSelectedMenuItem(null)}
            >
              <Ionicons name="close-circle" size={32} color={ShopColors.textSecondary} />
            </TouchableOpacity>

            {selectedMenuItem && (
              <>
                {selectedMenuItem.image && (
                  <View style={styles.menuModalImageContainer}>
                    <Image
                      source={{ uri: selectedMenuItem.image }}
                      style={styles.menuModalImage}
                      resizeMode="cover"
                    />
                    {!selectedMenuItem.isAvailable && (
                      <View style={styles.unavailableBadge}>
                        <Text style={styles.unavailableBadgeText}>Out of Stock</Text>
                      </View>
                    )}
                  </View>
                )}
                
                <View style={styles.menuModalInfo}>
                  <View style={styles.menuModalHeader}>
                    <View style={styles.menuModalTitleContainer}>
                      <Text style={styles.menuModalName}>{selectedMenuItem.item}</Text>
                      {selectedMenuItem.tags && selectedMenuItem.tags.length > 0 && (
                        <View style={styles.menuModalTags}>
                          {selectedMenuItem.tags.slice(0, 2).map((tag) => (
                            <View key={tag} style={styles.menuModalTag}>
                              <Text style={styles.menuModalTagText}>{tag}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                    <Text style={styles.menuModalPrice}>{selectedMenuItem.price}</Text>
                  </View>

                  {selectedMenuItem.description && (
                    <Text style={styles.menuModalDescription}>
                      {selectedMenuItem.description}
                    </Text>
                  )}

                  {selectedMenuItem.productData && (
                    <View style={styles.stockInfo}>
                      <Ionicons name="cube-outline" size={16} color={ShopColors.textSecondary} />
                      <Text style={styles.stockInfoText}>
                        {selectedMenuItem.productData.current_stock} units available
                      </Text>
                    </View>
                  )}

                  <View style={styles.quantitySection}>
                    <Text style={styles.quantitySectionLabel}>Quantity</Text>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                        onPress={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                      >
                        <Ionicons name="remove" size={20} color={quantity <= 1 ? ShopColors.textSecondary : ShopColors.accent} />
                      </TouchableOpacity>
                      <Text style={styles.quantityValue}>{quantity}</Text>
                      <TouchableOpacity
                        style={[
                          styles.quantityButton,
                          (!selectedMenuItem.productData || quantity >= selectedMenuItem.productData.current_stock) && styles.quantityButtonDisabled
                        ]}
                        onPress={() => handleQuantityChange(1)}
                        disabled={!selectedMenuItem.productData || quantity >= selectedMenuItem.productData.current_stock}
                      >
                        <Ionicons 
                          name="add" 
                          size={20} 
                          color={(!selectedMenuItem.productData || quantity >= selectedMenuItem.productData.current_stock) 
                            ? ShopColors.textSecondary 
                            : ShopColors.accent} 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.notesSection}>
                    <Text style={styles.notesSectionLabel}>Special Requests (Optional)</Text>
                    <View style={styles.notesInputContainer}>
                      <TextInput
                        style={styles.notesInput}
                        placeholder="e.g., no onions, extra spicy..."
                        placeholderTextColor={ShopColors.textSecondary}
                        value={specialRequests}
                        onChangeText={setSpecialRequests}
                        multiline
                        numberOfLines={2}
                        maxLength={200}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.addToCartButton,
                      !selectedMenuItem.isAvailable && styles.addToCartButtonDisabled
                    ]}
                    onPress={handleAddToCart}
                    disabled={!selectedMenuItem.isAvailable}
                  >
                    <Ionicons name="cart" size={20} color="#FFFFFF" />
                    <Text style={styles.addToCartButtonText}>
                      {selectedMenuItem.isAvailable ? 'Add to Cart' : 'Out of Stock'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  flatListContent: {
    flexGrow: 1,
  },
  tabContentContainer: {
    flex: 1,
    minHeight: screenHeight,
  },
  heroContainer: {
    height: HERO_HEIGHT,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  shopInfoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 44,
  },
  shopMainInfo: {
    marginBottom: 12,
  },
  shopTitleContainer: {
    flex: 1,
  },
  shopName: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginBottom: 4,
  },
  shopTagline: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  shopMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  fixedHeaderActions: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  headerButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 22,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: 10,
  },
  quickActionsBar: {
    flexDirection: 'row',
    backgroundColor: ShopColors.cardBackground,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: ShopColors.border,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textPrimary,
    marginTop: 4,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: ShopColors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: ShopColors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: ShopColors.accent,
  },
  tabButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textSecondary,
  },
  tabButtonTextActive: {
    color: ShopColors.accent,
    fontFamily: 'Poppins-SemiBold',
  },
  collapsedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: ShopColors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: ShopColors.border,
    zIndex: 15,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  collapsedHeaderSafeArea: {
    backgroundColor: ShopColors.cardBackground,
  },
  collapsedHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: COLLAPSED_HEADER_HEIGHT,
  },
  collapsedBackButton: {
    padding: 8,
    marginRight: 8,
  },
  collapsedShopInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  collapsedShopName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textPrimary,
  },
  collapsedActions: {
    flexDirection: 'row',
    gap: 8,
  },
  collapsedActionButton: {
    padding: 8,
  },
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalClose: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  imageModalImage: {
    width: screenWidth - 40,
    height: screenHeight - 200,
  },
  menuModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  menuModalContent: {
    backgroundColor: ShopColors.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.8,
  },
  menuModalClose: {
    alignSelf: 'flex-end',
    padding: 16,
  },
  menuModalImage: {
    width: '100%',
    height: 200,
  },
  menuModalInfo: {
    padding: 20,
  },
  menuModalName: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
    marginBottom: 8,
  },
  menuModalPrice: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.accent,
    marginBottom: 12,
  },
  menuModalDescription: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    lineHeight: 22,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: ShopColors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  cartBadgeText: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  cartBadgeSmall: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: ShopColors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeTextSmall: {
    fontSize: 9,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  menuModalImageContainer: {
    position: 'relative',
    width: '100%',
    height: 240,
  },
  unavailableBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: ShopColors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  unavailableBadgeText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  menuModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  menuModalTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  menuModalTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  menuModalTag: {
    backgroundColor: ShopColors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ShopColors.accent,
  },
  menuModalTagText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.accent,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: ShopColors.background,
    borderRadius: 8,
  },
  stockInfoText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textSecondary,
  },
  quantitySection: {
    marginTop: 20,
  },
  quantitySectionLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textPrimary,
    marginBottom: 10,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    backgroundColor: ShopColors.background,
    borderRadius: 12,
    padding: 12,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ShopColors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: ShopColors.accent,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quantityButtonDisabled: {
    borderColor: ShopColors.textSecondary,
    opacity: 0.5,
  },
  quantityValue: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
    minWidth: 40,
    textAlign: 'center',
  },
  notesSection: {
    marginTop: 20,
  },
  notesSectionLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textPrimary,
    marginBottom: 10,
  },
  notesInputContainer: {
    backgroundColor: ShopColors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 4,
  },
  notesInput: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textPrimary,
    padding: 12,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ShopColors.accent,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    shadowColor: ShopColors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addToCartButtonDisabled: {
    backgroundColor: ShopColors.textSecondary,
    shadowOpacity: 0,
  },
  addToCartButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
});

export default memo(ShopDetail);
