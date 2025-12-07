import apiClient from '@/services/apiClient';
import type {
  ReviewAndRating,
  ReviewAndRatings,
  ReviewType,
  ReviewPhoto,
  ReviewPhotos,
  Reply,
  Replies,
  CreateReviewPayload,
  UpdateReviewPayload,
  CreateReplyPayload,
  UpdateReplyPayload,
  ReviewWithAuthor,
} from '@/types/Feedback';
import type { Tourist } from '@/types/Tourist';
import type { User } from '@/types/User';

// Small helper to unwrap controller responses that may return either
// an array/row directly or an object like { message, data }
function unwrap<T>(res: any): T {
  if (res && typeof res === 'object') {
    if ('data' in res && res.data) return res.data as T;
  }
  return res as T;
}

// Some backend routes (via stored procedures) return nested arrays like [ [ rows ] ]
// or objects with numbered keys like { "0": {...}, "1": {...} }
function normalizeList<T>(raw: any): T[] {
  const src = unwrap<any>(raw);

  if (Array.isArray(src)) {
    // Handle nested arrays
    if (src.length > 0 && Array.isArray(src[0])) {
      return src[0] as T[];
    }

    // Handle array of objects where first item has numbered keys
    if (src.length > 0 && typeof src[0] === 'object' && src[0] !== null) {
      // Check if it's an object with numeric string keys (0, 1, 2, etc.)
      const keys = Object.keys(src[0]);
      const numericKeys = keys.filter((k) => /^\d+$/.test(k));

      if (numericKeys.length > 0) {
        // Extract values from numeric keys and flatten
        const extracted: T[] = [];
        numericKeys.forEach((key) => {
          const item = src[0][key];
          if (item && typeof item === 'object' && 'id' in item) {
            extracted.push(item as T);
          }
        });
        return extracted;
      }
    }

    return src as T[];
  }

  // Handle single object with numeric keys
  if (typeof src === 'object' && src !== null) {
    const keys = Object.keys(src);
    const numericKeys = keys.filter((k) => /^\d+$/.test(k));

    if (numericKeys.length > 0) {
      const extracted: T[] = [];
      numericKeys.forEach((key) => {
        const item = src[key];
        if (item && typeof item === 'object' && 'id' in item) {
          extracted.push(item as T);
        }
      });
      return extracted;
    }
  }

  return [src as T];
}

// ===== Reviews =====

export async function getAllReviews(): Promise<ReviewAndRatings> {
  const { data } = await apiClient.get(`/reviews`);
  return normalizeList<ReviewAndRating>(data);
}

export async function getReviewById(id: string): Promise<ReviewAndRating> {
  const { data } = await apiClient.get(`/reviews/${id}`);
  return unwrap<ReviewAndRating>(data);
}

export async function getReviewsByTypeAndEntityId(
  review_type: ReviewType,
  review_type_id: string
): Promise<ReviewAndRatings> {
  const { data } = await apiClient.get(
    `/reviews/type/${review_type}/${review_type_id}`
  );
  return normalizeList<ReviewAndRating>(data);
}

export async function getBusinessReviews(
  businessId: string,
  business_type: string
): Promise<ReviewWithAuthor[]> {
  // Fetch base reviews for this business/type
  const rawReviews = await getReviewsByTypeAndEntityId(
    business_type as ReviewType,
    businessId
  );

  if (!rawReviews || rawReviews.length === 0) return [];

  // Filter out invalid entries (like the OkPacket objects)
  const reviews = rawReviews.filter(
    (r) => r && typeof r === 'object' && 'id' in r && 'rating' in r
  );

  if (reviews.length === 0) return [];

  // Collect unique reviewer (tourist) IDs
  const touristIds = Array.from(
    new Set(reviews.map((r) => String(r.tourist_id)).filter(Boolean))
  );

  // Fetch all tourists in parallel and map by id
  const touristMap = new Map<string, Tourist | null>();
  await Promise.all(
    touristIds.map(async (tid) => {
      try {
        const { data } = await apiClient.get(`/tourist/${tid}`);
        touristMap.set(tid, unwrap<Tourist>(data));
      } catch {
        touristMap.set(tid, null);
      }
    })
  );

  // Optionally fetch underlying user accounts (email/profile), if present
  const userMap = new Map<string, User | null>();
  const userIds = Array.from(
    new Set(
      touristIds
        .map((tid) => touristMap.get(tid)?.user_id)
        .filter((uid): uid is string => !!uid && String(uid).length > 0)
    )
  );
  if (userIds.length > 0) {
    await Promise.all(
      userIds.map(async (uid) => {
        try {
          const { data } = await apiClient.get(`/users/${uid}`);
          userMap.set(uid, unwrap<User>(data));
        } catch {
          userMap.set(uid, null);
        }
      })
    );
  }

  // Fetch photos and replies for each review
  const photosMap = new Map<string, ReviewPhotos>();
  const repliesMap = new Map<string, Replies>();

  await Promise.all(
    reviews.map(async (r) => {
      try {
        const photos = await getReviewPhotos(r.id);
        photosMap.set(r.id, photos);
      } catch (error) {
        console.error(`Error fetching photos for review ${r.id}:`, error);
        photosMap.set(r.id, []);
      }

      try {
        const replies = await getRepliesByReviewId(r.id);
        repliesMap.set(r.id, replies);
      } catch (error) {
        console.error(`Error fetching replies for review ${r.id}:`, error);
        repliesMap.set(r.id, []);
      }
    })
  );

  // Merge review with its author details, photos, and replies
  const enriched: ReviewWithAuthor[] = reviews.map((r) => {
    const tourist = touristMap.get(String(r.tourist_id)) ?? null;
    const user = tourist?.user_id
      ? userMap.get(String(tourist.user_id)) ?? null
      : null;
    const photos = photosMap.get(r.id) || [];
    const replies = repliesMap.get(r.id) || [];

    return {
      ...r,
      tourist,
      user,
      photos,
      replies,
    };
  });

  return enriched;
}

