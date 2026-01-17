/**
 * Tourism Staff Management - Permission Structure Seed
 *
 * This seed creates tourism-specific permissions for staff management,
 * similar to business staff management but for the tourism portal.
 *
 * Includes granular permissions for:
 * - Adding/removing tourism staff
 * - Managing staff roles and permissions
 * - Viewing staff activity and audit logs
 *
 * @param { import("knex").Knex } knex
 */
exports.seed = async function (knex) {
  console.log('[Seed] Setting up tourism staff management permissions...');

  // Check if we have category_id column
  const hasCategoryId = await knex.schema.hasColumn('permissions', 'category_id');
  const hasScope = await knex.schema.hasColumn('permissions', 'scope');

  // Additional granular tourism staff permissions
  const tourismStaffPermissions = [
    {
      name: 'view_tourism_staff',
      description: 'View tourism office staff list',
      scope: 'system',
      category_id: 11
    },
    {
      name: 'add_tourism_staff',
      description: 'Add new tourism office staff members',
      scope: 'system',
      category_id: 11
    },
    {
      name: 'edit_tourism_staff',
      description: 'Edit tourism staff profiles and details',
      scope: 'system',
      category_id: 11
    },
    {
      name: 'remove_tourism_staff',
      description: 'Remove tourism staff members',
      scope: 'system',
      category_id: 11
    },
    {
      name: 'assign_tourism_staff_permissions',
      description: 'Assign permissions to tourism staff',
      scope: 'system',
      category_id: 11
    },
    {
      name: 'view_tourism_staff_activity',
      description: 'View tourism staff activity logs',
      scope: 'system',
      category_id: 11
    },
  ];

  // Build insert data with optional columns
  const insertData = tourismStaffPermissions.map(perm => {
    const record = { name: perm.name, description: perm.description };
    if (hasScope) {
      record.scope = perm.scope;
    }
    if (hasCategoryId && perm.category_id) {
      record.category_id = perm.category_id;
    }
    return record;
  });

  // Insert permissions (skip if already exists)
  for (const perm of insertData) {
    await knex('permissions')
      .insert(perm)
      .onConflict('name')
      .ignore();
  }

  console.log(`[Seed] ✅ ${insertData.length} tourism staff management permissions added.`);

  // Assign these permissions to Admin role (id = 1)
  console.log('[Seed] Assigning tourism staff permissions to Admin role...');

  const adminRoleId = 1; // Admin role

  // Get permission IDs
  const permissionNames = tourismStaffPermissions.map(p => p.name);
  const permissions = await knex('permissions')
    .whereIn('name', permissionNames)
    .select('id', 'name');

  if (permissions.length > 0) {
    const rolePermissions = permissions.map(p => ({
      user_role_id: adminRoleId,
      permission_id: p.id,
    }));

    // Insert role permissions (skip if already exists)
    for (const rp of rolePermissions) {
      await knex('role_permissions')
        .insert(rp)
        .onConflict(['user_role_id', 'permission_id'])
        .ignore();
    }

    console.log(`[Seed] ✅ Assigned ${permissions.length} permissions to Admin role.`);
  }

  // Also update the existing manage_tourism_staff permission if it exists
  await knex('permissions')
    .where('name', 'manage_tourism_staff')
    .update({
      description: 'Full access to manage tourism office staff (includes all staff operations)',
      ...(hasCategoryId ? { category_id: 11 } : {})
    });

  console.log('[Seed] ✅ Tourism staff management permissions setup complete.');
};;
