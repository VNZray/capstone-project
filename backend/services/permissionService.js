import db from '../db.js';

// Simple in-memory cache with TTL to reduce DB lookups
const cache = new Map(); // key: userId, value: { perms: Set<string>, expires: number }
const TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function getUserPermissions(userId) {
  if (!userId) return new Set();
  const now = Date.now();
  const cached = cache.get(userId);
  if (cached && cached.expires > now) return cached.perms;

  const [rows] = await db.query(
    `SELECT p.name
     FROM user u
     JOIN role_permissions rp ON rp.user_role_id = u.user_role_id
     JOIN permissions p ON p.id = rp.permission_id
     WHERE u.id = ?`,
    [userId]
  );
  const perms = new Set(rows.map((r) => r.name));
  cache.set(userId, { perms, expires: now + TTL_MS });
  return perms;
}

export function clearPermissionCache(userId) {
  if (userId) cache.delete(userId);
  else cache.clear();
}
