'use strict';
const { v4: uuidv4 } = require('uuid');

/**
 * Shop Categories Seeder
 *
 * Seeds global shop category templates.
 *
 * Table schema: id, name, description, icon, parent_id, created_at, updated_at
 */
module.exports = {
  async up(queryInterface) {
    const categories = [
      { id: uuidv4(), name: 'Food', description: 'Main dishes and meals', icon: 'utensils' },
      { id: uuidv4(), name: 'Beverage', description: 'Drinks and beverages', icon: 'coffee' },
      { id: uuidv4(), name: 'Dessert', description: 'Sweet treats and desserts', icon: 'cake' },
      { id: uuidv4(), name: 'Produce', description: 'Fresh fruits and vegetables', icon: 'apple' },
      { id: uuidv4(), name: 'Canned Goods', description: 'Canned foods and beverages', icon: 'package' },
      { id: uuidv4(), name: 'Household', description: 'Cleaning supplies and household items', icon: 'home' },
      { id: uuidv4(), name: 'Clothing & Apparel', description: 'Shirts, pants, dresses, and other clothing items', icon: 'shirt' },
      { id: uuidv4(), name: 'Handicrafts', description: 'Handmade local crafts and souvenirs', icon: 'gift' },
      { id: uuidv4(), name: 'Electronics', description: 'Electronic devices and accessories', icon: 'smartphone' },
      { id: uuidv4(), name: 'Health & Beauty', description: 'Health products, cosmetics, and beauty items', icon: 'heart' }
    ];

    await queryInterface.bulkInsert('shop_category', categories);

    console.log('[Seed] Shop categories seeded.');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('shop_category', null, {});
  }
};
