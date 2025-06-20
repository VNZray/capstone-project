import { ShopColors } from '@/constants/ShopColors';
import type { MenuItem, ShopData } from '@/types/shop';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
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
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

// Import our organism components
import {
  ShopDetailInfoSection,
  ShopDetailMenuSection,
  ShopDetailPhotosSection,
  ShopDetailPromotionsSection,
  ShopDetailReviewsSection,
} from './details/sections';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const HERO_HEIGHT = 280;
const COLLAPSED_HEADER_HEIGHT = 60;

// Define a specific type for the FlatList data item
interface TabContentItem {
  key: string;
  content: React.ReactNode;
}

// New props interface
interface ShopDetailProps {
  shop: ShopData; // No longer nullable here, the parent will handle the 'not found' case
  onFavoriteToggle: () => void;
  onShare: () => void;
  onCall: () => void;
  onDirections: () => void;
  onWebsite: () => void;
  // ... any other callbacks needed
}

const ShopDetail: React.FC<ShopDetailProps> = ({
  shop, // The component now receives the shop data directly
  onFavoriteToggle,
  onShare,
  onCall,
  onDirections,
  onWebsite,
}) => {
  // State for UI elements is OK to keep (modals, animations)
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(
    null
  );

  // Tab Navigation State
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
  const [isCollapsedHeaderVisible, setIsCollapsedHeaderVisible] =
    useState(false);

  // The isFavorited status now comes directly from the up-to-date shop prop
  const isFavorited = shop.isFavorited;

  // These handlers ARE used in the JSX below, so they are not unused.
  const handleFavoriteToggle = () => onFavoriteToggle();
  const handleShare = () => onShare();
  const handleCall = () => onCall();
  const handleDirections = () => onDirections();
  const handleWebsite = () => onWebsite();

  const handleMenuItemPress = useCallback((item: MenuItem) => {
    setSelectedMenuItem(item);
  }, []);

  const handleImagePress = useCallback((imageUrl: string) => {
    setSelectedImage(imageUrl);
  }, []);

  const handleReviewHelpful = useCallback((reviewId: string) => {
    console.log(`Review ${reviewId} marked as helpful`);
    // In a real app, this might call a prop like onReviewHelpful(reviewId)
  }, []);

  // Animation calculations
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

  // Tab Content Renderers - Return as simple components
  const renderTabContent = () => {
    // No need to check for !shop, as it's guaranteed by the new props interface
    switch (index) {
      case 0:
        return (
          <ShopDetailMenuSection
            shop={shop}
            onMenuItemPress={handleMenuItemPress} // Use local handler
          />
        );
      case 1:
        return <ShopDetailPromotionsSection shop={shop} />;
      case 2:
        return (
          <ShopDetailInfoSection
            shop={shop}
            onDirectionsPress={onDirections} // Directly pass prop
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
          <ShopDetailPhotosSection
            shop={shop}
            onImagePress={handleImagePress}
          />
        );
      default:
        return <View />;
    }
  };

  // FlatList Header Component - Contains hero, actions, and tabs
  const renderListHeader = () => {
    return (
      <>
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: shop.coverImage || shop.image }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Shop Info Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.shopInfoOverlay}
          >
            <View style={styles.shopMainInfo}>
              <View style={styles.shopTitleContainer}>
                <Text style={styles.shopName}>{shop.name}</Text>
                {shop.tagline && (
                  <Text style={styles.shopTagline}>{shop.tagline}</Text>
                )}
              </View>
            </View>

            <View style={styles.shopMetrics}>
              <View style={styles.metric}>
                <Ionicons name="star" size={16} color={ShopColors.warning} />
                <Text style={styles.metricText}>
                  {shop.rating.toFixed(1)} ({shop.ratingCount})
                </Text>
              </View>

              {shop.distance && (
                <View style={styles.metric}>
                  <Ionicons name="location" size={16} color="#FFFFFF" />
                  <Text style={styles.metricText}>
                    {shop.distance.toFixed(1)} km
                  </Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions Bar */}
        <View style={styles.quickActionsBar}>
          {shop.contact && (
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={handleCall} // Use local handler
            >
              <Ionicons name="call" size={20} color={ShopColors.accent} />
              <Text style={styles.quickActionText}>Call</Text>
            </TouchableOpacity>
          )}

          {shop.mapLocation && (
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={handleDirections} // Use local handler
            >
              <Ionicons name="navigate" size={20} color={ShopColors.accent} />
              <Text style={styles.quickActionText}>Directions</Text>
            </TouchableOpacity>
          )}

          {shop.socialLinks?.website && (
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={handleWebsite} // Use local handler
            >
              <Ionicons name="globe" size={20} color={ShopColors.accent} />
              <Text style={styles.quickActionText}>Website</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={handleShare} // Use local handler
          >
            <Ionicons name="share-social" size={20} color={ShopColors.accent} />
            <Text style={styles.quickActionText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
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
    );
  };

  // FlatList Data - Single item containing tab content
  const flatListData: TabContentItem[] = [
    { key: 'tabContent', content: renderTabContent() },
  ];

  const renderFlatListItem = ({ item }: { item: TabContentItem }) => {
    return <View style={styles.tabContentContainer}>{item.content}</View>;
  };

  // isLoading and !shop (Not Found) states are now handled by the parent component.

  // Main Render - Using FlatList instead of ScrollView
  return (
    <View style={styles.container}>
      {/* Main FlatList - No more nested ScrollView! */}
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

      {/* Fixed Header Actions (Always Visible on Hero) */}
      <Animated.View
        style={[
          styles.fixedHeaderActions,
          {
            opacity: headerOpacity,
            top: insets.top + 10,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerRightActions}>
          {/* Corrected: use local handler, comment outside JSX element */}
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          {/* Corrected: use local handler */}
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleFavoriteToggle}
          >
            <Ionicons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorited ? ShopColors.error : '#FFFFFF'}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Collapsed Header */}
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
              onPress={() => router.back()}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={ShopColors.textPrimary}
              />
            </TouchableOpacity>

            <View style={styles.collapsedShopInfo}>
              <Text style={styles.collapsedShopName} numberOfLines={1}>
                {shop.name}
              </Text>
            </View>

            <View style={styles.collapsedActions}>
              {/* Corrected: use local handler */}
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
                onPress={handleFavoriteToggle}
              >
                <Ionicons
                  name={isFavorited ? 'heart' : 'heart-outline'}
                  size={20}
                  color={
                    isFavorited ? ShopColors.error : ShopColors.textSecondary
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* Modals */}
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
              <Ionicons name="close" size={24} color={ShopColors.textPrimary} />
            </TouchableOpacity>

            {selectedMenuItem && (
              <>
                {selectedMenuItem.image && (
                  <Image
                    source={{ uri: selectedMenuItem.image }}
                    style={styles.menuModalImage}
                  />
                )}
                <View style={styles.menuModalInfo}>
                  <Text style={styles.menuModalName}>
                    {selectedMenuItem.item}
                  </Text>
                  <Text style={styles.menuModalPrice}>
                    {selectedMenuItem.price}
                  </Text>
                  {selectedMenuItem.description && (
                    <Text style={styles.menuModalDescription}>
                      {selectedMenuItem.description}
                    </Text>
                  )}
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

  // FlatList styles
  flatListContent: {
    flexGrow: 1,
  },
  tabContentContainer: {
    flex: 1,
    minHeight: screenHeight, // Ensure content takes full height
  },

  // Hero Section
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
    paddingVertical: 20,
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

  // Fixed Header Actions
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

  // Quick Actions Bar
  quickActionsBar: {
    flexDirection: 'row',
    backgroundColor: ShopColors.cardBackground,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: ShopColors.border,
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

  // Tab Navigation
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

  // Collapsed Header
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

  // Loading & Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  notFoundTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  notFoundText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  goBackButton: {
    backgroundColor: ShopColors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  goBackButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },

  // Modals
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
});

export default React.memo(ShopDetail); // Memoize this component!
