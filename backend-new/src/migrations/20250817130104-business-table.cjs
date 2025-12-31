'use strict';

/**
 * Business Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('business', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
      },
      business_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      min_price: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      max_price: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING(40),
        allowNull: false,
        unique: true
      },
      phone_number: {
        type: Sequelize.STRING(14),
        allowNull: false,
        unique: true
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      owner_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'owner',
          key: 'id'
        }
      },
      status: {
        type: Sequelize.ENUM('Pending', 'Active', 'Inactive', 'Maintenance'),
        allowNull: false,
        defaultValue: 'Pending'
      },
      business_image: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      latitude: {
        type: Sequelize.STRING(30),
        allowNull: false
      },
      longitude: {
        type: Sequelize.STRING(30),
        allowNull: false
      },
      website_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      facebook_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      instagram_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      hasBooking: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      hasStore: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      barangay_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'barangay',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      }
    });

    console.log('Business table created.');
  },

  async down(queryInterface) {
    // Drop table
    await queryInterface.dropTable('business');
  }
};
