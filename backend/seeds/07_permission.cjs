// Seed: permissions
// Purpose: Populate the permissions table with application-wide permissions.
// 
// Scope values:
// - 'business': Only visible to business owners for staff roles
// - 'system': Only visible to admin/tourism officers
// - 'all': Visible to both business and system roles

/**
 * Knex seed function.
 * @param {import('knex').Knex} knex
 */
exports.seed = async function (knex) {
	const table = 'permissions';

	// Check if scope column exists (migration may not have run yet)
	const hasScope = await knex.schema.hasColumn('permissions', 'scope');

	// Clear existing records to avoid duplicates on reseed
	await knex(table).del();

	// Build permission records with optional scope field
	const permissions = [
		// Dashboard & Reports (available to both business and system)
		{ name: 'view_dashboard', description: 'Access and view the dashboard overview', scope: 'all' },
		{ name: 'view_reports', description: 'View tourism and business analytics reports', scope: 'all' },

		// Business Profile Management (business-specific)
		{ name: 'view_business_profile', description: 'View business profile details', scope: 'business' },
		{ name: 'edit_business_profile', description: 'Edit and update business profile', scope: 'business' },

		// Bookings (business-specific)
		{ name: 'view_bookings', description: 'View list of bookings for accommodations or events', scope: 'business' },
		{ name: 'manage_bookings', description: 'Approve, cancel, or update bookings', scope: 'business' },

		// Transactions (business-specific)
		{ name: 'view_transactions', description: 'View financial transactions and records', scope: 'business' },
		{ name: 'manage_transactions', description: 'Modify or refund transactions', scope: 'business' },

		// Rooms Management (business-specific)
		{ name: 'view_rooms', description: 'View room listings under business', scope: 'business' },
		{ name: 'add_room', description: 'Add a new room to the business listing', scope: 'business' },
		{ name: 'edit_room', description: 'Edit existing room details', scope: 'business' },
		{ name: 'delete_room', description: 'Delete a room listing', scope: 'business' },

		// Promotions (business-specific)
		{ name: 'view_promotions', description: 'View business promotions', scope: 'business' },
		{ name: 'manage_promotions', description: 'Create, update, or delete promotions', scope: 'business' },

		// Reviews and Ratings (business-specific)
		{ name: 'view_reviews', description: 'View customer reviews and ratings', scope: 'business' },
		{ name: 'respond_reviews', description: 'Respond to customer feedback or reviews', scope: 'business' },

		// Staff Management (business-specific)
		{ name: 'view_staff', description: 'View all staff members', scope: 'business' },
		{ name: 'add_staff', description: 'Add new staff account under the business', scope: 'business' },
		{ name: 'edit_staff', description: 'Edit staff roles or information', scope: 'business' },
		{ name: 'remove_staff', description: 'Remove staff from the business', scope: 'business' },

		// Shop Management (business-specific)
		{ name: 'view_shop', description: 'View shop details and products', scope: 'business' },
		{ name: 'manage_shop', description: 'Add, edit, or remove shop products', scope: 'business' },
		{ name: 'view_orders', description: 'View customer orders in the shop', scope: 'business' },
		{ name: 'manage_orders', description: 'Process and update order statuses', scope: 'business' },

		// Event Management (business-specific - for event organizers)
		{ name: 'view_events', description: 'View event listings', scope: 'business' },
		{ name: 'manage_events', description: 'Create, update, or delete events', scope: 'business' },

		// Tourist Spot Management (SYSTEM ONLY - Admin/Tourism Officer)
		{ name: 'view_tourist_spots', description: 'View tourist spot listings', scope: 'system' },
		{ name: 'manage_tourist_spots', description: 'Add, edit, or remove tourist spots', scope: 'system' },

		// Settings (business-specific)
		{ name: 'manage_settings', description: 'Access and modify application settings', scope: 'business' },

		// Tourism Officer / Admin (SYSTEM ONLY)
		{ name: 'approve_business', description: 'Approve or reject new business registrations', scope: 'system' },
		{ name: 'approve_event', description: 'Approve or reject submitted events', scope: 'system' },
		{ name: 'approve_tourist_spot', description: 'Approve or reject tourist spot listings', scope: 'system' },
		{ name: 'approve_shop', description: 'Approve or reject shop listings', scope: 'system' },
		{ name: 'manage_users', description: 'Manage user accounts and roles', scope: 'system' },
		{ name: 'manage_services', description: 'Manage service categories and modules', scope: 'system' },
		{ name: 'view_all_profiles', description: 'View all business and tourist profiles', scope: 'system' },

		// Tourism-specific admin controls (SYSTEM ONLY)
		{ name: 'manage_tourism_staff', description: 'Create, update, deactivate tourism staff accounts', scope: 'system' },
	];

	// Insert permissions, conditionally including scope if column exists
	const insertData = permissions.map(perm => {
		const record = { name: perm.name, description: perm.description };
		if (hasScope) {
			record.scope = perm.scope;
		}
		return record;
	});

	await knex(table).insert(insertData);
};
