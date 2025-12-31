'use strict';

/**
 * Role Permissions Seeder
 *
 * Assigns permission to each role matching the old backend structure.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get the database connection
    const [roles] = await queryInterface.sequelize.query(
      'SELECT id, role_name FROM user_role'
    );
    const [permissions] = await queryInterface.sequelize.query(
      'SELECT id, name FROM permissions'
    );

    // Build lookup maps
    const roleIdByName = new Map(roles.map(r => [r.role_name, r.id]));
    const permIdByName = new Map(permissions.map(p => [p.name, p.id]));

    // Helper to get permission IDs
    const idsFor = (names) => names
      .map(n => permIdByName.get(n))
      .filter(id => typeof id === 'number');

    // All permission IDs for Admin
    const ALL_PERM_IDS = permissions.map(p => p.id);

    // Define permission sets per role
    const rolePermissionsByName = new Map([
      // System / Government Level - Admin gets all permission
      ['Admin', ALL_PERM_IDS],

      ['Tourism Officer', idsFor([
        'view_dashboard',
        'view_reports',
        'view_all_profiles',
        'manage_services'
      ])],

      ['Event Manager', idsFor([
        'view_dashboard',
        'view_reports',
        'view_bookings',
        'manage_bookings'
      ])],

      // Business Side
      ['Business Owner', idsFor([
        'view_business_profile',
        'edit_business_profile',
        'view_bookings',
        'manage_bookings',
        'view_transactions',
        'manage_transactions',
        'view_rooms',
        'add_room',
        'edit_room',
        'delete_room',
        'view_promotions',
        'manage_promotions',
        'manage_subscriptions',
        'view_reviews',
        'respond_reviews',
        'view_staff',
        'add_staff',
        'edit_staff',
        'remove_staff',
        'view_settings',
        'edit_settings'
      ])],

      ['Manager', idsFor([
        'view_business_profile',
        'edit_business_profile',
        'view_bookings',
        'manage_bookings',
        'view_transactions',
        'manage_transactions',
        'view_rooms',
        'add_room',
        'edit_room',
        'delete_room',
        'view_promotions',
        'manage_promotions',
        'view_reviews',
        'respond_reviews',
        'view_staff'
      ])],

      ['Room Manager', idsFor([
        'view_rooms',
        'add_room',
        'edit_room',
        'delete_room',
        'view_bookings'
      ])],

      ['Receptionist', idsFor([
        'view_bookings',
        'manage_bookings',
        'view_rooms'
      ])],

      ['Sales Associate', idsFor([
        'view_promotions',
        'manage_promotions'
      ])],

      // Tourist Side - No admin permission
      ['Tourist', idsFor([])]
    ]);

    // Build link rows
    const linkRows = [];
    for (const [roleName, permIds] of rolePermissionsByName.entries()) {
      const roleId = roleIdByName.get(roleName);
      if (!roleId) continue;
      for (const permId of permIds) {
        linkRows.push({ user_role_id: roleId, permission_id: permId });
      }
    }

    if (linkRows.length) {
      await queryInterface.bulkInsert('role_permissions', linkRows);
    }

    console.log('[Seed] Role permission seeded.');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('role_permissions', null, {});
  }
};
