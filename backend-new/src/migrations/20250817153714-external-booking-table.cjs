'use strict';

/**
 * External Booking Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('external_booking', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(40),
        allowNull: false
      },
      link: {
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
      }
    });

    console.log('External Booking table created.');
  },

  async down(queryInterface) {
    // Drop table
    await queryInterface.dropTable('external_booking');
  }
};
