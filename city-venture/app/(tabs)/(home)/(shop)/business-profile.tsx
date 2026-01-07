import ShopDetail from '@/components/shops/details/ShopDetail';
import ErrorState from '@/components/shops/details/ErrorState';
import ShopNotFound from '@/components/shops/details/ShopNotFound';
import ShopDetailSkeleton from '@/components/shops/details/skeletons/ShopDetailSkeleton';
import type {
  BusinessProfileView,
  BusinessProfileMenuItem,
  BusinessProfileMenuCategory,
  BusinessProfilePromotion,
  BusinessProfileReview,
  BusinessProfileGalleryItem,
  BusinessProfileAmenity,
  BusinessProfileHours,
  BusinessProfileRatingBreakdown,
  BusinessProfileOperatingStatus,
  BusinessProfileService,
} from '@/components/shops/details/types';
import { fetchBusinessDetails } from '@/services/BusinessService';
import { fetchProductsByBusinessId } from '@/services/ProductService';
import { fetchPromotionsByBusinessId } from '@/services/PromotionService';
import { fetchBusinessHours } from '@/services/BusinessHoursService';
import { fetchBusinessAmenities } from '@/services/AmenityService';
import { fetchServicesByBusinessId } from '@/services/ServiceService';
import {
  fetchBusinessReviewStats,
  fetchReviewsByBusinessId,
  type ProductReview,
} from '@/services/ProductReviewService';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, Share } from 'react-native';
import type { Business } from '@/types/Business';
import type { Product } from '@/types/Product';
import type { Promotion } from '@/types/Promotion';
import type { Service } from '@/types/Service';

// ============ DATA TRANSFORMATION UTILITIES ============

/**
 * Transform backend Business + Products into menu categories
 */
function transformMenuData(products: Product[]): BusinessProfileMenuCategory[] {
  if (!products.length) return [];

  // Group products by category
  const categoryMap = new Map<string, BusinessProfileMenuItem[]>();

  products.forEach((product) => {
    const categoryName = product.category_name || 'Uncategorized';
    const existing = categoryMap.get(categoryName) || [];

    const currentStock =
      typeof product.current_stock === 'string'
        ? parseInt(product.current_stock)
        : product.current_stock || 0;
    const isTemporarilyUnavailable =
      typeof product.is_unavailable === 'string'
        ? product.is_unavailable === '1'
        : Boolean(product.is_unavailable);
    const isAvailable =
      product.status === 'active' &&
      currentStock > 0 &&
      !isTemporarilyUnavailable;

    const menuItem: BusinessProfileMenuItem = {
      id: product.id,
      item: product.name,
      price: `₱${Number(product.price).toFixed(2)}`,
      description: product.description || undefined,
      category: categoryName,
      image: product.image_url || undefined,
      isPopular: false, // Placeholder - no backend field for this
      isBestseller: false, // Placeholder
      isAvailable,
      tags: product.categories?.map((c) => c.name) || [],
      // Store product data for cart operations
      productData: {
        business_id: product.business_id,
        status: product.status,
        current_stock: currentStock,
        name: product.name,
        price:
          typeof product.price === 'string'
            ? parseFloat(product.price)
            : product.price,
        image_url: product.image_url,
        is_unavailable: isTemporarilyUnavailable,
      },
    };

    existing.push(menuItem);
    categoryMap.set(categoryName, existing);
  });

  // Convert map to array of categories
  return Array.from(categoryMap.entries()).map(([category, items], index) => ({
    id: `cat-${index}`,
    category,
    description: undefined,
    items,
  }));
}

/**
 * Transform backend Promotion[] into BusinessProfilePromotion[]
 */
