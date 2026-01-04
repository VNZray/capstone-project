/**
 * @param { import("knex").Knex } knex
 */
export async function seed(knex) {
  // Make this seed idempotent; avoid deleting unrelated tables

  // Check if role_type column exists (migration may not have run yet)
  const hasRoleType = await knex.schema.hasColumn('user_role', 'role_type');

  // Inserts seed entries - System Roles only
  // Staff roles are created dynamically per-business when first staff is added
  const roles = [
    // System / Government Level
    { 
      id: 1, 
      role_name: "Admin", 
      role_description: "Full system control; manages all users, roles, and approvals.", 
      role_for: null,
      ...(hasRoleType && { role_type: 'system', is_immutable: true })
    },
    { 
      id: 2, 
      role_name: "Tourism Officer", 
      role_description: "Approves business, event, and tourist spot listings; monitors tourism reports.",  
      role_for: null,
      ...(hasRoleType && { role_type: 'system', is_immutable: true })
    },
    { 
      id: 3, 
      role_name: "Event Manager", 
      role_description: "Manages event listings, participant data, and schedules.",  
      role_for: null,
      ...(hasRoleType && { role_type: 'system', is_immutable: true })
    },

    // Business Owner - System Role (staff roles are per-business with per-user permissions)
    { 
      id: 4, 
      role_name: "Business Owner", 
      role_description: "Owner of a business listing; manages all operations and staff permissions.",  
      role_for: null,
      ...(hasRoleType && { role_type: 'system', is_immutable: true })
    },

    // Tourist Side
    { 
      id: 5, 
      role_name: "Tourist", 
      role_description: "Regular app user who explores listings, books accommodations, and leaves reviews.",  
      role_for: null,
      ...(hasRoleType && { role_type: 'system', is_immutable: true })
    },
  ];

  await knex("user_role").insert(roles)
    .onConflict('id')
    .merge(['role_name', 'role_description', 'role_for', ...(hasRoleType ? ['role_type', 'is_immutable'] : [])]);

  console.log('[Seed] System roles seeded successfully.');
}
