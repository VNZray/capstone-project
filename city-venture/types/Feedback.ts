// Feedback domain types shared across apps
import type { Tourist } from './Tourist';
import type { User } from './User';

// Matches ENUM in DB: review_and_rating.review_type
export type ReviewType =
	| 'Accommodation'
	| 'Room'
	| 'Shop'
	| 'Event'
	| 'Tourist Spot'
	| 'Product'
	| 'Service';

// Row from review_and_rating
export interface ReviewAndRating {
	id: string;
	review_type: ReviewType;
	review_type_id: string; // UUID of the entity being reviewed
	rating: number; // 1..5
	message: string;
	tourist_id: string; // UUID of the reviewer (tourist)
	created_at: string; // ISO timestamp from DB
	photos?: ReviewPhotos; // optional list of attached photos
}

// Row from reply
export interface Reply {
	id: string;
	review_and_rating_id: string; // FK to ReviewAndRating.id
	message: string;
	responder_id: string; // user id of the responder (e.g., owner/admin)
	created_at: string; // ISO timestamp from DB
}

// Collection aliases
export type ReviewAndRatings = ReviewAndRating[];
export type Replies = Reply[];
export interface ReviewPhoto {
	id: string;
	review_and_rating_id: string;
	photo_url: string;
	created_at: string;
}
export type ReviewPhotos = ReviewPhoto[];

// API payloads for convenience
export interface CreateReviewPayload {
	review_type: ReviewType;
	review_type_id: string;
	rating: number; // 1..5
	message: string;
	tourist_id: string;
	photos?: string[]; // optional already-uploaded public URLs
}

export interface UpdateReviewPayload {
	review_type?: ReviewType;
	review_type_id?: string;
	rating?: number; // 1..5
	message?: string;
}

export interface CreateReplyPayload {
	review_and_rating_id: string;
	message: string;
	responder_id: string;
}

export interface UpdateReplyPayload {
	message?: string;
}

// Enriched view model for UI convenience: review + author details
export interface ReviewWithAuthor extends ReviewAndRating {
	tourist: Tourist | null; // the reviewer profile (if resolvable)
	user?: User | null; // optional underlying user account
}