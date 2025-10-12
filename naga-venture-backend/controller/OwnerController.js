import db from "../db.js";
import { handleDbError } from "../utils/errorHandler.js";
import { v4 as uuidv4 } from "uuid";

// Insert Owner (calls InsertOwner SP)
export async function insertOwner(req, res) {
  try {
    const id = uuidv4();

    const {
      first_name,
      middle_name = null,
      last_name,
      age = null,
      birthdate = null,
      gender = null,
      business_type,
      barangay_id = null,
      user_id = null,
    } = req.body;

    const [rows] = await db.query("CALL InsertOwner(?,?,?,?,?,?,?,?,?,?)", [
      id,
      first_name,
      middle_name,
      last_name,
      age,
      birthdate,
      gender,
      business_type,
      barangay_id,
      user_id,
    ]);

    return res.status(201).json(rows[0][0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get owner by ID (calls GetOwnerById SP)
export async function getOwnerById(req, res) {
  const { id } = req.params;
  try {
    const [rows] = await db.query("CALL GetOwnerById(?)", [id]);

    if (!rows[0] || rows[0].length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Owner not found" });
    }

    return res.json(rows[0][0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get all owners (calls GetAllOwners SP)
export async function getAllOwners(req, res) {
  try {
    const [rows] = await db.query("CALL GetAllOwners()");

    return res.json(rows[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update owner (calls UpdateOwner SP)
export async function updateOwnerById(req, res) {
  const { id } = req.params;

  const {
    first_name,
    middle_name = null,
    last_name,
    age = null,
    birthdate = null,
    gender = null,
    business_type,
    barangay_id = null,
    user_id = null,
  } = req.body;

  try {
    const [rows] = await db.query("CALL UpdateOwner(?,?,?,?,?,?,?,?,?,?)", [
      id,
      first_name,
      middle_name,
      last_name,
      age,
      birthdate,
      gender,
      business_type,
      barangay_id,
      user_id,
    ]);

    if (!rows[0] || rows[0].length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Owner not found" });
    }

    return res.json(rows[0][0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Delete owner (calls DeleteOwner SP)
export async function deleteOwnerById(req, res) {
  const { id } = req.params;
  try {
    await db.query("CALL DeleteOwner(?)", [id]);
    // Confirm deletion by attempting to fetch the owner
    const [check] = await db.query("CALL GetOwnerById(?)", [id]);
    if (check[0] && check[0].length > 0) {
      return res.status(404).json({ success: false, message: "Owner not deleted" });
    }
    return res.json({ success: true, message: "Owner deleted successfully" });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// get owner by user ID (calls GetOwnerByUserId SP)
export async function getOwnerByUserId(request, response) {
  const { user_id } = request.params;
  try {
    const [rows] = await db.query("CALL GetOwnerByUserId(?)", [user_id]);

    if (!rows[0] || rows[0].length === 0) {
      return response
        .status(404)
        .json({ success: false, message: "Owner not found" });
    }

    return response.json(rows[0][0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}