/**
 * Sample seed: Simple Product Data
 * Creates sample products for different businesses and categories
 * 
 * Assumptions:
 * - Businesses exist from seed 05_user_and_business_sample_Data.js
 * 
 * Run: npx knex seed:run --specific=06_products_sample_data.cjs
 */

exports.seed = async function (knex) {
  // Delete existing products and their stock records to ensure clean seed
  await knex('stock_history').del();
  await knex('product_stock').del();
  await knex('product').del();
  
  // Delete existing shop categories for our restaurant
  await knex('shop_category').where('business_id', '66666666-6666-6666-6666-666666666666').del();

  // Reference to existing business from seed 05
  const RESTAURANT_BUSINESS_ID = '66666666-6666-6666-6666-666666666666'; // Sample Restaurant

  // Create shop categories for the restaurant
  const categories = [
    {
      id: 'cat-food-1111-1111-1111-111111111111',
      business_id: RESTAURANT_BUSINESS_ID,
      name: 'Food',
      description: 'Main dishes and meals',
      category_type: 'product',
      display_order: 1,
      status: 'active'
    },
    {
      id: 'cat-beve-2222-2222-2222-222222222222',
      business_id: RESTAURANT_BUSINESS_ID,
      name: 'Beverage',
      description: 'Drinks and beverages',
      category_type: 'product',
      display_order: 2,
      status: 'active'
    },
    {
      id: 'cat-dess-3333-3333-3333-333333333333',
      business_id: RESTAURANT_BUSINESS_ID,
      name: 'Dessert',
      description: 'Sweet treats and desserts',
      category_type: 'product',
      display_order: 3,
      status: 'active'
    }
  ];

  await knex('shop_category').insert(categories);
  console.log(`✅ Created ${categories.length} shop categories for Sample Restaurant`);

  // Sample products with different categories
  const products = [
    // Restaurant products - Food
    {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      business_id: RESTAURANT_BUSINESS_ID,
      shop_category_id: 'cat-food-1111-1111-1111-111111111111',
      name: 'Bicol Express',
      description: 'Spicy Bicol Express - traditional Filipino dish',
      price: 1000.00,
      status: 'active'
    },
    {
      id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      business_id: RESTAURANT_BUSINESS_ID,
      shop_category_id: 'cat-food-1111-1111-1111-111111111111',
      name: 'Adobo Special',
      description: 'Chicken Adobo with special sauce',
      price: 850.00,
      status: 'active'
    },
    {
      id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      business_id: RESTAURANT_BUSINESS_ID,
      shop_category_id: 'cat-food-1111-1111-1111-111111111111',
      name: 'Lumpia Shanghai',
      description: 'Crispy spring rolls - 5 pieces',
      price: 450.00,
      status: 'active'
    },
    // Beverages
    {
      id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
      business_id: RESTAURANT_BUSINESS_ID,
      shop_category_id: 'cat-beve-2222-2222-2222-222222222222',
      name: 'Iced Tea',
      description: 'Fresh iced tea - 1 liter',
      price: 150.00,
      status: 'active'
    },
    {
      id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
      business_id: RESTAURANT_BUSINESS_ID,
      shop_category_id: 'cat-beve-2222-2222-2222-222222222222',
      name: 'Mango Shake',
      description: 'Fresh mango shake with ice cream',
      price: 280.00,
      status: 'active'
    },
    // Desserts
    {
      id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
      business_id: RESTAURANT_BUSINESS_ID,
      shop_category_id: 'cat-dess-3333-3333-3333-333333333333',
      name: 'Leche Flan',
      description: 'Traditional Filipino caramel custard',
      price: 350.00,
      status: 'active'
    },
    {
      id: '11111111-aaaa-aaaa-aaaa-111111111111',
      business_id: RESTAURANT_BUSINESS_ID,
      shop_category_id: 'cat-dess-3333-3333-3333-333333333333',
      name: 'Halo-Halo',
      description: 'Popular Filipino shaved ice dessert',
      price: 200.00,
      status: 'active'
    },
    {
      id: '22222222-bbbb-bbbb-bbbb-222222222222',
      business_id: RESTAURANT_BUSINESS_ID,
      shop_category_id: 'cat-dess-3333-3333-3333-333333333333',
      name: 'Ube Cake',
      description: 'Purple yam cake - whole',
      price: 1500.00,
      status: 'active'
    }
  ];

  // Insert products
  await knex('product').insert(products);
  console.log(`✅ Inserted ${products.length} products for "Sample Restaurant" successfully`);

  // Stock data for each product
  const stockData = [
    { product_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_stock: 55 },
    { product_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', current_stock: 75 },
    { product_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', current_stock: 100 },
    { product_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', current_stock: 200 },
    { product_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', current_stock: 60 },
    { product_id: 'ffffffff-ffff-ffff-ffff-ffffffffffff', current_stock: 30 },
    { product_id: '11111111-aaaa-aaaa-aaaa-111111111111', current_stock: 80 },
    { product_id: '22222222-bbbb-bbbb-bbbb-222222222222', current_stock: 15 }
  ];

  // Insert stock records for each product
  for (const stock of stockData) {
    await knex('product_stock').insert({
      id: knex.raw('UUID()'),
      product_id: stock.product_id,
      current_stock: stock.current_stock,
      stock_unit: 'pieces'
    });
  }
  console.log(`✅ Created stock records for ${stockData.length} products successfully`);
};
