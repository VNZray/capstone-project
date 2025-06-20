// Enhanced shop data structure with comprehensive business information
export const shopsData = {
  1: {
    id: '1',
    name: 'Burger Joint',
    category: 'dining',
    subcategory: 'casual-dining',
    description:
      'A popular local burger joint serving freshly made burgers with locally sourced ingredients.',
    tagline: 'Home of the Famous Bicol Express Burger!',
    story:
      "Founded in 2018 by local chef Maria Santos, Burger Joint started as a small food cart and has grown into Naga's favorite burger destination. We pride ourselves on using fresh, locally-sourced ingredients and our signature Bicol spices that give our burgers that unique kick you can't find anywhere else.",

    // Images
    image:
      'https://i0.wp.com/nagayon.com/wp-content/uploads/2024/11/ateneo-de-naga-university1.jpg?resize=768%2C512&ssl=1',
    coverImage:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1200&h=600&fit=crop',
    logo: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=200&h=200&fit=crop',
    gallery: [
      {
        id: 'g1',
        url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800',
        caption: 'Our signature Bicol Express Burger',
        type: 'product',
      },
      {
        id: 'g2',
        url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800',
        caption: 'Cozy interior atmosphere',
        type: 'ambiance',
      },
      {
        id: 'g3',
        url: 'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?q=80&w=800',
        caption: 'Fresh ingredients daily',
        type: 'shop',
        isCustomerPhoto: true,
      },
    ],

    // Rating and Reviews
    rating: 4.5,
    ratingCount: 150,
    ratingBreakdown: {
      5: 89,
      4: 42,
      3: 15,
      2: 3,
      1: 1,
    },
    reviews: [
      {
        id: 'r1',
        userId: 'u1',
        userName: 'John D.',
        userAvatar:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&h=100&fit=crop',
        rating: 5,
        comment:
          'Best burger in Naga! The Bicol Express burger is incredible - perfect amount of spice and flavor. Staff is super friendly too.',
        date: '2024-05-15',
        images: [
          'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400',
        ],
        helpfulCount: 12,
        isVerifiedPurchase: true,
        response: {
          message:
            "Thank you so much John! We're thrilled you loved our signature burger. See you again soon!",
          date: '2024-05-16',
          isOwner: true,
        },
      },
      {
        id: 'r2',
        userId: 'u2',
        userName: 'Maria L.',
        userAvatar:
          'https://images.unsplash.com/photo-1494790108755-2616b612b5f5?q=80&w=100&h=100&fit=crop',
        rating: 4,
        comment:
          'Great food and atmosphere. A bit crowded during lunch but worth the wait!',
        date: '2024-05-10',
        helpfulCount: 8,
        isVerifiedPurchase: true,
      },
    ],

    // Location and Contact
    location: '123 Magsaysay Avenue, Naga City, Camarines Sur',
    mapLocation: { latitude: 13.6218, longitude: 123.1948 },
    contact: '+63 (54) 472-1234',
    email: 'info@burgerjoint-naga.com',
    socialLinks: {
      facebook: 'https://facebook.com/burgerjointnaga',
      instagram: 'https://instagram.com/burgerjointnaga',
      website: 'https://www.burgerjoint-naga.com',
    },

    // Business Information
    businessHours: {
      monday: { open: '10:00', close: '22:00' },
      tuesday: { open: '10:00', close: '22:00' },
      wednesday: { open: '10:00', close: '22:00' },
      thursday: { open: '10:00', close: '22:00' },
      friday: { open: '10:00', close: '23:00' },
      saturday: { open: '10:00', close: '23:00' },
      sunday: { open: '11:00', close: '21:00' },
    },
    priceRange: '₱150 - ₱300',
    isOpen: true,

    // Menu with enhanced data
    menu: [
      {
        id: 'm1',
        item: 'Classic Burger',
        price: '₱180',
        description: 'Beef patty, lettuce, tomato, onion, special sauce',
        image:
          'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300',
        category: 'burgers',
        isPopular: true,
        isAvailable: true,
        tags: ['beef', 'classic'],
      },
      {
        id: 'm2',
        item: 'Bicol Express Burger',
        price: '₱220',
        description:
          'Our signature burger with spicy Bicol Express twist, coconut milk-infused sauce',
        image:
          'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?q=80&w=300',
        category: 'burgers',
        isBestseller: true,
        isPopular: true,
        isAvailable: true,
        tags: ['spicy', 'signature', 'bicol'],
      },
      {
        id: 'm3',
        item: 'Cheese Fries',
        price: '₱120',
        description: 'Crispy fries topped with melted cheese',
        image:
          'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=300',
        category: 'sides',
        isAvailable: true,
        tags: ['cheese', 'fries'],
      },
    ],
    featuredItems: ['m2', 'm1'],
    menuCategories: ['burgers', 'sides', 'beverages'],

    // Business Features
    amenities: [
      { id: 'a1', name: 'Free WiFi', icon: 'wifi', available: true },
      { id: 'a2', name: 'Air Conditioning', icon: 'snow', available: true },
      { id: 'a3', name: 'Parking Available', icon: 'car', available: true },
      {
        id: 'a4',
        name: 'Wheelchair Accessible',
        icon: 'accessibility',
        available: true,
      },
      {
        id: 'a5',
        name: 'Outdoor Seating',
        icon: 'partly-sunny',
        available: false,
      },
      { id: 'a6', name: 'Delivery Service', icon: 'bicycle', available: true },
    ],

    promotions: [
      {
        id: 'p1',
        title: 'Buy 2 Get 1 Free Fries',
        description: 'Order any 2 burgers and get free cheese fries!',
        discountPercent: 0,
        validUntil: '2025-06-10',
        terms: 'Valid for dine-in only. Cannot be combined with other offers.',
        isActive: true,
        image:
          'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=400',
      },
      {
        id: 'p2',
        title: 'Student Discount',
        description: '10% off for students with valid ID',
        discountPercent: 10,
        validUntil: '2025-12-31',
        terms: 'Must present valid student ID. Valid for students only.',
        isActive: true,
      },
    ],

    verification: {
      isVerified: true,
      verificationBadges: ['FDA Approved', 'Business Permit'],
      businessLicense: true,
      healthCertificate: true,
      dtiBusiness: true,
    },

    stats: {
      followerCount: 1250,
      viewCount: 8500,
      averageResponseTime: 'Within 2 hours',
      responseRate: 95,
    },

    // Utility
    distance: 0.8,
    isFavorited: false,
    isBookmarkable: true,
    acceptsReservations: false,
    hasDelivery: true,
    hasPickup: true,
    tags: ['burgers', 'local-favorite', 'spicy', 'casual-dining'],
  },

  2: {
    id: '2',
    name: 'Serenity Spa & Wellness',
    category: 'spa',
    subcategory: 'full-service-spa',
    description:
      'A tranquil oasis offering premium spa and wellness services in the heart of Naga City.',
    tagline: 'Your Gateway to Relaxation and Wellness',
    story:
      'Established in 2020, Serenity Spa & Wellness was born from the vision of creating a peaceful sanctuary where busy individuals can escape the stresses of daily life. Our team of certified therapists combines traditional Filipino healing practices with modern wellness techniques to provide a truly transformative experience.',

    // Images
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80',
    coverImage:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1200&h=600&fit=crop',
    logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=200&h=200&fit=crop',
    gallery: [
      {
        id: 'g1',
        url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800',
        caption: 'Relaxing massage therapy room',
        type: 'ambiance',
      },
      {
        id: 'g2',
        url: 'https://images.unsplash.com/photo-1559784558-71fb2b1fc36d?q=80&w=800',
        caption: 'Premium facial treatment',
        type: 'product',
      },
      {
        id: 'g3',
        url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=800',
        caption: 'Peaceful waiting area',
        type: 'ambiance',
      },
    ],

    // Rating and Reviews
    rating: 4.8,
    ratingCount: 85,
    ratingBreakdown: {
      5: 68,
      4: 12,
      3: 4,
      2: 1,
      1: 0,
    },
    reviews: [
      {
        id: 'r1',
        userId: 'u3',
        userName: 'Sarah M.',
        userAvatar:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&h=100&fit=crop',
        rating: 5,
        comment:
          'Absolutely amazing experience! The hot stone massage was exactly what I needed. The therapists are so skilled and the ambiance is perfect for relaxation.',
        date: '2024-05-20',
        helpfulCount: 15,
        isVerifiedPurchase: true,
        response: {
          message:
            "Thank you Sarah! We're so happy you enjoyed your hot stone massage. We look forward to welcoming you back soon.",
          date: '2024-05-21',
          isOwner: true,
        },
      },
    ],

    // Location and Contact
    location: '456 Peñafrancia Avenue, Naga City, Camarines Sur',
    mapLocation: { latitude: 13.622, longitude: 123.195 },
    contact: '+63 (54) 478-9012',
    email: 'book@serenityspa-naga.com',
    socialLinks: {
      facebook: 'https://facebook.com/serenityspa.naga',
      instagram: 'https://instagram.com/serenityspa_naga',
      website: 'https://www.serenityspa-naga.com',
    },

    // Business Information
    businessHours: {
      monday: { open: '09:00', close: '20:00' },
      tuesday: { open: '09:00', close: '20:00' },
      wednesday: { open: '09:00', close: '20:00' },
      thursday: { open: '09:00', close: '20:00' },
      friday: { open: '09:00', close: '20:00' },
      saturday: { open: '08:00', close: '18:00' },
      sunday: { open: '10:00', close: '18:00' },
    },
    priceRange: '₱500 - ₱2,500',
    isOpen: true,

    // Services Menu
    menu: [
      {
        id: 's1',
        item: 'Swedish Massage (60 min)',
        price: '₱1,200',
        description:
          'Classic full-body massage to relieve tension and promote relaxation',
        image:
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=300',
        category: 'massage',
        isPopular: true,
        isAvailable: true,
        tags: ['relaxation', 'full-body', '60-minutes'],
      },
      {
        id: 's2',
        item: 'Hot Stone Therapy (90 min)',
        price: '₱1,800',
        description:
          'Heated basalt stones combined with massage to melt away stress and tension',
        image:
          'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=300',
        category: 'massage',
        isBestseller: true,
        isPopular: true,
        isAvailable: true,
        tags: ['hot-stone', 'premium', '90-minutes'],
      },
      {
        id: 's3',
        item: 'Rejuvenating Facial',
        price: '₱800',
        description:
          'Deep cleansing facial with hydrating mask for glowing skin',
        image:
          'https://images.unsplash.com/photo-1559784558-71fb2b1fc36d?q=80&w=300',
        category: 'facial',
        isAvailable: true,
        tags: ['skincare', 'hydrating', 'anti-aging'],
      },
    ],
    featuredItems: ['s2', 's1'],
    menuCategories: ['massage', 'facial', 'body-treatments', 'packages'],

    // Business Features
    amenities: [
      {
        id: 'a1',
        name: 'Private Treatment Rooms',
        icon: 'lock-closed',
        available: true,
      },
      { id: 'a2', name: 'Shower Facilities', icon: 'water', available: true },
      { id: 'a3', name: 'Relaxation Lounge', icon: 'bed', available: true },
      { id: 'a4', name: 'Aromatherapy', icon: 'flower', available: true },
      {
        id: 'a5',
        name: 'Couples Treatment Room',
        icon: 'heart',
        available: true,
      },
      { id: 'a6', name: 'Parking Available', icon: 'car', available: true },
    ],

    promotions: [
      {
        id: 'p1',
        title: 'First Visit Special',
        description: '20% off your first treatment',
        discountPercent: 20,
        validUntil: '2024-12-31',
        terms:
          'Valid for new customers only. Cannot be combined with other offers.',
        isActive: true,
      },
      {
        id: 'p2',
        title: 'Couples Package',
        description: 'Book couples massage and get complimentary facial',
        validUntil: '2024-07-31',
        terms:
          'Valid for couples massage bookings only. Advance booking required.',
        isActive: true,
        image:
          'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=400',
      },
    ],

    verification: {
      isVerified: true,
      verificationBadges: [
        'Certified Therapists',
        'Health Department Approved',
      ],
      businessLicense: true,
      healthCertificate: true,
    },

    stats: {
      followerCount: 890,
      viewCount: 5200,
      averageResponseTime: 'Within 1 hour',
      responseRate: 98,
    },
    // Utility
    distance: 1.2,
    isFavorited: false,
    isBookmarkable: true,
    acceptsReservations: true,
    hasDelivery: false,
    hasPickup: false,
    tags: ['spa', 'wellness', 'massage', 'relaxation', 'premium'],
  },

  3: {
    id: '3',
    name: 'Brew & Beans Coffee House',
    category: 'cafe',
    subcategory: 'coffee-shop',
    description:
      'Artisan coffee roasted locally with cozy atmosphere perfect for work and relaxation.',
    tagline: 'Where Every Cup Tells a Story',
    story:
      'Started in 2019 by coffee enthusiast Miguel Reyes, Brew & Beans sources premium beans from local Bicol farms and roasts them in-house. Our mission is to showcase the rich coffee heritage of the Philippines while providing a warm, welcoming space for the community to gather.',

    // Images
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80',
    coverImage:
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1200&h=600&fit=crop',
    logo: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=200&h=200&fit=crop',
    gallery: [
      {
        id: 'g1',
        url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=800',
        caption: 'Freshly brewed signature coffee',
        type: 'product',
      },
      {
        id: 'g2',
        url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800',
        caption: 'Cozy interior perfect for work',
        type: 'ambiance',
      },
      {
        id: 'g3',
        url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800',
        caption: 'Local coffee beans roasting process',
        type: 'shop',
      },
    ],

    // Rating and Reviews
    rating: 4.6,
    ratingCount: 120,
    ratingBreakdown: {
      5: 78,
      4: 28,
      3: 10,
      2: 3,
      1: 1,
    },
    reviews: [
      {
        id: 'r1',
        userId: 'u4',
        userName: 'Alex T.',
        userAvatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&h=100&fit=crop',
        rating: 5,
        comment:
          'Best coffee in Naga! The Bicol Blend is amazing and the wifi is reliable for remote work. Love the local art on the walls too.',
        date: '2024-05-18',
        helpfulCount: 18,
        isVerifiedPurchase: true,
        response: {
          message:
            "Thanks Alex! We're glad you enjoy our Bicol Blend and the work-friendly atmosphere. See you soon!",
          date: '2024-05-19',
          isOwner: true,
        },
      },
    ],

    // Location and Contact
    location: '789 Jacob Street, Naga City, Camarines Sur',
    mapLocation: { latitude: 13.6215, longitude: 123.1952 },
    contact: '+63 (54) 475-3456',
    email: 'hello@brewandbeans-naga.com',
    socialLinks: {
      facebook: 'https://facebook.com/brewandbeansph',
      instagram: 'https://instagram.com/brewandbeansnaga',
      website: 'https://www.brewandbeans-naga.com',
    },

    // Business Information
    businessHours: {
      monday: { open: '06:00', close: '21:00' },
      tuesday: { open: '06:00', close: '21:00' },
      wednesday: { open: '06:00', close: '21:00' },
      thursday: { open: '06:00', close: '21:00' },
      friday: { open: '06:00', close: '22:00' },
      saturday: { open: '07:00', close: '22:00' },
      sunday: { open: '07:00', close: '20:00' },
    },
    priceRange: '₱80 - ₱250',
    isOpen: true,

    // Menu
    menu: [
      {
        id: 'c1',
        item: 'Bicol Blend Americano',
        price: '₱120',
        description: 'Our signature coffee blend from local Bicol farms',
        image:
          'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=300',
        category: 'coffee',
        isBestseller: true,
        isPopular: true,
        isAvailable: true,
        tags: ['signature', 'local', 'strong'],
      },
      {
        id: 'c2',
        item: 'Iced Coconut Latte',
        price: '₱150',
        description:
          'Smooth espresso with coconut milk, perfect for tropical weather',
        image:
          'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=300',
        category: 'coffee',
        isPopular: true,
        isAvailable: true,
        tags: ['coconut', 'iced', 'dairy-free'],
      },
      {
        id: 'c3',
        item: 'Banana Bread',
        price: '₱95',
        description: 'Homemade banana bread using local saba bananas',
        image:
          'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=300',
        category: 'pastry',
        isAvailable: true,
        tags: ['homemade', 'local-ingredients', 'sweet'],
      },
    ],
    featuredItems: ['c1', 'c2'],
    menuCategories: ['coffee', 'pastry', 'sandwiches', 'beverages'],

    // Business Features
    amenities: [
      { id: 'a1', name: 'Free WiFi', icon: 'wifi', available: true },
      { id: 'a2', name: 'Power Outlets', icon: 'flash', available: true },
      { id: 'a3', name: 'Air Conditioning', icon: 'snow', available: true },
      { id: 'a4', name: 'Study Area', icon: 'library', available: true },
      {
        id: 'a5',
        name: 'Outdoor Seating',
        icon: 'partly-sunny',
        available: true,
      },
      { id: 'a6', name: 'Takeaway Service', icon: 'bag', available: true },
    ],

    promotions: [
      {
        id: 'p1',
        title: 'Student Discount',
        description: '15% off for students with valid ID',
        discountPercent: 15,
        validUntil: '2024-12-31',
        terms: 'Must present valid student ID. Valid Monday to Friday only.',
        isActive: true,
      },
      {
        id: 'p2',
        title: 'Buy 5 Get 1 Free',
        description: 'Loyalty card program - collect stamps for free coffee',
        validUntil: '2024-12-31',
        terms:
          'Valid for regular coffee drinks only. Cannot be combined with other offers.',
        isActive: true,
      },
    ],

    verification: {
      isVerified: true,
      verificationBadges: ['FDA Approved', 'Organic Certified'],
      businessLicense: true,
      healthCertificate: true,
    },

    stats: {
      followerCount: 2100,
      viewCount: 12000,
      averageResponseTime: 'Within 30 minutes',
      responseRate: 92,
    },

    // Utility
    distance: 0.6,
    isFavorited: false,
    isBookmarkable: true,
    acceptsReservations: false,
    hasDelivery: true,
    hasPickup: true,
    tags: ['coffee', 'local-roasted', 'wifi', 'study-friendly', 'artisan'],
  },

  4: {
    id: '4',
    name: 'TechHub Computer Shop',
    category: 'computer',
    subcategory: 'computer-electronics',
    description:
      'Your one-stop shop for computers, laptops, gadgets, and tech support services in Naga City.',
    tagline: 'Powering Your Digital Life',
    story:
      "Established in 2017 by tech enthusiast Robert Cruz, TechHub has been serving Naga's growing tech community with quality computer products and reliable repair services. We specialize in custom PC builds, laptop repairs, and providing the latest gadgets to keep you connected.",

    // Images
    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80',
    coverImage:
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?q=80&w=1200&h=600&fit=crop',
    logo: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?q=80&w=200&h=200&fit=crop',
    gallery: [
      {
        id: 'g1',
        url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=800',
        caption: 'Latest laptop models in stock',
        type: 'product',
      },
      {
        id: 'g2',
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?q=80&w=800',
        caption: 'Professional repair station',
        type: 'shop',
      },
      {
        id: 'g3',
        url: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?q=80&w=800',
        caption: 'Custom gaming PC builds',
        type: 'product',
      },
    ],

    // Rating and Reviews
    rating: 4.4,
    ratingCount: 95,
    ratingBreakdown: {
      5: 58,
      4: 25,
      3: 8,
      2: 3,
      1: 1,
    },
    reviews: [
      {
        id: 'r1',
        userId: 'u5',
        userName: 'Mark P.',
        userAvatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&h=100&fit=crop',
        rating: 5,
        comment:
          'Excellent service! They fixed my laptop quickly and the price was very reasonable. Staff is knowledgeable and helpful.',
        date: '2024-05-12',
        helpfulCount: 14,
        isVerifiedPurchase: true,
        response: {
          message:
            "Thank you Mark! We're happy we could get your laptop running smoothly again. Don't hesitate to reach out if you need anything else!",
          date: '2024-05-13',
          isOwner: true,
        },
      },
    ],

    // Location and Contact
    location: '321 Gen. Luna Street, Naga City, Camarines Sur',
    mapLocation: { latitude: 13.6222, longitude: 123.1945 },
    contact: '+63 (54) 473-7890',
    email: 'support@techhub-naga.com',
    socialLinks: {
      facebook: 'https://facebook.com/techhubnaga',
      instagram: 'https://instagram.com/techhub_naga',
      website: 'https://www.techhub-naga.com',
    },

    // Business Information
    businessHours: {
      monday: { open: '08:00', close: '19:00' },
      tuesday: { open: '08:00', close: '19:00' },
      wednesday: { open: '08:00', close: '19:00' },
      thursday: { open: '08:00', close: '19:00' },
      friday: { open: '08:00', close: '19:00' },
      saturday: { open: '08:00', close: '18:00' },
      sunday: { open: '10:00', close: '17:00' },
    },
    priceRange: '₱500 - ₱80,000',
    isOpen: true,

    // Products/Services Menu
    menu: [
      {
        id: 't1',
        item: 'Laptop Repair Service',
        price: '₱800',
        description: 'Complete laptop diagnostic and repair service',
        image:
          'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=300',
        category: 'repair',
        isPopular: true,
        isAvailable: true,
        tags: ['repair', 'diagnostic', 'warranty'],
      },
      {
        id: 't2',
        item: 'Custom Gaming PC Build',
        price: '₱35,000',
        description:
          'High-performance gaming PC tailored to your specifications',
        image:
          'https://images.unsplash.com/photo-1587831990711-23ca6441447b?q=80&w=300',
        category: 'custom-build',
        isBestseller: true,
        isPopular: true,
        isAvailable: true,
        tags: ['gaming', 'custom', 'high-performance'],
      },
      {
        id: 't3',
        item: 'Phone Screen Replacement',
        price: '₱1,500',
        description: 'Professional smartphone screen repair with warranty',
        image:
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=300',
        category: 'repair',
        isAvailable: true,
        tags: ['mobile', 'screen', 'warranty'],
      },
    ],
    featuredItems: ['t2', 't1'],
    menuCategories: [
      'laptops',
      'desktops',
      'repair',
      'accessories',
      'custom-build',
    ],

    // Business Features
    amenities: [
      { id: 'a1', name: 'Free Diagnostic', icon: 'search', available: true },
      {
        id: 'a2',
        name: 'Warranty Service',
        icon: 'shield-checkmark',
        available: true,
      },
      { id: 'a3', name: 'On-site Support', icon: 'home', available: true },
      {
        id: 'a4',
        name: 'Data Recovery',
        icon: 'document-text',
        available: true,
      },
      {
        id: 'a5',
        name: 'Trade-in Program',
        icon: 'swap-horizontal',
        available: true,
      },
      { id: 'a6', name: 'Installment Payment', icon: 'card', available: true },
    ],

    promotions: [
      {
        id: 'p1',
        title: 'Back to School Promo',
        description: '10% off on laptops for students',
        discountPercent: 10,
        validUntil: '2024-08-31',
        terms:
          'Valid for students with ID. Cannot be combined with other offers.',
        isActive: true,
      },
      {
        id: 'p2',
        title: 'Free Screen Protector',
        description: 'Free tempered glass with phone screen replacement',
        validUntil: '2024-07-31',
        terms: 'Valid for screen replacement services only.',
        isActive: true,
      },
    ],

    verification: {
      isVerified: true,
      verificationBadges: ['Authorized Dealer', 'Certified Technicians'],
      businessLicense: true,
      technicalCertifications: true,
    },

    stats: {
      followerCount: 1650,
      viewCount: 9200,
      averageResponseTime: 'Within 2 hours',
      responseRate: 89,
    },

    // Utility
    distance: 1.0,
    isFavorited: false,
    isBookmarkable: true,
    acceptsReservations: true,
    hasDelivery: false,
    hasPickup: true,
    tags: ['computers', 'repair', 'gaming', 'tech-support', 'custom-build'],
  },

  5: {
    id: '5',
    name: 'Naga Treasures Souvenir Shop',
    category: 'souvenir',
    subcategory: 'gifts-souvenirs',
    description:
      'Authentic Bicolano souvenirs, local crafts, and unique gifts showcasing the rich culture of Naga City.',
    tagline: 'Take Home a Piece of Naga',
    story:
      'Founded in 2016 by local artist Carmen Villanueva, Naga Treasures was born from a passion to preserve and share Bicolano culture through authentic handicrafts. We work directly with local artisans and communities to bring you genuine products that tell the story of our beautiful region.',

    // Images
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80',
    coverImage:
      'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=1200&h=600&fit=crop',
    logo: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=200&h=200&fit=crop',
    gallery: [
      {
        id: 'g1',
        url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800',
        caption: 'Handwoven traditional crafts',
        type: 'product',
      },
      {
        id: 'g2',
        url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=800',
        caption: 'Local pottery and ceramics',
        type: 'product',
      },
      {
        id: 'g3',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800',
        caption: 'Shop interior with local artwork',
        type: 'shop',
      },
    ],

    // Rating and Reviews
    rating: 4.7,
    ratingCount: 78,
    ratingBreakdown: {
      5: 58,
      4: 15,
      3: 3,
      2: 1,
      1: 1,
    },
    reviews: [
      {
        id: 'r1',
        userId: 'u6',
        userName: 'Lisa M.',
        userAvatar:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&h=100&fit=crop',
        rating: 5,
        comment:
          'Beautiful authentic items! I bought several pieces for my family abroad. The owner was very knowledgeable about the history behind each item.',
        date: '2024-05-08',
        helpfulCount: 22,
        isVerifiedPurchase: true,
        response: {
          message:
            "Thank you Lisa! We're so glad you found meaningful pieces to share with your family. Safe travels!",
          date: '2024-05-09',
          isOwner: true,
        },
      },
    ],

    // Location and Contact
    location: '567 Rizal Street, Naga City, Camarines Sur',
    mapLocation: { latitude: 13.6225, longitude: 123.194 },
    contact: '+63 (54) 476-5432',
    email: 'info@nagatreasures.com',
    socialLinks: {
      facebook: 'https://facebook.com/nagatreasures',
      instagram: 'https://instagram.com/naga_treasures',
      website: 'https://www.nagatreasures.com',
    },

    // Business Information
    businessHours: {
      monday: { open: '09:00', close: '18:00' },
      tuesday: { open: '09:00', close: '18:00' },
      wednesday: { open: '09:00', close: '18:00' },
      thursday: { open: '09:00', close: '18:00' },
      friday: { open: '09:00', close: '18:00' },
      saturday: { open: '08:00', close: '19:00' },
      sunday: { open: '09:00', close: '17:00' },
    },
    priceRange: '₱50 - ₱1,500',
    isOpen: true,

    // Products Menu
    menu: [
      {
        id: 'n1',
        item: 'Handwoven Abaca Bag',
        price: '₱450',
        description: 'Traditional handwoven bag made from native abaca fibers',
        image:
          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=300',
        category: 'handicrafts',
        isBestseller: true,
        isPopular: true,
        isAvailable: true,
        tags: ['handwoven', 'traditional', 'eco-friendly'],
      },
      {
        id: 'n2',
        item: 'Bicol Express Sauce Mix',
        price: '₱85',
        description:
          'Authentic Bicol Express spice mix - bring the taste of Bicol home',
        image:
          'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=300',
        category: 'food-souvenirs',
        isPopular: true,
        isAvailable: true,
        tags: ['spices', 'authentic', 'local-flavor'],
      },
      {
        id: 'n3',
        item: 'Naga City Ceramic Mug',
        price: '₱180',
        description: 'Locally made ceramic mug featuring Naga City landmarks',
        image:
          'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=300',
        category: 'ceramics',
        isAvailable: true,
        tags: ['ceramic', 'landmarks', 'functional'],
      },
    ],
    featuredItems: ['n1', 'n2'],
    menuCategories: [
      'handicrafts',
      'food-souvenirs',
      'ceramics',
      'textiles',
      'accessories',
    ],

    // Business Features
    amenities: [
      { id: 'a1', name: 'Gift Wrapping', icon: 'gift', available: true },
      { id: 'a2', name: 'Shipping Service', icon: 'airplane', available: true },
      { id: 'a3', name: 'Cultural Stories', icon: 'book', available: true },
      { id: 'a4', name: 'Custom Orders', icon: 'create', available: true },
      { id: 'a5', name: 'Bulk Discounts', icon: 'pricetags', available: true },
      { id: 'a6', name: 'Tourist Guides', icon: 'map', available: true },
    ],

    promotions: [
      {
        id: 'p1',
        title: 'Tourist Special',
        description: '15% off for tourists with valid ID',
        discountPercent: 15,
        validUntil: '2024-12-31',
        terms:
          'Must present tourist visa or foreign passport. Minimum purchase of ₱300.',
        isActive: true,
      },
      {
        id: 'p2',
        title: 'Bulk Purchase Discount',
        description: 'Buy 5 items get 1 free',
        validUntil: '2024-12-31',
        terms:
          'Valid for items of equal or lesser value. Cannot be combined with other offers.',
        isActive: true,
      },
    ],

    verification: {
      isVerified: true,
      verificationBadges: [
        'Authentic Local Products',
        'Cultural Heritage Certified',
      ],
      businessLicense: true,
      culturalCertification: true,
    },

    stats: {
      followerCount: 950,
      viewCount: 6800,
      averageResponseTime: 'Within 1 hour',
      responseRate: 96,
    },

    // Utility
    distance: 0.9,
    isFavorited: false,
    isBookmarkable: true,
    acceptsReservations: false,
    hasDelivery: true,
    hasPickup: true,
    tags: [
      'souvenirs',
      'handicrafts',
      'authentic',
      'cultural',
      'local-artisans',
    ],
  },

  // You can continue adding more shops with this enhanced structure...
};

