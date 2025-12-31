'use strict';

/**
 * Tourist Spot Schedules Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tourist_spot_schedules', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('UUID()')
      },
      tourist_spot_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tourist_spots',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      day_of_week: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      open_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      close_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      is_closed: {
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

    // Add index
    await queryInterface.addIndex('tourist_spot_schedules', ['tourist_spot_id'], { name: 'idx_tourist_spot_schedules' });

    console.log('Tourist spot schedules table created.');
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tourist_spot_schedules');
  }
};
