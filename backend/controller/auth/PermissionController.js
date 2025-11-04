import db from "../../db.js";
import { handleDbError } from "../../utils/errorHandler.js";
import { getUserPermissions } from "../../services/permissionService.js";

// Permissions CRUD
export async function getAllPermissions(req, res) {
  try {
    const [rows] = await db.query("CALL GetAllPermissions()");
    return res.json(rows[0] || []);
  } catch (error) {
    return handleDbError(error, res);
  }
}

export async function getPermissionById(req, res) {
  const { id } = req.params;
  try {
    const [rows] = await db.query("CALL GetPermissionById(?)", [id]);
    if (!rows[0] || rows[0].length === 0) return res.status(404).json({ message: "Permission not found" });
    return res.json(rows[0][0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

export async function insertPermission(req, res) {
  const { name, description } = req.body || {};
  if (!name) return res.status(400).json({ message: "name is required" });
  try {
    const [rows] = await db.query("CALL InsertPermission(?, ?)", [name, description ?? null]);
    if (!rows[0] || rows[0].length === 0) return res.status(500).json({ message: "Failed to insert permission" });
    return res.status(201).json(rows[0][0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

export async function updatePermissionById(req, res) {
  const { id } = req.params;
  const { name, description } = req.body || {};
  try {
    const [rows] = await db.query("CALL UpdatePermission(?, ?, ?)", [id, name ?? null, description ?? null]);
    if (!rows[0] || rows[0].length === 0) return res.status(404).json({ message: "Permission not found" });
    return res.json(rows[0][0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

export async function deletePermissionById(req, res) {
  const { id } = req.params;
  try {
    await db.query("CALL DeletePermission(?)", [id]);
    return res.json({ message: "Permission deleted" });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Role-Permissions
export async function getPermissionsByRoleId(req, res) {
  const { user_role_id } = req.params;
  try {
    const [rows] = await db.query("CALL GetPermissionsByRoleId(?)", [user_role_id]);
    return res.json(rows[0] || []);
  } catch (error) {
    return handleDbError(error, res);
  }
}

export async function assignPermissionToRole(req, res) {
  const { user_role_id, permission_id } = req.body || {};
  if (!user_role_id || !permission_id) {
    return res.status(400).json({ message: "user_role_id and permission_id are required" });
  }
  try {
    const [rows] = await db.query("CALL InsertRolePermission(?, ?)", [user_role_id, permission_id]);
    return res.status(201).json(rows[0]?.[0] || { user_role_id, permission_id });
  } catch (error) {
    return handleDbError(error, res);
  }
}

export async function unassignPermissionFromRole(req, res) {
  const { user_role_id, permission_id } = req.params;
  if (!user_role_id || !permission_id) {
    return res.status(400).json({ message: "user_role_id and permission_id are required" });
  }
  try {
    await db.query("CALL DeleteRolePermission(?, ?)", [user_role_id, permission_id]);
    return res.json({ message: "Permission unassigned from role" });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Authenticated user's permissions
export async function getMyPermissions(req, res) {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'Not authenticated' });
    const perms = await getUserPermissions(req.user.id);
    return res.json({ permissions: Array.from(perms) });
  } catch (error) {
    return handleDbError(error, res);
  }
}
