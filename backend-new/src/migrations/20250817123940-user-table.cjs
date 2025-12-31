'use strict';

/**
 * User and User Role Tables Migration
 * Combined with RBAC Enhancement and Staff Onboarding columns
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // User Role table (with RBAC enhancement columns from migration 20251210000001)
    await queryInterface.createTable('user_role', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      role_name: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      role_description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      role_for: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      // RBAC Enhancement columns
      role_type: {
        type: Sequelize.ENUM('system', 'preset', 'business'),
        allowNull: false,
        defaultValue: 'system'
      },
      is_custom: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      based_on_role_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'user_role',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      is_immutable: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for user_role
    await queryInterface.addIndex('user_role', ['role_for', 'role_type'], { name: 'idx_role_for_type' });
    await queryInterface.addIndex('user_role', ['role_type'], { name: 'idx_role_type' });
    await queryInterface.addIndex('user_role', ['based_on_role_id'], { name: 'idx_based_on_role' });

    // User table (with staff onboarding columns from migration 20251211000001)
    await queryInterface.createTable('user', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
      },
      email: {
        type: Sequelize.STRING(40),
        allowNull: false,
        unique: true
      },
      phone_number: {
        type: Sequelize.STRING(13),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      user_profile: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      otp: {
        type: Sequelize.STRING(6),
        allowNull: true
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true
      },
      user_role_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'user_role',
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
      },
      // Staff onboarding enhancement columns
      must_change_password: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      profile_completed: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      invitation_token: {
        type: Sequelize.STRING(64),
        allowNull: true
      },
      invitation_expires_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Add index for invitation token
    await queryInterface.addIndex('user', ['invitation_token'], { name: 'idx_user_invitation_token' });

    console.log('User tables created.');
  },

  async down(queryInterface) {
    // Drop tables
    await queryInterface.dropTable('user');
    await queryInterface.dropTable('user_role');
  }
};
