import db from "../../db.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { handleDbError } from "../../utils/errorHandler.js";
import { v4 as uuidv4 } from "uuid";
import { hasBusinessAccess } from "../../utils/authHelpers.js";
import {
	setUserPermissions,
	getUserPermissionsList,
	getAvailablePermissions,
	clearPermissionCache
} from "../../services/permissionService.js";

const STAFF_FIELDS = [
	"first_name",
	"middle_name",
	"last_name",
	"title",
	"user_id",
	"business_id",
];

const makePlaceholders = (n) => Array(n).fill("?").join(",");
const buildStaffParams = (id, body) => [id, ...STAFF_FIELDS.map((f) => body?.[f] ?? null)];

/**
 * Onboard a new staff member
 * Creates user account + staff record in a single transaction
 * Staff is instantly active and verified for simplified onboarding
 */
export async function onboardStaff(req, res) {
	try {
		const {
			first_name,
			last_name,
			email,
			phone_number,
			password,
			business_id,
			role_id,
			title,
		} = req.body;

		// Validate required fields
		if (!first_name || !email || !business_id || !role_id) {
			return res.status(400).json({
				message: "First name, email, business ID, and role are required",
			});
		}

		// Check authorization - user must have access to this business
		const userRole = req.user?.role;
		if (!["Admin", "Tourism Officer"].includes(userRole)) {
			const hasAccess = await hasBusinessAccess(business_id, req.user, userRole);
			if (!hasAccess) {
				return res.status(403).json({
					message: "Not authorized to add staff to this business",
				});
			}
		}

		// Check if email already exists
		const [existingUser] = await db.query("SELECT id FROM user WHERE email = ?", [email]);
		if (existingUser && existingUser.length > 0) {
			return res.status(409).json({
				message: "A user with this email already exists",
			});
		}

		// Generate IDs and password
		const userId = uuidv4();
		const staffId = uuidv4();
		const tempPassword = password || crypto.randomBytes(8).toString("hex");
		const hashedPassword = await bcrypt.hash(tempPassword, 10);

		// Call the onboarding procedure with title parameter
		const [rows] = await db.query(
			"CALL OnboardStaff(?,?,?,?,?,?,?,?,?,?)",
			[
				userId,
				staffId,
				email,
				phone_number || "",
				hashedPassword,
				first_name,
				last_name || "",
				business_id,
				role_id,
				title || "Staff",
			]
		);

		if (!rows[0] || rows[0].length === 0) {
			return res.status(500).json({ error: "Failed to create staff member" });
		}

		const staff = rows[0][0];

		// Return staff info with temp password for email sending
		return res.status(201).json({
			...staff,
			temp_password: tempPassword, // For email invitation
		});
	} catch (error) {
		return handleDbError(error, res);
	}
}

// Legacy: Create staff (InsertStaff) - kept for backwards compatibility
export async function insertStaff(req, res) {
	try {
		const id = uuidv4();
		const params = buildStaffParams(id, req.body);
		const placeholders = makePlaceholders(params.length);
		const [rows] = await db.query(`CALL InsertStaff(${placeholders})`, params);
		if (!rows[0] || rows[0].length === 0) {
			return res.status(404).json({ error: "Inserted row not found" });
		}
		return res.status(201).json(rows[0][0]);
	} catch (error) {
		return handleDbError(error, res);
	}
}

// Read all (GetAllStaff)
export async function getAllStaff(req, res) {
	try {
		const [rows] = await db.query("CALL GetAllStaff()");
		return res.json(rows[0]);
	} catch (error) {
		return handleDbError(error, res);
	}
}

// Read one by id (GetStaffById)
export async function getStaffById(req, res) {
	const { id } = req.params;
	try {
		const [rows] = await db.query("CALL GetStaffById(?)", [id]);
		if (!rows[0] || rows[0].length === 0) {
			return res.status(404).json({ message: "Staff not found" });
		}
		return res.json(rows[0][0]);
	} catch (error) {
		return handleDbError(error, res);
	}
}

