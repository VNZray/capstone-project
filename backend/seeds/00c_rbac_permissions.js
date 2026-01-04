/**
 * RBAC Seed - Business Permissions
 * 
 * Seeds comprehensive permissions for business operations.
 * These permissions can be assigned to roles (system or business).
 * 
 * @param { import("knex").Knex } knex
 */
export async function seed(knex) {
  // Check if scope column exists (migration may not have run yet)
  const hasScope = await knex.schema.hasColumn('permissions', 'scope');
  
  // Define comprehensive business permissions
  const permissions = [
    // Order Management (category_id: 1)
    { name: 'view_orders', description: 'View order list and details', scope: 'business', category_id: 1 },
    { name: 'create_orders', description: 'Create new orders', scope: 'business', category_id: 1 },
    { name: 'update_orders', description: 'Update order status and details', scope: 'business', category_id: 1 },
    { name: 'cancel_orders', description: 'Cancel orders', scope: 'business', category_id: 1 },
    { name: 'manage_order_payments', description: 'Process order payments', scope: 'business', category_id: 1 },
    
    // Product Management (category_id: 2)
    { name: 'view_products', description: 'View product catalog', scope: 'business', category_id: 2 },
    { name: 'create_products', description: 'Add new products', scope: 'business', category_id: 2 },
    { name: 'update_products', description: 'Edit product details and pricing', scope: 'business', category_id: 2 },
    { name: 'delete_products', description: 'Remove products from catalog', scope: 'business', category_id: 2 },
    { name: 'manage_inventory', description: 'Update stock levels', scope: 'business', category_id: 2 },
    { name: 'manage_discounts', description: 'Create and manage product discounts', scope: 'business', category_id: 2 },
    { name: 'manage_promotions', description: 'Create and manage promotions', scope: 'business', category_id: 2 },
    
    // Service Management (category_id: 3)
    { name: 'view_services', description: 'View service offerings', scope: 'business', category_id: 3 },
    { name: 'create_services', description: 'Add new services', scope: 'business', category_id: 3 },
    { name: 'update_services', description: 'Edit service details and pricing', scope: 'business', category_id: 3 },
    { name: 'delete_services', description: 'Remove services', scope: 'business', category_id: 3 },
    { name: 'manage_service_inquiries', description: 'Respond to service inquiries', scope: 'business', category_id: 3 },
    
    // Staff Management (category_id: 4)
    { name: 'view_staff', description: 'View staff list', scope: 'business', category_id: 4 },
    { name: 'create_staff', description: 'Add new staff members', scope: 'business', category_id: 4 },
    { name: 'update_staff', description: 'Edit staff information', scope: 'business', category_id: 4 },
    { name: 'delete_staff', description: 'Remove staff members', scope: 'business', category_id: 4 },
    { name: 'manage_staff_roles', description: 'Assign roles to staff', scope: 'business', category_id: 4 },
    
    // Customer Relations (category_id: 5)
    { name: 'view_customers', description: 'View customer information', scope: 'business', category_id: 5 },
    { name: 'manage_customer_reviews', description: 'Respond to and manage reviews', scope: 'business', category_id: 5 },
    { name: 'send_notifications', description: 'Send notifications to customers', scope: 'business', category_id: 5 },
    
    // Financial (category_id: 6)
    { name: 'view_payments', description: 'View payment history', scope: 'business', category_id: 6 },
    { name: 'process_refunds', description: 'Process refund requests', scope: 'business', category_id: 6 },
    { name: 'view_financial_reports', description: 'Access financial reports', scope: 'business', category_id: 6 },
    
    // Reporting (category_id: 7)
    { name: 'view_reports', description: 'Access business reports', scope: 'business', category_id: 7 },
    { name: 'export_reports', description: 'Export report data', scope: 'business', category_id: 7 },
    { name: 'view_analytics', description: 'Access business analytics', scope: 'business', category_id: 7 },
    
    // Settings (category_id: 8)
    { name: 'manage_business_settings', description: 'Configure business settings', scope: 'business', category_id: 8 },
    { name: 'manage_business_hours', description: 'Set operating hours', scope: 'business', category_id: 8 },
    { name: 'manage_business_amenities', description: 'Manage business amenities', scope: 'business', category_id: 8 },
    { name: 'manage_business_profile', description: 'Edit business profile and details', scope: 'business', category_id: 8 },
    
    // Booking Management (category_id: 9)
    { name: 'view_bookings', description: 'View accommodation bookings', scope: 'business', category_id: 9 },
    { name: 'create_bookings', description: 'Create new bookings', scope: 'business', category_id: 9 },
    { name: 'update_bookings', description: 'Modify booking details', scope: 'business', category_id: 9 },
    { name: 'cancel_bookings', description: 'Cancel bookings', scope: 'business', category_id: 9 },
    { name: 'manage_rooms', description: 'Manage room listings and availability', scope: 'business', category_id: 9 },
    { name: 'manage_room_amenities', description: 'Configure room amenities', scope: 'business', category_id: 9 },
    { name: 'check_in_guests', description: 'Process guest check-ins', scope: 'business', category_id: 9 },
    { name: 'check_out_guests', description: 'Process guest check-outs', scope: 'business', category_id: 9 },
    
    // System Administration (category_id: 10)
    { name: 'manage_users', description: 'Full user management', scope: 'system', category_id: 10 },
    { name: 'manage_all_businesses', description: 'Manage all businesses on platform', scope: 'system', category_id: 10 },
    { name: 'approve_businesses', description: 'Approve business registrations', scope: 'system', category_id: 10 },
    { name: 'manage_tourist_spots', description: 'Manage tourist spot listings', scope: 'system', category_id: 10 },
    { name: 'approve_tourist_spots', description: 'Approve tourist spot submissions', scope: 'system', category_id: 10 },
    { name: 'manage_platform_settings', description: 'Configure platform-wide settings', scope: 'system', category_id: 10 },
    { name: 'view_platform_analytics', description: 'Access platform-wide analytics', scope: 'system', category_id: 10 },
  ];

  // Insert or update permissions
  for (const perm of permissions) {
    const existing = await knex('permissions').where({ name: perm.name }).first();
    
    if (existing) {
      // Update existing permission
      const updateData = { description: perm.description };
      if (hasScope) {
        updateData.scope = perm.scope;
        updateData.category_id = perm.category_id;
      }
      await knex('permissions').where({ name: perm.name }).update(updateData);
    } else {
      // Insert new permission
      const insertData = { name: perm.name, description: perm.description };
      if (hasScope) {
        insertData.scope = perm.scope;
        insertData.category_id = perm.category_id;
      }
      await knex('permissions').insert(insertData);
    }
  }

  console.log('[Seed] Business permissions seeded/updated.');

  // ============================================================
  // Define default permission sets for common role types
  // These serve as documentation - actual roles are custom per-business
  // ============================================================
  
  // Get all permission IDs
  const allPerms = await knex('permissions').select('id', 'name');
  const permMap = {};
  allPerms.forEach(p => { permMap[p.name] = p.id; });

  // Define permission sets for reference (used when creating custom roles)
  const rolePermissions = {
    'Manager': [
      'view_orders', 'create_orders', 'update_orders', 'cancel_orders', 'manage_order_payments',
      'view_products', 'create_products', 'update_products', 'delete_products', 'manage_inventory', 'manage_discounts', 'manage_promotions',
      'view_services', 'create_services', 'update_services', 'delete_services', 'manage_service_inquiries',
      'view_staff', 'create_staff', 'update_staff', 'delete_staff', 'manage_staff_roles',
      'view_customers', 'manage_customer_reviews', 'send_notifications',
      'view_payments', 'process_refunds', 'view_financial_reports',
      'view_reports', 'export_reports', 'view_analytics',
      'manage_business_settings', 'manage_business_hours', 'manage_business_amenities', 'manage_business_profile',
      'view_bookings', 'create_bookings', 'update_bookings', 'cancel_bookings', 'manage_rooms', 'manage_room_amenities', 'check_in_guests', 'check_out_guests',
    ],
    'Receptionist': [
      'view_orders', 'create_orders', 'update_orders',
      'view_products',
      'view_services', 'manage_service_inquiries',
      'view_customers',
      'view_bookings', 'create_bookings', 'update_bookings', 'check_in_guests', 'check_out_guests',
    ],
    'Room Manager': [
      'view_bookings', 'create_bookings', 'update_bookings', 'cancel_bookings',
      'manage_rooms', 'manage_room_amenities',
      'view_customers',
      'check_in_guests', 'check_out_guests',
    ],
    'Sales Associate': [
      'view_orders', 'create_orders', 'update_orders',
      'view_products', 'update_products', 'manage_inventory',
      'view_customers', 'manage_customer_reviews',
      'view_payments',
    ],
    'Cook': [
      'view_orders', 'update_orders',
      'view_products',
    ],
    'Housekeeper': [
      'view_bookings',
      'manage_rooms',
    ],
    'Cashier': [
      'view_orders', 'create_orders', 'update_orders', 'manage_order_payments',
      'view_products',
      'view_payments', 'process_refunds',
    ],
    'Tour Guide': [
      'view_bookings',
      'view_services',
      'view_customers',
    ],
    'Inventory Clerk': [
      'view_products', 'update_products', 'manage_inventory',
      'view_reports',
    ],
    'Event Manager': [
      'view_orders', 'create_orders', 'update_orders',
      'view_services', 'create_services', 'update_services', 'manage_service_inquiries',
      'view_bookings', 'create_bookings', 'update_bookings',
      'view_customers', 'send_notifications',
      'view_reports',
    ],
  };

  // NOTE: These permission sets are for reference only.
  // Preset roles have been removed - business owners create custom roles.
  // We skip assigning these permissions since presets no longer exist.
  console.log('[Seed] Permission sets defined for reference (presets removed).');

  // ============================================================
  // Assign system permissions to Admin and Tourism Officer
  // ============================================================
  const systemPermissions = [
    'manage_users', 'manage_all_businesses', 'approve_businesses',
    'manage_tourist_spots', 'approve_tourist_spots',
    'manage_platform_settings', 'view_platform_analytics',
  ];

  // Business Owner gets ALL business-scope permissions
  const businessOwnerPermissions = [
    'view_orders', 'create_orders', 'update_orders', 'cancel_orders', 'manage_order_payments',
    'view_products', 'create_products', 'update_products', 'delete_products', 'manage_inventory', 'manage_discounts', 'manage_promotions',
    'view_services', 'create_services', 'update_services', 'delete_services', 'manage_service_inquiries',
    'view_staff', 'create_staff', 'update_staff', 'delete_staff', 'manage_staff_roles',
    'view_customers', 'manage_customer_reviews', 'send_notifications',
    'view_payments', 'process_refunds', 'view_financial_reports',
    'view_reports', 'export_reports', 'view_analytics',
    'manage_business_settings', 'manage_business_hours', 'manage_business_amenities', 'manage_business_profile',
    'view_bookings', 'create_bookings', 'update_bookings', 'cancel_bookings', 'manage_rooms', 'manage_room_amenities', 'check_in_guests', 'check_out_guests',
  ];

  const adminRole = await knex('user_role').where({ role_name: 'Admin' }).first();
  const tourismOfficerRole = await knex('user_role').where({ role_name: 'Tourism Officer' }).first();
  const businessOwnerRole = await knex('user_role').where({ role_name: 'Business Owner' }).first();

  if (adminRole) {
    // Admin gets ALL permissions (system + business)
    const allPermIds = Object.values(permMap);
    
    for (const permId of allPermIds) {
      try {
        await knex('role_permissions')
          .insert({ user_role_id: adminRole.id, permission_id: permId })
          .onConflict(['user_role_id', 'permission_id'])
          .ignore();
      } catch (err) {
        if (!err.message.includes('Duplicate')) {
          console.error(`[Seed] Error assigning permission to Admin:`, err.message);
        }
      }
    }
    console.log(`[Seed] Assigned ALL permissions to Admin`);
  }

  if (tourismOfficerRole) {
    // Tourism Officer gets subset of system permissions
    const officerPerms = ['approve_businesses', 'approve_tourist_spots', 'view_platform_analytics', 'manage_tourist_spots'];
    const officerPermIds = officerPerms
      .filter(name => permMap[name])
      .map(name => permMap[name]);
    
    for (const permId of officerPermIds) {
      try {
        await knex('role_permissions')
          .insert({ user_role_id: tourismOfficerRole.id, permission_id: permId })
          .onConflict(['user_role_id', 'permission_id'])
          .ignore();
      } catch (err) {
        if (!err.message.includes('Duplicate')) {
          console.error(`[Seed] Error assigning permission to Tourism Officer:`, err.message);
        }
      }
    }
    console.log(`[Seed] Assigned system permissions to Tourism Officer`);
  }

  if (businessOwnerRole) {
    // Business Owner gets all business-scope permissions
    const ownerPermIds = businessOwnerPermissions
      .filter(name => permMap[name])
      .map(name => permMap[name]);
    
    for (const permId of ownerPermIds) {
      try {
        await knex('role_permissions')
          .insert({ user_role_id: businessOwnerRole.id, permission_id: permId })
          .onConflict(['user_role_id', 'permission_id'])
          .ignore();
      } catch (err) {
        if (!err.message.includes('Duplicate')) {
          console.error(`[Seed] Error assigning permission to Business Owner:`, err.message);
        }
      }
    }
    console.log(`[Seed] Assigned business permissions to Business Owner`);
  }

  console.log('[Seed] RBAC permissions seed completed.');
}
