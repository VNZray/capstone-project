'use strict';
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

/**
 * Sample Users and Business Seeder
 *
 * Creates complete user ecosystem with proper profile linkage:
 * - Admin user (role_id: 1) → tourism profile
 * - Tourist user (role_id: 9) → tourist profile
 * - Owner user (role_id: 4) → owner profile → businesses
 */

// Fixed UUID for Sample Restaurant so other seeds can reference it
const RESTAURANT_BUSINESS_ID = '66666666-6666-6666-6666-666666666666';

module.exports = {
  async up(queryInterface) {
    // Helper function for random phone number
    const randomPhone = () => '+639' + Math.floor(100000000 + Math.random() * 900000000);

    // Create plain users data
    const adminId = uuidv4();
    const touristId = uuidv4();
    const ownerId = uuidv4();

    const plainUsers = [
      { id: adminId, email: 'admin@gmail.com', phone_number: randomPhone(), password: 'admin123', user_role_id: 1, barangay_id: 1 },
      { id: touristId, email: 'tourist@gmail.com', phone_number: randomPhone(), password: 'tourist123', user_role_id: 9, barangay_id: 2 },
      { id: ownerId, email: 'owner@gmail.com', phone_number: randomPhone(), password: 'owner123', user_role_id: 4, barangay_id: 3 }
    ];

    // Hash passwords and create users array
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

    await queryInterface.bulkInsert('user', users);
    console.log('[Seed] Inserted sample users');

    // Create owner profile
    const ownerProfileId = uuidv4();
    const owner = {
      id: ownerProfileId,
      first_name: 'Hans Gabriel',
      middle_name: 'Camacho',
      last_name: 'Candor',
      age: 35,
      birthdate: '2003-12-08',
      gender: 'Male',
      user_id: ownerId
    };
    await queryInterface.bulkInsert('owner', [owner]);
    console.log('[Seed] Inserted owner profile');

    // Create tourism profile for admin
    const tourism = {
      id: uuidv4(),
      first_name: 'Emmanuel',
      middle_name: 'Valle',
      last_name: 'Collao',
      position: 'Tourism Officer',
      user_id: adminId
    };
    await queryInterface.bulkInsert('tourism', [tourism]);
    console.log('[Seed] Inserted tourism profile');

    // Create tourist profile
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
      user_id: touristId
    };
    await queryInterface.bulkInsert('tourist', [tourist]);
    console.log('[Seed] Inserted tourist profile');

    // Create sample restaurant business
    const businessRecords = [
      {
        id: RESTAURANT_BUSINESS_ID,
        business_name: 'Sample Restaurant',
        description: 'A simple demo shop restaurant.',
        min_price: 120,
        max_price: 550,
        email: 'restaurant@example.com',
        phone_number: randomPhone(),
        barangay_id: 1,
        address: 'Abella, Naga City, Camarines Sur',
        owner_id: ownerProfileId,
        status: 'Active',
        business_image: 'https://media.istockphoto.com/id/1314210006/photo/grocery-store-shop-in-vintage-style-with-fruit-and-vegetables-crates-on-the-street.jpg?s=612x612&w=0&k=20&c=UFL3bRQkWH7dt6EMLswvM4u8-1sPQU9T5IFHXuBbClU=',
        latitude: '13.6219',
        longitude: '123.1950',
        hasBooking: false
      }
    ];

    await queryInterface.bulkInsert('business', businessRecords);
    console.log('[Seed] Inserted sample restaurant business');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('business', { id: RESTAURANT_BUSINESS_ID });
    await queryInterface.bulkDelete('tourist', null, {});
    await queryInterface.bulkDelete('tourism', null, {});
    await queryInterface.bulkDelete('owner', null, {});
    await queryInterface.bulkDelete('user', {
      email: ['admin@gmail.com', 'tourist@gmail.com', 'owner@gmail.com']
    });
  }
};
