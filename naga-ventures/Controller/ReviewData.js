export const reviews = {
    1: { // Peñafrancia Festival
        averageRating: 4.5,
        totalReviews: 100,
        ratingDistribution: {
            5: 40, // 40%
            4: 30, // 30%
            3: 15, // 15%
            2: 10, // 10%
            1: 5,  // 5%
        },
        reviews: [
            {
                id: 1,
                userId: "user1",
                username: "User",
                date: "31 Jul",
                rating: 5,
                comment: "Kaia was phenomenal with our dog Max! We were first-time users of dog sitting service and were quite nervous. Kaia's professionalism and genuine love for dogs immediately put us at ease. She sent regular updates and photos, and Max came home happy and well-cared for. Will definitely book with her again!",
                profilePic: "https://i.pravatar.cc/150?img=1"
            },
            {
                id: 2,
                userId: "user2",
                username: "Maria",
                date: "30 Jul",
                rating: 4,
                comment: "Amazing festival! The procession was beautiful and the atmosphere was incredible.",
                profilePic: "https://i.pravatar.cc/150?img=2"
            },
            {
                id: 3,
                userId: "user3",
                username: "Juan",
                date: "29 Jul",
                rating: 5,
                comment: "A must-visit cultural event. The fluvial procession was spectacular!",
                profilePic: "https://i.pravatar.cc/150?img=3"
            }
        ]
    }
}; 