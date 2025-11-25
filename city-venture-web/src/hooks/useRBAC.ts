import { useAuth } from "@/src/context/AuthContext";

/**
 * RBAC helper hook to check roles/permissions in components (e.g., to hide nav items).
 */
export default function useRBAC() {
  const { user } = useAuth();
  const role = (user?.role_name || '').toString();
  const perms = new Set(user?.permissions || []);

  function hasRole(...roles: string[]) {
    if (!roles || roles.length === 0) return true;
    return roles.includes(role);
  }

  function canAny(...required: string[]) {
    if (!required || required.length === 0) return true;
    return required.some((p) => perms.has(p));
  }

  function canAll(...required: string[]) {
    if (!required || required.length === 0) return true;
    return required.every((p) => perms.has(p));
  }

  return { role, permissions: Array.from(perms), hasRole, canAny, canAll };
}
