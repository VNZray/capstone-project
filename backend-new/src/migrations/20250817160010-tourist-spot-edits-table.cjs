'use strict';

/**
 * Tourist Spot Edits Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tourist_spot_edits', {
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
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      barangay_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'barangay',
          key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true
      },
      contact_phone: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      contact_email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      website: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      entry_fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      spot_status: {
        type: Sequelize.ENUM('pending', 'active', 'inactive'),
        allowNull: false,
        defaultValue: 'pending'
      },
      is_featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      approval_status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
      },
      remarks: {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: ''
      },
      submitted_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      reviewed_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Add indexes
    await queryInterface.addIndex('tourist_spot_edits', ['tourist_spot_id'], { name: 'idx_tourist_spot' });
    await queryInterface.addIndex('tourist_spot_edits', ['barangay_id'], { name: 'idx_barangay_edit' });

    console.log('Tourist spot edits table created.');
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tourist_spot_edits');
  }
};
