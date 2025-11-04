import db from "../../db.js";
import { handleDbError } from "../../utils/errorHandler.js";
import { v4 as uuidv4 } from "uuid";

const STAFF_FIELDS = [
	"first_name",
	"middle_name",
	"last_name",
	"user_id",
	"business_id",
];

const makePlaceholders = (n) => Array(n).fill("?").join(",");
const buildStaffParams = (id, body) => [id, ...STAFF_FIELDS.map((f) => body?.[f] ?? null)];

// Create staff (InsertStaff)
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
