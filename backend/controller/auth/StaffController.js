import db from "../../db.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { handleDbError } from "../../utils/errorHandler.js";
import { v4 as uuidv4 } from "uuid";
import { hasBusinessAccess } from "../../utils/authHelpers.js";

const STAFF_FIELDS = [
	"first_name",
	"middle_name",
	"last_name",
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

		// Call the simplified onboarding procedure (no invitation tokens)
		const [rows] = await db.query(
			"CALL OnboardStaff(?,?,?,?,?,?,?,?,?)",
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
