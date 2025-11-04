// ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import Loading from "../components/Loading";

interface ProtectedRouteProps {
  children: React.ReactElement;
  // Optional RBAC controls
  requiredRoles?: string[]; // match against user.role_name (normalized)
  requiredAnyPermissions?: string[]; // match against user.permissions
}

export default function ProtectedRoute({ children, requiredRoles, requiredAnyPermissions }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Role-based check (if provided)
  if (requiredRoles && requiredRoles.length > 0) {
    const userRole = (user.role_name || '').toString();
    const roleOk = requiredRoles.includes(userRole);
    if (!roleOk) return <Navigate to="/" replace />;
  }

  // Permission-based OR check (if provided)
  if (requiredAnyPermissions && requiredAnyPermissions.length > 0) {
    const userPerms = new Set(user.permissions || []);
    const permOk = requiredAnyPermissions.some((p) => userPerms.has(p));
    if (!permOk) return <Navigate to="/" replace />;
  }

  return children;
}
