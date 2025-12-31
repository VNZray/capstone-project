'use strict';

/**
 * Review and Rating / Reply Tables Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Review and Rating table
    await queryInterface.createTable('review_and_rating', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
      },
      review_type: {
        type: Sequelize.ENUM('Accommodation', 'Room', 'Shop', 'Event', 'Tourist Spot', 'Product', 'Service'),
        allowNull: false
      },
      review_type_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      rating: {
        type: Sequelize.TINYINT,
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      tourist_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      }
    });

    // Reply table
    await queryInterface.createTable('reply', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
      },
      review_and_rating_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'review_and_rating',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      responder_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      }
    });

    console.log('Review and Rating / Reply tables created.');
  },

  async down(queryInterface) {
    // Drop tables
    await queryInterface.dropTable('reply');
    await queryInterface.dropTable('review_and_rating');
  }
};
