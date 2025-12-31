'use strict';

/**
 * Tourist Spot Images Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tourist_spot_images', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
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
      file_url: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      file_format: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      file_size: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      alt_text: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      uploaded_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('tourist_spot_images', ['tourist_spot_id'], { name: 'idx_tourist_spot_images_spot_id' });
    await queryInterface.addIndex('tourist_spot_images', ['is_primary'], { name: 'idx_tourist_spot_images_primary' });

    console.log('Tourist spot images table created.');
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tourist_spot_images');
  }
};
