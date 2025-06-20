// app/(tabs)/(home)/(touristSpots)/data.ts
// Data file containing tourist spot information and helper functions
// Includes spot details, ratings, and data management functions

import { calculateSpotRatings } from './reviewsData';

// Interface for map coordinates
interface MapLocation {
  latitude: number;
  longitude: number;
}

// Interface defining the structure of a tourist spot
export interface TouristSpot {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  additionalImages: string[];
  location: string;
  mapLocation: MapLocation;
  contact: string;
  openingHours: string;
  admissionFee: string;
}

// Interface extending TouristSpot with rating information
export interface TouristSpotWithRatings extends TouristSpot {
  rating: number;
  ratingCount: number;
  ratingDistribution: {
    [key: number]: number;
  };
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Destination {
  id: string;
  name: string;
  image: string;
}

// Database of tourist spots in Naga City
// Each spot contains comprehensive information including location, contact details, and images
export const touristSpotsData: { [key: string]: TouristSpot } = {
  1: {
    id: '1',
    name: 'Naga Metropolitan Cathedral',
    category: 'historical',
    description:
      'Metropolitan Cathedral and Parish of Saint John the Evangelist, commonly known as the Naga Metropolitan Cathedral. It is the seat of the Roman Catholic Archdiocese of Caceres.',
    image:
      'https://i0.wp.com/nagayon.com/wp-content/uploads/2024/05/Cathedral-Exterior_1-scaled.jpg?resize=768%2C576&ssl=1',
    additionalImages: [
      'https://i0.wp.com/nagayon.com/wp-content/uploads/2024/05/Cathedral-Exterior_1-scaled.jpg?resize=768%2C576&ssl=1',
      'https://i0.wp.com/nagayon.com/wp-content/uploads/2024/05/Cathedral-Exterior_1-scaled.jpg?resize=768%2C576&ssl=1',
      'https://i0.wp.com/nagayon.com/wp-content/uploads/2024/05/Cathedral-Exterior_1-scaled.jpg?resize=768%2C576&ssl=1',
      'https://i0.wp.com/nagayon.com/wp-content/uploads/2024/05/Cathedral-Exterior_1-scaled.jpg?resize=768%2C576&ssl=1',
    ],
    location: 'J. Hernandez Avenue, Naga City, Camarines Sur',
    mapLocation: {
      latitude: 13.628269541811807,
      longitude: 123.18720142762204,
    },
    contact: '+63 (54) 473-8022',
    openingHours: 'Open 24 hours',
    admissionFee: 'Free',
  },
  2: {
    id: '2',
    name: 'The Porta Mariae',
    category: 'historical',
    description:
      'The Porta Mariae (Latin for "Door of Mary") is a devotional landmark built to commemorate the tercentenary of devotion to Our Lady of Peñafrancia.',
    image:
      'https://i0.wp.com/nagayon.com/wp-content/uploads/2024/05/Porta-mariae-e1717984426731.jpg?resize=768%2C506&ssl=1',
    additionalImages: [],
    location: 'Magsaysay Avenue, Naga City, Camarines Sur',
    mapLocation: { latitude: 13.62756337517753, longitude: 123.18675883068613 },
    contact: 'N/A',
    openingHours: 'Open 24 hours',
    admissionFee: 'Free',
  },
  3: {
    id: '3',
    name: 'Mt. Isarog National Park',
    category: 'natural',
    description:
      'Mount Isarog is a potentially active stratovolcano located in the province of Camarines Sur, Philippines.',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Mount_Isarog_View_at_Antipolo_Baao_Camarines_Sur.jpg/1200px-Mount_Isarog_View_at_Antipolo_Baao_Camarines_Sur.jpg',
    additionalImages: [],
    location: 'Panicuason, Naga City, Camarines Sur',
    mapLocation: { latitude: 13.662625165467086, longitude: 123.3710678221174 },
    contact: 'DENR Region V',
    openingHours: 'Varies',
    admissionFee: '₱50',
  },
  4: {
    id: '4',
    name: 'Malabsay Falls',
    category: 'natural',
    description:
      'A breathtaking waterfall located within Mt. Isarog National Park, offering scenic views and a refreshing escape into nature.',
    image:
      'https://www.nagacityguide.com/wordpress/wp-content/uploads/2016/04/Jomari-Dumalasa%E2%80%8E2.jpg',
    additionalImages: [],
    location: 'Panicuason, Naga City, Camarines Sur',
    mapLocation: {
      latitude: 13.663670840210843,
      longitude: 123.33689878662024,
    },
    contact: 'DENR Region V',
    openingHours: '6:00 AM - 6:00 PM',
    admissionFee: '₱20',
  },
  5: {
    id: '5',
    name: 'Penafrancia Church',
    category: 'historical',
    description:
      'The Basilica of Our Lady of Peñafrancia, an important religious site and a center of Marian devotion in the Bicol region.',
    image:
      'https://www2.naga.gov.ph/wp-content/uploads/2022/08/20220704-VIC06248-1024x683.jpg',
    additionalImages: [],
    location: 'Balatas Road, Naga City, Camarines Sur',
    mapLocation: {
      latitude: 13.634427116867132,
      longitude: 123.19541593970112,
    },
    contact: '+63 (54) 472-5723',
    openingHours: '5:00 AM - 9:00 PM',
    admissionFee: 'Free',
  },
  6: {
    id: '6',
    name: 'Panicuason Hot Springs Resort',
    category: 'resorts',
    description:
      'A relaxing hot spring resort tucked within the lush greenery of Mt. Isarog, perfect for rejuvenation and adventure.',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRG0ngeduQIbdqDtRb3zqWEnjzGQFoh78-Xpg&s',
    additionalImages: [],
    location: 'Panicuason, Naga City, Camarines Sur',
    mapLocation: {
      latitude: 13.672114857194526,
      longitude: 123.32050396629431,
    },
    contact: '+63 (54) 473-0414',
    openingHours: '7:00 AM - 9:00 PM',
    admissionFee: '₱150',
  },
  7: {
    id: '7',
    name: 'Robinsons Place Naga',
    category: 'urban',
    description:
      'A major shopping mall in Naga City offering a variety of retail, dining, and entertainment options.',
    image:
      'https://rlcommercialreit.com.ph/sites/default/files/portfolio/Cybergate-Naga.png',
    additionalImages: [],
    location:
      'Roxas Avenue cor. Almeda Highway, Brgy. Triangulo, Naga City, Camarines Sur',
    mapLocation: {
      latitude: 13.615618815288265,
      longitude: 123.19336149328089,
    }, // Approximate coordinates
    contact: '(054) 881-2545',
    openingHours: '10:00 AM - 9:00 PM',
    admissionFee: 'Free',
  },
  8: {
    id: '8',
    name: 'Avenue Square',
    category: 'urban',
    description:
      'A popular commercial complex in Naga City known for its restaurants, bars, and shops.',
    image:
      'https://www.theavenueplazahotel.com/assets/others/avenue_square-e2e2a3c54ed22fb17c1eed075d694ed9.jpg',
    additionalImages: [],
    location: 'Magsaysay Avenue, Naga City, Camarines Sur',
    mapLocation: {
      latitude: 13.632303298842043,
      longitude: 123.19624412698813,
    }, // Approximate coordinates
    contact: 'N/A',
    openingHours: 'Varies',
    admissionFee: 'Free (establishment-dependent)',
  },
  9: {
    id: '9',
    name: 'Jesse M. Robredo Museum',
    category: 'museums',
    description:
      'A museum dedicated to the life and legacy of the late Jesse M. Robredo, former Mayor of Naga City and DILG Secretary.',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4mBM9FhkaRsDdz2T_YigB3VEZjMu92asFrQ&s',
    additionalImages: [],
    location:
      'Naga Civic Center, Taal Ave cor. J.Miranda Ave, Brgy. Concepcion Pequeña, Naga City, Camarines Sur',
    mapLocation: {
      latitude: 13.628807741401566,
      longitude: 123.19728423745774,
    }, // Approximate coordinates
    contact: '09276485734 / (054) 205-5422',
    openingHours: '8:00 AM - 4:00 PM (Tue-Sun)',
    admissionFee: 'Free',
  },
  10: {
    id: '10',
    name: 'San Francisco Church',
    category: 'historical',
    description:
      'One of the oldest churches in the Bicol Region, known for its Spanish-era architecture.',
    image:
      'https://i0.wp.com/nagayon.com/wp-content/uploads/2024/05/San-Francisco-Exterior_1-scaled.jpg?fit=1200%2C900&ssl=1',
    additionalImages: [],
    location: 'Peñafrancia Street, Naga City, Camarines Sur',
    mapLocation: {
      latitude: 13.624514180255026,
      longitude: 123.18629871447476,
    }, // Approximate coordinates
    contact: 'N/A',
    openingHours: 'Varies',
    admissionFee: 'Free',
  },
  11: {
    id: '11',
    name: 'Plaza Quince Martires',
    category: 'historical',
    description:
      'A historical plaza in downtown Naga City, commemorating fifteen martyrs of the Bicol Region.',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/c/c5/IJVSanFranciscoChurch1.jpg',
    additionalImages: [],
    location: 'General Luna Street, Naga City, Camarines Sur',
    mapLocation: {
      latitude: 13.624569899153629,
      longitude: 123.18590977079522,
    }, // Approximate coordinates
    contact: 'N/A',
    openingHours: 'Open 24 hours',
    admissionFee: 'Free',
  },
  12: {
    id: '12',
    name: 'Magsaysay Avenue',
    category: 'urban',
    description:
      'The main thoroughfare in Naga City, known for its vibrant nightlife, restaurants, and commercial establishments.',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnni0TyM7KDBBYLiW9sDH8syVOl5Mb1y1WpA&s',
    additionalImages: [],
    location: 'Magsaysay Avenue, Naga City, Camarines Sur',
    mapLocation: {
      latitude: 13.628833328622463,
      longitude: 123.19927649512846,
    }, // Approximate coordinates (center of the avenue)
    contact: 'N/A',
    openingHours: 'Varies',
    admissionFee: 'Free (establishment-dependent)',
  },
};

export const categories: Category[] = [
  { id: 'historical', name: 'Historical', icon: 'university' },
  { id: 'natural', name: 'Natural', icon: 'tree' },
  { id: 'urban', name: 'Urban', icon: 'building' },
  { id: 'museums', name: 'Museums', icon: 'landmark' },
  { id: 'resorts', name: 'Resorts', icon: 'umbrella-beach' },
];

// Helper function to get all tourist spots
export const getAllTouristSpots = (): TouristSpot[] => {
  return Object.values(touristSpotsData);
};

// Helper function to get spots by category
export const getSpotsByCategory = (categoryId: string): TouristSpot[] => {
  return Object.values(touristSpotsData).filter(
    (spot) => spot.category === categoryId
  );
};

// Helper function to get a spot by ID
export const getSpotById = (spotId: string): TouristSpot | null => {
  return touristSpotsData[spotId] || null;
};

// Helper function to get all categories
export const getAllCategories = (): Category[] => {
  return categories;
};

// Helper function to get a category by ID
export const getCategoryById = (categoryId: string): Category | null => {
  return categories.find((category) => category.id === categoryId) || null;
};

// Helper function to get a spot with its calculated ratings
export const getSpotWithRatings = (
  spotId: string
): TouristSpotWithRatings | null => {
  const spot = touristSpotsData[spotId];
  if (!spot) return null;

  const ratings = calculateSpotRatings(spotId);
  return {
    ...spot,
    ...ratings,
  };
};

// In-memory store for reviews
let reviewsStore: {
  id: string;
  spotId: string;
  userId: number;
  reviewerName: string;
  reviewText: string;
  rating: number;
  reviewDate: string;
  profileImageUri: string;
}[] = [];

export const addReview = (review: (typeof reviewsStore)[0]) => {
  reviewsStore.push(review);
};

export const getReviews = (spotId: string) => {
  return reviewsStore.filter((review) => review.spotId === spotId);
};
