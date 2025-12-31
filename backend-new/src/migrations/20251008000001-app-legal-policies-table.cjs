'use strict';

/**
 * App Legal Policies Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('app_legal_policies', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
      },
      policy_type: {
        type: Sequelize.ENUM('terms_of_service', 'privacy_policy', 'cookie_policy', 'community_guidelines', 'refund_policy', 'disclaimer'),
        allowNull: false,
        unique: true
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT('long'),
        allowNull: false
      },
      version: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: '1.0'
      },
      effective_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'user',
          key: 'id'
        },
        onDelete: 'SET NULL'
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

    // Note: Stored procedures are now managed separately in src/procedures/appLegalPolicyProcedures.js

    console.log('App legal policies table created.');
  },

  async down(queryInterface) {
    // Note: Stored procedures are now dropped separately via src/procedures/appLegalPolicyProcedures.js

    // Drop table
    await queryInterface.dropTable('app_legal_policies');
  }
};
