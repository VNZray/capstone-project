'use strict';
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

/**
 * Test Users Seeder
 *
 * Creates test accounts matching the old backend structure and role IDs.
 * Role IDs: Admin=1, Tourism Officer=2, Event Manager=3, Business Owner=4,
 *           Manager=5, Room Manager=6, Receptionist=7, Sales Associate=8, Tourist=9
 */
module.exports = {
  async up(queryInterface) {
    const adminHash = await bcrypt.hash('Admin123!', 10);
    const touristHash = await bcrypt.hash('Tourist123!', 10);
    const ownerHash = await bcrypt.hash('Owner123!', 10);

    // Helper function for random phone number
    const randomPhone = () => '+639' + Math.floor(100000000 + Math.random() * 900000000);

    // Create test users
    const users = [
      {
        id: uuidv4(),
        email: 'admin@cityventure.test',
        phone_number: randomPhone(),
        password: adminHash,
        is_verified: true,
        is_active: true,
        user_role_id: 1, // Admin
        barangay_id: 1
      },
      {
        id: uuidv4(),
        email: 'tourist@cityventure.test',
        phone_number: randomPhone(),
        password: touristHash,
        is_verified: true,
        is_active: true,
        user_role_id: 9, // Tourist
        barangay_id: 2
      },
      {
        id: uuidv4(),
        email: 'owner@cityventure.test',
        phone_number: randomPhone(),
        password: ownerHash,
        is_verified: true,
        is_active: true,
        user_role_id: 4, // Business Owner
        barangay_id: 3
      },
      {
        id: uuidv4(),
        email: 'manager@cityventure.test',
        phone_number: randomPhone(),
        password: ownerHash,
        is_verified: true,
        is_active: true,
        user_role_id: 5, // Manager
        barangay_id: 1
      },
      {
        id: uuidv4(),
        email: 'receptionist@cityventure.test',
        phone_number: randomPhone(),
        password: ownerHash,
        is_verified: true,
        is_active: true,
        user_role_id: 7, // Receptionist
        barangay_id: 1
      },
      {
        id: uuidv4(),
        email: 'sales@cityventure.test',
        phone_number: randomPhone(),
        password: ownerHash,
        is_verified: true,
        is_active: true,
        user_role_id: 8, // Sales Associate
        barangay_id: 1
      },
      {
        id: uuidv4(),
        email: 'roommanager@cityventure.test',
        phone_number: randomPhone(),
        password: ownerHash,
        is_verified: true,
        is_active: true,
        user_role_id: 6, // Room Manager
        barangay_id: 1
      }
    ];

    await queryInterface.bulkInsert('user', users);

    console.log('[Seed] Test users seeded.');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('user', {
      email: [
        'admin@cityventure.test',
        'tourist@cityventure.test',
        'owner@cityventure.test',
        'manager@cityventure.test',
        'receptionist@cityventure.test',
        'sales@cityventure.test',
        'roommanager@cityventure.test'
      ]
    });
  }
};
