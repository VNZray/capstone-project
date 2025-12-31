'use strict';

/**
 * Address Tables Migration
 * Creates province, municipality, barangay, and address tables
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Province table
    await queryInterface.createTable('province', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      province: {
        type: Sequelize.STRING(100),
        allowNull: false
      }
    });

    // Municipality table
    await queryInterface.createTable('municipality', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      municipality: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      province_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'province',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      }
    });

    // Barangay table
    await queryInterface.createTable('barangay', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      barangay: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      municipality_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'municipality',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      }
    });

    // Address table
    await queryInterface.createTable('address', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      province_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'province',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      municipality_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'municipality',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
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

    console.log('Address tables created.');
  },

  async down(queryInterface) {
    // Drop tables
    await queryInterface.dropTable('address');
    await queryInterface.dropTable('barangay');
    await queryInterface.dropTable('municipality');
    await queryInterface.dropTable('province');
  }
};
