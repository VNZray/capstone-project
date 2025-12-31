'use strict';

/**
 * Promotion Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create promo_type table
    await queryInterface.createTable('promo_type', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      promo_name: {
        type: Sequelize.ENUM('discount_coupon', 'promo_code', 'room_discount'),
        allowNull: false,
        unique: true
      }
    });

    // Seed promo_type table
    await queryInterface.bulkInsert('promo_type', [
      { promo_name: 'discount_coupon' },
      { promo_name: 'room_discount' },
      { promo_name: 'promo_code' }
    ]);

    // Create promotion table
    await queryInterface.createTable('promotion', {
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
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      image_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      external_link: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      promo_code: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      discount_percentage: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      fixed_discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      usage_limit: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      used_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      promo_type: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'promo_type',
          key: 'id'
        },
        onDelete: 'RESTRICT'
      }
    });

    // Add indexes
    await queryInterface.addIndex('promotion', ['business_id'], { name: 'idx_promotion_business' });
    await queryInterface.addIndex('promotion', ['start_date', 'end_date'], { name: 'idx_promotion_dates' });
    await queryInterface.addIndex('promotion', ['is_active'], { name: 'idx_promotion_active' });
    await queryInterface.addIndex('promotion', ['promo_type'], { name: 'idx_promotion_type' });

    console.log('Promotion tables created.');
  },

  async down(queryInterface) {
    // Drop tables
    await queryInterface.dropTable('promotion');
    await queryInterface.dropTable('promo_type');
  }
};
