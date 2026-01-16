import { useAuth } from "@/src/context/AuthContext";

/**
 * RBAC helper hook to check roles/permissions in components (e.g., to hide nav items).
 * 
 * Business Owners automatically have full access - they bypass permission checks.
 * Staff members must have explicit permissions.
 */
export default function useRBAC() {
  const { user } = useAuth();
  const role = (user?.role_name || '').toString();
  const perms = new Set(user?.permissions || []);
  
  // Business Owners have full access to their business
  const isOwner = role === 'Business Owner';
  // Admins have full platform access
  const isAdmin = role === 'Admin';

  function hasRole(...roles: string[]) {
    if (!roles || roles.length === 0) return true;
    return roles.includes(role);
  }

  function canAny(...required: string[]) {
    if (!required || required.length === 0) return true;
    // Business Owners and Admins bypass permission checks
    if (isOwner || isAdmin) return true;
    return required.some((p) => perms.has(p));
  }

  function canAll(...required: string[]) {
    if (!required || required.length === 0) return true;
    // Business Owners and Admins bypass permission checks
    if (isOwner || isAdmin) return true;
    return required.every((p) => perms.has(p));
  }

  return { role, permissions: Array.from(perms), hasRole, canAny, canAll, isOwner, isAdmin };
}