// Export for compatibility with existing code
export const ShopsData = Object.values(shopsData);

// Hierarchical categories with main categories and subcategories
export const mainCategories = [
  {
    id: 'food-beverage',
    name: 'Food & Beverage',
    icon: 'restaurant',
    description: 'Restaurants, cafes, bars, and food establishments',
    subcategories: [
      { id: 'dining', name: 'Restaurants', icon: 'restaurant-outline' },
      { id: 'cafe', name: 'Cafes', icon: 'cafe-outline' },
      { id: 'bars', name: 'Bars & Nightlife', icon: 'wine-outline' },
      { id: 'fastfood', name: 'Fast Food', icon: 'fast-food-outline' },
      { id: 'bakery', name: 'Bakeries', icon: 'storefront-outline' },
    ],
  },
  {
    id: 'health-beauty',
    name: 'Health & Beauty',
    icon: 'medical',
    description: 'Spas, salons, pharmacies, and wellness services',
    subcategories: [
      { id: 'spa', name: 'Spas & Wellness', icon: 'leaf-outline' },
      { id: 'salon', name: 'Salons & Barbershops', icon: 'cut-outline' },
      { id: 'pharmacy', name: 'Pharmacies', icon: 'medical-outline' },
      { id: 'clinic', name: 'Clinics', icon: 'medical' },
      { id: 'dental', name: 'Dental Services', icon: 'medical-outline' },
      { id: 'optical', name: 'Optical Shops', icon: 'eye-outline' },
    ],
  },
  {
    id: 'technology-services',
    name: 'Technology & Services',
    icon: 'desktop',
    description: 'Computer shops, printing, and tech services',
    subcategories: [
      { id: 'computer', name: 'Computer Shops', icon: 'desktop-outline' },
      {
        id: 'mobile',
        name: 'Mobile & Electronics',
        icon: 'phone-portrait-outline',
      },
      { id: 'printing', name: 'Printing Services', icon: 'print-outline' },
      { id: 'internet', name: 'Internet Cafes', icon: 'wifi-outline' },
      { id: 'repair', name: 'Repair Services', icon: 'build-outline' },
    ],
  },
  {
    id: 'shopping-retail',
    name: 'Shopping & Retail',
    icon: 'storefront-outline',
    description: 'Clothing, gifts, accessories, and retail stores',
    subcategories: [
      { id: 'souvenir', name: 'Souvenirs & Gifts', icon: 'gift-outline' },
      { id: 'clothing', name: 'Clothing & Fashion', icon: 'shirt-outline' },
      { id: 'shoes', name: 'Shoes & Accessories', icon: 'footsteps-outline' },
      { id: 'jewelry', name: 'Jewelry & Watches', icon: 'diamond-outline' },
      { id: 'books', name: 'Books & Stationery', icon: 'library-outline' },
      { id: 'sports', name: 'Sports & Recreation', icon: 'fitness-outline' },
      { id: 'toys', name: 'Toys & Games', icon: 'game-controller-outline' },
    ],
  },
  {
    id: 'professional-services',
    name: 'Professional Services',
    icon: 'briefcase',
    description: 'Financial, legal, and business services',
    subcategories: [
      { id: 'financial', name: 'Financial Services', icon: 'card-outline' },
      { id: 'insurance', name: 'Insurance', icon: 'shield-outline' },
      { id: 'legal', name: 'Legal Services', icon: 'document-text-outline' },
      { id: 'accounting', name: 'Accounting', icon: 'calculator-outline' },
      { id: 'realestate', name: 'Real Estate', icon: 'home-outline' },
      { id: 'travel', name: 'Travel & Tours', icon: 'airplane-outline' },
    ],
  },
  {
    id: 'automotive-transportation',
    name: 'Automotive & Transportation',
    icon: 'car-outline',
    description: 'Car services, gas stations, and transportation',
    subcategories: [
      { id: 'automotive', name: 'Automotive Services', icon: 'car' },
      { id: 'gasstation', name: 'Gas Stations', icon: 'car-sport' },
      { id: 'parking', name: 'Parking Services', icon: 'car-outline' },
    ],
  },
  {
    id: 'specialty-stores',
    name: 'Specialty Stores',
    icon: 'hammer',
    description: 'Hardware, garden, pet, and specialty shops',
    subcategories: [
      { id: 'hardware', name: 'Hardware Stores', icon: 'hammer' },
      { id: 'garden', name: 'Garden & Plants', icon: 'flower' },
      { id: 'pet', name: 'Pet Stores & Services', icon: 'paw' },
      { id: 'music', name: 'Music & Instruments', icon: 'musical-notes' },
      { id: 'art', name: 'Art & Crafts', icon: 'brush' },
    ],
  },
  {
    id: 'essential-services',
    name: 'Essential Services',
    icon: 'basket',
    description: 'Grocery, laundry, and daily necessities',
    subcategories: [
      { id: 'laundry', name: 'Laundry Services', icon: 'shirt-outline' },
      { id: 'grocery', name: 'Grocery Stores', icon: 'basket' },
      { id: 'convenience', name: 'Convenience Stores', icon: 'storefront' },
      { id: 'market', name: 'Markets', icon: 'basket-outline' },
    ],
  },
];

