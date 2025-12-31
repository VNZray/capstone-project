'use strict';

/**
 * Permissions and Role Permissions Tables Migration
 * Combined with RBAC Enhancement tables (permission_categories, role_permission_overrides, role_audit_log)
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create permission_categories table for better organization
    await queryInterface.createTable('permission_categories', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true
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

    // Create permissions table (matching old backend name)
    await queryInterface.createTable('permissions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'permission_categories',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      scope: {
        type: Sequelize.ENUM('system', 'business', 'all'),
        allowNull: false,
        defaultValue: 'all'
      }
    });

    // Add indexes for permissions
    await queryInterface.addIndex('permissions', ['category_id'], { name: 'idx_permission_category' });
    await queryInterface.addIndex('permissions', ['scope'], { name: 'idx_permission_scope' });

    // Create role_permissions table (matching old backend name)
    await queryInterface.createTable('role_permissions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user_role',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      permission_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'permissions',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add unique constraint
    await queryInterface.addIndex('role_permissions', ['user_role_id', 'permission_id'], {
      name: 'uq_role_permission',
      unique: true
    });

    // Create role_permission_overrides table for fine-grained control
    await queryInterface.createTable('role_permission_overrides', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user_role',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      permission_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'permissions',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      is_granted: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true
      }
    });

    // Add unique constraint for overrides
    await queryInterface.addIndex('role_permission_overrides', ['user_role_id', 'permission_id'], {
      name: 'uq_role_permission_override',
      unique: true
    });

    // Create role_audit_log table for tracking changes
    await queryInterface.createTable('role_audit_log', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user_role',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      action: {
        type: Sequelize.ENUM('created', 'updated', 'deleted', 'permission_added', 'permission_removed', 'override_added', 'override_removed'),
        allowNull: false
      },
      old_values: {
        type: Sequelize.JSON,
        allowNull: true
      },
      new_values: {
        type: Sequelize.JSON,
        allowNull: true
      },
      performed_by: {
        type: Sequelize.UUID,
        allowNull: true
      },
      performed_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for audit log
    await queryInterface.addIndex('role_audit_log', ['user_role_id'], { name: 'idx_role_audit_role' });
    await queryInterface.addIndex('role_audit_log', ['performed_at'], { name: 'idx_role_audit_time' });

    // Note: Stored procedures are managed separately in src/procedures/permissionsProcedures.js
    console.log('Permissions, role permissions, and RBAC enhancement tables created.');
  },

  async down(queryInterface) {
    // Note: Stored procedures are managed separately in src/procedures/permissionsProcedures.js
    // Drop tables in order
    await queryInterface.dropTable('role_audit_log');
    await queryInterface.dropTable('role_permission_overrides');
    await queryInterface.dropTable('role_permissions');
    await queryInterface.dropTable('permissions');
    await queryInterface.dropTable('permission_categories');
  }
};
