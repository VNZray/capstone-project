/**
 * Tourism Staff Permission Assignments Seed
 *
 * This assigns system-scope permissions to Tourism Staff users via the user_permissions table.
 * Tourism staff are individuals in the tourism office with specific system-level access.
 *
 * Unlike business staff who get permissions assigned by the business owner,
 * tourism staff permissions are pre-assigned based on their role (Admin or Tourism Officer).
 *
 * @param {import('knex').Knex} knex
 */
exports.seed = async function (knex) {
  console.log('[Seed] Assigning tourism staff permissions...');

  // Delete existing tourism staff permissions (for idempotency)
  // We only clear permissions for users with system roles (Admin, Tourism Officer)
  const systemRoles = await knex('user_role')
    .whereIn('role_name', ['Admin', 'Tourism Officer'])
    .select('id');

  const systemRoleIds = systemRoles.map(r => r.id);

  if (systemRoleIds.length > 0) {
    const systemUsers = await knex('user')
      .whereIn('user_role_id', systemRoleIds)
      .select('id');

    const systemUserIds = systemUsers.map(u => u.id);

    if (systemUserIds.length > 0) {
      await knex('user_permissions')
        .whereIn('user_id', systemUserIds)
        .del();
    }
  }

  // Get permission IDs for system-scope permissions
  const systemPermissions = await knex('permissions')
    .where('scope', 'system')
    .select('id', 'name');

  const permissionMap = {};
  systemPermissions.forEach(perm => {
    permissionMap[perm.name] = perm.id;
  });

  // Get all tourism staff users
  const tourismStaff = await knex.raw(`
    SELECT u.id as user_id, u.email, ur.role_name, t.id as tourism_id
    FROM user u
    INNER JOIN user_role ur ON u.user_role_id = ur.id
    LEFT JOIN tourism t ON u.id = t.user_id
    WHERE ur.role_name IN ('Admin', 'Tourism Officer')
  `);

  const staffList = Array.isArray(tourismStaff[0]) ? tourismStaff[0] : [];

  if (staffList.length === 0) {
    console.log('[Seed] No tourism staff found. Skipping permission assignment.');
    return;
  }

  // Define permission sets for each role
  const rolePermissions = {
    'Admin': [
      // Dashboard & Reporting
      'view_dashboard',
      'view_reports',

      // Approval (all types)
      'approve_business',
      'approve_event',
      'approve_tourist_spot',
      'approve_shop',

      // Services Management
      'view_tourist_spots',
      'manage_tourist_spots',
      'view_events',
      'manage_events',
      'view_accommodations',
      'manage_accommodations',
      'view_shops',
      'manage_shops',
      'manage_services',

      // Emergency Facilities
      'view_emergency_facilities',
      'manage_emergency_facilities',

      // Staff Management
      'manage_tourism_staff',
      'view_tourism_staff',
      'add_tourism_staff',
      'edit_tourism_staff',
      'remove_tourism_staff',
      'assign_tourism_staff_permissions',
      'view_tourism_staff_activity',

      // User Management
      'manage_users',
      'view_all_profiles',
    ],
    'Tourism Officer': [
      // Dashboard & Reporting
      'view_dashboard',
      'view_reports',

      // Approval (limited - tourist spots and events only)
      'approve_event',
      'approve_tourist_spot',

      // Services Management (View and Manage)
      'view_tourist_spots',
      'manage_tourist_spots',
      'view_events',
      'manage_events',
      'view_accommodations',
      'view_shops',

      // Emergency Facilities (View only)
      'view_emergency_facilities',

      // Limited profile viewing
      'view_all_profiles',
    ],
  };

  // Prepare permission assignments
  const permissionAssignments = [];

  for (const staff of staffList) {
    const permissions = rolePermissions[staff.role_name] || [];

    for (const permName of permissions) {
      if (permissionMap[permName]) {
        permissionAssignments.push({
          user_id: staff.user_id,
          permission_id: permissionMap[permName],
          granted_by: null, // System-assigned
          created_at: knex.fn.now(),
        });
      }
    }
  }

  // Insert permission assignments
  if (permissionAssignments.length > 0) {
    await knex('user_permissions').insert(permissionAssignments);
    console.log(`[Seed] Assigned ${permissionAssignments.length} permissions to ${staffList.length} tourism staff members.`);
  } else {
    console.log('[Seed] No permissions to assign.');
  }

  // Log summary
  console.log('[Seed] Tourism staff permission assignment summary:');
  const summary = {};
  staffList.forEach(staff => {
    summary[staff.role_name] = (summary[staff.role_name] || 0) + 1;
  });
  Object.entries(summary).forEach(([role, count]) => {
    const perms = rolePermissions[role] || [];
    console.log(`  - ${role}: ${count} user(s) × ${perms.length} permissions`);
  });
};
