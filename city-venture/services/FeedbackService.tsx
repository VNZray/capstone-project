import axios from 'axios';
import api from '@/services/api';
import type {
  ReviewAndRating,
  ReviewAndRatings,
  ReviewType,
  Reply,
  Replies,
  CreateReviewPayload,
  UpdateReviewPayload,
  CreateReplyPayload,
  UpdateReplyPayload,
  ReviewPhotos,
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
function normalizeList<T>(raw: any): T[] {
  const src = unwrap<any>(raw);
  if (Array.isArray(src)) {
    if (src.length > 0 && Array.isArray(src[0])) {
      return src[0] as T[];
    }
    return src as T[];
  }
  return [src as T];
}

// ===== Reviews =====

export async function getAllReviews(): Promise<ReviewAndRatings> {
  const { data } = await axios.get(`${api}/reviews`);
  return unwrap<ReviewAndRatings>(data);
}

export async function getReviewById(id: string): Promise<ReviewAndRating> {
  const { data } = await axios.get(`${api}/reviews/${id}`);
  return data;
}

export async function getReviewsByTypeAndEntityId(
  review_type: ReviewType,
  review_type_id: string
): Promise<ReviewAndRatings> {
  const { data } = await axios.get(
    `${api}/reviews/type/${(review_type)}/${review_type_id}`
  );
  return normalizeList<ReviewAndRating>(data);
}

export async function getBusinessReviews(
  businessId: string,
  business_type: string
): Promise<ReviewWithAuthor[]> {
  // Fetch base reviews for this business/type
  const reviews = await getReviewsByTypeAndEntityId(
    business_type as ReviewType,
    businessId
  );

  if (!reviews || reviews.length === 0) return [];

  // Collect unique reviewer (tourist) IDs
  const touristIds = Array.from(
    new Set(reviews.map((r) => String(r.tourist_id)).filter(Boolean))
  );

  // Fetch all tourists in parallel and map by id
  const touristMap = new Map<string, Tourist | null>();
  await Promise.all(
    touristIds.map(async (tid) => {
      try {
        const { data } = await axios.get(`${api}/tourist/${tid}`);
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
          const { data } = await axios.get(`${api}/users/${uid}`);
          userMap.set(uid, unwrap<User>(data));
        } catch {
          userMap.set(uid, null);
        }
      })
    );
  }

  // Merge review with its author details
  const enriched: ReviewWithAuthor[] = reviews.map((r) => {
    const tourist = touristMap.get(String(r.tourist_id)) ?? null;
    const user = tourist?.user_id ? userMap.get(String(tourist.user_id)) ?? null : null;
    return { ...r, tourist, user };
  });

  return enriched;
}

export async function createReview(payload: CreateReviewPayload): Promise<ReviewAndRating> {
  const { data } = await axios.post(`${api}/reviews`, payload);
  return unwrap<ReviewAndRating>(data);
}

export async function updateReview(
  id: string,
  payload: UpdateReviewPayload
): Promise<ReviewAndRating> {
  const { data } = await axios.patch(`${api}/reviews/${id}`, payload);
  return unwrap<ReviewAndRating>(data);
}

export async function deleteReview(id: string): Promise<{ message: string }> {
  const { data } = await axios.delete(`${api}/reviews/${id}`);
  return data;
}

// ===== Replies =====

export async function getAllReplies(): Promise<Replies> {
  const { data } = await axios.get(`${api}/replies`);
  return unwrap<Replies>(data);
}

export async function getReplyById(id: string): Promise<Reply> {
  const { data } = await axios.get(`${api}/replies/${id}`);
  return unwrap<Reply>(data);
}

export async function getRepliesByReviewId(reviewId: string): Promise<Replies> {
  const { data } = await axios.get(`${api}/replies/review/${reviewId}`);
  return unwrap<Replies>(data);
}

export async function createReply(payload: CreateReplyPayload): Promise<Reply> {
  const { data } = await axios.post(`${api}/replies`, payload);
  return unwrap<Reply>(data);
}

export async function updateReply(id: string, payload: UpdateReplyPayload): Promise<Reply> {
  const { data } = await axios.patch(`${api}/replies/${id}`, payload);
  return unwrap<Reply>(data);
}

export async function deleteReply(id: string): Promise<{ message: string }> {
  const { data } = await axios.delete(`${api}/replies/${id}`);
  return data;
}

// ===== Review Photos =====

export async function getReviewPhotos(reviewId: string): Promise<ReviewPhotos> {
  const { data } = await axios.get(`${api}/reviews/${reviewId}/photos`);
  return unwrap<ReviewPhotos>(data);
}

export async function addReviewPhotos(reviewId: string, photos: string[]): Promise<ReviewPhotos> {
  const { data } = await axios.post(`${api}/reviews/${reviewId}/photos`, { photos });
  // Endpoint returns { message, data }
  return unwrap<ReviewPhotos>(data);
}

export async function deleteReviewPhoto(photoId: string): Promise<{ message: string }> {
  const { data } = await axios.delete(`${api}/reviews/photos/${photoId}`);
  return data;
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