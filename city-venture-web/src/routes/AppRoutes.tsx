import { Routes, Route, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

// Route Components
import AccommodationRoutes from "./AccommodationRoutes";
import ShopRoutes from "./ShopRoutes";
import TourismRoutes from "./TourismRoutes";
import ProtectedRoute from "./ProtectedRoute";

// Pages
import NotFound from "../pages/NotFound";
import About from "../pages/About";
import Registration from "../pages/BusinessRegistration";
import Unauthorized from "@/src/pages/Unauthorized";
import Test from "../pages/Test";
import ChangePassword from "../pages/ChangePassword";
import ServerDown from "../pages/ServerDown";

// Layouts
import MainLayout from "../layout/MainLayout";
import BusinessLayout from "../layout/BusinessLayout";
import BusinessManagementLayout from "../layout/BusinessManagementLayout";

// Features - Landing & Auth
import LandingPage from "@/src/features/landing-page/LandingPage";
import BusinessPortalLogin from "../features/auth/LoginPage";
import AdminLogin from "../features/auth/old-page/AdminLogin";
import AdminRegister from "../features/auth/old-page/AdminRegister";
import TouristRegister from "../features/auth/TouristRegister";
import ForgetPassword from "../features/auth/ForgetPassword";

// Features - Business
import MyBusiness from "../features/business/listing/MyBusiness";
import BusinessRegistration from "../features/business/listing/BusinessRegistration";
import OwnerProfile from "../features/business/profile/Profile";

// Unified Business CMS - Shared features across all business types
import {
  Dashboard as UnifiedDashboard,
  BusinessProfile as UnifiedBusinessProfile,
  Reviews as UnifiedReviews,
  Promotions as UnifiedPromotions,
  Subscription as UnifiedSubscription,
  ManageStaff as UnifiedManageStaff,
  Settings,
  StaffRoles as StaffRolesPage,
} from "../features/business/unified";

// Context Providers
import { AuthProvider } from "../context/AuthContext";
import { BusinessProvider } from "../context/BusinessContext";

// Services & Types
import { apiV1 } from "../services/api";
import Loading from "../components/ui/Loading";

export default function AppRoutes() {
  const home = "/";
  const business = "/business";
  const tourism = "/tourism";
  const [isServerUp, setIsServerUp] = useState<boolean | null>(null);

  const checkServerStatus = async () => {
    try {
      // Use the new backend health endpoint
      // apiV1 is like http://localhost:3000/api/v1, we need http://localhost:3000/health
      const baseUrl = apiV1.replace(/\/api\/v1$/, "").replace(/\/api$/, "");
      const { data } = await axios.get<{
        success?: boolean;
        data?: { status: string };
      }>(`${baseUrl}/health`, {
        timeout: 5000,
      });
      // New backend returns { success: true, data: { status: 'healthy' } }
      setIsServerUp(data?.success === true || data?.data?.status === "healthy");
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
  const BUSINESS_ROLES = [
    "Business Owner",
    "Manager",
    "Room Manager",
    "Receptionist",
    "Sales Associate",
  ];

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
        {/* Public routes */}
        <Route element={<MainLayout />}>
          <Route index element={<LandingPage />} />
          <Route path={`${home}`} element={<LandingPage />} />
          <Route path={`${home}about`} element={<About />} />
          <Route path={`${home}forget-password`} element={<ForgetPassword />} />
        </Route>

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
        <Route path={`user/profile`} element={<OwnerProfile />} />
        <Route path={`/register`} element={<TouristRegister />} />
        <Route path={`${tourism}/login`} element={<AdminLogin />} />
        <Route path={`${tourism}/signup`} element={<AdminRegister />} />

        {/* Business Portal Routes */}
        <Route
          element={
            <BusinessProvider>
              <Outlet />
            </BusinessProvider>
          }
        >
          {/* Business listing/registration routes */}
          <Route element={<BusinessLayout />}>
            <Route
              path={`${business}`}
              element={
                <ProtectedRoute requiredRoles={["Business Owner"]}>
                  <MyBusiness />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${business}/register`}
              element={
                <ProtectedRoute requiredRoles={["Business Owner"]}>
                  <BusinessRegistration />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Business Management Routes - Using Unified CMS */}
          <Route element={<BusinessManagementLayout />}>
            {/* Unified Dashboard - dynamically renders based on business type */}
            <Route
              path={`${business}/dashboard`}
              element={
                <ProtectedRoute requiredRoles={BUSINESS_ROLES}>
                  <UnifiedDashboard />
                </ProtectedRoute>
              }
            />

            {/* Unified Business Profile */}
            <Route
              path={`${business}/business-profile`}
              element={
                <ProtectedRoute requiredRoles={BUSINESS_ROLES}>
                  <UnifiedBusinessProfile />
                </ProtectedRoute>
              }
            />

            {/* Unified Reviews */}
            <Route
              path={`${business}/reviews`}
              element={
                <ProtectedRoute requiredRoles={BUSINESS_ROLES}>
                  <UnifiedReviews />
                </ProtectedRoute>
              }
            />

            {/* Unified Promotions */}
            <Route
              path={`${business}/promotions`}
              element={
                <ProtectedRoute requiredRoles={BUSINESS_ROLES}>
                  <UnifiedPromotions />
                </ProtectedRoute>
              }
            />

            {/* Unified Subscription */}
            <Route
              path={`${business}/subscription`}
              element={
                <ProtectedRoute requiredRoles={["Business Owner"]}>
                  <UnifiedSubscription />
                </ProtectedRoute>
              }
            />

            {/* Unified Staff Management */}
            <Route
              path={`${business}/manage-staff`}
              element={
                <ProtectedRoute requiredRoles={["Business Owner"]}>
                  <UnifiedManageStaff />
                </ProtectedRoute>
              }
            />

            {/* Staff Roles */}
            <Route
              path={`${business}/staff-roles`}
              element={
                <ProtectedRoute requiredRoles={["Business Owner"]}>
                  <StaffRolesPage />
                </ProtectedRoute>
              }
            />

            {/* Settings */}
            <Route
              path={`${business}/settings`}
              element={
                <ProtectedRoute requiredRoles={["Business Owner"]}>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Accommodation-specific routes */}
            {AccommodationRoutes({ businessRoles: BUSINESS_ROLES })}

            {/* Shop-specific routes */}
            {ShopRoutes({ businessRoles: BUSINESS_ROLES })}
          </Route>
        </Route>

        {/* Tourism/Admin Portal Routes */}
        {TourismRoutes({ tourismRoles: TOURISM_ROLES })}
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
