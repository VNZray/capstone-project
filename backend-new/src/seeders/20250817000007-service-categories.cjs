'use strict';
const { v4: uuidv4 } = require('uuid');

/**
 * Service Categories Seeder
 *
 * Seeds global service category templates for businesses.
 *
 * Table schema: id, name, description, icon, created_at
 */
module.exports = {
  async up(queryInterface) {
    const categories = [
      { id: uuidv4(), name: 'Tour Services', description: 'Guided tours and travel services', icon: 'map' },
      { id: uuidv4(), name: 'Transportation', description: 'Vehicle rentals and transport services', icon: 'car' },
      { id: uuidv4(), name: 'Wellness & Spa', description: 'Massage, spa, and wellness services', icon: 'heart' },
      { id: uuidv4(), name: 'Water Sports', description: 'Diving, snorkeling, and water activities', icon: 'waves' },
      { id: uuidv4(), name: 'Photography', description: 'Photo and video services', icon: 'camera' },
      { id: uuidv4(), name: 'Event Services', description: 'Event planning and catering', icon: 'calendar' },
      { id: uuidv4(), name: 'Equipment Rental', description: 'Rental of equipment and gear', icon: 'tool' },
      { id: uuidv4(), name: 'Food Services', description: 'Catering and food delivery', icon: 'utensils' }
    ];

    await queryInterface.bulkInsert('service_category', categories);

    console.log('[Seed] Service categories seeded.');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('service_category', null, {});
  }
};
