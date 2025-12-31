'use strict';

/**
 * Subscription Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('subscription', {
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
      plan_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      booking_system: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      promotion_tools: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      visibility_boost: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      publication: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'active'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    console.log('Subscription table created.');
  },

  async down(queryInterface) {
    await queryInterface.dropTable('subscription');
  }
};