export async function createReview(
  payload: CreateReviewPayload
): Promise<ReviewAndRating> {
  const { data } = await apiClient.post(`/reviews`, payload);
  return unwrap<ReviewAndRating>(data);
}

export async function updateReview(
  id: string,
  payload: UpdateReviewPayload
): Promise<ReviewAndRating> {
  const { data } = await apiClient.patch(`/reviews/${id}`, payload);
  return unwrap<ReviewAndRating>(data);
}

export async function deleteReview(id: string): Promise<{ message: string }> {
  const { data } = await apiClient.delete(`/reviews/${id}`);
  return data;
}

// ===== Replies =====

export async function getAllReplies(): Promise<Replies> {
  const { data } = await apiClient.get(`/replies`);
  return normalizeList<Reply>(data);
}

export async function getReplyById(id: string): Promise<Reply> {
  const { data } = await apiClient.get(`/replies/${id}`);
  return unwrap<Reply>(data);
}

export async function getRepliesByReviewId(reviewId: string): Promise<Replies> {
  const { data } = await apiClient.get(`/replies/review/${reviewId}`);
  return normalizeList<Reply>(data);
}

export async function createReply(payload: CreateReplyPayload): Promise<Reply> {
  const { data } = await apiClient.post(`/replies`, payload);
  return unwrap<Reply>(data);
}

export async function updateReply(
  id: string,
  payload: UpdateReplyPayload
): Promise<Reply> {
  const { data } = await apiClient.patch(`/replies/${id}`, payload);
  return unwrap<Reply>(data);
}

export async function deleteReply(id: string): Promise<{ message: string }> {
  const { data } = await apiClient.delete(`/replies/${id}`);
  return data;
}

// ===== Review Photos =====

export async function getReviewPhotos(reviewId: string): Promise<ReviewPhotos> {
  const { data } = await apiClient.get(
    `/review-photos/reviews/${reviewId}/photos`
  );
  return normalizeList<ReviewPhoto>(data);
}

export async function addReviewPhotos(
  reviewId: string,
  photos: string[]
): Promise<ReviewPhotos> {
  const { data } = await apiClient.post(
    `/review-photos/reviews/${reviewId}/photos`,
    { photos }
  );
  // Endpoint returns { message, data }
  return unwrap<ReviewPhotos>(data);
}

export async function deleteReviewPhoto(
  photoId: string
): Promise<{ message: string }> {
  const { data } = await apiClient.delete(
    `/review-photos/reviews/photos/${photoId}`
  );
  return data;
}

// calculate average rating for a review type and entity id
export async function getAverageRating(
  review_type: ReviewType,
  review_type_id: string
): Promise<number> {
  const { data } = await apiClient.get(
    `/reviews/average/${review_type}/${review_type_id}`
  );
  // Handle array/object response: [{ average_rating: "5.0000" }]
  let avg = 0;
  if (
    Array.isArray(data) &&
    data.length > 0 &&
    data[0].average_rating !== undefined
  ) {
    avg = parseFloat(data[0].average_rating);
  } else if (
    data &&
    typeof data === 'object' &&
    data.average_rating !== undefined
  ) {
    avg = parseFloat(data.average_rating);
  } else if (typeof data === 'number') {
    avg = data;
  }
  return isNaN(avg) ? 0 : avg;
}

// calculate total number of reviews for a review type and entity id
export async function getTotalReviews(
  review_type: ReviewType,
  review_type_id: string
): Promise<number> {
  const { data } = await apiClient.get(
    `/reviews/total/${review_type}/${review_type_id}`
  );
  // Handle array/object response: [{ total_reviews: 2 }]
  let total = 0;
  if (
    Array.isArray(data) &&
    data.length > 0 &&
    data[0].total_reviews !== undefined
  ) {
    total = Number(data[0].total_reviews);
  } else if (
    data &&
    typeof data === 'object' &&
    data.total_reviews !== undefined
  ) {
    total = Number(data.total_reviews);
  } else if (typeof data === 'number') {
    total = data;
  }
  return isNaN(total) ? 0 : total;
}

/**
 * Check if a tourist has already reviewed a specific entity (room, accommodation, etc.)
 * Returns true if a review exists, false otherwise
 */
export async function checkIfTouristHasReviewed(
  touristId: string,
  reviewType: ReviewType,
  reviewTypeId: string
): Promise<boolean> {
  try {
    const reviews = await getReviewsByTypeAndEntityId(reviewType, reviewTypeId);
    // Filter out invalid entries and check if tourist has reviewed
    const validReviews = reviews.filter(
      (r) => r && typeof r === 'object' && 'id' in r && 'tourist_id' in r
    );
    return validReviews.some((r) => String(r.tourist_id) === String(touristId));
  } catch (error) {
    console.error('Error checking if tourist has reviewed:', error);
    return false;
  }
}

export default {
  // reviews
  getAllReviews,
  getReviewById,
  getReviewsByTypeAndEntityId,
  getBusinessReviews,
  createReview,
  updateReview,
  deleteReview,
  checkIfTouristHasReviewed,
  // replies
  getAllReplies,
  getReplyById,
  getRepliesByReviewId,
  createReply,
  updateReply,
  deleteReply,
  // photos
  getReviewPhotos,
  addReviewPhotos,
  deleteReviewPhoto,
};
