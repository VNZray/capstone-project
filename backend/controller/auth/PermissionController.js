import db from "../../db.js";
import { handleDbError } from "../../utils/errorHandler.js";
import { getUserPermissions } from "../../services/permissionService.js";
import { v4 as uuidv4 } from "uuid";

const PERMISSION_FIELDS = [
  "name",
  "description",
];


const makePlaceholders = (n) => Array(n).fill("?").join(",");

const buildPermissionParams = (id, body) => [id, ...PERMISSION_FIELDS.map((f) => body?.[f] ?? null)];

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

  try {

    const id = uuidv4();
    const params = buildPermissionParams(id, req.body);
    const placeholders = makePlaceholders(params.length);
    const [rows] = await db.query(`CALL InsertPermission(${placeholders})`, params);
  
    if (!rows[0] || rows[0].length === 0) return res.status(500).json({ message: "Failed to insert permission" });
    return res.status(201).json(rows[0][0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

export async function updatePermissionById(req, res) {
  const { id } = req.params;
  const { name, description, permission_for } = req.body || {};
  try {
    const [rows] = await db.query(
      "CALL UpdatePermission(?, ?, ?)",
      [
        id,
        name ?? null,
        description ?? null,
      ]
    );
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

export async function addRolePermission(req, res) {
  // The user requested to add `business_id` here.
  // The current database procedure `InsertRolePermission` does not support it.
  // A migration to add `business_id` to `role_permissions` table and update the procedure would be needed.
  const { user_role_id, permission_id, permission_ids, business_id } = req.body || {};
  
  // Support both single and bulk assignment
  if (!user_role_id) {
    return res.status(400).json({ message: "user_role_id is required" });
  }

  try {
    // Bulk assignment
    if (permission_ids && Array.isArray(permission_ids)) {
      const results = [];
      for (const permId of permission_ids) {
        try {
          // TODO: When DB supports it, pass business_id to a new version of the procedure.
          const [rows] = await db.query("CALL InsertRolePermission(?, ?)", [user_role_id, permId]);
          results.push(rows[0]?.[0] || { user_role_id, permission_id: permId, business_id });
        } catch (err) {
          // Ignore duplicate errors, continue with others
          if (!err.message?.includes('Duplicate')) {
            throw err;
          }
        }
      }
      return res.status(201).json(results);
    }
    
    // Single assignment
    if (!permission_id) {
      return res.status(400).json({ message: "permission_id or permission_ids is required" });
    }
    // TODO: When DB supports it, pass business_id to a new version of the procedure.
    const [rows] = await db.query("CALL InsertRolePermission(?, ?)", [user_role_id, permission_id]);
    return res.status(201).json(rows[0]?.[0] || { user_role_id, permission_id, business_id });
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

export async function createDefaultBusinessPermissions(req, res) {
  const { business_id } = req.body;
  if (!business_id) {
    return res.status(400).json({ message: "business_id is required" });
  }

  try {
    const [rows] = await db.query("CALL CreateDefaultBusinessPermissions(?)", [business_id]);
    return res.status(201).json(rows[0] || []);
  } catch (error) {
    // Prevent crashing on duplicate entries if the procedure is run more than once
    // for the same business. A better approach would be to have `INSERT IGNORE`
    // or `ON DUPLICATE KEY UPDATE` in the procedure itself.
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(200).json({ message: "Default permissions may already exist for this business." });
    }
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
