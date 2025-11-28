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

	// Helper to create permission with CRUD flags
	const p = (name, desc, add = false, view = false, update = false, del = false, permFor = 'business') => ({
		name,
		description: desc,
		can_add: add,
		can_view: view,
		can_update: update,
		can_delete: del,
		permission_for: permFor
	});

	await knex(table).insert([
		// Dashboard & Reports (Tourism & Business)
		p('view_dashboard', 'Access and view the dashboard overview', false, true, false, false, 'tourism'),
	
	]);
};

