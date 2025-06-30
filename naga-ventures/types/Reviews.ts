// The base Review type for reviews made by users
export type Review = {
  id: string;
  user_id: string;
  reviewable_type: 'accommodation' | 'shop' | 'event' | 'spot';
  reviewable_id: string;
  rating: number;
  comment: string;
  created_at: string;
};

// The reply made by a business owner or admin
export type Reply = {
  id: string;
  review_id: string;
  responder_id: string;
  reply_text: string;
  created_at: string;
};

