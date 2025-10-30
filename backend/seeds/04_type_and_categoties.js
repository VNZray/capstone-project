// seeds/01_type.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Inserts seed entries
  await knex("type").insert([
    { id: 1, type: "Accommodation" },
    { id: 2, type: "Shop" },
    { id: 3, type: "Event" },
    { id: 4, type: "Tourist Spot" },
  ]);

  await knex("category").insert([
    // Accommodation categories
    { id: 1, category: "Hotel", type_id: 1 },
    { id: 2, category: "Resort", type_id: 1 },
    { id: 10, category: "Hostel", type_id: 1 },
    { id: 11, category: "Inn", type_id: 1 },
    { id: 12, category: "Bed and Breakfast", type_id: 1 },
    { id: 16, category: "Guesthouse", type_id: 1 },
    { id: 17, category: "Motel", type_id: 1 },
    { id: 18, category: "Serviced Apartment", type_id: 1 },
    { id: 19, category: "Villa", type_id: 1 },
    { id: 20, category: "Lodge", type_id: 1 },
    { id: 21, category: "Homestay", type_id: 1 },
    { id: 22, category: "Cottage", type_id: 1 },
    { id: 23, category: "Capsule Hotel", type_id: 1 },
    { id: 24, category: "Boutique Hotel", type_id: 1 },
    { id: 25, category: "Eco Resort", type_id: 1 },

    // Shop categories
    { id: 3, category: "Restaurant", type_id: 2 },
    { id: 5, category: "Coffee Shop", type_id: 2 },
    { id: 13, category: "Gift Shop", type_id: 2 },
    { id: 14, category: "Clothing Store", type_id: 2 },
    { id: 15, category: "Souvenir Shop", type_id: 2 },
    { id: 26, category: "Convenience Store", type_id: 2 },
    { id: 27, category: "Supermarket", type_id: 2 },
    { id: 28, category: "Bakery", type_id: 2 },
    { id: 29, category: "Pharmacy", type_id: 2 },
    { id: 30, category: "Bookstore", type_id: 2 },
    { id: 31, category: "Electronics Store", type_id: 2 },
    { id: 32, category: "Jewelry Store", type_id: 2 },
    { id: 33, category: "Department Store", type_id: 2 },
    { id: 34, category: "Market", type_id: 2 },
    { id: 35, category: "Artisan Shop", type_id: 2 },
    { id: 36, category: "Sports Store", type_id: 2 },
    { id: 37, category: "Toy Store", type_id: 2 },
    { id: 38, category: "Furniture Store", type_id: 2 },
    { id: 39, category: "Pet Shop", type_id: 2 },

    // Tourist Spot categories
    { id: 4, category: "Museum", type_id: 4 },
    { id: 6, category: "Nature", type_id: 4 },
    { id: 7, category: "Historical", type_id: 4 },
    { id: 8, category: "Urban Attractions", type_id: 4 },
    { id: 9, category: "Churches", type_id: 4 },
  ]);
}
