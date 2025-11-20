import db from "../db.js";

/**
 * Fetch the role name for a user.
 * @param {string} userId
 * @returns {Promise<string|null>}
 */
export async function getUserRole(userId) {
  if (!userId) return null;

  const [rows] = await db.query(
    `SELECT ur.role_name 
     FROM user u
     JOIN user_role ur ON ur.id = u.user_role_id
     WHERE u.id = ?`,
    [userId]
  );

  return rows && rows.length > 0 ? rows[0].role_name : null;
}

/**
 * Ensure req.user has a role attached; fetch from DB when missing.
 * @param {import("express").Request} req
 * @returns {Promise<string|null>}
 */
function normalizeRole(role) {
  if (!role) return null;
  const lower = role.toLowerCase();
  switch (lower) {
    case "admin":
      return "Admin";
    case "owner":
    case "business owner":
      return "Business Owner";
    case "staff":
      return "Staff";
    case "tourist":
      return "Tourist";
    case "system":
      return "System";
    default:
      // Fallback to original casing if unexpected
      return role;
  }
}

export async function ensureUserRole(req) {
  if (!req?.user?.id) return null;
  if (req.user.role) return req.user.role;

  const role = await getUserRole(req.user.id);
  if (role) {
    const normalized = normalizeRole(role);
    req.user.role = normalized;
    req.user.roleRaw = role;
  }
  return req.user.role || null;
}

/**
 * Check if a user has access to a business (owner, staff, or admin).
 * @param {string} businessId
 * @param {Object} user
 * @param {string} [roleOverride]
 * @returns {Promise<boolean>}
 */
export async function hasBusinessAccess(businessId, user, roleOverride) {
  if (!businessId || !user?.id) return false;

  const role = normalizeRole(roleOverride || user.role || (await getUserRole(user.id)));
  if (!role) return false;

  if (role === "Admin") return true;

  if (role === "Business Owner") {
    const [rows] = await db.query(
      `SELECT b.id 
       FROM business b
       JOIN owner o ON b.owner_id = o.id
       WHERE b.id = ? AND o.user_id = ?`,
      [businessId, user.id]
    );
    return !!(rows && rows.length > 0);
  }

  if (role === "Staff") {
    const [rows] = await db.query(
      "SELECT id FROM staff WHERE business_id = ? AND user_id = ?",
      [businessId, user.id]
    );
    return !!(rows && rows.length > 0);
  }

  return false;
}

export default {
  getUserRole,
  ensureUserRole,
  hasBusinessAccess,
};
