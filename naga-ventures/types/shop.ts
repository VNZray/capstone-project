// Shop-related TypeScript type definitions

export interface ShopMenuItem {
  id: string;
  item: string;
  price: string;
  description?: string;
  category?: string;
  image?: string;
  isPopular?: boolean;
  isBestseller?: boolean;
  isAvailable?: boolean;
  tags?: string[];
}

export interface ShopLocation {
  latitude: number;
  longitude: number;
}

export interface ShopSocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  website?: string;
  tiktok?: string;
}

export interface ShopAmenity {
  id: string;
  name: string;
  icon: string;
  available: boolean;
}

export interface ShopPromotion {
  id: string;
  title: string;
  description: string;
  discountPercent?: number;
  validUntil?: string;
  terms?: string;
  isActive: boolean;
  image?: string;
}

export interface ShopBusinessHours {
  monday: { open: string; close: string; isClosed?: boolean };
  tuesday: { open: string; close: string; isClosed?: boolean };
  wednesday: { open: string; close: string; isClosed?: boolean };
  thursday: { open: string; close: string; isClosed?: boolean };
  friday: { open: string; close: string; isClosed?: boolean };
  saturday: { open: string; close: string; isClosed?: boolean };
  sunday: { open: string; close: string; isClosed?: boolean };
}

export interface ShopGallery {
  id: string;
  url: string;
  caption?: string;
  type: 'shop' | 'product' | 'customer' | 'ambiance';
  isCustomerPhoto?: boolean;
}

export interface ShopVerification {
  isVerified: boolean;
  verificationBadges?: string[];
  businessLicense?: boolean;
  healthCertificate?: boolean;
  dtiBusiness?: boolean;
}

export interface ShopStats {
  followerCount?: number;
  viewCount?: number;
  averageResponseTime?: string; // e.g., "Within 2 hours"
  responseRate?: number; // 0-100 percentage
}

export interface ShopData {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description?: string;
  tagline?: string; // Short catchy description
  story?: string; // Longer about section

  // Images
  image: string; // Main cover image
  logo?: string;
  coverImage?: string; // Large banner image
  gallery?: ShopGallery[];
  additionalImages?: string[];

  // Rating and Reviews
  rating: number;
  ratingCount: number;
  reviews?: ShopReview[];
  ratingBreakdown?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };

  // Location and Contact
  location?: string;
  mapLocation?: ShopLocation;
  contact?: string;
  email?: string;
  socialLinks?: ShopSocialLinks;

  // Business Information
  businessHours?: ShopBusinessHours;
  openingHours?: string; // Fallback string format
  priceRange?: string;
  isOpen?: boolean;
  temporaryHours?: string; // For special announcements

  // Products/Services/Menu
  menu?: ShopMenuItem[];
  featuredItems?: string[]; // Array of menu item IDs
  menuCategories?: string[];

  // Business Features
  amenities?: ShopAmenity[];
  promotions?: ShopPromotion[];
  verification?: ShopVerification;
  stats?: ShopStats;

  // Utility
  distance?: number;
  isFavorited?: boolean;
  isBookmarkable?: boolean;
  acceptsReservations?: boolean;
  hasDelivery?: boolean;
  hasPickup?: boolean;
  tags?: string[];
}

export interface MenuItem {
  id: string;
  item: string;
  price: string;
  description?: string;
  image?: string;
  category?: string;
  isPopular?: boolean;
  isBestseller?: boolean;
  isAvailable?: boolean;
}

export interface ShopReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  images?: string[];
  helpfulCount?: number;
  isVerifiedPurchase?: boolean;
  response?: {
    message: string;
    date: string;
    isOwner: boolean;
  };
}

export interface ShopCategory {
  id: string;
  name: string;
  icon: string;
  description?: string;
  mainCategory?: string;
  mainCategoryName?: string;
  subcategories?: ShopCategory[];
}

export interface MainCategory {
  // Ensuring MainCategory is exported
  id: string;
  name: string;
  icon: string;
  description: string;
  subcategories: ShopCategory[];
}

export interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  termsAndConditions: string;
  shopId?: string; // Optional: if the offer is tied to a specific shop
  image?: string;
  discountPercent?: number;
  discountFixedAmount?: number;
  validFrom: string; // ISO date string
  validUntil: string; // ISO date string
  isActive: boolean;
  applicableToAllShops?: boolean; // If true, not tied to a specific shopId
  applicableShopIds?: string[]; // List of shop IDs if applicable to multiple specific shops
}
