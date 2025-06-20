export const events = [
    {
      id: 1,
      name: "Peñafrancia Festival 2024",
      type: "Cultural",
      date: "September 13-22, 2024",
      location: "Naga City",
      coordinates: {
        latitude: 13.6217,
        longitude: 123.1948,
        venue: "Naga Metropolitan Cathedral"
      },
      description: "The Peñafrancia Festival is a religious and cultural celebration in honor of Our Lady of Peñafrancia, featuring fluvial processions, street parades, and various cultural events.",
      image: {
        src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbWt-kLXq4Zw8sfkYxcVAKBxQlmrnIWNNaeg&s",
        alt: "Peñafrancia Festival fluvial procession with devotees carrying the image of Our Lady of Peñafrancia",
        href: "/events/penafrancia-festival"
      },
      isNearby: true,
      isUpcoming: true,
      schedule: [
        {
          day: "September 13",
          events: ["Opening Ceremony", "Traslacion Procession"]
        },
        {
          day: "September 21",
          events: ["Fluvial Procession", "Cultural Night"]
        }
      ],
      admissionFee: "Free",
      startTime: "9:00 AM",
      endTime: "10:00 PM",
      features: [
        "Religious Processions",
        "Cultural Performances",
        "Street Dancing",
        "Food Festival",
        "Fireworks Display"
      ]
    },
    {
      id: 2,
      name: "NAGA WON! 365 Photo Contest",
      type: "Competition",
      date: "January - December 2024",
      location: "Naga City",
      coordinates: {
        latitude: 13.6232,
        longitude: 123.1943,
        venue: "Plaza Rizal"
      },
      description: "A year-long photo and reel contest showcasing the beauty and culture of Naga City through the lens of local photographers and content creators.",
      image: {
        src: "https://images.pexels.com/photos/1449795/pexels-photo-1449795.jpeg",
        alt: "NAGA WON! 365 Photo Contest promotional image showing Naga City landmarks",
        href: "/events/photo-contest"
      },
      isNearby: false,
      isUpcoming: true,
      categories: ["Street Photography", "Cultural Events", "Food & Cuisine", "City Landscapes"],
      admissionFee: "₱500 registration fee",
      startTime: "12:00 AM",
      endTime: "11:59 PM",
      prizes: {
        first: "₱50,000",
        second: "₱30,000",
        third: "₱20,000",
        special: "₱10,000"
      }
    },
    {
      id: 3,
      name: "Kinalas Festival",
      type: "Food Festival",
      date: "June 15-18, 2024",
      location: "Plaza Quezon, Naga City",
      coordinates: {
        latitude: 13.6197,
        longitude: 123.1941,
        venue: "Plaza Quezon"
      },
      description: "A celebration of Naga's famous noodle dish, featuring cooking competitions, food stalls, and cultural performances.",
      image: {
        src: "https://1.bp.blogspot.com/-EnxlWvxRyW0/XS9Qj4PQs7I/AAAAAAAAAVA/qOOKCHnNOqI5TXCXaKhqvLJiwHbP86UYgCLcBGAs/s1600/kinalas.jpg",
        alt: "Kinalas Festival featuring traditional Naga City noodle dish",
        href: "/events/kinalas-festival"
      },
      isNearby: true,
      isUpcoming: true,
      activities: ["Cooking Competition", "Food Fair", "Cultural Shows", "Live Music"],
      admissionFee: "Free",
      startTime: "10:00 AM",
      endTime: "10:00 PM",
      specialDishes: [
        "Traditional Kinalas",
        "Kinalas Pizza",
        "Kinalas Shawarma",
        "Crispy Kinalas",
        "Lechon Kinalas"
      ],
      features: [
        "Live Cooking Demonstrations",
        "Best Kinalas Competition",
        "Food Tasting",
        "Local Entertainment"
      ]
    },
    {
      id: 4,
      name: "Kamundagan Festival",
      type: "Cultural",
      date: "December 15-25, 2024",
      location: "Various locations in Naga City",
      coordinates: {
        latitude: 13.6213,
        longitude: 123.1945,
        venue: "Plaza Quince Martires"
      },
      description: "A Christmas festival celebrating the birth of Jesus Christ with various activities including street dancing, lantern parade, and night market.",
      image: {
        src: "https://bicol.politics.com.ph/wp-content/uploads/2022/12/kamundagan-2022.jpg",
        alt: "Kamundagan Festival Christmas celebration with lantern parade",
        href: "/events/kamundagan-festival"
      },
      isNearby: false,
      isUpcoming: true,
      highlights: ["Lantern Parade", "Christmas Village", "Night Market", "Street Dancing Competition"],
      admissionFee: "Free",
      startTime: "4:00 PM",
      endTime: "12:00 AM",
      schedule: [
        {
          day: "December 15",
          events: ["Opening Ceremony", "Christmas Village Opening"]
        },
        {
          day: "December 20",
          events: ["Lantern Parade", "Christmas Carol Competition"]
        },
        {
          day: "December 24",
          events: ["Midnight Mass", "Community Celebration"]
        }
      ]
    },
    {
      id: 5,
      name: "Bicol Food Festival",
      type: "Food Festival",
      date: "August 10-12, 2024",
      location: "SM City Naga",
      coordinates: {
        latitude: 13.6258,
        longitude: 123.1934,
        venue: "SM City Naga"
      },
      description: "A gastronomic celebration featuring Bicol's spicy and unique cuisine, with cooking demonstrations and food tasting events.",
      image: {
        src: "https://1.bp.blogspot.com/-8cXxe_aH5nY/X1gYs8CdHjI/AAAAAAAAA8Y/vH6BGdz9goMNgKHWBN9lHxJJmqJ4JvWPgCLcBGAsYHQ/s1600/bicol%2Bexpress.jpg",
        alt: "Bicol Food Festival showcasing local spicy dishes",
        href: "/events/bicol-food-festival"
      },
      isNearby: true,
      isUpcoming: true,
      features: ["Cooking Demos", "Food Tasting", "Local Chef Showcase", "Spicy Food Challenge"],
      admissionFee: "₱100",
      startTime: "10:00 AM",
      endTime: "9:00 PM",
      specialDishes: [
        "Bicol Express",
        "Laing",
        "Pinangat",
        "Tinapa Rice",
        "Sili Ice Cream"
      ]
    }
  ];
  
  export const eventCategories = [
    {
      id: 1,
      name: "Cultural",
      icon: "culture"
    },
    {
      id: 2,
      name: "Food Festival",
      icon: "food"
    },
    {
      id: 3,
      name: "Competition",
      icon: "trophy"
    },
    {
      id: 4,
      name: "Music",
      icon: "music"
    },
    {
      id: 5,
      name: "Sports",
      icon: "sports"
    }
  ]; 