// Read by foreign key (GetStaffByUserId)
export async function getStaffByUserId(req, res) {
	const { user_id } = req.params;
	try {
		const [rows] = await db.query("CALL GetStaffByUserId(?)", [user_id]);
		if (!rows[0] || rows[0].length === 0) {
			return res.status(404).json({ message: "Staff not found" });
		}
		return res.json(rows[0][0]);
	} catch (error) {
		return handleDbError(error, res);
	}
}

// Read by business ID (GetStaffByBusinessId) - with user details and role
export async function getStaffByBusinessId(req, res) {
	const { business_id } = req.params;
	try {
		const [rows] = await db.query("CALL GetStaffByBusinessId(?)", [business_id]);
		if (!rows[0] || rows[0].length === 0) {
			return res.status(200).json([]); // Return empty array if no staff
		}
		return res.json(rows[0]);
	} catch (error) {
		return handleDbError(error, res);
	}
}

// Update by id (UpdateStaff)
export async function updateStaffById(req, res) {
	const { id } = req.params;
	try {
		const params = buildStaffParams(id, req.body);
		const placeholders = makePlaceholders(params.length);
		const [rows] = await db.query(`CALL UpdateStaff(${placeholders})`, params);
		if (!rows[0] || rows[0].length === 0) {
			return res.status(404).json({ message: "Staff not found" });
		}
		return res.json(rows[0][0]);
	} catch (error) {
		return handleDbError(error, res);
	}
}

// Delete by id (DeleteStaff)
export async function deleteStaffById(req, res) {
	const { id } = req.params;
	try {
		await db.query("CALL DeleteStaff(?)", [id]);
		// Confirm deletion
		const [check] = await db.query("CALL GetStaffById(?)", [id]);
		if (check[0] && check[0].length > 0) {
			return res.status(404).json({ message: "Staff not deleted" });
		}
		return res.json({ message: "Staff deleted successfully" });
	} catch (error) {
		return handleDbError(error, res);
	}
}

// ============================================================
// STAFF PERMISSION MANAGEMENT (Simplified RBAC)
// ============================================================

/**
 * Get permissions for a specific staff member
 * @route GET /api/staff/:id/permissions
 */
export async function getStaffPermissions(req, res) {
	const { id } = req.params;
	try {
		// Get staff to find user_id
		const [staffRows] = await db.query("CALL GetStaffById(?)", [id]);
		if (!staffRows[0] || staffRows[0].length === 0) {
			return res.status(404).json({ message: "Staff not found" });
		}
		const staff = staffRows[0][0];

		// Check authorization
		const hasAccess = await hasBusinessAccess(staff.business_id, req.user);
		if (!hasAccess) {
			return res.status(403).json({ message: "Not authorized to view this staff member's permissions" });
		}

		// Get user permissions
		const permissions = await getUserPermissionsList(staff.user_id);

		return res.json({
			staff_id: id,
			user_id: staff.user_id,
			permissions,
		});
	} catch (error) {
		return handleDbError(error, res);
	}
}

/**
 * Update permissions for a specific staff member
 * Replaces all existing permissions with the provided list
 * @route PUT /api/staff/:id/permissions
 * @body { permission_ids: number[] }
 */
export async function updateStaffPermissions(req, res) {
	const { id } = req.params;
	const { permission_ids } = req.body;

	if (!Array.isArray(permission_ids)) {
		return res.status(400).json({ message: "permission_ids must be an array" });
	}

	try {
		// Get staff to find user_id and business_id
		const [staffRows] = await db.query("CALL GetStaffById(?)", [id]);
		if (!staffRows[0] || staffRows[0].length === 0) {
			return res.status(404).json({ message: "Staff not found" });
		}
		const staff = staffRows[0][0];

		// Check authorization - must be owner or have manage_staff_roles permission
		const hasAccess = await hasBusinessAccess(staff.business_id, req.user);
		if (!hasAccess) {
			return res.status(403).json({ message: "Not authorized to modify this staff member's permissions" });
		}

		// Set the permissions (replaces all existing)
		const updatedPermissions = await setUserPermissions(
			staff.user_id,
			permission_ids,
			req.user.id
		);

		return res.json({
			staff_id: id,
			user_id: staff.user_id,
			permissions: updatedPermissions,
			message: "Permissions updated successfully",
		});
	} catch (error) {
		return handleDbError(error, res);
	}
}

