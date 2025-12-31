'use strict';

/**
 * Categories Table Migration
 * Hierarchical categories for businesses, tourist spots, and events
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if categories table already exists
    const [tables] = await queryInterface.sequelize.query(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'categories'"
    );

    if (tables.length === 0) {
      // Create categories table
      await queryInterface.createTable('categories', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        parent_category: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'categories',
            key: 'id'
          },
          onDelete: 'SET NULL'
        },
        alias: {
          type: Sequelize.STRING(100),
          allowNull: false,
          unique: true
        },
        title: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        applicable_to: {
          type: Sequelize.ENUM('business', 'tourist_spot', 'event', 'business,tourist_spot', 'business,event', 'tourist_spot,event', 'all'),
          allowNull: false,
          defaultValue: 'all'
        },
        status: {
          type: Sequelize.ENUM('active', 'inactive'),
          allowNull: false,
          defaultValue: 'active'
        },
        sort_order: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
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

      // Add indexes for categories
      await queryInterface.addIndex('categories', ['parent_category'], { name: 'idx_categories_parent' });
      await queryInterface.addIndex('categories', ['status'], { name: 'idx_categories_status' });
      await queryInterface.addIndex('categories', ['sort_order'], { name: 'idx_categories_sort' });
      await queryInterface.addIndex('categories', ['applicable_to'], { name: 'idx_categories_applicable' });
    }

    console.log('Categories table created.');
  },

  async down(queryInterface) {
    await queryInterface.dropTable('categories');
  }
};
