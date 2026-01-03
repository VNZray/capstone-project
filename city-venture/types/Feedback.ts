// Base types from backend
export type ReviewAndRating = {
  id: string;
  review_type: ReviewType;
  review_type_id: string;
  rating: number;
  message: string;
  tourist_id: string;
  created_at: string;
  updated_at?: string;
  photos?: ReviewPhoto[];
  replies?: Reply[];
};

export type ReviewAndRatings = ReviewAndRating[];

export type ReviewType = 'accommodation' | 'restaurant' | 'tourist_spot' | 'shop' | 'service' | 'room';

export type ReviewPhoto = {
  id: string;
  review_and_rating_id: string;
  photo_url: string;
  created_at?: string;
};

export type ReviewPhotos = ReviewPhoto[];

export type Reply = {
  id: string;
  review_and_rating_id: string;
  message: string;
  responder_id: string;
  created_at: string;
  updated_at?: string;
};

export type Replies = Reply[];

// Enriched types for display
export type ReviewWithAuthor = ReviewAndRating & {
  tourist?: {
    id?: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    user_id?: string;
  } | null;
  user?: {
    id?: string;
    user_profile?: string;
    email?: string;
  } | null;
};

// Create/Update payloads
export type CreateReviewPayload = {
  review_type: ReviewType;
  review_type_id: string;
  rating: number;
  message: string;
  tourist_id: string;
  photos?: string[];
};

export type UpdateReviewPayload = {
  review_type?: ReviewType;
  review_type_id?: string;
  rating?: number;
  message?: string;
};

export type CreateReplyPayload = {
  review_and_rating_id: string;
  message: string;
  responder_id: string;
};

export type UpdateReplyPayload = {
  message: string;
};

// Extended review type with entity details (from GetReviewsByTouristId)
export type ReviewWithEntityDetails = ReviewAndRating & {
  entity_name?: string | null;
  business_id?: string | null;
  accommodation_name?: string | null;
};

// Legacy alias for backward compatibility
export type Review = ReviewAndRating;
export type Reviews = ReviewAndRatings;