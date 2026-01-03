/**
 * RBAC Enhancement Seed - System Roles Setup
 * 
 * Updates existing user_role entries with the two-tier RBAC fields:
 * - role_type: system or business
 * - is_custom: whether role is custom-created
 * - is_immutable: whether role can be modified
 * 
 * Business owners create custom roles directly (no presets).
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
    { id: 1, role_name: 'Admin', role_type: 'system', is_immutable: true, is_custom: false, role_for: null },
    { id: 2, role_name: 'Tourism Officer', role_type: 'system', is_immutable: true, is_custom: false, role_for: null },
    { id: 4, role_name: 'Business Owner', role_type: 'system', is_immutable: false, is_custom: false, role_for: null },
    { id: 9, role_name: 'Tourist', role_type: 'system', is_immutable: true, is_custom: false, role_for: null },
  ];

  for (const role of systemRoles) {
    await knex('user_role')
      .where({ id: role.id })
      .update({
        role_type: role.role_type,
        is_immutable: role.is_immutable,
        is_custom: role.is_custom,
        role_for: role.role_for,
      });
  }

  console.log('[Seed] System roles updated with RBAC enhancements.');

  // ============================================================
  // Clean up legacy preset roles (if any exist without users)
  // ============================================================
  const legacyPresetIds = [3, 5, 6, 7, 8]; // Event Manager, Manager, Room Manager, Receptionist, Sales Associate
  
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

  // Also clean up any other preset roles that were added later
  const otherPresets = await knex('user_role')
    .where({ role_type: 'preset' })
    .select('id', 'role_name');
  
  for (const preset of otherPresets) {
    const userCount = await knex('user').where({ user_role_id: preset.id }).count('id as count').first();
    if (userCount.count === 0) {
      await knex('role_permissions').where({ user_role_id: preset.id }).del();
      await knex('user_role').where({ id: preset.id }).del();
      console.log(`[Seed] Removed unused preset role: ${preset.role_name}`);
    }
  }

  console.log('[Seed] RBAC enhancement complete - two-tier system active.');
}
