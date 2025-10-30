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

/** @param { import('knex').Knex } knex */
export async function seed(knex) {
  // Clean dependent tables in proper order to respect foreign key constraints
  // Delete from most dependent to least dependent tables
  await knex('business').del();           // References: owner, address, etc.
  await knex('owner').del();              // References: user, address
  await knex('tourism').del();            // References: user
  await knex('tourist').del();            // References: user, address
  await knex('user').del();               // References: user_role

  // Insert three users: admin (tourism officer), tourist, owner
  // Hash passwords before insertion to satisfy bcrypt.compare during login
  const plainUsers = [
    { id: '11111111-1111-1111-1111-111111111111', email: 'admin@example.com',   phone_number: '+630000000001', password: 'admin123',   user_role_id: 1 }, // Admin/Tourism Officer
    { id: '22222222-2222-2222-2222-222222222222', email: 'tourist@example.com', phone_number: '+630000000002', password: 'tourist123', user_role_id: 2 }, // Tourist
    { id: '33333333-3333-3333-3333-333333333333', email: 'owner@example.com',   phone_number: '+630000000003', password: 'owner123',   user_role_id: 3 }  // Business Owner
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
      user_role_id: u.user_role_id
    });
  }

  await knex('user').insert(users);

  // Create an address record to reference (province/municipality/barangay)
  // Note: MySQL ignores .returning(); knex for MySQL returns an array of inserted ids for auto-increment PKs.
  const insertedAddress = await knex('address').insert({ province_id: 20, municipality_id: 24, barangay_id: 1 });
  // insertedAddress will be an array like [id] for MySQL, or an object for PG when using .returning().
  const addressId = Array.isArray(insertedAddress) ? insertedAddress[0] : insertedAddress;
  // The owner/tourist/business tables in this schema reference the barangay (integer) directly
  // (see migrations: owner.barangay_id, tourist.barangay_id, business.barangay_id).
  const barangayId = 1; // we inserted address with barangay_id = 1 above

  const owner = {
    id: '44444444-4444-4444-4444-444444444444',
    first_name: 'Juan',
    middle_name: null,
    last_name: 'Dela Cruz',
    age: 35,
    birthdate: '1990-01-01',
    gender: 'Male',
    business_type: 'Both', // can own multiple types
    barangay_id: barangayId,
    user_id: '33333333-3333-3333-3333-333333333333'
  };
  await knex('owner').insert(owner);

  // Create a tourism profile linked to admin user
  const tourism = {
    id: '77777777-7777-7777-7777-777777777777',
    first_name: 'Maria',
    middle_name: 'Santos',
    last_name: 'Rodriguez',
    position: 'Tourism Officer',
    user_id: '11111111-1111-1111-1111-111111111111' // admin user
  };
  await knex('tourism').insert(tourism);

  // Create a tourist profile linked to tourist user
  const tourist = {
    id: '88888888-8888-8888-8888-888888888888',
    first_name: 'Ana',
    middle_name: 'Cruz',
    last_name: 'Mendoza',
    ethnicity: 'Bicolano',
    birthdate: '1995-03-15',
    age: 30,
    gender: 'Female',
    nationality: 'Filipino',
    category: 'Domestic',
    barangay_id: barangayId,
    user_id: '22222222-2222-2222-2222-222222222222' // tourist user
  };
  await knex('tourist').insert(tourist);

  // Two businesses: one Accommodation (Hotel category id 1, type id 1) and one Shop (Restaurant category id 3, type id 2)
  const businessRecords = [
    {
      id: '55555555-5555-5555-5555-555555555555',
      business_name: 'Sample Hotel',
      description: 'A simple demo accommodation.',
      min_price: 1500,
      max_price: 4500,
      email: 'hotel@example.com',
      phone_number: '+630000010001',
      business_type_id: 1, // Accommodation type id
      business_category_id: 1, // Hotel category
  barangay_id: barangayId,
      address: 'Abella, Naga City, Camarines Sur',
      owner_id: owner.id,
      status: 'Active',
      business_image: null,
      latitude: '13.6218',
      longitude: '123.1948',
      hasBooking: true
    },
    {
      id: '66666666-6666-6666-6666-666666666666',
      business_name: 'Sample Restaurant',
      description: 'A simple demo shop restaurant.',
      min_price: 120,
      max_price: 550,
      email: 'restaurant@example.com',
      phone_number: '+630000020001',
      business_type_id: 2, // Shop type id
      business_category_id: 3, // Restaurant category
  barangay_id: barangayId,
      address: 'Abella, Naga City, Camarines Sur',
      owner_id: owner.id,
      status: 'Active',
      business_image: null,
      latitude: '13.6219',
      longitude: '123.1950',
      hasBooking: false
    }
  ];

  await knex('business').insert(businessRecords);
}