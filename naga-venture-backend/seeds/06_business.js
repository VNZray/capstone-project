// seeds/06_business.js
// Inserts sample owners (if not already present) and at least 5 sample businesses.
// Assumptions:
//  - Previous seeds (01..05) have run creating location, type and category tables.
//  - This seed can be re-run safely; it upserts by checking existing owner IDs and
//    clears ONLY the business table before inserting fresh sample data.

import { v4 as uuidv4 } from "uuid";

/**
 * @param { import('knex').Knex } knex
 */
export async function seed(knex) {
  // Sample static UUIDs for deterministic references (change if they collide in your data)
  const ownerIds = {
    hotelOwner: "11111111-1111-4111-8111-111111111111",
    resortOwner: "22222222-2222-4222-8222-222222222222",
    restoOwner: "33333333-3333-4333-8333-333333333333",
    cafeOwner: "44444444-4444-4444-8444-444444444444",
    museumOwner: "55555555-5555-4555-8555-555555555555",
  };

  const existingOwners = await knex("owner").whereIn("id", Object.values(ownerIds));
  const existingOwnerIds = new Set(existingOwners.map((o) => o.id));

  const ownersToInsert = [
    {
      id: ownerIds.hotelOwner,
      first_name: "Carlos",
      middle_name: null,
      last_name: "Reyes",
      age: 45,
      birthday: "1980-05-12",
      gender: "Male",
      email: "carlos.reyes@example.com",
      phone_number: "+639111111111",
      business_type: "Accommodation",
      province_id: 20,
      municipality_id: 24,
      barangay_id: 1,
    },
    {
      id: ownerIds.resortOwner,
      first_name: "Maria",
      middle_name: null,
      last_name: "Delos Santos",
      age: 39,
      birthday: "1986-11-03",
      gender: "Female",
      email: "maria.delos.santos@example.com",
      phone_number: "+639122222222",
      business_type: "Accommodation",
      province_id: 20,
      municipality_id: 24,
      barangay_id: 4,
    },
    {
      id: ownerIds.restoOwner,
      first_name: "Jasper",
      middle_name: null,
      last_name: "Lim",
      age: 34,
      birthday: "1991-02-21",
      gender: "Male",
      email: "jasper.lim@example.com",
      phone_number: "+639133333333",
      business_type: "Shop",
      province_id: 20,
      municipality_id: 24,
      barangay_id: 9,
    },
    {
      id: ownerIds.cafeOwner,
      first_name: "Elena",
      middle_name: null,
      last_name: "Garcia",
      age: 29,
      birthday: "1996-07-18",
      gender: "Female",
      email: "elena.garcia@example.com",
      phone_number: "+639144444444",
      business_type: "Shop",
      province_id: 20,
      municipality_id: 24,
      barangay_id: 15,
    },
    {
      id: ownerIds.museumOwner,
      first_name: "Rico",
      middle_name: null,
      last_name: "Santiago",
      age: 52,
      birthday: "1973-09-09",
      gender: "Male",
      email: "rico.santiago@example.com",
      phone_number: "+639155555555",
      business_type: "Both",
      province_id: 20,
      municipality_id: 24,
      barangay_id: 20,
    },
  ].filter((o) => !existingOwnerIds.has(o.id));

  if (ownersToInsert.length) {
    await knex("owner").insert(ownersToInsert);
  }

  // Clear only business table (other seeds already cleared earlier if needed)
  await knex("business").del();

  const businesses = [
    {
      id: uuidv4(),
      business_name: "Central Plaza Hotel",
      description: "Modern hotel near city center with conference facilities.",
      min_price: 1500.0,
      max_price: 4500.0,
      email: "contact@centralplazahotel.test",
      phone_number: "+639166666666",
      business_category_id: 1, // Hotel
      business_type_id: 1, // Accommodation
      province_id: 20,
      municipality_id: 24,
      barangay_id: 1,
      address: "Abella, Naga City, Camarines Sur",
      owner_id: ownerIds.hotelOwner,
      status: "Active",
      business_image: null,
      latitude: "13.6235",
      longitude: "123.1930",
      x_url: null,
      website_url: "https://centralplaza.test",
      facebook_url: "https://facebook.com/centralplazahotel",
      instagram_url: "https://instagram.com/centralplazahotel",
      hasBooking: true,
    },
    {
      id: uuidv4(),
      business_name: "Lakeside Resort & Spa",
      description: "Relaxing resort offering spa services and lake activities.",
      min_price: 2500.0,
      max_price: 8500.0,
      email: "reservations@lakesideresort.test",
      phone_number: "+639177777777",
      business_category_id: 2, // Resort
      business_type_id: 1,
      province_id: 20,
      municipality_id: 24,
      barangay_id: 4,
      address: "Balatas, Naga City, Camarines Sur",
      owner_id: ownerIds.resortOwner,
      status: "Pending",
      business_image: null,
      latitude: "13.6202",
      longitude: "123.2051",
      x_url: null,
      website_url: "https://lakesideresort.test",
      facebook_url: "https://facebook.com/lakesideresort",
      instagram_url: "https://instagram.com/lakesideresort",
      hasBooking: true,
    },
    {
      id: uuidv4(),
      business_name: "Heritage Museum & Gallery",
      description: "Local artifacts and rotating cultural exhibits.",
      min_price: 100.0,
      max_price: 300.0,
      email: "info@heritagemuseum.test",
      phone_number: "+639188888888",
      business_category_id: 4, // Museum
      business_type_id: 4, // Tourist Spot
      province_id: 20,
      municipality_id: 24,
      barangay_id: 20,
      address: "Sabang, Naga City, Camarines Sur",
      owner_id: ownerIds.museumOwner,
      status: "Active",
      business_image: null,
      latitude: "13.6190",
      longitude: "123.1905",
      x_url: null,
      website_url: null,
      facebook_url: "https://facebook.com/heritagemuseum",
      instagram_url: null,
      hasBooking: false,
    },
    {
      id: uuidv4(),
      business_name: "Triangle Bistro",
      description: "Casual dining serving fusion cuisine and local favorites.",
      min_price: 250.0,
      max_price: 1200.0,
      email: "hello@trianglebistro.test",
      phone_number: "+639199999999",
      business_category_id: 3, // Restaurant
      business_type_id: 2, // Shop (food service)
      province_id: 20,
      municipality_id: 24,
      barangay_id: 9,
      address: "Concepcion Pequeña, Naga City, Camarines Sur",
      owner_id: ownerIds.restoOwner,
      status: "Active",
      business_image: null,
      latitude: "13.6242",
      longitude: "123.1966",
      x_url: null,
      website_url: null,
      facebook_url: "https://facebook.com/trianglebistro",
      instagram_url: "https://instagram.com/trianglebistro",
      hasBooking: false,
    },
    {
      id: uuidv4(),
      business_name: "Liboton Coffee Roasters",
      description: "Specialty coffee shop with artisan pastries and beans.",
      min_price: 120.0,
      max_price: 650.0,
      email: "orders@libotoncoffee.test",
      phone_number: "+639100000000",
      business_category_id: 5, // Coffee Shop
      business_type_id: 2, // Shop
      province_id: 20,
      municipality_id: 24,
      barangay_id: 15,
      address: "Liboton, Naga City, Camarines Sur",
      owner_id: ownerIds.cafeOwner,
      status: "Active",
      business_image: null,
      latitude: "13.6218",
      longitude: "123.1989",
      x_url: null,
      website_url: null,
      facebook_url: "https://facebook.com/libotoncoffee",
      instagram_url: "https://instagram.com/libotoncoffee",
      hasBooking: false,
    },
  ];

  await knex("business").insert(businesses);
}
