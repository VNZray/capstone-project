'use strict';

/**
 * Approval Records Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('approval_records', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      entity_type: {
        type: Sequelize.ENUM('business', 'owner', 'tourism', 'tourist_spot'),
        allowNull: false
      },
      entity_id: {
        type: Sequelize.STRING(64),
        allowNull: false
      },
      action: {
        type: Sequelize.ENUM('approve', 'reject', 'suspend', 'reinstate'),
        allowNull: false
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      approved_by: {
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
      }
    });

    // Add indexes
    await queryInterface.addIndex('approval_records', ['entity_type', 'entity_id'], { name: 'idx_approval_entity' });

    console.log('Approval records table created.');
  },

  async down(queryInterface) {
    await queryInterface.dropTable('approval_records');
  }
};
