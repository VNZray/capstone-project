'use strict';

/**
 * Business Category Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('business_category', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      icon: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Create business_category_mapping table
    await queryInterface.createTable('business_category_mapping', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      business_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'business',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'business_category',
          key: 'id'
        },
        onDelete: 'CASCADE'
      }
    });

    // Add unique constraint
    await queryInterface.addIndex('business_category_mapping', ['business_id', 'category_id'], {
      name: 'idx_business_category_unique',
      unique: true
    });

    // Note: Stored procedures are created via procedures/businessCategoryProcedures.js

    // Seed default business categories
    await queryInterface.sequelize.query(`
      INSERT INTO business_category (id, name, slug, description, icon, sort_order) VALUES
      (UUID(), 'Accommodation', 'accommodation', 'Hotels, resorts, inns, and other lodging', 'hotel', 1),
      (UUID(), 'Restaurant', 'restaurant', 'Restaurants, cafes, and dining establishments', 'restaurant', 2),
      (UUID(), 'Shop', 'shop', 'Retail stores, souvenir shops, and markets', 'storefront', 3),
      (UUID(), 'Tour', 'tour', 'Tour operators and travel agencies', 'tour', 4),
      (UUID(), 'Activity', 'activity', 'Adventure activities and experiences', 'hiking', 5),
      (UUID(), 'Transportation', 'transportation', 'Transport services and rentals', 'directions_car', 6),
      (UUID(), 'Wellness', 'wellness', 'Spa, massage, and wellness centers', 'spa', 7),
      (UUID(), 'Entertainment', 'entertainment', 'Entertainment venues and attractions', 'attractions', 8);
    `);

    console.log('Business category tables created.');
  },

  async down(queryInterface) {
    // Note: Stored procedures are dropped via procedures/businessCategoryProcedures.js

    // Drop tables
    await queryInterface.dropTable('business_category_mapping');
    await queryInterface.dropTable('business_category');
  }
};
