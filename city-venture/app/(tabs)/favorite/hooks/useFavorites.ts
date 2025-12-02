import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import {
    getFavoritesByTouristId,
    deleteFavorite,
    type Favorite,
    type FavoriteType,
} from '@/services/FavoriteService';
import { fetchBusinessData, fetchBusinessDetails } from '@/services/AccommodationService';
import { fetchRoomDetails } from '@/services/RoomService';
import { fetchTouristSpotById } from '@/services/TouristSpotService';
import type { FavoriteItem, Category } from '../types';

export const useFavorites = (userId: string | undefined) => {
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Map favorite type to category
    const mapFavoriteTypeToCategory = (
        type: FavoriteType
    ): Exclude<Category, 'All'> => {
        const mapping: Record<FavoriteType, Exclude<Category, 'All'>> = {
            accommodation: 'Accommodation',
            room: 'Room',
            shop: 'Shop',
            event: 'Event',
            tourist_spot: 'Tourist Spot',
        };
        return mapping[type];
    };

    // Fetch favorites and their details
    const fetchFavorites = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            const favoritesData = await getFavoritesByTouristId(userId);
            console.log(
                'Raw favorites data:',
                JSON.stringify(favoritesData, null, 2)
            );

            // Fetch details for each favorite
            const favoritesWithDetails = await Promise.all(
                favoritesData.map(async (fav: Favorite) => {
                    try {
                        let itemData: any = null;
                        let title = 'Unknown';
                        let location = 'Location not available';
                        let image = '';
                        let price = undefined;

                        console.log(
                            `Fetching details for favorite ${fav.id}, type: ${fav.favorite_type}, item_id: ${fav.my_favorite_id}`
                        );

                        if (fav.favorite_type === 'accommodation') {
                            itemData = await fetchBusinessData(fav.my_favorite_id);
                            console.log('Accommodation data:', itemData);
                            title = itemData.business_name || 'Accommodation';
                            location = `${itemData.barangay_name || ''}, ${itemData.municipality_name || ''
                                }`;
                            image = itemData.business_image || '';
                            price = itemData.min_price ? `₱${itemData.min_price}` : undefined;
                        } else if (fav.favorite_type === 'room') {
                            itemData = await fetchRoomDetails(fav.my_favorite_id);
                            console.log('Room data:', itemData);
                            title =
                                itemData.room_type || `Room ${itemData.room_number || ''}`;
                            location = `${itemData.room_number ? 'Room ' + itemData.room_number : ''
                                } • ${itemData.floor || ''}sqm`;
                            image = itemData.room_image || '';

                            // Format room price
                            const rawPrice = itemData.room_price as any;
                            if (rawPrice != null) {
                                if (typeof rawPrice === 'number') {
                                    price =
                                        '₱' +
                                        rawPrice.toLocaleString('en-PH', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        });
                                } else {
                                    const numeric = String(rawPrice).replace(/[^0-9.]/g, '');
                                    const num = Number(numeric);
                                    if (!isNaN(num)) {
                                        price =
                                            '₱' +
                                            num.toLocaleString('en-PH', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            });
                                    }
                                }
                            }
                        } else if (fav.favorite_type === 'tourist_spot') {
                            itemData = await fetchTouristSpotById(fav.my_favorite_id);
                            title = itemData.name || 'Tourist Spot';
                            location = `${itemData.barangay_name || ''}, ${itemData.municipality_name || ''
                                }`;
                            image = itemData.spot_image || '';
                        }

                        return {
                            id: fav.id,
                            favoriteId: fav.id,
                            itemId: fav.my_favorite_id,
                            title,
                            location,
                            rating: itemData.ratings || 0, // TODO: Fetch ratings
                            reviews: itemData.reviews || 0,
                            price,
                            category: mapFavoriteTypeToCategory(fav.favorite_type),
                            image,
                            favoriteType: fav.favorite_type,
                        } as FavoriteItem;
                    } catch (error) {
                        console.error(
                            `Failed to fetch details for favorite ${fav.id}:`,
                            error
                        );
                        return null;
                    }
                })
            );

            setFavorites(
                favoritesWithDetails.filter(
                    (item): item is FavoriteItem => item !== null
                )
            );
        } catch (error) {
            console.error('Failed to fetch favorites:', error);
            Alert.alert('Error', 'Failed to load favorites. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchFavorites();
    }, [fetchFavorites]);

    const handleRemoveFavorite = useCallback(async (favoriteId: string) => {
        Alert.alert(
            'Remove Favorite',
            'Are you sure you want to remove this from your favorites?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteFavorite(favoriteId);
                            setFavorites((prev) =>
                                prev.filter((item) => item.favoriteId !== favoriteId)
                            );
                        } catch (error) {
                            console.error('Failed to remove favorite:', error);
                            Alert.alert(
                                'Error',
                                'Failed to remove favorite. Please try again.'
                            );
                        }
                    },
                },
            ]
        );
    }, []);

    return {
        favorites,
        loading,
        refreshing,
        onRefresh,
        handleRemoveFavorite,
    };
};
