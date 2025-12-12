/**
 * RBAC Enhancement Seed - Enhanced User Roles
 * 
 * Updates existing user_role entries with the new three-tier RBAC fields:
 * - role_type: system, preset, or business
 * - is_custom: whether role is custom-created
 * - is_immutable: whether role can be modified
 * 
 * Also adds preset roles that businesses can clone.
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
  // STEP 1: Update existing system roles
  // ============================================================
  const systemRoles = [
    { id: 1, role_name: 'Admin', role_type: 'system', is_immutable: true, is_custom: false, role_for: null },
    { id: 2, role_name: 'Tourism Officer', role_type: 'system', is_immutable: true, is_custom: false, role_for: null },
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

  // Business Owner is system but not immutable (for potential customization)
  await knex('user_role')
    .where({ id: 4 })
    .update({
      role_type: 'system',
      is_immutable: false,
      is_custom: false,
      role_for: null,
    });

  console.log('[Seed] System roles updated with RBAC enhancements.');

  // ============================================================
  // STEP 2: Convert existing business-specific roles to presets
  // ============================================================
  // These are the template roles that businesses can clone
  const presetRoles = [
    { 
      id: 3, 
      role_name: 'Event Manager', 
      role_description: 'Manages event listings, participant data, and schedules.',
      role_type: 'preset',
      is_immutable: false,
      is_custom: false,
      role_for: null
    },
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
        role_description: role.role_description,
        role_type: role.role_type,
        is_immutable: role.is_immutable,
        is_custom: role.is_custom,
        role_for: role.role_for,
      });
  }

  console.log('[Seed] Preset roles (templates) configured.');

  // ============================================================
  // STEP 3: Add additional preset roles for common business needs
  // ============================================================
  const additionalPresets = [
    {
      role_name: 'Cook',
      role_description: 'Kitchen staff responsible for food preparation and order fulfillment.',
      role_type: 'preset',
      is_immutable: false,
      is_custom: false,
      role_for: null,
    },
    {
      role_name: 'Housekeeper',
      role_description: 'Responsible for room cleanliness and maintenance status updates.',
      role_type: 'preset',
      is_immutable: false,
      is_custom: false,
      role_for: null,
    },
    {
      role_name: 'Cashier',
      role_description: 'Handles payments, refunds, and point-of-sale operations.',
      role_type: 'preset',
      is_immutable: false,
      is_custom: false,
      role_for: null,
    },
    {
      role_name: 'Tour Guide',
      role_description: 'Leads tours and manages tourist group activities.',
      role_type: 'preset',
      is_immutable: false,
      is_custom: false,
      role_for: null,
    },
    {
      role_name: 'Inventory Clerk',
      role_description: 'Manages product inventory, stock levels, and supplier orders.',
      role_type: 'preset',
      is_immutable: false,
      is_custom: false,
      role_for: null,
    },
  ];

  // Insert only if they don't exist (by role_name)
  for (const preset of additionalPresets) {
    const existing = await knex('user_role')
      .where({ role_name: preset.role_name })
      .first();
    
    if (!existing) {
      await knex('user_role').insert(preset);
      console.log(`[Seed] Added preset role: ${preset.role_name}`);
    }
  }

  console.log('[Seed] Additional preset roles added.');
}
