'use strict';
const { v4: uuidv4 } = require('uuid');

/**
 * Sample Products Seeder
 *
 * Creates sample products for the Sample Restaurant business.
 * Depends on: 20250817000009-sample-users-business.cjs
 *
 * Product table schema: id, business_id, name, description, price, category_id, image_url, is_available, created_at, updated_at
 */

// Fixed UUID matching the restaurant business
const RESTAURANT_BUSINESS_ID = '66666666-6666-6666-6666-666666666666';

module.exports = {
  async up(queryInterface) {
    // Get the Food category ID from the seeded shop_category
    const [categories] = await queryInterface.sequelize.query(
      `SELECT id, name FROM shop_category WHERE name = 'Food' LIMIT 1`
    );
    const foodCategoryId = categories.length > 0 ? categories[0].id : null;

    // Get the Beverage category ID
    const [beverageCategories] = await queryInterface.sequelize.query(
      `SELECT id FROM shop_category WHERE name = 'Beverage' LIMIT 1`
    );
    const beverageCategoryId = beverageCategories.length > 0 ? beverageCategories[0].id : null;

    // Get the Dessert category ID
    const [dessertCategories] = await queryInterface.sequelize.query(
      `SELECT id FROM shop_category WHERE name = 'Dessert' LIMIT 1`
    );
    const dessertCategoryId = dessertCategories.length > 0 ? dessertCategories[0].id : null;

    // Sample products matching actual schema
    const products = [
      // Food
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        business_id: RESTAURANT_BUSINESS_ID,
        name: 'Bicol Express',
        description: 'Spicy Bicol Express - traditional Filipino dish',
        price: 180.00,
        shop_category_id: foodCategoryId,
        status: 'active'
      },
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        business_id: RESTAURANT_BUSINESS_ID,
        name: 'Adobo Special',
        description: 'Chicken Adobo with special sauce',
        price: 150.00,
        shop_category_id: foodCategoryId,
        status: 'active'
      },
      {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        business_id: RESTAURANT_BUSINESS_ID,
        name: 'Lumpia Shanghai',
        description: 'Crispy spring rolls - 5 pieces',
        price: 85.00,
        shop_category_id: foodCategoryId,
        status: 'active'
      },
      // Beverages
      {
        id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        business_id: RESTAURANT_BUSINESS_ID,
        name: 'Iced Tea',
        description: 'Fresh iced tea - 1 liter',
        price: 45.00,
        shop_category_id: beverageCategoryId,
        status: 'active'
      },
      {
        id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        business_id: RESTAURANT_BUSINESS_ID,
        name: 'Mango Shake',
        description: 'Fresh mango shake with ice cream',
        price: 75.00,
        shop_category_id: beverageCategoryId,
        status: 'active'
      },
      // Desserts
      {
        id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        business_id: RESTAURANT_BUSINESS_ID,
        name: 'Leche Flan',
        description: 'Traditional Filipino caramel custard',
        price: 65.00,
        shop_category_id: dessertCategoryId,
        status: 'active'
      },
      {
        id: '11111111-aaaa-aaaa-aaaa-111111111111',
        business_id: RESTAURANT_BUSINESS_ID,
        name: 'Halo-Halo',
        description: 'Popular Filipino shaved ice dessert',
        price: 85.00,
        shop_category_id: dessertCategoryId,
        status: 'active'
      },
      {
        id: '22222222-bbbb-bbbb-bbbb-222222222222',
        business_id: RESTAURANT_BUSINESS_ID,
        name: 'Ube Cake Slice',
        description: 'Purple yam cake - per slice',
        price: 95.00,
        shop_category_id: dessertCategoryId,
        status: 'active'
      }
    ];

    await queryInterface.bulkInsert('product', products);
    console.log(`[Seed] Inserted ${products.length} products for Sample Restaurant`);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('product', { business_id: RESTAURANT_BUSINESS_ID });
  }
};
