/**
 * RBAC Enhancement Seed - System Roles Setup
 * 
 * Updates existing user_role entries with the simplified RBAC fields:
 * - role_type: system (all roles are now system roles)
 * - is_immutable: whether role can be modified
 * 
 * No more per-business roles. Staff use the single "Staff" role.
 * 
 * @param { import("knex").Knex } knex
 */
export async function seed(knex) {
  // Check if role_type column exists (migration may not have run yet)
  const hasRoleType = await knex.schema.hasColumn('user_role', 'role_type');
  if (!hasRoleType) {
    console.log('[Seed] user_role.role_type column does not exist yet, skipping enhancement seed...');
    return;
  }

  // ============================================================
  // Update system roles with proper RBAC flags
  // ============================================================
  const systemRoles = [
    { id: 1, role_name: 'Admin', role_type: 'system', is_immutable: true },
    { id: 2, role_name: 'Tourism Officer', role_type: 'system', is_immutable: true },
    { id: 4, role_name: 'Business Owner', role_type: 'system', is_immutable: true },
    { id: 5, role_name: 'Tourist', role_type: 'system', is_immutable: true },
    { id: 6, role_name: 'Staff', role_type: 'system', is_immutable: true },
  ];

  for (const role of systemRoles) {
    await knex('user_role')
      .where({ id: role.id })
      .update({
        role_type: role.role_type,
        is_immutable: role.is_immutable,
      });
  }

  console.log('[Seed] System roles updated with RBAC enhancements.');

  // ============================================================
  // Clean up legacy preset roles (if any exist without users)
  // ============================================================
  const legacyPresetIds = [3, 7, 8]; // Event Manager and any other legacy roles
  
  for (const roleId of legacyPresetIds) {
    // Check if role exists and has no users assigned
    const role = await knex('user_role').where({ id: roleId }).first();
    if (role && role.role_type === 'preset') {
      const userCount = await knex('user').where({ user_role_id: roleId }).count('id as count').first();
      if (userCount.count === 0) {
        // Delete permissions first, then role
        await knex('role_permissions').where({ user_role_id: roleId }).del();
        await knex('user_role').where({ id: roleId }).del();
        console.log(`[Seed] Removed unused preset role: ${role.role_name}`);
      }
    }
  }

  console.log('[Seed] RBAC enhancement complete - simplified system active.');
}
