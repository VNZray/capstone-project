import type { FavoriteType } from '@/services/FavoriteService';

export type Category =
    | 'All'
    | 'Accommodation'
    | 'Room'
    | 'Shop'
    | 'Event'
    | 'Tourist Spot';

export type FavoriteItem = {
    id: string;
    favoriteId: string; // The favorite record ID for deletion
    title: string;
    location: string;
    rating: number;
    reviews?: number;
    price?: string;
    category: Exclude<Category, 'All'>;
    image: string;
    favoriteType: FavoriteType;
    itemId: string; // The actual item ID (accommodation_id, room_id, etc.)
};

export const CATEGORIES: Category[] = [
    'All',
    'Accommodation',
    'Shop',
    'Room',
    'Event',
    'Tourist Spot',
];
