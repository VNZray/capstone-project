import { useEffect, useState } from "react";
import { Outlet, Route, Routes } from "react-router-dom";

// Route Components
import TourismRoutes from "./TourismRoutes";

// Permission constants

// Pages
import Unauthorized from "@/src/pages/Unauthorized";
import Registration from "../pages/BusinessRegistration";
import ChangePassword from "../pages/ChangePassword";
import NotFound from "../pages/NotFound";
import ServerDown from "../pages/ServerDown";
import Test from "../pages/Test";

// Layouts

// Features - Landing & Auth
import BusinessPortalLogin from "../features/auth/LoginPage";
import AdminLogin from "../features/auth/old-page/AdminLogin";
import AdminRegister from "../features/auth/old-page/AdminRegister";
import TouristRegister from "../features/auth/TouristRegister";

// Unified Business CMS - Shared features across all business types

// Context Providers
import { AuthProvider } from "../context/AuthContext";
import { BusinessProvider } from "../context/BusinessContext";

// Services & Types
import Loading from "../components/ui/Loading";
import { checkTourismBackendHealth } from "../services/healthCheck";

export default function AppRoutes() {
  const [isServerUp, setIsServerUp] = useState<boolean | null>(null);

  const checkServerStatus = async () => {
    try {
      // Only check Tourism backend health - independent of Business backend
      const result = await checkTourismBackendHealth();
      setIsServerUp(result.isUp);

      if (!result.isUp) {
        console.error("Tourism backend health check failed:", result.error);
      }
    } catch (error) {
      console.error("Server status check failed:", error);
      setIsServerUp(false);
    }
  };

  useEffect(() => {
    checkServerStatus();
  }, []);

  // Normalized role names as produced by AuthService
  const TOURISM_ROLES = ["Admin", "Tourism Officer"];
  // Show loading or server down while checking
  if (isServerUp === null) {
    return <Loading variant="default" showProgress />;
  }

  if (isServerUp === false) {
    return <ServerDown />;
  }

  return (
    <Routes>
      <Route
        element={
          <AuthProvider>
            <Outlet />
          </AuthProvider>
        }
      >
        {/* Tourist landing page - now the default home page */}
        <Route index element={<AdminLogin />} />

        <Route path={`/unauthorized`} element={<Unauthorized />} />
        <Route path={`/change-password`} element={<ChangePassword />} />

        {/* Business Provider wrapper for login */}
        <Route
          element={
            <BusinessProvider>
              <Outlet />
            </BusinessProvider>
          }
        >
          <Route path={`/login`} element={<BusinessPortalLogin />} />
        </Route>

        <Route path={`business-registration`} element={<Registration />} />
        <Route path={`/test`} element={<Test />} />
        <Route path={`/register`} element={<TouristRegister />} />
        <Route path={`/login`} element={<AdminLogin />} />
        <Route path={`/signup`} element={<AdminRegister />} />

        {/* Tourism/Admin Portal Routes */}
        {TourismRoutes({ tourismRoles: TOURISM_ROLES })}
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
