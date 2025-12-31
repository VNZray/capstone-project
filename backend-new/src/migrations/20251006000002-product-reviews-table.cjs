'use strict';

/**
 * Product Reviews Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_review', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'product',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      tourist_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'tourist',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'order',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_verified_purchase: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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

    // Add indexes
    await queryInterface.addIndex('product_review', ['product_id'], { name: 'idx_product_review_product' });
    await queryInterface.addIndex('product_review', ['tourist_id'], { name: 'idx_product_review_tourist' });

    // Note: Stored procedures are now managed separately in src/procedures/productReviewProcedures.js

    console.log('Product reviews table created.');
  },

  async down(queryInterface) {
    // Note: Stored procedures are now dropped separately via src/procedures/productReviewProcedures.js

    // Drop table
    await queryInterface.dropTable('product_review');
  }
};
