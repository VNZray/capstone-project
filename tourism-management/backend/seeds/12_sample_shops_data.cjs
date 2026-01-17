/**
 * Sample seed: Shops with products
 * Creates sample shop businesses with owners, products, and categories
 *
 * Assumptions:
 * - User roles, barangays, business types/categories exist from earlier seeds
 * - Business type 2 = Shop, category 4 = Grocery (adjust if needed)
 *
 * Run: npx knex seed:run --specific=12_shops_sample_data.cjs
 */

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require("uuid");

function randomPhone() {
  // Generates a random PH mobile number: +639XXXXXXXXX
  return '+639' + Math.floor(100000000 + Math.random() * 900000000);
}

/** @param { import('knex').Knex } knex */
exports.seed = async function (knex) {
  // Insert a shop owner user (don't delete existing users to avoid conflicts)
  const shopOwnerUser = {
    id: uuidv4(),
    email: 'shopowner@gmail.com',
    phone_number: randomPhone(),
    password: await bcrypt.hash('shop123', 10),
    is_verified: true,
    is_active: true,
    user_role_id: 4, // Business Owner
    barangay_id: 1
  };

  await knex('user').insert(shopOwnerUser);
  console.log('✅ Inserted shop owner user');

  // Insert owner profile
  const shopOwner = {
    id: uuidv4(),
    first_name: 'Maria',
    middle_name: 'Santos',
    last_name: 'Dela Cruz',
    age: 40,
    birthdate: '1984-05-15',
    gender: 'Female',
    user_id: shopOwnerUser.id
  };

  await knex('owner').insert(shopOwner);
  console.log('✅ Inserted shop owner profile');

  // Insert shop business
  const shopBusiness = {
    id: uuidv4(),
    business_name: 'Dela Cruz Grocery Store',
    description: 'Your neighborhood grocery store with fresh produce, canned goods, and daily essentials.',
    min_price: 50,
    max_price: 500,
    email: 'delacruzgrocery@example.com',
    phone_number: randomPhone(),
    barangay_id: 1,
    address: 'Panganiban Drive, Naga City, Camarines Sur',
    owner_id: shopOwner.id,
    status: 'Active',
    business_image: 'https://example.com/grocery-store.jpg', // Placeholder image
    latitude: '13.6219',
    longitude: '123.1950',
    hasBooking: false,
    hasStore: true,
  };

  await knex('business').insert(shopBusiness);
  console.log('✅ Inserted shop business');

  // Insert shop categories
  const shopCategories = [
    {
      id: uuidv4(),
      business_id: shopBusiness.id,
      name: 'Produce',
      description: 'Fresh fruits and vegetables',
      category_type: 'product',
      display_order: 1,
      status: 'active'
    },
    {
      id: uuidv4(),
      business_id: shopBusiness.id,
      name: 'Canned Goods',
      description: 'Canned foods and beverages',
      category_type: 'product',
      display_order: 2,
      status: 'active'
    },
    {
      id: uuidv4(),
      business_id: shopBusiness.id,
      name: 'Household',
      description: 'Cleaning supplies and household items',
      category_type: 'product',
      display_order: 3,
      status: 'active'
    }
  ];

  await knex('shop_category').insert(shopCategories);
  console.log(`✅ Inserted ${shopCategories.length} shop categories`);

  // Insert sample products
  const products = [
    {
      id: uuidv4(),
      business_id: shopBusiness.id,
      shop_category_id: shopCategories[0].id, // Produce
      name: 'Bananas',
      description: 'Fresh bananas, 1 kg',
      price: 50.00,
      status: 'active'
    },
    {
      id: uuidv4(),
      business_id: shopBusiness.id,
      shop_category_id: shopCategories[0].id, // Produce
      name: 'Tomatoes',
      description: 'Ripe tomatoes, 500g',
      price: 30.00,
      status: 'active'
    },
    {
      id: uuidv4(),
      business_id: shopBusiness.id,
      shop_category_id: shopCategories[1].id, // Canned Goods
      name: 'Canned Tuna',
      description: '185g canned tuna in oil',
      price: 45.00,
      status: 'active'
    },
    {
      id: uuidv4(),
      business_id: shopBusiness.id,
      shop_category_id: shopCategories[1].id, // Canned Goods
      name: 'Soda Bottle',
      description: '1.5L soda bottle',
      price: 25.00,
      status: 'active'
    },
    {
      id: uuidv4(),
      business_id: shopBusiness.id,
      shop_category_id: shopCategories[2].id, // Household
      name: 'Dish Soap',
      description: '500ml dishwashing liquid',
      price: 20.00,
      status: 'active'
    },
    {
      id: uuidv4(),
      business_id: shopBusiness.id,
      shop_category_id: shopCategories[2].id, // Household
      name: 'Laundry Detergent',
      description: '1kg laundry powder',
      price: 80.00,
      status: 'active'
    }
  ];

  await knex('product').insert(products);
  console.log(`✅ Inserted ${products.length} products for shop`);

  // Insert stock for products
  const stockData = [
    { product_id: products[0].id, current_stock: 100 },
    { product_id: products[1].id, current_stock: 80 },
    { product_id: products[2].id, current_stock: 60 },
    { product_id: products[3].id, current_stock: 120 },
    { product_id: products[4].id, current_stock: 90 },
    { product_id: products[5].id, current_stock: 50 }
  ];

  for (const stock of stockData) {
    await knex('product_stock').insert({
      id: uuidv4(),
      product_id: stock.product_id,
      current_stock: stock.current_stock,
      stock_unit: 'pieces'
    });
  }
  console.log(`✅ Created stock records for ${stockData.length} shop products`);
};