function transformPromotions(
  promotions: Promotion[]
): BusinessProfilePromotion[] {
  return promotions.map((promo) => ({
    id: promo.id,
    title: promo.title,
    description: promo.description,
    discountPercent: undefined, // Placeholder - no discount field in backend
    validUntil: promo.end_date
      ? new Date(promo.end_date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : undefined,
    terms: promo.terms_conditions || undefined,
    isActive: Boolean(promo.is_active),
    image: promo.image_url || undefined,
  }));
}

/**
 * Transform backend Service[] into BusinessProfileService[]
 */
function transformServices(services: Service[]): BusinessProfileService[] {
  return services.map((service) => {
    // Parse contact_methods if it's a string
    let contactMethods: { type: string; value: string }[] = [];
    if (service.contact_methods) {
      if (typeof service.contact_methods === 'string') {
        try {
          contactMethods = JSON.parse(service.contact_methods);
        } catch {
          contactMethods = [];
        }
      } else if (Array.isArray(service.contact_methods)) {
        contactMethods = service.contact_methods;
      }
    }
    
    return {
      id: service.id,
      name: service.name,
      description: service.description || undefined,
      image: service.image_url || undefined,
      basePrice: typeof service.base_price === 'string' 
        ? parseFloat(service.base_price) 
        : service.base_price || 0,
      priceType: service.price_type || 'fixed',
      requirements: service.requirements || undefined,
      contactMethods,
      contactNotes: service.contact_notes || undefined,
      status: service.status || 'active',
      categoryName: service.category_name || undefined,
    };
  });
}

/**
 * Transform backend product reviews into BusinessProfileReview[]
 */
function transformReviews(reviews: ProductReview[]): BusinessProfileReview[] {
  if (!Array.isArray(reviews)) {
    return [];
  }

  return reviews.map((review, index) => ({
    id: review.id || `review-${index}`, // Fallback ID if missing
    userId: review.user_id || 'unknown',
    userName: 'Anonymous User', // Backend doesn't include user name in review response
    userAvatar: undefined,
    rating: typeof review.rating === 'number' ? review.rating : 0,
    comment: review.review_text || review.review_title || '',
    date: new Date(review.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    images: [], // Backend doesn't support review images yet
    helpfulCount: undefined,
    isVerifiedPurchase: review.is_verified_purchase || false,
    response: undefined, // Backend doesn't support owner responses yet
  }));
}

/**
 * Transform backend gallery images (PLACEHOLDER - no gallery table in backend)
 */
function transformGallery(business: Business): BusinessProfileGalleryItem[] {
  const items: BusinessProfileGalleryItem[] = [];

  if (business.business_image) {
    items.push({
      id: 'cover',
      url: business.business_image,
      caption: business.business_name,
      type: 'shop',
      isCustomerPhoto: false,
    });
  }

  // Placeholder additional images
  return items;
}

/**
 * Transform backend amenities
 */
function transformAmenities(
  amenities: {
    id?: number;
    business_id: string;
    amenity_id: number;
    name: string;
  }[]
): BusinessProfileAmenity[] {
  return amenities.map((amenity) => ({
    id: String(amenity.amenity_id),
    name: amenity.name,
    icon: 'checkmark-circle', // Placeholder - backend has no icon field
    available: true,
  }));
}

/**
 * Transform backend business hours
 * Backend returns: { id, business_id, day_of_week, open_time, close_time, is_open }
 */
function transformBusinessHours(hours: any[]): BusinessProfileHours {
  const transformed: BusinessProfileHours = {};
  const dayMap: Record<string, keyof BusinessProfileHours> = {
    monday: 'monday',
    tuesday: 'tuesday',
    wednesday: 'wednesday',
    thursday: 'thursday',
    friday: 'friday',
    saturday: 'saturday',
    sunday: 'sunday',
  };

  hours.forEach((h) => {
    const dayKey = h.day_of_week?.toLowerCase();
    if (dayKey && dayMap[dayKey]) {
      transformed[dayMap[dayKey]] = {
        open: h.open_time || '00:00',
        close: h.close_time || '00:00',
        isClosed: !h.is_open,
      };
    }
  });

  return transformed;
}

/**
 * Calculate operating status from business hours
 */
function calculateOperatingStatus(
  hours: BusinessProfileHours
): BusinessProfileOperatingStatus {
  const now = new Date();
  const dayNames: (keyof BusinessProfileHours)[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  const todayKey = dayNames[now.getDay()];
  const todayHours = hours[todayKey];

  if (!todayHours || todayHours.isClosed) {
    return {
      label: 'Closed',
      isOpen: false,
      nextOpening: 'See schedule for hours',
    };
  }

  // Simple open/closed check (could be enhanced with actual time parsing)
  return {
    label: 'Open',
    isOpen: true,
  };
}

/**
 * Transform review stats into rating breakdown
 */
function transformRatingBreakdown(stats: any): {
  breakdown: BusinessProfileRatingBreakdown;
  average: number;
  count: number;
} {
  if (!stats?.overall_statistics) {
    return {
      breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      average: 0,
      count: 0,
    };
  }

  const overall = stats.overall_statistics;

  // Use the overall statistics breakdown from backend
  const breakdown: BusinessProfileRatingBreakdown = {
    5: parseInt(overall.five_star) || 0,
    4: parseInt(overall.four_star) || 0,
    3: parseInt(overall.three_star) || 0,
    2: parseInt(overall.two_star) || 0,
    1: parseInt(overall.one_star) || 0,
  };

  return {
    breakdown,
    average: parseFloat(overall.average_rating) || 0,
    count: parseInt(overall.total_reviews) || 0,
  };
}

// ============ MAIN COMPONENT ============

export default function BusinessProfileScreen() {
  const { businessId } = useLocalSearchParams<{ businessId: string }>();

  const [view, setView] = useState<BusinessProfileView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBusinessProfile = useCallback(async () => {
    if (!businessId) {
      setError('No business ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [
        business,
        products,
        promotions,
        allHours,
        amenities,
        reviewStats,
        reviewsData,
        servicesData,
      ] = await Promise.all([
        fetchBusinessDetails(businessId),
        fetchProductsByBusinessId(businessId).catch(() => []),
        fetchPromotionsByBusinessId(businessId).catch(() => []),
        fetchBusinessHours(businessId).catch(() => []),
        fetchBusinessAmenities(businessId).catch(() => []),
        fetchBusinessReviewStats(businessId).catch(() => null),
        fetchReviewsByBusinessId(businessId).catch(() => []),
        fetchServicesByBusinessId(businessId).catch(() => []),
      ]);

      // Filter hours for this specific business (backend returns all hours)
      const hours = allHours.filter((h: any) => h.business_id === businessId);

      // Transform data into UI view model
      const menu = transformMenuData(products);
      const promos = transformPromotions(promotions);
      const reviews = transformReviews(reviewsData);
      const gallery = transformGallery(business);
      const amenitiesTransformed = transformAmenities(amenities);
      const businessHours = transformBusinessHours(hours);
      const operatingStatus = calculateOperatingStatus(businessHours);
      const servicesTransformed = transformServices(servicesData);
      const { breakdown, average, count } =
        transformRatingBreakdown(reviewStats);

      const profileView: BusinessProfileView = {
        id: business.id || '',
        name: business.business_name,
        businessId: business.id || '',
        tagline: business.description || undefined,
        description: business.description || undefined,
        story: undefined, // Placeholder
        coverImage: business.business_image || undefined,
        image: business.business_image || undefined,
        logo: undefined, // Placeholder
        rating: typeof average === 'number' && !isNaN(average) ? average : 0,
        ratingCount: typeof count === 'number' && !isNaN(count) ? count : 0,
        ratingBreakdown: breakdown,
        distance: undefined, // Placeholder - requires user location
        category:
          business.categories && business.categories.length > 0
            ? business.categories[0].category_title
            : undefined, // Uses entity_categories
        priceRange:
          business.min_price && business.max_price
            ? `₱${business.min_price} - ₱${business.max_price}`
            : undefined,
        contact: business.phone_number || undefined,
        email: business.email || undefined,
        location: business.address || undefined,
        mapLocation:
          business.latitude && business.longitude
            ? {
                latitude: parseFloat(business.latitude),
                longitude: parseFloat(business.longitude),
              }
            : null,
        socialLinks: {
          facebook: business.facebook_url || undefined,
          instagram: business.instagram_url || undefined,
          website: business.website_url || undefined,
          x: business.x_url || undefined,
        },
        promotions: promos,
        menu,
        services: servicesTransformed,
        reviews,
        gallery,
        amenities: amenitiesTransformed,
        businessHours,
        operatingStatus,
        verification: undefined, // Placeholder
        stats: undefined, // Placeholder
        isFavorited: false, // Placeholder
      };

      setView(profileView);
    } catch (err: any) {
      console.error('[BusinessProfile] Load error:', err);
      setError(err.message || 'Failed to load business profile');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    loadBusinessProfile();
  }, [loadBusinessProfile]);

  const handleFavoriteToggle = useCallback(() => {
    // TODO: Implement favorite persistence
    console.log('Toggle favorite');
  }, []);

  const handleShare = useCallback(async () => {
    if (!view) return;
    try {
      await Share.share({
        message: `Check out ${view.name} on City Venture!`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  }, [view]);

  const handleCall = useCallback(() => {
    if (!view?.contact) {
      Alert.alert('No Contact', 'Contact number not available');
      return;
    }
    Linking.openURL(`tel:${view.contact}`);
  }, [view]);

  const handleDirections = useCallback(() => {
    if (!view?.mapLocation) {
      Alert.alert('No Location', 'Location not available');
      return;
    }
    const { latitude, longitude } = view.mapLocation;
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    );
  }, [view]);

  const handleWebsite = useCallback(() => {
    if (!view?.socialLinks?.website) {
      Alert.alert('No Website', 'Website not available');
      return;
    }
    Linking.openURL(view.socialLinks.website);
  }, [view]);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <ShopDetailSkeleton />
      </>
    );
  }

  if (error || !view) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        {error === 'No business ID provided' ? (
          <ShopNotFound />
        ) : (
          <ErrorState
            title="Unable to Load Business"
            message={
              error ||
              'Something went wrong while loading this business profile.'
            }
            onRetry={loadBusinessProfile}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ShopDetail
        shop={view}
        onFavoriteToggle={handleFavoriteToggle}
        onShare={handleShare}
        onCall={handleCall}
        onDirections={handleDirections}
        onWebsite={handleWebsite}
      />
    </>
  );
}
