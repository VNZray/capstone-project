'use strict';

/**
 * Booking Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('booking', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
      },
      pax: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      num_children: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      num_adults: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      num_infants: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      foreign_counts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      domestic_counts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      overseas_counts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      local_counts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      trip_purpose: {
        type: Sequelize.STRING(30),
        allowNull: false
      },
      booking_type: {
        type: Sequelize.ENUM('overnight', 'short-stay'),
        defaultValue: 'overnight'
      },
      check_in_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      check_out_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      check_in_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      check_out_time: {
        type: Sequelize.TIME,
        allowNull: false
      },
      total_price: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      balance: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      booking_status: {
        type: Sequelize.ENUM('Pending', 'Reserved', 'Checked-In', 'Checked-Out', 'Canceled'),
        allowNull: false,
        defaultValue: 'Pending'
      },
      booking_source: {
        type: Sequelize.ENUM('online', 'walk-in'),
        allowNull: false,
        defaultValue: 'online'
      },
      guest_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      guest_phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      guest_email: {
        type: Sequelize.STRING(100),
        allowNull: true
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
      business_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'business',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      tourist_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tourist',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    console.log('Booking table created.');
  },

  async down(queryInterface) {
    // Drop table
    await queryInterface.dropTable('booking');
  }
};
