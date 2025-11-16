// ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import Loading from "../components/Loading";

interface ProtectedRouteProps {
  children: React.ReactElement;
  // RBAC: Role-based access control
  requiredRoles?: string[]; // match against user.role_name (normalized)
  // RBAC: Permission-based access control
  requiredAllPermissions?: string[]; // user must have ALL (AND logic)
  requiredAnyPermissions?: string[]; // user must have ANY (OR logic)
  // Redirect path on unauthorized access (default: "/")
  redirectTo?: string;
}

/**
 * Protected Route Component with Role-Based Access Control (RBAC)
 * 
 * Supports both role-based and permission-based access control:
 * 1. Role check: User must have one of the requiredRoles
 * 2. Permission checks:
 *    - requiredAllPermissions: User must have ALL permissions (AND)
 *    - requiredAnyPermissions: User must have ANY permission (OR)
 * 
 * @example Role-based protection
 * <ProtectedRoute requiredRoles={["Business Owner", "Manager"]}>
 *   <Dashboard />
 * </ProtectedRoute>
 * 
 * @example Permission-based protection
 * <ProtectedRoute requiredAnyPermissions={["view_dashboard", "view_reports"]}>
 *   <Analytics />
 * </ProtectedRoute>
 * 
 * @example Combined protection
 * <ProtectedRoute 
 *   requiredRoles={["Manager"]} 
 *   requiredAnyPermissions={["manage_bookings"]}
 * >
 *   <BookingManagement />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({
  children,
  requiredRoles,
  requiredAllPermissions,
  requiredAnyPermissions,
  redirectTo = "/unauthorized",
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Role-based check (if provided)
  if (requiredRoles && requiredRoles.length > 0) {
    const userRole = (user.role_name || '').toString();
    const roleOk = requiredRoles.includes(userRole);
    
    if (!roleOk) {
      console.warn(
        `[ProtectedRoute] Access denied. Required roles: ${requiredRoles.join(', ')}, Current role: ${userRole}`
      );
      return <Navigate to={redirectTo} replace />;
    }
  }

  // Permission-based AND check (if provided)
  if (requiredAllPermissions && requiredAllPermissions.length > 0) {
    const userPerms = new Set(user.permissions || []);
    const hasAllPerms = requiredAllPermissions.every((p) => userPerms.has(p));
    
    if (!hasAllPerms) {
      const missingPerms = requiredAllPermissions.filter((p) => !userPerms.has(p));
      console.warn(
        `[ProtectedRoute] Access denied. Missing permissions: ${missingPerms.join(', ')}`
      );
      return <Navigate to={redirectTo} replace />;
    }
  }

  // Permission-based OR check (if provided)
  if (requiredAnyPermissions && requiredAnyPermissions.length > 0) {
    const userPerms = new Set(user.permissions || []);
    const hasAnyPerm = requiredAnyPermissions.some((p) => userPerms.has(p));
    
    if (!hasAnyPerm) {
      console.warn(
        `[ProtectedRoute] Access denied. Required any of: ${requiredAnyPermissions.join(', ')}`
      );
      return <Navigate to={redirectTo} replace />;
    }
  }

  return children;
}
