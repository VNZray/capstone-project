'use strict';

/**
 * Staff Table Migration
 * Matches the old backend staff table structure
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('staff', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
      },
      first_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      middle_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      last_name: {
        type: Sequelize.STRING(255),
        allowNull: false
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
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id'
        },
        onDelete: 'CASCADE'
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

    // Add indexes
    await queryInterface.addIndex('staff', ['user_id'], { name: 'idx_user_id' });
    await queryInterface.addIndex('staff', ['business_id'], { name: 'idx_business_id' });

    // Note: Stored procedures are managed separately in src/procedures/staffProcedures.js
    console.log('Staff table created.');
  },

  async down(queryInterface) {
    // Note: Stored procedures are managed separately in src/procedures/staffProcedures.js
    // Drop table
    await queryInterface.dropTable('staff');
  }
};
