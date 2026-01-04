// Seed: role_permissions
// Purpose: Assign permissions to each role using existing user_role and permissions records.

/**
 * @param {import('knex').Knex} knex
 */
exports.seed = async function seedRolePermissions(knex) {
  const ROLE_TABLE = 'user_role';
  const PERM_TABLE = 'permissions';
  const LINK_TABLE = 'role_permissions';

  // Clear existing assignments first to avoid unique constraint conflicts
  await knex(LINK_TABLE).del();

  // Load roles and permissions
  const roles = await knex(ROLE_TABLE).select('id', 'role_name');
  const permissions = await knex(PERM_TABLE).select('id', 'name');

  // Build quick lookup maps
  const roleIdByName = new Map(roles.map((r) => [r.role_name, r.id]));
  const permIdByName = new Map(permissions.map((p) => [p.name, p.id]));

  // Helper to translate permission names to ids, filtering out any missing
  const idsFor = (names) =>
    names
      .map((n) => permIdByName.get(n))
      .filter((id) => typeof id === 'number');

  // Define permission sets per role based on role responsibilities
  const ALL_PERM_IDS = permissions.map((p) => p.id);

  const rolePermissionsByName = new Map([
    // System / Government Level
    ['Admin', ALL_PERM_IDS],
    [
      'Tourism Officer',
      idsFor([
        'view_dashboard',
        'view_reports',
        // No approvals for officer
        // 'approve_business',
        // 'approve_event',
        // 'approve_tourist_spot',
        // 'approve_shop',
        'view_all_profiles',
        // No staff management and no generic manage_users to avoid access to staff page
        // 'manage_users',
        'manage_services',
      ]),
    ],
    [
      'Event Coordinator',
      idsFor([
        'view_dashboard',
        'view_reports',
        'view_bookings',
        'manage_bookings',
      ]),
    ],

    // Business Side
    [
      'Business Owner',
      idsFor([
        // Business profile
        'view_business_profile',
        'edit_business_profile',
        // Bookings & transactions
        'view_bookings',
        'manage_bookings',
        'view_transactions',
        'manage_transactions',
        // Rooms
        'view_rooms',
        'add_room',
        'edit_room',
        'delete_room',
        // Promotions
        'view_promotions',
        'manage_promotions',

        'manage_subscriptions',

        // Shop & Products
        'view_shop',
        'manage_shop',
        'view_orders',
        'manage_orders',

        // Reviews
        'view_reviews',
        'respond_reviews',
        // Staff management
        'view_staff',
        'add_staff',
        'edit_staff',
        'remove_staff',

        // Settings
        'view_settings',
        'edit_settings'
      ]),
    ],
    [
      'Manager',
      idsFor([
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
        'view_staff',
      ]),
    ],
    [
      'Room Manager',
      idsFor([
        'view_rooms',
        'add_room',
        'edit_room',
        'delete_room',
        'view_bookings',
      ]),
    ],
    [
      'Receptionist',
      idsFor([
        'view_bookings',
        'manage_bookings',
        'view_rooms',
      ]),
    ],
    [
      'Sales Associate',
      idsFor([
        'view_promotions',
        'manage_promotions',
      ]),
    ],

    // Tourist Side — application-level actions are not modeled as admin permissions here
    ['Tourist', idsFor([])],
  ]);

  // Build link rows
  const linkRows = [];
  for (const [roleName, permIds] of rolePermissionsByName.entries()) {
    const roleId = roleIdByName.get(roleName);
    if (!roleId) continue; // Skip if role not present
    for (const pid of permIds) {
      linkRows.push({ user_role_id: roleId, permission_id: pid });
    }
  }

  if (linkRows.length) {
    await knex(LINK_TABLE).insert(linkRows);
  }
};
