'use strict';

/**
 * Business Policies Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('business_policies', {
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
      policy_type: {
        type: Sequelize.ENUM('cancellation', 'refund', 'privacy', 'terms', 'booking', 'payment', 'other'),
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      version: {
        type: Sequelize.INTEGER,
        defaultValue: 1
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
    await queryInterface.addIndex('business_policies', ['business_id'], { name: 'idx_business_policies_business' });
    await queryInterface.addIndex('business_policies', ['policy_type'], { name: 'idx_business_policies_type' });

    // Note: Stored procedures are now managed separately in src/procedures/businessPolicyProcedures.js

    console.log('Business policies table created.');
  },

  async down(queryInterface) {
    // Note: Stored procedures are now dropped separately via src/procedures/businessPolicyProcedures.js

    // Drop table
    await queryInterface.dropTable('business_policies');
  }
};
