'use strict';

/**
 * Business Photos Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('business_photo', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
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
      photo_url: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      caption: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      photo_type: {
        type: Sequelize.ENUM('cover', 'gallery', 'logo', 'menu', 'facility'),
        allowNull: false,
        defaultValue: 'gallery'
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('business_photo', ['business_id'], { name: 'idx_business_photo_business' });
    await queryInterface.addIndex('business_photo', ['photo_type'], { name: 'idx_business_photo_type' });

    // Note: Stored procedures are managed separately in src/procedures/businessPhotosProcedures.js
    console.log('Business photos table created.');
  },

  async down(queryInterface) {
    // Note: Stored procedures are managed separately in src/procedures/businessPhotosProcedures.js
    // Drop table
    await queryInterface.dropTable('business_photo');
  }
};
