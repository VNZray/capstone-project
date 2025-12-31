'use strict';

/**
 * Hierarchical Categories Seeder
 *
 * Seeds a 3-level category structure for businesses, tourist spots, and events.
 */
module.exports = {
  async up(queryInterface) {
    // Check if categories already exist
    const [existing] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM categories"
    );

    if (existing[0].count > 0) {
      console.log('[Seed] Categories already exist, skipping');
      return;
    }

    // Level 1 Categories (Root)
    const level1Categories = [
      // Business types
      { alias: 'accommodation', title: 'Accommodation', applicable_to: 'business', sort_order: 1 },
      { alias: 'food-dining', title: 'Food & Dining', applicable_to: 'business', sort_order: 2 },
      { alias: 'shopping', title: 'Shopping', applicable_to: 'business', sort_order: 3 },
      { alias: 'entertainment', title: 'Entertainment', applicable_to: 'business', sort_order: 4 },
      { alias: 'services', title: 'Services', applicable_to: 'business', sort_order: 5 },

      // Tourist spot types
      { alias: 'natural-attractions', title: 'Natural Attractions', applicable_to: 'tourist_spot', sort_order: 6 },
      { alias: 'cultural-heritage', title: 'Cultural & Heritage', applicable_to: 'tourist_spot', sort_order: 7 },
      { alias: 'adventure-activities', title: 'Adventure Activities', applicable_to: 'tourist_spot', sort_order: 8 },

      // Event types
      { alias: 'festivals', title: 'Festivals & Celebrations', applicable_to: 'event', sort_order: 9 },
      { alias: 'sports-events', title: 'Sports Events', applicable_to: 'event', sort_order: 10 },
      { alias: 'cultural-events', title: 'Cultural Events', applicable_to: 'event', sort_order: 11 },
    ];

    // Insert Level 1 and store IDs
    const level1Ids = {};
    for (const cat of level1Categories) {
      await queryInterface.bulkInsert('categories', [{
        ...cat,
        parent_category: null,
        status: 'active',
      }]);

      const [[inserted]] = await queryInterface.sequelize.query(
        `SELECT id FROM categories WHERE alias = '${cat.alias}'`
      );
      level1Ids[cat.alias] = inserted.id;
    }
    console.log(`[Seed] Inserted ${level1Categories.length} Level 1 categories`);

    // Level 2 Categories (Subcategories)
    const level2Categories = [
      // Accommodation subcategories
      { parent: 'accommodation', alias: 'hotels', title: 'Hotels', sort_order: 1 },
      { parent: 'accommodation', alias: 'resorts', title: 'Resorts', sort_order: 2 },
      { parent: 'accommodation', alias: 'hostels', title: 'Hostels', sort_order: 3 },
      { parent: 'accommodation', alias: 'inns', title: 'Inns & B&Bs', sort_order: 4 },
      { parent: 'accommodation', alias: 'vacation-rentals', title: 'Vacation Rentals', sort_order: 5 },

      // Food & Dining subcategories
      { parent: 'food-dining', alias: 'restaurants', title: 'Restaurants', sort_order: 1 },
      { parent: 'food-dining', alias: 'cafes', title: 'Cafés & Coffee Shops', sort_order: 2 },
      { parent: 'food-dining', alias: 'fast-food', title: 'Fast Food', sort_order: 3 },
      { parent: 'food-dining', alias: 'bars-nightlife', title: 'Bars & Nightlife', sort_order: 4 },
      { parent: 'food-dining', alias: 'bakeries', title: 'Bakeries & Desserts', sort_order: 5 },
      { parent: 'food-dining', alias: 'street-food', title: 'Street Food', sort_order: 6 },

      // Shopping subcategories
      { parent: 'shopping', alias: 'clothing', title: 'Clothing & Fashion', sort_order: 1 },
      { parent: 'shopping', alias: 'souvenirs', title: 'Souvenirs & Gifts', sort_order: 2 },
      { parent: 'shopping', alias: 'local-crafts', title: 'Local Crafts', sort_order: 3 },
      { parent: 'shopping', alias: 'groceries', title: 'Groceries & Markets', sort_order: 4 },
      { parent: 'shopping', alias: 'electronics', title: 'Electronics', sort_order: 5 },

      // Entertainment subcategories
      { parent: 'entertainment', alias: 'amusement', title: 'Amusement Parks', sort_order: 1 },
      { parent: 'entertainment', alias: 'cinema', title: 'Cinema & Theater', sort_order: 2 },
      { parent: 'entertainment', alias: 'gaming', title: 'Gaming & Arcades', sort_order: 3 },
      { parent: 'entertainment', alias: 'karaoke', title: 'Karaoke & Music', sort_order: 4 },

      // Services subcategories
      { parent: 'services', alias: 'tour-operators', title: 'Tour Operators', sort_order: 1 },
      { parent: 'services', alias: 'transport', title: 'Transport & Rentals', sort_order: 2 },
      { parent: 'services', alias: 'wellness', title: 'Wellness & Spa', sort_order: 3 },
      { parent: 'services', alias: 'photography', title: 'Photography Services', sort_order: 4 },

      // Natural Attractions subcategories
      { parent: 'natural-attractions', alias: 'beaches', title: 'Beaches', sort_order: 1 },
      { parent: 'natural-attractions', alias: 'mountains', title: 'Mountains & Hills', sort_order: 2 },
      { parent: 'natural-attractions', alias: 'waterfalls', title: 'Waterfalls', sort_order: 3 },
      { parent: 'natural-attractions', alias: 'caves', title: 'Caves', sort_order: 4 },
      { parent: 'natural-attractions', alias: 'parks', title: 'Parks & Gardens', sort_order: 5 },

      // Cultural & Heritage subcategories
      { parent: 'cultural-heritage', alias: 'museums', title: 'Museums', sort_order: 1 },
      { parent: 'cultural-heritage', alias: 'churches', title: 'Churches & Temples', sort_order: 2 },
      { parent: 'cultural-heritage', alias: 'historical-sites', title: 'Historical Sites', sort_order: 3 },
      { parent: 'cultural-heritage', alias: 'monuments', title: 'Monuments', sort_order: 4 },

      // Adventure Activities subcategories
      { parent: 'adventure-activities', alias: 'water-sports', title: 'Water Sports', sort_order: 1 },
      { parent: 'adventure-activities', alias: 'hiking', title: 'Hiking & Trekking', sort_order: 2 },
      { parent: 'adventure-activities', alias: 'zipline', title: 'Zipline & Aerial', sort_order: 3 },
      { parent: 'adventure-activities', alias: 'camping', title: 'Camping', sort_order: 4 },

      // Festivals subcategories
      { parent: 'festivals', alias: 'religious-festivals', title: 'Religious Festivals', sort_order: 1 },
      { parent: 'festivals', alias: 'food-festivals', title: 'Food Festivals', sort_order: 2 },
      { parent: 'festivals', alias: 'music-festivals', title: 'Music Festivals', sort_order: 3 },

      // Sports Events subcategories
      { parent: 'sports-events', alias: 'tournaments', title: 'Tournaments', sort_order: 1 },
      { parent: 'sports-events', alias: 'marathons', title: 'Marathons & Races', sort_order: 2 },

      // Cultural Events subcategories
      { parent: 'cultural-events', alias: 'art-exhibits', title: 'Art Exhibits', sort_order: 1 },
      { parent: 'cultural-events', alias: 'performances', title: 'Performances', sort_order: 2 },
      { parent: 'cultural-events', alias: 'workshops', title: 'Workshops', sort_order: 3 },
    ];

    // Insert Level 2 and store IDs
    const level2Ids = {};
    for (const cat of level2Categories) {
      const parentId = level1Ids[cat.parent];
      const [[parentCat]] = await queryInterface.sequelize.query(
        `SELECT applicable_to FROM categories WHERE id = ${parentId}`
      );

      await queryInterface.bulkInsert('categories', [{
        alias: cat.alias,
        title: cat.title,
        parent_category: parentId,
        applicable_to: parentCat.applicable_to,
        status: 'active',
        sort_order: cat.sort_order,
      }]);

      const [[inserted]] = await queryInterface.sequelize.query(
        `SELECT id FROM categories WHERE alias = '${cat.alias}'`
      );
      level2Ids[cat.alias] = inserted.id;
    }
    console.log(`[Seed] Inserted ${level2Categories.length} Level 2 categories`);

    // Level 3 Categories (Specialties)
    const level3Categories = [
      // Restaurant specialties
      { parent: 'restaurants', alias: 'filipino-cuisine', title: 'Filipino Cuisine', sort_order: 1 },
      { parent: 'restaurants', alias: 'italian-cuisine', title: 'Italian', sort_order: 2 },
      { parent: 'restaurants', alias: 'japanese-cuisine', title: 'Japanese', sort_order: 3 },
      { parent: 'restaurants', alias: 'chinese-cuisine', title: 'Chinese', sort_order: 4 },
      { parent: 'restaurants', alias: 'seafood', title: 'Seafood', sort_order: 5 },
      { parent: 'restaurants', alias: 'fine-dining', title: 'Fine Dining', sort_order: 6 },
      { parent: 'restaurants', alias: 'casual-dining', title: 'Casual Dining', sort_order: 7 },
      { parent: 'restaurants', alias: 'buffet', title: 'Buffet', sort_order: 8 },

      // Café specialties
      { parent: 'cafes', alias: 'specialty-coffee', title: 'Specialty Coffee', sort_order: 1 },
      { parent: 'cafes', alias: 'milk-tea', title: 'Milk Tea', sort_order: 2 },
      { parent: 'cafes', alias: 'co-working', title: 'Co-working Cafés', sort_order: 3 },

      // Hotel specialties
      { parent: 'hotels', alias: 'luxury-hotel', title: 'Luxury', sort_order: 1 },
      { parent: 'hotels', alias: 'business-hotel', title: 'Business', sort_order: 2 },
      { parent: 'hotels', alias: 'boutique-hotel', title: 'Boutique', sort_order: 3 },
      { parent: 'hotels', alias: 'budget-hotel', title: 'Budget', sort_order: 4 },

      // Beach specialties
      { parent: 'beaches', alias: 'white-sand', title: 'White Sand', sort_order: 1 },
      { parent: 'beaches', alias: 'diving-spots', title: 'Diving Spots', sort_order: 2 },
      { parent: 'beaches', alias: 'surfing-spots', title: 'Surfing Spots', sort_order: 3 },

      // Water sports specialties
      { parent: 'water-sports', alias: 'scuba-diving', title: 'Scuba Diving', sort_order: 1 },
      { parent: 'water-sports', alias: 'snorkeling', title: 'Snorkeling', sort_order: 2 },
      { parent: 'water-sports', alias: 'kayaking', title: 'Kayaking', sort_order: 3 },
      { parent: 'water-sports', alias: 'island-hopping', title: 'Island Hopping', sort_order: 4 },
    ];

    // Insert Level 3
    for (const cat of level3Categories) {
      const parentId = level2Ids[cat.parent];
      if (!parentId) continue;

      const [[parentCat]] = await queryInterface.sequelize.query(
        `SELECT applicable_to FROM categories WHERE id = ${parentId}`
      );

      await queryInterface.bulkInsert('categories', [{
        alias: cat.alias,
        title: cat.title,
        parent_category: parentId,
        applicable_to: parentCat.applicable_to,
        status: 'active',
        sort_order: cat.sort_order,
      }]);
    }
    console.log(`[Seed] Inserted ${level3Categories.length} Level 3 categories`);

    console.log('[Seed] Hierarchical categories seeded successfully');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('entity_categories', null, {});
    await queryInterface.bulkDelete('categories', null, {});
  }
};
