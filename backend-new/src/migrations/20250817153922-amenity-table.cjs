'use strict';

/**
 * Amenity Tables Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Amenity table
    await queryInterface.createTable('amenity', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(100),
        unique: true,
        allowNull: true
      },
      icon: {
        type: Sequelize.STRING(60),
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    });

    // Business Amenities junction table
    await queryInterface.createTable('business_amenities', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
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
      amenity_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'amenity',
          key: 'id'
        },
        onDelete: 'CASCADE'
      }
    });

    // Room Amenities junction table
    await queryInterface.createTable('room_amenities', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
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
      amenity_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'amenity',
          key: 'id'
        },
        onDelete: 'CASCADE'
      }
    });

    console.log('Amenity tables created.');
  },

  async down(queryInterface) {
    // Drop tables
    await queryInterface.dropTable('room_amenities');
    await queryInterface.dropTable('business_amenities');
    await queryInterface.dropTable('amenity');
  }
};
