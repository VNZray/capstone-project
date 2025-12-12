/**
 * RBAC Enhancement Seed - Updated User Roles with Role Types
 * 
 * Updates existing user roles to include the new role_type, is_custom,
 * and is_immutable fields. Also adds new preset roles for businesses.
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
    { id: 9, role_name: 'Tourist', role_type: 'system', is_immutable: true, is_custom: false },
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
  // Convert existing business roles (5-8) to presets
  // These become templates that businesses can clone
  // ============================================================
  const presetRoles = [
    { 
      id: 5, 
      role_name: 'Manager',
      role_description: 'Handles daily business operations such as bookings, rooms, and transactions.',
      role_type: 'preset',
      is_immutable: false,
      is_custom: false,
      role_for: null
    },
    { 
      id: 6, 
      role_name: 'Room Manager',
      role_description: 'Responsible for managing room listings, availability, maintenance, and pricing.',
      role_type: 'preset',
      is_immutable: false,
      is_custom: false,
      role_for: null
    },
    { 
      id: 7, 
      role_name: 'Receptionist',
      role_description: 'Front desk staff responsible for booking confirmation and guest check-ins.',
      role_type: 'preset',
      is_immutable: false,
      is_custom: false,
      role_for: null
    },
    { 
      id: 8, 
      role_name: 'Sales Associate',
      role_description: 'Manages shop products, prices, and promotions.',
      role_type: 'preset',
      is_immutable: false,
      is_custom: false,
      role_for: null
    },
  ];

  for (const role of presetRoles) {
    await knex('user_role')
      .where({ id: role.id })
      .update({
        role_name: role.role_name,
        role_description: role.role_description,
        role_type: role.role_type,
        is_immutable: role.is_immutable,
        is_custom: role.is_custom,
        role_for: role.role_for,
      });
  }

  console.log('[Seed] Updated business roles to preset templates');

  // ============================================================
  // Add new preset roles for common business positions
  // ============================================================
  const newPresets = [
    {
      role_name: 'Cook',
      role_description: 'Kitchen staff responsible for food preparation and order fulfillment.',
      role_type: 'preset',
      is_custom: false,
      is_immutable: false,
      role_for: null,
    },
    {
      role_name: 'Housekeeper',
      role_description: 'Responsible for room cleaning and maintenance tasks.',
      role_type: 'preset',
      is_custom: false,
      is_immutable: false,
      role_for: null,
    },
    {
      role_name: 'Cashier',
      role_description: 'Handles payments, refunds, and cash management.',
      role_type: 'preset',
      is_custom: false,
      is_immutable: false,
      role_for: null,
    },
    {
      role_name: 'Tour Guide',
      role_description: 'Leads tours and assists guests with local information.',
      role_type: 'preset',
      is_custom: false,
      is_immutable: false,
      role_for: null,
    },
    {
      role_name: 'Inventory Clerk',
      role_description: 'Manages product inventory levels and stock updates.',
      role_type: 'preset',
      is_custom: false,
      is_immutable: false,
      role_for: null,
    },
  ];

  for (const preset of newPresets) {
    // Check if already exists
    const existing = await knex('user_role').where({ role_name: preset.role_name }).first();
    
    if (!existing) {
      await knex('user_role').insert(preset);
      console.log(`[Seed] Created new preset role: ${preset.role_name}`);
    } else {
      // Update to preset type if exists
      await knex('user_role')
        .where({ role_name: preset.role_name })
        .update({
          role_type: 'preset',
          is_custom: false,
          is_immutable: false,
          role_for: null,
        });
    }
  }

  console.log('[Seed] RBAC user roles seed completed.');
}
