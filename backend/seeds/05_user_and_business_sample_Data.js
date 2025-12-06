/**
 * Sample seed: users with linked profiles, and businesses
 * Creates complete user ecosystem with proper profile linkage:
 * - Admin user (role_id: 1) → tourism profile
 * - Tourist user (role_id: 2) → tourist profile  
 * - Owner user (role_id: 3) → owner profile → businesses
 * 
 * Keep it simple and deterministic so it can be referenced in tests/dev.
 * Assumes earlier seeds inserted user_role, province/municipality/barangay, type/category.
 *
 * Run: npx knex seed:run --specific=06_users_and_business.js
 * (Ensure migrations + prior seeds 00..05 executed first.)
 *
 * Notes:
 * - Passwords here are plain text for demo; in production hash them.
 * - Using fixed UUIDs for reproducibility.
 */

import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from "uuid";

// Fixed UUID for Sample Restaurant so other seeds can reference it
const RESTAURANT_BUSINESS_ID = '66666666-6666-6666-6666-666666666666';

/** @param { import('knex').Knex } knex */
export async function seed(knex) {
  // // Clean dependent tables in proper order to respect foreign key constraints
  // // Delete from most dependent to least dependent tables
  // await knex('business').del();           // References: owner, address, etc.
  // await knex('owner').del();              // References: user, address
  // await knex('tourism').del();            // References: user
  // await knex('tourist').del();            // References: user, address
  // await knex('user').del();               // References: user_role
function randomPhone() {
  // Generates a random PH mobile number: +639XXXXXXXXX
  return '+639' + Math.floor(100000000 + Math.random() * 900000000);
}
  // Insert three users: admin (tourism officer), tourist, owner
  // Hash passwords before insertion to satisfy bcrypt.compare during login
  const plainUsers = [
    { id: uuidv4(), email: 'admin@gmail.com',   phone_number: randomPhone(), password: 'admin123',   user_role_id: 1, barangay_id: 1 }, // Admin/Tourism Officer
    { id: uuidv4(), email: 'tourist@gmail.com', phone_number: randomPhone(), password: 'tourist123', user_role_id: 9, barangay_id: 2 }, // Tourist
    { id: uuidv4(), email: 'owner@gmail.com',   phone_number: randomPhone(), password: 'owner123',   user_role_id: 4, barangay_id: 3 }  // Business Owner
  ];

  const users = [];
  for (const u of plainUsers) {
    const hashed = await bcrypt.hash(u.password, 10);
    users.push({
      id: u.id,
      email: u.email,
      phone_number: u.phone_number,
      password: hashed,
      is_verified: true,
      is_active: true,
      user_role_id: u.user_role_id,
      barangay_id: u.barangay_id
    });
  }

  await knex('user').insert(users);

  const barangayId = 1; // we inserted address with barangay_id = 1 above
  const owner = {
    id: uuidv4(),
    first_name: 'Hans Gabriel',
    middle_name: 'Camacho',
    last_name: 'Candor',
    age: 35,
    birthdate: '2003-12-08',
    gender: 'Male',
    user_id: plainUsers[2].id
  };
  await knex('owner').insert(owner);

  // Create a tourism profile linked to admin user
  const tourism = {
    id: uuidv4(),
    first_name: 'Emmanuel',
    middle_name: 'Valle',
    last_name: 'Collao',
    position: 'Tourism Officer',
    user_id: plainUsers[0].id
  };
  await knex('tourism').insert(tourism);

  const tourist = {
    id: uuidv4(),
    first_name: 'Rayven',
    middle_name: null,
    last_name: 'Clores',
    ethnicity: 'Bicolano',
    birthdate: '2003-09-28',
    age: 22,
    gender: 'Male',
    nationality: 'Filipino',
    origin: 'Domestic',
    user_id: plainUsers[1].id
  };
  await knex('tourist').insert(tourist);

  const businessRecords = [
    {
      id: RESTAURANT_BUSINESS_ID,
      business_name: 'Sample Restaurant',
      description: 'A simple demo shop restaurant.',
      min_price: 120,
      max_price: 550,
      email: 'restaurant@example.com',
      phone_number: randomPhone(),
      barangay_id: barangayId,
      address: 'Abella, Naga City, Camarines Sur',
      owner_id: owner.id,
      status: 'Active',
      business_image: 'https://media.istockphoto.com/id/1314210006/photo/grocery-store-shop-in-vintage-style-with-fruit-and-vegetables-crates-on-the-street.jpg?s=612x612&w=0&k=20&c=UFL3bRQkWH7dt6EMLswvM4u8-1sPQU9T5IFHXuBbClU=',
      latitude: '13.6219',
      longitude: '123.1950',
      hasBooking: false
    }
  ];

  await knex('business').insert(businessRecords);

  // Add entity categories for the business (Shop type category)
  // Note: Category IDs will be assigned by the hierarchical_categories migration
  // For now, we'll add them via a separate query after the categories migration runs
}