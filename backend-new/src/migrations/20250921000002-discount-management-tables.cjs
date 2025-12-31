'use strict';

/**
 * Discount Management Tables Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('discount', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
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
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      discount_type: {
        type: Sequelize.ENUM('percentage', 'fixed'),
        allowNull: false
      },
      value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      min_purchase: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
      },
      max_discount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      applies_to: {
        type: Sequelize.ENUM('all', 'product', 'category', 'room', 'service'),
        allowNull: false,
        defaultValue: 'all'
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

    // Create discount_items table for specific items a discount applies to
    await queryInterface.createTable('discount_items', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      discount_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'discount',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      item_type: {
        type: Sequelize.ENUM('product', 'category', 'room', 'service'),
        allowNull: false
      },
      item_id: {
        type: Sequelize.STRING(64),
        allowNull: false
      }
    });

    // Add indexes
    await queryInterface.addIndex('discount', ['business_id'], { name: 'idx_discount_business' });
    await queryInterface.addIndex('discount', ['is_active', 'start_date', 'end_date'], { name: 'idx_discount_active_dates' });
    await queryInterface.addIndex('discount_items', ['discount_id'], { name: 'idx_discount_items_discount' });

    // Note: Stored procedures are now managed separately in src/procedures/discountProcedures.js

    console.log('Discount management tables created.');
  },

  async down(queryInterface) {
    // Note: Stored procedures are now dropped separately via src/procedures/discountProcedures.js

    // Drop tables
    await queryInterface.dropTable('discount_items');
    await queryInterface.dropTable('discount');
  }
};
