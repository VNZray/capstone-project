/**
 * RBAC Enhancement Seed - Updated User Roles with Role Types
 * 
 * Updates existing user roles to include the new role_type and is_immutable fields.
 * Preset roles have been removed - all staff roles are now custom per-business.
 * 
 * This seed should run after the RBAC enhancement migration.
 * 
 * @param { import("knex").Knex } knex
 */
export async function seed(knex) {
  // Check if the new columns exist (migration may not have run yet)
  const hasRoleType = await knex.schema.hasColumn('user_role', 'role_type');
  
  if (!hasRoleType) {
    console.log('[Seed] role_type column does not exist yet, skipping RBAC updates...');
    return;
  }

  // ============================================================
  // Update existing system roles
  // ============================================================
  const systemRoles = [
    { id: 1, role_name: 'Admin', role_type: 'system', is_immutable: true, is_custom: false },
    { id: 2, role_name: 'Tourism Officer', role_type: 'system', is_immutable: true, is_custom: false },
    { id: 3, role_name: 'Event Manager', role_type: 'system', is_immutable: true, is_custom: false },
    { id: 4, role_name: 'Business Owner', role_type: 'system', is_immutable: true, is_custom: false },
    { id: 5, role_name: 'Tourist', role_type: 'system', is_immutable: true, is_custom: false },
  ];

  for (const role of systemRoles) {
    await knex('user_role')
      .where({ id: role.id })
      .update({
        role_type: role.role_type,
        is_immutable: role.is_immutable,
        is_custom: role.is_custom,
        role_for: null, // System roles don't belong to a business
      });
  }

  console.log('[Seed] Updated system roles with role_type');

  // ============================================================
  // Delete old preset roles (6-8) if they exist
  // These are no longer needed - business owners create custom roles
  // Note: ID 5 is now Tourist, so we only delete 6-8
  // ============================================================
  const oldPresetIds = [6, 7, 8];
  
  // Check if any users are assigned to these roles before deleting
  const usersWithOldRoles = await knex('user')
    .whereIn('user_role_id', oldPresetIds)
    .count('id as count')
    .first();
  
  if (usersWithOldRoles && usersWithOldRoles.count > 0) {
    console.log(`[Seed] Warning: ${usersWithOldRoles.count} users still assigned to old preset roles (6-8). Skipping deletion.`);
    console.log('[Seed] Please migrate these users to custom business roles first.');
  } else {
    // Safe to delete - no users assigned
    await knex('role_permissions').whereIn('user_role_id', oldPresetIds).del();
    await knex('user_role').whereIn('id', oldPresetIds).del();
    console.log('[Seed] Deleted old preset roles (6-8) - not needed in new RBAC system');
  }

  // ============================================================
  // Delete other preset roles that may have been created
  // ============================================================
  const otherPresets = ['Cook', 'Housekeeper', 'Cashier', 'Tour Guide', 'Inventory Clerk'];
  
  for (const presetName of otherPresets) {
    const preset = await knex('user_role').where({ role_name: presetName, role_type: 'preset' }).first();
    
    if (preset) {
      // Check if any users are assigned
      const usersAssigned = await knex('user').where({ user_role_id: preset.id }).count('id as count').first();
      
      if (!usersAssigned || usersAssigned.count === 0) {
        await knex('role_permissions').where({ user_role_id: preset.id }).del();
        await knex('user_role').where({ id: preset.id }).del();
        console.log(`[Seed] Deleted unused preset role: ${presetName}`);
      } else {
        console.log(`[Seed] Warning: Preset role ${presetName} has users assigned, skipping deletion`);
      }
    }
  }

  console.log('[Seed] RBAC user roles seed completed - preset roles removed.');
}
