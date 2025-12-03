import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  HighlightedTouristSpot,
  PartnerBusiness,
  HomeEvent,
  NewsArticle,
} from '@/services/HomeContentService';

export type ActionItem = {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
};

export type PromoCardContent = {
  id: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
};

export type Recommendation = {
  id: string;
  title: string;
  location: string;
  image: string;
  rating: number;
  reviews: number;
  price: string;
  tags: string[];
};

export type SpecialOffer = {
  id: string;
  title: string;
  description: string;
  discount: string;
  image: string;
  ctaText: string;
  validUntil?: string;
  category: string;
};

export const ACTIONS: ActionItem[] = [
  {
    id: 'accommodation',
    label: 'Hotels',
    icon: 'bed',
  },
  {
    id: 'food',
    label: 'Food',
    icon: 'silverware-fork-knife',
  },
  {
    id: 'transport',
    label: 'Transport',
    icon: 'bus',
  },
  {
    id: 'map',
    label: 'Map',
    icon: 'map-outline',
  },
  {
    id: 'tours',
    label: 'Tours',
    icon: 'island',
  },
  {
    id: 'tickets',
    label: 'Tickets',
    icon: 'ticket-confirmation-outline',
  },
  {
    id: 'guides',
    label: 'Guides',
    icon: 'account-tie',
  },
  {
    id: 'saved',
    label: 'Saved',
    icon: 'bookmark',
  },
  {
    id: 'cleaning',
    label: 'Cleaning',
    icon: 'broom',
  },
  {
    id: 'repair',
    label: 'Repair',
    icon: 'hammer-wrench',
  },
  {
    id: 'delivery',
    label: 'Delivery',
    icon: 'truck-delivery',
  },
  {
    id: 'laundry',
    label: 'Laundry',
    icon: 'washing-machine',
  },
  {
    id: 'massage',
    label: 'Massage',
    icon: 'spa',
  },
  {
    id: 'salon',
    label: 'Salon',
    icon: 'hair-dryer',
  },
  {
    id: 'fitness',
    label: 'Fitness',
    icon: 'dumbbell',
  },
  {
    id: 'more',
    label: 'More',
    icon: 'dots-horizontal',
  },
];

export const PROMO_CARD: PromoCardContent = {
  id: 'report',
  title: 'See something that needs attention?',
  description:
    'Report issues around the city and track ongoing fixes in one place.',
  primaryCta: 'View reports',
  secondaryCta: 'Report an issue',
};

export const PLACEHOLDER_SPOTS: HighlightedTouristSpot[] = [
  {
    id: 'spot-aurora',
    name: 'Aurora Park Skyline',
    image:
      'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=900&q=80',
    barangay: 'Centro',
    rating: 4.8,
    reviews: 412,
  },
  {
    id: 'spot-river',
    name: 'Naga River Walk',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    barangay: 'Penafrancia',
    rating: 4.6,
    reviews: 289,
  },
  {
    id: 'spot-hill',
    name: 'Panoramic Hill Deck',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    barangay: 'Cararayan',
    rating: 4.9,
    reviews: 512,
  },
];

export const PLACEHOLDER_BUSINESSES: PartnerBusiness[] = [
  {
    id: 'biz-cafe',
    name: 'Habitat Coffee & Co.',
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=700&q=80',
    category: 'Cafe',
    isVerified: true,
  },
  {
    id: 'biz-bistro',
    name: 'Riverstone Bistro',
    image:
      'https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?auto=format&fit=crop&w=700&q=80',
    category: 'Dining',
    isVerified: true,
  },
  {
    id: 'biz-gear',
    name: 'Trail & Tide Outfitters',
    image:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=700&q=80',
    category: 'Outdoor',
    isVerified: true,
  },
];

export const PLACEHOLDER_EVENTS: HomeEvent[] = [
  {
    id: 'event-festival',
    name: 'City Lights Music Fest',
    date: 'Nov 24, 7:00 PM',
    location: 'Plaza Quezon',
    image:
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'event-ride',
    name: 'Sunrise Fun Ride',
    date: 'Nov 27, 5:30 AM',
    location: 'Naga River Park',
    image:
      'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'event-market',
    name: 'Magsaysay Night Market',
    date: 'Dec 02, 6:00 PM',
    location: 'Magsaysay Ave.',
    image:
      'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=700&q=80',
  },
];

export const PLACEHOLDER_NEWS: NewsArticle[] = [
  {
    id: 'news-hub',
    title: 'New transport hub streamlines downtown commute',
    excerpt:
      'The integrated terminal opens this week, promising smoother rides and safer waiting areas for daily commuters.',
    category: 'Updates',
    image:
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80',
    publishedAt: 'Today',
  },
  {
    id: 'news-green',
    title: 'Green corridors add 200 new trees across barangays',
    excerpt:
      'Local volunteers and partners joined forces to expand shaded walkways that connect parks and bike lanes.',
    category: 'Community',
    image:
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80',
    publishedAt: 'Yesterday',
  },
];

export const RECOMMENDATIONS: Recommendation[] = [
  {
    id: '1',
    title: 'Hidden Gem in Kyoto',
    location: 'Kyoto, Japan',
    image:
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviews: 128,
    price: '$120/night',
    tags: ['Culture', 'Relax'],
  },
  {
    id: '2',
    title: 'Santorini Sunset Cruise',
    location: 'Santorini, Greece',
    image:
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    reviews: 342,
    price: '$85/person',
    tags: ['Adventure', 'Sea'],
  },
  {
    id: '3',
    title: 'Swiss Alps Hiking',
    location: 'Zermatt, Switzerland',
    image:
      'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviews: 89,
    price: 'Free',
    tags: ['Nature', 'Hiking'],
  },
];

export const SPECIAL_OFFERS: SpecialOffer[] = [
  {
    id: 'offer-1',
    title: 'Promote is 10% Off',
    description: 'Exclusive Deal! Unlock 10% off your next adventure',
    discount: '10% OFF',
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    ctaText: 'Claim Now',
    validUntil: 'Dec 31, 2024',
    category: 'Food & Dining',
  },
  {
    id: 'offer-2',
    title: 'Discover Local Treasures',
    description: '20% off on unique local crafts',
    discount: '20% OFF',
    image:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
    ctaText: 'Explore',
    validUntil: 'Nov 30, 2024',
    category: 'Shopping',
  },
  {
    id: 'offer-3',
    title: 'Weekend Getaway Deal',
    description: 'Book 2 nights, get 1 free at partner hotels',
    discount: 'BUY 2 GET 1',
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
    ctaText: 'Book Now',
    validUntil: 'Dec 15, 2024',
    category: 'Accommodation',
  },
  {
    id: 'offer-4',
    title: 'Adventure Package',
    description: 'Save 25% on guided tours and activities',
    discount: '25% OFF',
    image:
      'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=600&q=80',
    ctaText: 'View Tours',
    validUntil: 'Jan 10, 2025',
    category: 'Activities',
  },
];

