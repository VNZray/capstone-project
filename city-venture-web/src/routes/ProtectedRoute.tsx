// ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import Loading from "../components/Loading";

/**
 * Scope types for route protection:
 * - 'platform': Only system roles without business binding (Admin, Tourism Officer, etc.)
 * - 'business': Only roles with a business association (Business Owner, custom staff roles)
 * - 'any': Any authenticated user with the required permissions
 */
type RouteScope = 'platform' | 'business' | 'any';

interface ProtectedRouteProps {
  children: React.ReactElement;
  /**
   * @deprecated Use requiredScope + permissions instead of hardcoded role names.
   * Role names are just display labels - authorization should be based on what roles CAN DO (permissions).
   */
  requiredRoles?: string[];
  // Scope-based access control (preferred over requiredRoles)
  requiredScope?: RouteScope;
  // RBAC: Permission-based access control
  requiredAllPermissions?: string[]; // user must have ALL (AND logic)
  requiredAnyPermissions?: string[]; // user must have ANY (OR logic)
  // Redirect path on unauthorized access (default: "/")
  redirectTo?: string;
  // Skip onboarding checks (for the change-password page itself)
  skipOnboardingCheck?: boolean;
}

/**
 * Determines the user's role scope based on role properties.
 * - Platform scope: system roles without business binding (role_type: 'system', no role_for)
 * - Business scope: roles with business association (role_type: 'business' or has role_for/business_id)
 */
function getUserScope(user: { role_type?: string; role_for?: string | number | null; business_id?: string | number | null }): 'platform' | 'business' {
  const roleType = user.role_type || 'system';
  const hasBusinessBinding = !!(user.role_for || user.business_id);
  
  // Business scope if role_type is 'business' OR if there's a business binding
  if (roleType === 'business' || hasBusinessBinding) {
    return 'business';
  }
  
  return 'platform';
}

/**
 * Protected Route Component with Role-Based Access Control (RBAC)
 * 
 * Supports scope-based and permission-based access control:
 * 1. Scope check: User's role must match the required scope
 *    - 'platform': System roles (Admin, Tourism Officer, Event Manager)
 *    - 'business': Roles with business binding (Business Owner, Staff, custom roles)
 *    - 'any': Any authenticated user (default)
 * 2. Permission checks:
 *    - requiredAllPermissions: User must have ALL permissions (AND)
 *    - requiredAnyPermissions: User must have ANY permission (OR)
 * 3. Onboarding checks:
 *    - must_change_password: Staff must change password before accessing app
 *    - profile_completed: Staff must complete profile after password change
 * 
 * @example Scope-based protection (recommended)
 * <ProtectedRoute requiredScope="platform" requiredAnyPermissions={["approve_business", "manage_users"]}>
 *   <AdminDashboard />
 * </ProtectedRoute>
 * 
 * @example Business scope protection
 * <ProtectedRoute requiredScope="business" requiredAnyPermissions={["manage_orders"]}>
 *   <OrderManagement />
 * </ProtectedRoute>
 * 
 * @example Permission-only protection (any scope)
 * <ProtectedRoute requiredAnyPermissions={["view_dashboard", "view_reports"]}>
 *   <Analytics />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({
  children,
  requiredRoles,
  requiredScope = 'any',
  requiredAllPermissions,
  requiredAnyPermissions,
  redirectTo = "/unauthorized",
  skipOnboardingCheck = false,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Staff onboarding flow - redirect to change password if required
  // Skip if we're already on the change-password or complete-profile page
  if (!skipOnboardingCheck) {
    const onboardingPaths = ['/change-password', '/complete-profile'];
    const isOnboardingPath = onboardingPaths.some(path => location.pathname.startsWith(path));
    
    if (!isOnboardingPath) {
      // Check if must change password
      if (user.must_change_password) {
        console.log('[ProtectedRoute] Staff must change password, redirecting...');
        return <Navigate to="/change-password" replace state={{ from: location }} />;
      }
      
      // Check if profile needs completion (after password change)
      if (user.profile_completed === false) {
        console.log('[ProtectedRoute] Staff must complete profile, redirecting...');
        return <Navigate to="/complete-profile" replace state={{ from: location }} />;
      }
    }
  }

  // Role-based check (DEPRECATED - kept for backwards compatibility)
  if (requiredRoles && requiredRoles.length > 0) {
    console.warn('[ProtectedRoute] requiredRoles is deprecated. Use requiredScope + permissions instead.');
    const userRole = (user.role_name || '').toString();
    const userRoleType = user.role_type || 'system';
    const isCustomBusinessRole = userRoleType === 'business';
    
    // Check if user's role matches any required role
    let roleOk = requiredRoles.includes(userRole);
    
    // RBAC Enhancement: Custom business roles should be treated as having business scope
    // Allow access if route requires business-related roles and user has business role type
    if (!roleOk && isCustomBusinessRole) {
      const businessRelatedRoles = [
        "Manager", "Room Manager", "Receptionist", "Sales Associate", 
        "Staff", "Business Owner"
      ];
      const requiresBusinessAccess = requiredRoles.some(r => 
        businessRelatedRoles.includes(r) || r.toLowerCase().includes('staff')
      );
      
      if (requiresBusinessAccess) {
        roleOk = true;
        console.log('[ProtectedRoute] Custom business role granted access:', userRole);
      }
    }
    
    if (!roleOk) {
      console.warn(
        `[ProtectedRoute] Access denied. Required roles: ${requiredRoles.join(', ')}, Current role: ${userRole} (type: ${userRoleType})`
      );
      return <Navigate to={redirectTo} replace />;
    }
  }

  // Scope-based check (preferred method)
  if (requiredScope !== 'any') {
    const userScope = getUserScope(user);
    
    if (requiredScope !== userScope) {
      console.warn(
        `[ProtectedRoute] Access denied. Required scope: ${requiredScope}, User scope: ${userScope}`
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
