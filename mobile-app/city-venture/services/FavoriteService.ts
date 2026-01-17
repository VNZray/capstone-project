import apiClient from '@/services/api/apiClient';

export type FavoriteType =
  | 'accommodation'
  | 'room'
  | 'shop'
  | 'tourist_spot'
  | 'event';

export type Favorite = {
  id: string;
  tourist_id: string;
  favorite_type: FavoriteType;
  my_favorite_id: string;
  created_at?: Date | string;
};

/** Get all favorites by tourist ID */
export const getFavoritesByTouristId = async (
  touristId: string
): Promise<Favorite[]> => {
  const { data } = await apiClient.get<any>(`/favorite/tourist/${touristId}`);
  // Backend returns [[favorites], metadata] - extract the first array
  const favorites =
    Array.isArray(data) && Array.isArray(data[0]) ? data[0] : data;
  return Array.isArray(favorites) ? favorites : [];
};

/** Add a new favorite */
export const addFavorite = async (
  touristId: string,
  favoriteType: FavoriteType,
  myFavoriteId: string
): Promise<{ message: string; id: string }> => {
  const { data } = await apiClient.post<{ message: string; id: string }>(
    '/favorite',
    {
      tourist_id: touristId,
      favorite_type: favoriteType,
      my_favorite_id: myFavoriteId,
    }
  );
  return data;
};

/** Delete a favorite */
export const deleteFavorite = async (
  favoriteId: string
): Promise<{ message: string }> => {
  const { data } = await apiClient.delete<{ message: string }>(
    `/favorite/${favoriteId}`
  );
  return data;
};

/** Check if a favorite exists */
export const checkFavoriteExists = async (
  touristId: string,
  favoriteType: FavoriteType,
  myFavoriteId: string
): Promise<{ exists: boolean; favoriteId: string | null }> => {
  const { data } = await apiClient.get<{
    exists: boolean;
    favoriteId: string | null;
  }>('/favorite/check', {
    params: {
      tourist_id: touristId,
      favorite_type: favoriteType,
      my_favorite_id: myFavoriteId,
    },
  });
  return data;
};
