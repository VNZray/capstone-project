'use strict';

/**
 * Report Status History Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('report_status_history', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
      },
      report_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'report',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('submitted', 'under_review', 'in_progress', 'resolved', 'rejected'),
        allowNull: false
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      updated_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'user',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    console.log('Report status history table created.');
  },

  async down(queryInterface) {
    await queryInterface.dropTable('report_status_history');
  }
};
