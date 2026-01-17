/**
 * Role Permissions Seed
 * 
 * Assigns permissions to system roles.
 * Uses the unified permission names from 01_permissions.cjs
 * 
 * @param {import('knex').Knex} knex
 */
exports.seed = async function (knex) {
  const ROLE_TABLE = 'user_role';
  const PERM_TABLE = 'permissions';
  const LINK_TABLE = 'role_permissions';

  // Clear existing role-permission assignments
  await knex(LINK_TABLE).del();

  // Load current roles and permissions
  const roles = await knex(ROLE_TABLE).select('id', 'role_name');
  const permissions = await knex(PERM_TABLE).select('id', 'name');

  // Build lookup maps
  const roleIdByName = new Map(roles.map(r => [r.role_name, r.id]));
  const permIdByName = new Map(permissions.map(p => [p.name, p.id]));

  // Helper: Convert permission names to IDs, filtering out missing
  const idsFor = (names) =>
    names
      .map(n => permIdByName.get(n))
      .filter(id => typeof id === 'number');

  // All permission IDs for Admin
  const ALL_PERM_IDS = permissions.map(p => p.id);

  // ============================================================
  // ROLE PERMISSION DEFINITIONS
  // ============================================================
  const rolePermissions = new Map([
    // ------------------------------------------------------------
    // ADMIN - Full system access
    // ------------------------------------------------------------
    ['Admin', ALL_PERM_IDS],

    // ------------------------------------------------------------
    // TOURISM OFFICER - Platform oversight (limited)
    // ------------------------------------------------------------
    ['Tourism Officer', idsFor([
      // Dashboard & Reports
      'view_dashboard',
      'view_reports',
      'view_analytics',
      // View all profiles
      'view_all_profiles',
      // Service management
      'manage_services',
      // Tourist spots
      'view_tourist_spots',
      'manage_tourist_spots',
      'approve_tourist_spot',
    ])],

    // ------------------------------------------------------------
    // EVENT MANAGER - Event coordination
    // ------------------------------------------------------------
    ['Event Manager', idsFor([
      'view_dashboard',
      'view_reports',
      'view_bookings',
      'manage_bookings',
      'view_events',
      'manage_events',
    ])],

    // ------------------------------------------------------------
    // BUSINESS OWNER - Full business access
    // ------------------------------------------------------------
    ['Business Owner', idsFor([
      // Dashboard & Reports
      'view_dashboard',
      'view_reports',
      'view_analytics',
      // Business Profile
      'view_business_profile',
      'manage_business_profile',
      'manage_business_settings',
      // Bookings & Rooms
      'view_bookings',
      'manage_bookings',
      'manage_rooms',
      // Shop & Products
      'view_shop',
      'manage_shop',
      'manage_discounts',
      // Orders
      'view_orders',
      'manage_orders',
      // Transactions & Payments
      'view_transactions',
      'view_payments',
      'manage_payments',
      'manage_refunds',
      // Promotions
      'view_promotions',
      'manage_promotions',
      // Reviews
      'view_reviews',
      'manage_reviews',
      // Staff
      'view_staff',
      'add_staff',
      'manage_staff_roles',
      // Services
      'view_services',
      'manage_business_services',
      'manage_service_inquiries',
      // Notifications
      'send_notifications',
      // Subscription
      'manage_subscriptions',
    ])],

    // ------------------------------------------------------------
    // STAFF - Minimal default (permissions assigned per-user)
    // Staff get permissions through user_permissions table
    // ------------------------------------------------------------
    ['Staff', idsFor([
      'view_dashboard',
    ])],

    // ------------------------------------------------------------
    // TOURIST - Customer-facing access
    // ------------------------------------------------------------
    ['Tourist', idsFor([
      // No special permissions - tourists access public endpoints
    ])],
  ]);

  // ============================================================
  // INSERT ROLE PERMISSIONS
  // ============================================================
  let totalAssigned = 0;

  for (const [roleName, permIds] of rolePermissions) {
    const roleId = roleIdByName.get(roleName);
    
    if (!roleId) {
      console.warn(`[Seed] Role "${roleName}" not found, skipping...`);
      continue;
    }

    if (!permIds || permIds.length === 0) {
      console.log(`[Seed] No permissions to assign for role "${roleName}"`);
      continue;
    }

    // Build insert records
    const records = permIds.map(permId => ({
      user_role_id: roleId,
      permission_id: permId,
    }));

    await knex(LINK_TABLE).insert(records);
    totalAssigned += records.length;
    console.log(`[Seed] Assigned ${records.length} permissions to "${roleName}"`);
  }

  console.log(`[Seed] Role permissions seed completed. Total: ${totalAssigned} assignments.`);
};
