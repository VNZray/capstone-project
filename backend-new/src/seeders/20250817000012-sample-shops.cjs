'use strict';
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

/**
 * Sample Shops Seeder
 *
 * Creates a sample shop business with products.
 */

module.exports = {
  async up(queryInterface) {
    const randomPhone = () => '+639' + Math.floor(100000000 + Math.random() * 900000000);

    // Create shop owner user
    const shopOwnerUserId = uuidv4();
    await queryInterface.bulkInsert('user', [{
      id: shopOwnerUserId,
      email: 'shopowner@gmail.com',
      phone_number: randomPhone(),
      password: await bcrypt.hash('shop123', 10),
      is_verified: true,
      is_active: true,
      user_role_id: 4,
      barangay_id: 1
    }]);
    console.log('[Seed] Inserted shop owner user');

    // Create owner profile
    const shopOwnerId = uuidv4();
    await queryInterface.bulkInsert('owner', [{
      id: shopOwnerId,
      first_name: 'Maria',
      middle_name: 'Santos',
      last_name: 'Dela Cruz',
      age: 40,
      birthdate: '1984-05-15',
      gender: 'Female',
      user_id: shopOwnerUserId
    }]);
    console.log('[Seed] Inserted shop owner profile');

    // Create shop business
    const shopBusinessId = uuidv4();
    await queryInterface.bulkInsert('business', [{
      id: shopBusinessId,
      business_name: 'Dela Cruz Grocery Store',
      description: 'Your neighborhood grocery store with fresh produce, canned goods, and daily essentials.',
      min_price: 20,
      max_price: 500,
      email: 'delacruzgrocery@example.com',
      phone_number: randomPhone(),
      barangay_id: 1,
      address: 'Panganiban Drive, Naga City, Camarines Sur',
      owner_id: shopOwnerId,
      status: 'Active',
      latitude: '13.6219',
      longitude: '123.1950',
      hasBooking: false
    }]);
    console.log('[Seed] Inserted shop business');

    // Get category IDs from the global shop_category table
    const [produceCategory] = await queryInterface.sequelize.query(
      `SELECT id FROM shop_category WHERE name = 'Produce' LIMIT 1`
    );
    const [cannedCategory] = await queryInterface.sequelize.query(
      `SELECT id FROM shop_category WHERE name = 'Canned Goods' LIMIT 1`
    );
    const [householdCategory] = await queryInterface.sequelize.query(
      `SELECT id FROM shop_category WHERE name = 'Household' LIMIT 1`
    );

    const produceCategoryId = produceCategory.length > 0 ? produceCategory[0].id : null;
    const cannedCategoryId = cannedCategory.length > 0 ? cannedCategory[0].id : null;
    const householdCategoryId = householdCategory.length > 0 ? householdCategory[0].id : null;

    // Create products using the actual schema
    const products = [
      {
        id: uuidv4(),
        business_id: shopBusinessId,
        name: 'Bananas',
        description: 'Fresh bananas, 1 kg',
        price: 50.00,
        shop_category_id: produceCategoryId,
        status: 'active'
      },
      {
        id: uuidv4(),
        business_id: shopBusinessId,
        name: 'Tomatoes',
        description: 'Ripe tomatoes, 500g',
        price: 30.00,
        shop_category_id: produceCategoryId,
        status: 'active'
      },
      {
        id: uuidv4(),
        business_id: shopBusinessId,
        name: 'Canned Tuna',
        description: '185g canned tuna in oil',
        price: 45.00,
        shop_category_id: cannedCategoryId,
        status: 'active'
      },
      {
        id: uuidv4(),
        business_id: shopBusinessId,
        name: 'Soda Bottle',
        description: '1.5L soda bottle',
        price: 65.00,
        shop_category_id: cannedCategoryId,
        status: 'active'
      },
      {
        id: uuidv4(),
        business_id: shopBusinessId,
        name: 'Dish Soap',
        description: '500ml liquid dish soap',
        price: 85.00,
        shop_category_id: householdCategoryId,
        status: 'active'
      },
      {
        id: uuidv4(),
        business_id: shopBusinessId,
        name: 'Laundry Detergent',
        description: '1kg powder detergent',
        price: 120.00,
        shop_category_id: householdCategoryId,
        status: 'active'
      }
    ];

    await queryInterface.bulkInsert('product', products);
    console.log(`[Seed] Inserted ${products.length} products for Dela Cruz Grocery Store`);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('product', null, {});
    await queryInterface.bulkDelete('business', { business_name: 'Dela Cruz Grocery Store' });
    await queryInterface.bulkDelete('owner', null, {});
    await queryInterface.bulkDelete('user', { email: 'shopowner@gmail.com' });
  }
};
