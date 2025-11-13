// Seed: permissions
// Purpose: Populate the permissions table with application-wide permissions.

/**
 * Knex seed function.
 * @param {import('knex').Knex} knex
 */
exports.seed = async function (knex) {
	const table = 'permissions';

	// Clear existing records to avoid duplicates on reseed
	await knex(table).del();

	await knex(table).insert([
		// Dashboard & Reports
		{ name: 'view_dashboard', description: 'Access and view the dashboard overview' },
		{ name: 'view_reports', description: 'View tourism and business analytics reports' },

		// Business Profile Management
		{ name: 'view_business_profile', description: 'View business profile details' },
		{ name: 'edit_business_profile', description: 'Edit and update business profile' },

		// Bookings
		{ name: 'view_bookings', description: 'View list of bookings for accommodations or events' },
		{ name: 'manage_bookings', description: 'Approve, cancel, or update bookings' },

		// Transactions
		{ name: 'view_transactions', description: 'View financial transactions and records' },
		{ name: 'manage_transactions', description: 'Modify or refund transactions' },

		// Rooms Management
		{ name: 'view_rooms', description: 'View room listings under business' },
		{ name: 'add_room', description: 'Add a new room to the business listing' },
		{ name: 'edit_room', description: 'Edit existing room details' },
		{ name: 'delete_room', description: 'Delete a room listing' },

		// Promotions
		{ name: 'view_promotions', description: 'View business promotions' },
		{ name: 'manage_promotions', description: 'Create, update, or delete promotions' },

		// Reviews and Ratings
		{ name: 'view_reviews', description: 'View customer reviews and ratings' },
		{ name: 'respond_reviews', description: 'Respond to customer feedback or reviews' },

		// Staff Management
		{ name: 'view_staff', description: 'View all staff members' },
		{ name: 'add_staff', description: 'Add new staff account under the business' },
		{ name: 'edit_staff', description: 'Edit staff roles or information' },
		{ name: 'remove_staff', description: 'Remove staff from the business' },

		// Shop Management
		{ name: 'view_shop', description: 'View shop details and products' },
		{ name: 'manage_shop', description: 'Add, edit, or remove shop products' },
		{ name: 'view_orders', description: 'View customer orders in the shop' },
		{ name: 'manage_orders', description: 'Process and update order statuses' },

		// Event Management
		{ name: 'view_events', description: 'View event listings' },
		{ name: 'manage_events', description: 'Create, update, or delete events' },

		// Tourist Spot Management
		{ name: 'view_tourist_spots', description: 'View tourist spot listings' },
		{ name: 'manage_tourist_spots', description: 'Add, edit, or remove tourist spots' },

		// Settings
		{ name: 'manage_settings', description: 'Access and modify application settings' },

		// Tourism Officer / Admin
		{ name: 'approve_business', description: 'Approve or reject new business registrations' },
		{ name: 'approve_event', description: 'Approve or reject submitted events' },
		{ name: 'approve_tourist_spot', description: 'Approve or reject tourist spot listings' },
		{ name: 'approve_shop', description: 'Approve or reject shop listings' },
		{ name: 'manage_users', description: 'Manage user accounts and roles' },
		{ name: 'manage_services', description: 'Manage service categories and modules' },
		{ name: 'view_all_profiles', description: 'View all business and tourist profiles' },
	]);
};

