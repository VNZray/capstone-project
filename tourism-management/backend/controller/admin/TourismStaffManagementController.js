import db from "../../db.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { randomBytes } from "crypto";
import { handleDbError } from "../../utils/errorHandler.js";

const toBool = (v, d = null) => (typeof v === "boolean" ? v : d);

function generateTempPassword(len = 12) {
  return randomBytes(Math.ceil((len * 3) / 4)).toString("base64url").slice(0, len);
}

export async function listTourismStaff(req, res) {
  try {
    const [resultSets] = await db.query("CALL GetTourismListWithUserRole()");
    const rows = resultSets?.[0] ?? resultSets;
    return res.json(rows || []);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get a single tourism staff by tourism_id
export async function getTourismStaffById(req, res) {
  const { id } = req.params;
  try {
    const [resultSets] = await db.query("CALL GetTourismWithUserRoleById(?)", [id]);
    const rows = resultSets?.[0] ?? resultSets;
    if (!rows || rows.length === 0) return res.status(404).json({ message: "Tourism staff not found" });
    return res.json(rows[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Create user + tourism profile within a transaction
export async function createTourismStaff(req, res) {
  const {
    email,
    phone_number,
    password,
    first_name,
    middle_name,
    last_name,
    position,
    user_role_id,
    role_name,
    is_verified = true,
    is_active = true,
    barangay_id = null,
    permission_ids = [],
  } = req.body || {};

  if (!email || !phone_number || !first_name || !last_name) {
    return res.status(400).json({ message: "email, phone_number, first_name, last_name are required" });
  }

  let resolvedRoleId = user_role_id ?? null;
  try {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      if (!resolvedRoleId && role_name) {
        // Resolve role via stored procedure
        const [roleSets] = await conn.query("CALL GetAllUserRoles()");
        const roleRows = roleSets?.[0] ?? roleSets;
        const match = Array.isArray(roleRows)
          ? roleRows.find((rr) => (rr.role_name || '').toLowerCase() === String(role_name).toLowerCase())
          : null;
        if (!match) throw new Error(`Role not found: ${role_name}`);
        resolvedRoleId = match.id;
      }

      const userId = uuidv4();
      const rawPassword = password || generateTempPassword(12);
      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      const userParams = [
        userId,
        email,
        phone_number,
        hashedPassword,
        null,
        null,
        !!is_verified,
        !!is_active,
        null,
        resolvedRoleId,
        barangay_id,
      ];
      const [uRows] = await conn.query("CALL InsertUser(?,?,?,?,?,?,?,?,?,?,?)", userParams);
      const insertedUser = uRows?.[0]?.[0];
      if (!insertedUser) throw new Error("Failed to insert user");

      // Insert tourism profile
      const tourismId = uuidv4();
      const tourismParams = [
        tourismId,
        first_name,
        middle_name ?? null,
        last_name,
        position ?? null,
        userId,
      ];
      const [tRows] = await conn.query("CALL InsertTourism(?,?,?,?,?,?)", tourismParams);
      const insertedTourism = tRows?.[0]?.[0];
      if (!insertedTourism) throw new Error("Failed to insert tourism profile");

      // Insert permissions if provided
      if (Array.isArray(permission_ids) && permission_ids.length > 0) {
        for (const permissionId of permission_ids) {
          await conn.query(
            "INSERT INTO user_permissions (user_id, permission_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE user_id=user_id",
            [userId, permissionId]
          );
        }
      }

      await conn.commit();

      return res.status(201).json({
        message: "Tourism staff created",
        user: {
          id: userId,
          email,
          phone_number,
          is_verified: !!is_verified,
          is_active: !!is_active,
          user_role_id: resolvedRoleId,
        },
        tourism: insertedTourism,
        credentials: password ? undefined : { temporary_password: rawPassword },
      });
    } catch (err) {
      try { await conn.rollback(); } catch {}
      // Handle duplicate keys (email/phone) gracefully
      if (err && err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Email or phone number already exists' });
      }
      return handleDbError(err, res);
    } finally {
      conn.release();
    }
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update tourism staff (user + tourism); fields optional
export async function updateTourismStaff(req, res) {
  const { id } = req.params;
  const {
    email,
    phone_number,
    password,
    first_name,
    middle_name,
    last_name,
    position,
    user_role_id,
    role_name,
    is_verified,
    is_active,
    barangay_id,
    permission_ids,
  } = req.body || {};

  try {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [tLookup] = await conn.query("CALL GetTourismById(?)", [id]);
      const currentTourism = tLookup?.[0]?.[0];
      if (!currentTourism) {
        await conn.rollback();
        return res.status(404).json({ message: "Tourism staff not found" });
      }
      const userId = currentTourism.user_id;
      let resolvedRoleId = user_role_id ?? null;
      if (!resolvedRoleId && role_name) {
        // Resolve role via stored procedure
        const [roleSets] = await conn.query("CALL GetAllUserRoles()");
        const roleRows = roleSets?.[0] ?? roleSets;
        const match = Array.isArray(roleRows)
          ? roleRows.find((rr) => (rr.role_name || '').toLowerCase() === String(role_name).toLowerCase())
          : null;
        if (!match) throw new Error(`Role not found: ${role_name}`);
        resolvedRoleId = match.id;
      }

      const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
      const userParams = [
        userId,
        email ?? null,
        phone_number ?? null,
        hashedPassword,
        null,
        null,
        toBool(is_verified),
        toBool(is_active),
        null,
        resolvedRoleId,
        barangay_id ?? null,
      ];
      const [uRows] = await conn.query("CALL UpdateUser(?,?,?,?,?,?,?,?,?,?,?)", userParams);
      const updatedUser = uRows?.[0]?.[0];
      if (!updatedUser) throw new Error("Failed to update user");

      // Update tourism profile
      const tourismParams = [
        id,
        first_name ?? null,
        middle_name ?? null,
        last_name ?? null,
        position ?? null,
        null,
      ];
      const [tRows] = await conn.query("CALL UpdateTourism(?,?,?,?,?,?)", tourismParams);
      const updatedTourism = tRows?.[0]?.[0];
      if (!updatedTourism) throw new Error("Failed to update tourism profile");

      // Update permissions if provided
      if (Array.isArray(permission_ids)) {
        // Delete existing permissions
        await conn.query("DELETE FROM user_permissions WHERE user_id = ?", [userId]);

        // Insert new permissions
        if (permission_ids.length > 0) {
          for (const permissionId of permission_ids) {
            await conn.query(
              "INSERT INTO user_permissions (user_id, permission_id) VALUES (?, ?)",
              [userId, permissionId]
            );
          }
        }
      }

      await conn.commit();
      return res.json({ message: "Tourism staff updated", user: updatedUser, tourism: updatedTourism });
    } catch (err) {
      try { await conn.rollback(); } catch {}
      return handleDbError(err, res);
    } finally {
      conn.release();
    }
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Change account status (active/verified) by tourism_id
export async function changeTourismStaffStatus(req, res) {
  const { id } = req.params; // tourism_id
  const { is_active, is_verified } = req.body || {};
  try {
    const [tLookup] = await db.query("CALL GetTourismById(?)", [id]);
    const currentTourism = tLookup?.[0]?.[0];
    if (!currentTourism) return res.status(404).json({ message: "Tourism staff not found" });
    const userId = currentTourism.user_id;

    const userParams = [
      userId,
      null,
      null,
      null,
      null,
      null,
      toBool(is_verified),
      toBool(is_active),
      null,
      null,
      null,
    ];
    const [uRows] = await db.query("CALL UpdateUser(?,?,?,?,?,?,?,?,?,?,?)", userParams);
    const updated = uRows?.[0]?.[0];
    if (!updated) return res.status(500).json({ message: "Failed to update status" });
    return res.json({ message: "Status updated", user: updated });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Generate a password reset (set new temp password)
export async function resetTourismStaffPassword(req, res) {
  const { id } = req.params; // tourism_id
  try {
    const [tLookup] = await db.query("CALL GetTourismById(?)", [id]);
    const currentTourism = tLookup?.[0]?.[0];
    if (!currentTourism) return res.status(404).json({ message: "Tourism staff not found" });
    const userId = currentTourism.user_id;

    const temp = generateTempPassword(12);
    const hashedPassword = await bcrypt.hash(temp, 10);

    const userParams = [
      userId,
      null,
      null,
      hashedPassword,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ];
    await db.query("CALL UpdateUser(?,?,?,?,?,?,?,?,?,?,?)", userParams);
    return res.json({ message: "Temporary password generated", credentials: { temporary_password: temp } });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Delete tourism staff
export async function deleteTourismStaff(req, res) {
  const { id } = req.params;
  try {
    await db.query("CALL DeleteTourismStaff(?)", [id]);
    return res.json({ message: "Tourism staff deleted successfully" });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get permissions for a tourism staff member
export async function getTourismStaffPermissions(req, res) {
  const { userId } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT p.id, p.name, p.description, p.scope
       FROM user_permissions up
       JOIN permissions p ON up.permission_id = p.id
       WHERE up.user_id = ?
       ORDER BY p.name`,
      [userId]
    );
    return res.json(rows || []);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get available permissions for tourism staff (system-scoped)
export async function getAvailableTourismPermissions(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT
        pc.id as category_id,
        pc.name as category_name,
        pc.description as category_description,
        pc.portal,
        pc.sort_order,
        p.id as permission_id,
        p.name as permission_name,
        p.description as permission_description,
        p.scope
       FROM permission_categories pc
       LEFT JOIN permissions p ON p.category_id = pc.id AND p.scope = 'system'
       WHERE p.id IS NOT NULL
         AND (pc.portal = 'tourism' OR pc.portal = 'shared')
       ORDER BY pc.sort_order, pc.name, p.name`
    );

    // Group permissions by category
    const categories = {};
    for (const row of rows) {
      if (!categories[row.category_id]) {
        categories[row.category_id] = {
          category_id: row.category_id,
          category_name: row.category_name,
          sort_order: row.sort_order,
          permissions: [],
        };
      }
      categories[row.category_id].permissions.push({
        id: row.permission_id,
        name: row.permission_name,
        description: row.permission_description,
        scope: row.scope,
        category_name: row.category_name,
      });
    }

    return res.json(Object.values(categories));
  } catch (error) {
    return handleDbError(error, res);
  }
}
