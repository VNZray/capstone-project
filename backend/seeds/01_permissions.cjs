/**
 * Unified Permissions Seed
 *
 * This is the single source of truth for all permissions in the system.
 * Permissions are organized by scope:
 * - 'system': Platform-wide (Admin, Tourism Officer)
 * - 'business': Business-level (Owner, Staff)
 *
 * Naming Convention:
 * - view_* : Read-only access
 * - manage_* : Full CRUD access (implies view)
 * - add_* : Create new records (legacy, prefer manage_*)
 *
 * @param {import('knex').Knex} knex
 */
exports.seed = async function (knex) {
  const table = 'permissions';

  // Check if scope column exists
  const hasScope = await knex.schema.hasColumn(table, 'scope');
  const hasCategoryId = await knex.schema.hasColumn(table, 'category_id');

  // Clear existing permissions
  await knex(table).del();

  // ============================================================
  // PERMISSION DEFINITIONS
  // ============================================================
  const permissions = [
    // --------------------------------------------------------
    // DASHBOARD & REPORTING
    // --------------------------------------------------------
    { name: 'view_dashboard', description: 'Access dashboard overview', scope: 'all', category_id: 17 },
    { name: 'view_reports', description: 'View analytics and reports', scope: 'all', category_id: 17 },
    { name: 'view_analytics', description: 'View business analytics', scope: 'business', category_id: 7 },

    // --------------------------------------------------------
    // BUSINESS PROFILE (scope: business)
    // --------------------------------------------------------
    { name: 'view_business_profile', description: 'View business profile details', scope: 'business', category_id: 8 },
    { name: 'manage_business_profile', description: 'Edit business profile and settings', scope: 'business', category_id: 8 },
    { name: 'manage_business_settings', description: 'Configure business settings', scope: 'business', category_id: 8 },

    // --------------------------------------------------------
    // BOOKING & ACCOMMODATION (scope: business)
    // --------------------------------------------------------
    { name: 'view_bookings', description: 'View booking list and details', scope: 'business', category_id: 9 },
    { name: 'manage_bookings', description: 'Create, update, cancel bookings', scope: 'business', category_id: 9 },
    { name: 'manage_rooms', description: 'Manage room listings and availability', scope: 'business', category_id: 9 },

    // --------------------------------------------------------
    // SHOP & PRODUCTS (scope: business)
    // --------------------------------------------------------
    { name: 'view_shop', description: 'View shop and products', scope: 'business', category_id: 2 },
    { name: 'manage_shop', description: 'Add, edit, remove products and categories', scope: 'business', category_id: 2 },
    { name: 'manage_discounts', description: 'Create and manage product discounts', scope: 'business', category_id: 2 },

    // --------------------------------------------------------
    // ORDERS (scope: business)
    // --------------------------------------------------------
    { name: 'view_orders', description: 'View customer orders', scope: 'business', category_id: 1 },
    { name: 'manage_orders', description: 'Process and update order statuses', scope: 'business', category_id: 1 },

    // --------------------------------------------------------
    // TRANSACTIONS & PAYMENTS (scope: business)
    // --------------------------------------------------------
    { name: 'view_transactions', description: 'View financial transactions', scope: 'business', category_id: 6 },
    { name: 'view_payments', description: 'View payment history', scope: 'business', category_id: 6 },
    { name: 'manage_payments', description: 'Process payments and refunds', scope: 'business', category_id: 6 },
    { name: 'manage_refunds', description: 'Process refund requests', scope: 'business', category_id: 6 },

    // --------------------------------------------------------
    // PROMOTIONS (scope: business)
    // --------------------------------------------------------
    { name: 'view_promotions', description: 'View business promotions', scope: 'business', category_id: 2 },
    { name: 'manage_promotions', description: 'Create, update, delete promotions', scope: 'business', category_id: 2 },

    // --------------------------------------------------------
    // REVIEWS (scope: business)
    // --------------------------------------------------------
    { name: 'view_reviews', description: 'View customer reviews', scope: 'business', category_id: 5 },
    { name: 'manage_reviews', description: 'Respond to and manage reviews', scope: 'business', category_id: 5 },

    // --------------------------------------------------------
    // STAFF MANAGEMENT (scope: business)
    // --------------------------------------------------------
    { name: 'view_staff', description: 'View staff members list', scope: 'business', category_id: 4 },
    { name: 'add_staff', description: 'Add and manage staff accounts', scope: 'business', category_id: 4 },
    { name: 'manage_staff_roles', description: 'Assign roles and permissions to staff', scope: 'business', category_id: 4 },

    // --------------------------------------------------------
    // SERVICES & INQUIRIES (scope: business)
    // --------------------------------------------------------
    { name: 'view_services', description: 'View service offerings', scope: 'business', category_id: 3 },
    { name: 'manage_business_services', description: 'Add, edit, delete business services', scope: 'business', category_id: 3 },
    { name: 'manage_services', description: 'Manage service categories (system level)', scope: 'system', category_id: 10 },
    { name: 'manage_service_inquiries', description: 'Respond to service inquiries', scope: 'business', category_id: 3 },

    // --------------------------------------------------------
    // NOTIFICATIONS (scope: business)
    // --------------------------------------------------------
    { name: 'send_notifications', description: 'Send notifications to customers', scope: 'business', category_id: 5 },

    // --------------------------------------------------------
    // EVENTS (scope: system - managed by Admin/Tourism Officer)
    // --------------------------------------------------------
    { name: 'view_events', description: 'View event listings', scope: 'system', category_id: 13 },
    { name: 'manage_events', description: 'Create, update, delete events', scope: 'system', category_id: 13 },

    // --------------------------------------------------------
    // SYSTEM ADMINISTRATION (scope: system)
    // --------------------------------------------------------
    { name: 'manage_users', description: 'Manage user accounts and roles', scope: 'system', category_id: 16 },
    { name: 'view_all_profiles', description: 'View all business and user profiles', scope: 'system', category_id: 16 },
    { name: 'approve_business', description: 'Approve or reject business registrations', scope: 'system', category_id: 14 },
    { name: 'approve_event', description: 'Approve or reject submitted events', scope: 'system', category_id: 14 },
    { name: 'approve_shop', description: 'Approve or reject shop listings', scope: 'system', category_id: 14 },

    // --------------------------------------------------------
    // TOURIST SPOTS (scope: system)
    // --------------------------------------------------------
    { name: 'view_tourist_spots', description: 'View tourist spot listings', scope: 'system', category_id: 12 },
    { name: 'manage_tourist_spots', description: 'Add, edit, remove tourist spots', scope: 'system', category_id: 12 },
    { name: 'approve_tourist_spot', description: 'Approve tourist spot submissions', scope: 'system', category_id: 15 },

    // --------------------------------------------------------
    // TOURISM SERVICES (scope: system)
    // --------------------------------------------------------
    { name: 'view_accommodations', description: 'View accommodation businesses', scope: 'system', category_id: 17 },
    { name: 'view_shops', description: 'View shop businesses', scope: 'system', category_id: 17 },
    { name: 'manage_accommodations', description: 'Manage accommodation listings', scope: 'system', category_id: 10 },
    { name: 'manage_shops', description: 'Manage shop listings', scope: 'system', category_id: 10 },

    // --------------------------------------------------------
    // EMERGENCY FACILITIES (scope: system)
    // --------------------------------------------------------
    { name: 'view_emergency_facilities', description: 'View emergency facilities', scope: 'system', category_id: 19 },
    { name: 'manage_emergency_facilities', description: 'Add, edit, remove emergency facilities', scope: 'system', category_id: 19 },

    // --------------------------------------------------------
    // TOURISM STAFF (scope: system)
    // --------------------------------------------------------
    { name: 'manage_tourism_staff', description: 'Manage tourism office staff', scope: 'system', category_id: 11 },

    // --------------------------------------------------------
    // SUBSCRIPTION (scope: business)
    // --------------------------------------------------------
    { name: 'manage_subscriptions', description: 'Manage business subscription plan', scope: 'business', category_id: 8 },
  ];

  // Build insert data with optional columns
  const insertData = permissions.map(perm => {
    const record = { name: perm.name, description: perm.description };
    if (hasScope) {
      record.scope = perm.scope;
    }
    if (hasCategoryId && perm.category_id) {
      record.category_id = perm.category_id;
    }
    return record;
  });

  await knex(table).insert(insertData);

  console.log(`[Seed] ${insertData.length} permissions seeded successfully.`);
};