// Flattened categories for backward compatibility
export const categories = mainCategories.flatMap((mainCat) =>
  mainCat.subcategories.map((subCat) => ({
    ...subCat,
    mainCategory: mainCat.id,
    mainCategoryName: mainCat.name,
  }))
);

// Helper functions for category management
export const getCategoryById = (categoryId) => {
  return categories.find((cat) => cat.id === categoryId);
};

export const getMainCategoryById = (mainCategoryId) => {
  return mainCategories.find((cat) => cat.id === mainCategoryId);
};

export const getSubcategoriesByMainCategory = (mainCategoryId) => {
  const mainCat = getMainCategoryById(mainCategoryId);
  return mainCat ? mainCat.subcategories : [];
};

export const getMainCategoryBySubcategory = (subcategoryId) => {
  const category = getCategoryById(subcategoryId);
  return category ? getMainCategoryById(category.mainCategory) : null;
};

// Featured locations (first 3 shops)
export const featuredShops = [shopsData['1'], shopsData['2'], shopsData['3']];

// Destinations mapping for consistency with tourist spots
export const destinations = Object.values(shopsData);

// --- START: New Special Offers Data ---
// Updated to be an object and match SpecialOffer type
export const specialOffersData = {
  so_001: {
    id: 'so_001',
    title: 'Weekend Getaway Deals',
    description:
      'Amazing deals for your next weekend adventure. Explore scenic spots and enjoy local culture with our curated packages.',
    termsAndConditions:
      'Offer valid for bookings made through our app. Subject to availability. Cannot be combined with other promos. Travel insurance not included. Valid for travel dates within the next 3 months.',
    image:
      'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?q=80&w=600&h=320&fit=crop',
    promoImageUrl:
      'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?q=80&w=600&h=320&fit=crop', // Retained for compatibility if used elsewhere
    altText:
      'Advertisement for weekend getaway travel packages with a scenic view.', // Retained for compatibility
    targetPath: '/(tabs)/(home)/(offers)/weekend-deals', // Retained for compatibility
    validFrom: '2024-06-01T00:00:00Z',
    validUntil: '2024-08-31T23:59:59Z',
    isActive: true,
    discountPercent: 15,
    applicableShopIds: ['1', '3'], // Example: Burger Joint & Brew & Beans
    applicableToAllShops: false,
    type: 'discount',
    category: 'travel',
  },
  so_002: {
    id: 'so_002',
    title: 'Restaurant Discounts: Up to 50% Off!',
    description:
      'Dine at your favorite Naga restaurants and enjoy up to 50% off on selected dishes. Perfect for foodies!',
    termsAndConditions:
      'Discount varies per restaurant and item. Valid for dine-in only. Present this offer in the app to avail. Not valid on holidays. Minimum spend may be required at some locations.',
    image:
      'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=600&h=320&fit=crop',
    promoImageUrl:
      'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=600&h=320&fit=crop',
    altText: 'Advertisement for restaurant discounts showing delicious food.',
    targetPath: '/(tabs)/(home)/(shops)/categories/dining',
    validFrom: '2024-05-15T00:00:00Z',
    validUntil: '2024-07-15T23:59:59Z',
    isActive: true,
    discountPercent: 50, // "Up to"
    shopId: '1', // Example: Burger Joint specific offer
    applicableToAllShops: false,
    type: 'percentage_off',
    category: 'dining',
  },
  so_003: {
    id: 'so_003',
    title: 'New Tech Gadgets - Launch Offer',
    description:
      'Be the first to own the latest tech! Special launch prices on new smartphones, laptops, and accessories.',
    termsAndConditions:
      'Offer valid while stocks last. Limited to one unit per customer for select items. Warranty terms apply. Check in-store for participating brands.',
    image:
      'https://images.unsplash.com/photo-1526178094224-95108a9590cf?q=80&w=600&h=320&fit=crop',
    promoImageUrl:
      'https://images.unsplash.com/photo-1526178094224-95108a9590cf?q=80&w=600&h=320&fit=crop',
    altText: 'Advertisement for new tech gadgets with a sleek product shot.',
    targetPath: '/(tabs)/(home)/(shops)/categories/mobile', // Example path, adjust as needed
    validFrom: '2024-06-10T00:00:00Z',
    validUntil: '2024-06-30T23:59:59Z',
    isActive: true,
    discountFixedAmount: 500, // e.g. P500 off
    applicableShopIds: ['4'], // Example: TechHub
    applicableToAllShops: false,
    type: 'fixed_amount_off',
    category: 'electronics',
  },
  so_004: {
    id: 'so_004',
    title: 'Fashion Frenzy: Seasonal Sale',
    description:
      'Refresh your wardrobe with our seasonal fashion sale. Discounts on clothing, shoes, and accessories.',
    termsAndConditions:
      'Valid on selected items only. Sizes and availability may vary. Exchange policy applies. Not valid for gift cards.',
    image:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&h=320&fit=crop',
    promoImageUrl:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&h=320&fit=crop',
    altText: 'Advertisement for a fashion sale with stylish apparel.',
    targetPath: '/(tabs)/(home)/(shops)/categories/clothing', // Example path
    validFrom: '2024-07-01T00:00:00Z',
    validUntil: '2024-07-31T23:59:59Z',
    isActive: true,
    discountPercent: 30,
    applicableToAllShops: true, // Example: Applies to all clothing stores
    type: 'sale_event',
    category: 'fashion',
  },
};
// --- END: New Special Offers Data ---

// Helper function to get a special offer by its ID
export const getSpecialOfferById = (id) => {
  return specialOffersData[id] || null;
};

// Helper function to get shops by an array of IDs
export const getShopsByIds = (ids) => {
  if (!ids || ids.length === 0) {
    return [];
  }
  return ids.map((id) => shopsData[id]).filter((shop) => shop !== undefined);
};
