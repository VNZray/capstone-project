'use strict';

/**
 * Room Blocked Dates Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('room_blocked_dates', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
      },
      room_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'room',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      reason: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      blocked_by: {
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
    await queryInterface.addIndex('room_blocked_dates', ['room_id'], { name: 'idx_room_blocked_dates_room' });
    await queryInterface.addIndex('room_blocked_dates', ['start_date', 'end_date'], { name: 'idx_room_blocked_dates_range' });

    // Note: Stored procedures are now managed separately in src/procedures/roomBlockedDatesProcedures.js

    console.log('Room blocked dates table created.');
  },

  async down(queryInterface) {
    // Note: Stored procedures are now dropped separately via src/procedures/roomBlockedDatesProcedures.js

    // Drop table
    await queryInterface.dropTable('room_blocked_dates');
  }
};