/**
 * Get available permissions for staff assignment
 * Returns all business-scope permissions grouped by category
 * @route GET /api/staff/permissions/available
 */
export async function getAvailableStaffPermissions(req, res) {
	try {
		const permissions = await getAvailablePermissions('business', 'business');

		// Group by category for UI
		const grouped = {};
		for (const perm of permissions) {
			const categoryName = perm.category_name || 'Other';
			if (!grouped[categoryName]) {
				grouped[categoryName] = {
					category_id: perm.category_id,
					category_name: categoryName,
					sort_order: perm.sort_order || 999,
					permissions: [],
				};
			}
			grouped[categoryName].permissions.push({
				id: perm.id,
				name: perm.name,
				description: perm.description,
			});
		}

		// Convert to array sorted by sort_order
		const result = Object.values(grouped).sort((a, b) => a.sort_order - b.sort_order);

		return res.json(result);
	} catch (error) {
		return handleDbError(error, res);
	}
}

/**
 * Get staff with their permissions for a business
 * @route GET /api/staff/business/:business_id/with-permissions
 */
export async function getStaffWithPermissions(req, res) {
	const { business_id } = req.params;
	try {
		// Check authorization
		const hasAccess = await hasBusinessAccess(business_id, req.user);
		if (!hasAccess) {
			return res.status(403).json({ message: "Not authorized to view staff for this business" });
		}

		// Try stored procedure first
		try {
			const [rows] = await db.query("CALL GetBusinessStaffWithPermissions(?)", [business_id]);
			return res.json(rows[0] || []);
		} catch (spError) {
			// Fallback to manual query if procedure doesn't exist
			if (spError.code === 'ER_SP_DOES_NOT_EXIST') {
				const [staffRows] = await db.query(
					`SELECT
						s.id AS staff_id,
						s.user_id,
						s.first_name,
						s.middle_name,
						s.last_name,
						s.title,
						s.created_at,
						u.email,
						u.phone_number,
						u.is_active
					FROM staff s
					JOIN user u ON u.id = s.user_id
					WHERE s.business_id = ?
					ORDER BY s.created_at DESC`,
					[business_id]
				);

				// Fetch permissions for each staff member
				const result = await Promise.all(staffRows.map(async (staff) => {
					const permissions = await getUserPermissionsList(staff.user_id);
					return {
						...staff,
						permissions: permissions.map(p => ({ id: p.permission_id, name: p.name })),
					};
				}));

				return res.json(result);
			}
			throw spError;
		}
	} catch (error) {
		return handleDbError(error, res);
	}
}

/**
 * Update staff title (display name like "Manager", "Cashier")
 * @route PATCH /api/staff/:id/title
 * @body { title: string }
 */
export async function updateStaffTitle(req, res) {
	const { id } = req.params;
	const { title } = req.body;

	if (!title || typeof title !== 'string') {
		return res.status(400).json({ message: "title is required and must be a string" });
	}

	try {
		// Get staff to find business_id
		const [staffRows] = await db.query("CALL GetStaffById(?)", [id]);
		if (!staffRows[0] || staffRows[0].length === 0) {
			return res.status(404).json({ message: "Staff not found" });
		}
		const staff = staffRows[0][0];

		// Check authorization
		const hasAccess = await hasBusinessAccess(staff.business_id, req.user);
		if (!hasAccess) {
			return res.status(403).json({ message: "Not authorized to modify this staff member" });
		}

		// Update title
		await db.query("UPDATE staff SET title = ? WHERE id = ?", [title.trim(), id]);

		return res.json({
			staff_id: id,
			title: title.trim(),
			message: "Title updated successfully",
		});
	} catch (error) {
		return handleDbError(error, res);
	}
}

