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
      birthday = null,
      gender = null,
      email,
      phone_number,
      business_type,
      address_id = null,
    } = req.body;

    const [rows] = await db.query("CALL InsertOwner(?,?,?,?,?,?,?,?,?,?,?)", [
      id,
      first_name,
      middle_name,
      last_name,
      age,
      birthday,
      gender,
      email,
      phone_number,
      business_type,
      address_id,
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
    birthday = null,
    gender = null,
    email,
    phone_number,
    business_type,
    address_id = null,
  } = req.body;

  try {
    const [rows] = await db.query("CALL UpdateOwner(?,?,?,?,?,?,?,?,?,?,?)", [
      id,
      first_name,
      middle_name,
      last_name,
      age,
      birthday,
      gender,
      email,
      phone_number,
      business_type,
      address_id,
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
    const [result] = await db.query("CALL DeleteOwner(?)", [id]);

    // CALL result may not return affectedRows directly, so confirm delete
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Owner not found" });
    }

    return res.json({ success: true, message: "Owner deleted successfully" });
  } catch (error) {
    return handleDbError(error, res);
  }
}
