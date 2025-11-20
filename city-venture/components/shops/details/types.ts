export type BusinessProfileMenuItem = {
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
  // Store original product data for cart operations
  productData?: {
    business_id: string;
    status: string;
    current_stock: number;
    name: string;
    price: number;
    image_url?: string | null;
    is_unavailable?: boolean;
  };
};

export type BusinessProfileMenuCategory = {
  id: string;
  category: string;
  description?: string;
  items: BusinessProfileMenuItem[];
};

export type BusinessProfilePromotion = {
  id: string;
  title: string;
  description: string;
  discountPercent?: number;
  validUntil?: string;
  terms?: string;
  isActive: boolean;
  image?: string;
};

export type BusinessProfileGalleryItem = {
  id: string;
  url: string;
  caption?: string;
  type?: 'shop' | 'product' | 'customer' | 'ambiance';
  isCustomerPhoto?: boolean;
};

export type BusinessProfileReview = {
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
};

export type BusinessProfileRatingBreakdown = {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
};

export type BusinessProfileDayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type BusinessProfileDayHours = {
  open: string;
  close: string;
  isClosed?: boolean;
};

export type BusinessProfileHours = {
  [K in BusinessProfileDayKey]?: BusinessProfileDayHours;
};

export type BusinessProfileAmenity = {
  id: string;
  name: string;
  icon: string;
  available: boolean;
};

export type BusinessProfileVerification = {
  isVerified: boolean;
  badges: string[];
};

export type BusinessProfileStats = {
  followerCount?: number;
  responseRate?: number;
  averageResponseTime?: string;
};

export type BusinessProfileOperatingStatus = {
  label: string;
  isOpen: boolean;
  nextOpening?: string;
};

export type BusinessProfileView = {
  id: string;
  name: string;
  businessId: string;
  tagline?: string;
  description?: string;
  story?: string;
  coverImage?: string;
  image?: string;
  logo?: string;
  rating: number;
  ratingCount: number;
  ratingBreakdown: BusinessProfileRatingBreakdown;
  distance?: number;
  category?: string;
  priceRange?: string;
  contact?: string;
  email?: string;
  location?: string;
  mapLocation?: {
    latitude: number;
    longitude: number;
  } | null;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    website?: string;
    x?: string;
  };
  promotions: BusinessProfilePromotion[];
  menu: BusinessProfileMenuCategory[];
  reviews: BusinessProfileReview[];
  gallery: BusinessProfileGalleryItem[];
  amenities: BusinessProfileAmenity[];
  businessHours: BusinessProfileHours;
  operatingStatus?: BusinessProfileOperatingStatus;
  verification?: BusinessProfileVerification;
  stats?: BusinessProfileStats;
  isFavorited?: boolean;
};
