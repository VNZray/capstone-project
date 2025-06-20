import type { ShopData } from '@/types/shop';

// Simple props interfaces
export interface ShopCardProps {
  shop: ShopData;
  onPress: (shopId: string) => void;
  showRating?: boolean;
  showCategory?: boolean;
  width?: number;
}

export interface ShopListProps {
  shops: ShopData[];
  onShopPress: (shopId: string) => void;
  title?: string;
  horizontal?: boolean;
  showRating?: boolean;
  showCategory?: boolean;
  showViewAll?: boolean;
  onViewAllPress?: () => void;
  emptyMessage?: string;
  width?: number;
  gridLayout?: boolean;
  numColumns?: number;
}

export interface ShopSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  value?: string;
}

export interface ShopCategoriesProps {
  categories: {
    id: string;
    name: string;
    icon: string;
  }[];
  onCategoryPress: (categoryId: string) => void;
  showViewAll?: boolean;
  onViewAllPress?: () => void;
}

export interface ShopCarouselProps {
  shops: ShopData[];
  onShopPress: (shopId: string) => void;
  title?: string;
  showViewAll?: boolean;
  onViewAllPress?: () => void;
}

// Proposed type for special offer data
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface SpecialOfferData {
  id: string;
  promoImageUrl: string; // URL for the promotional image
  title?: string;        // Optional: A very short title for the offer
  altText?: string;      // Accessibility text for the image
  // navigationPath?: string; // Or some way to define where to go on press
}