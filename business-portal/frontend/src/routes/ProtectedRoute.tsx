/**
 * ProtectedRoute - Simplified RBAC
 * 
 * Simple role-based route protection using hardcoded role names.
 * Staff permissions are checked for specific features within pages, not at route level.
 */

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import Loading from "../components/Loading";

interface ProtectedRouteProps {
  children: React.ReactElement;
  /**
   * Required role names for access. User must have ONE of these roles.
   * Common roles: "Admin", "Tourism Officer", "Business Owner", "Tourist", "Staff"
   */
  requiredRoles?: string[];
  /**
   * Redirect path on unauthorized access (default: "/unauthorized")
   */
  redirectTo?: string;
  /**
   * Skip onboarding checks (for change-password/complete-profile pages)
   */
  skipOnboardingCheck?: boolean;
  /**
   * Optional permission check - user must have ANY of these permissions.
   * Use for staff access to specific features.
   */
  requiredAnyPermissions?: string[];
}

/**
 * Protected Route Component
 * 
 * Checks:
 * 1. Authentication - must be logged in
 * 2. Staff onboarding - must change password / complete profile if required
 * 3. Role check - user role must match one of the required roles
 * 4. Permission check (optional) - for fine-grained staff access
 * 
 * @example Role-based protection
 * <ProtectedRoute requiredRoles={["Admin", "Tourism Officer"]}>
 *   <AdminDashboard />
 * </ProtectedRoute>
 * 
 * @example Business routes (owners + staff with custom roles)
 * <ProtectedRoute requiredRoles={["Business Owner"]}>
 *   <BusinessDashboard />
 * </ProtectedRoute>
 * 
 * @example Staff permission check
 * <ProtectedRoute requiredRoles={["Business Owner"]} requiredAnyPermissions={["manage_products"]}>
 *   <ProductManagement />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({
  children,
  requiredRoles,
  redirectTo = "/unauthorized",
  skipOnboardingCheck = false,
  requiredAnyPermissions,
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

  // Staff onboarding flow
  if (!skipOnboardingCheck) {
    const onboardingPaths = ['/change-password', '/complete-profile'];
    const isOnboardingPath = onboardingPaths.some(path => location.pathname.startsWith(path));
    
    if (!isOnboardingPath) {
      if (user.must_change_password) {
        return <Navigate to="/change-password" replace state={{ from: location }} />;
      }
      
      if (user.profile_completed === false) {
        return <Navigate to="/complete-profile" replace state={{ from: location }} />;
      }
    }
  }

  // Role-based check
  if (requiredRoles && requiredRoles.length > 0) {
    const userRole = (user.role_name || '').toString();
    const isStaff = userRole === 'Staff';
    
    // Direct role match
    let roleOk = requiredRoles.includes(userRole);
    
    // Staff members can access business routes (they have "Staff" role)
    if (!roleOk && isStaff) {
      const businessRouteRoles = ["Business Owner", "Staff", "Manager"];
      if (requiredRoles.some(r => businessRouteRoles.includes(r))) {
        roleOk = true;
      }
    }
    
    if (!roleOk) {
      console.warn(`[ProtectedRoute] Access denied. Required: ${requiredRoles.join(', ')}, Has: ${userRole}`);
      return <Navigate to={redirectTo} replace />;
    }
  }

  // Permission check (optional - for staff feature access)
  if (requiredAnyPermissions && requiredAnyPermissions.length > 0) {
    const userPerms = new Set(user.permissions || []);
    const hasAnyPerm = requiredAnyPermissions.some((p) => userPerms.has(p));
    
    // Business Owners bypass permission checks (they have full access)
    const isOwner = user.role_name === 'Business Owner';
    
    if (!hasAnyPerm && !isOwner) {
      console.warn(`[ProtectedRoute] Permission denied. Required any: ${requiredAnyPermissions.join(', ')}`);
      return <Navigate to={redirectTo} replace />;
    }
  }

  return children;
}
