import { Routes, Route, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

// Route Components
import AccommodationRoutes from "./AccommodationRoutes";
import ShopRoutes from "./ShopRoutes";
import TourismRoutes from "./TourismRoutes";
import ProtectedRoute from "./ProtectedRoute";

// Permission constants
import * as P from "@/src/constants/permissions";

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
import BusinessLandingPage from "@/src/features/landing-page/BusinessLandingPage";
import TouristLandingPage from "@/src/features/landing-page/TouristLandingPage";
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
} from "../features/business/unified";

// Context Providers
import { AuthProvider } from "../context/AuthContext";
import { BusinessProvider } from "../context/BusinessContext";

// Services & Types
import api from "../services/api";
import type { User } from "../types/User";
import Loading from "../components/ui/Loading";

export default function AppRoutes() {
  const home = "/";
  const business = "/business";
  const tourism = "/tourism";
  const [isServerUp, setIsServerUp] = useState<boolean | null>(null);

  const checkServerStatus = async () => {
    try {
      // Use a public endpoint for health check (business list is public)
      const response = await axios.get(`${api}/business`, {
        timeout: 5000,
      });
      setIsServerUp(response.status === 200);
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
          <Route path="/for-business" element={<BusinessLandingPage />} />
        </Route>

        {/* Tourist landing page - has its own navbar */}
        <Route path="/explore" element={<TouristLandingPage />} />

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
                <ProtectedRoute requiredAnyPermissions={[P.VIEW_BUSINESS_PROFILE, P.MANAGE_BUSINESS_PROFILE]}>
                  <MyBusiness />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${business}/register`}
              element={
                <ProtectedRoute requiredAnyPermissions={[P.MANAGE_BUSINESS_PROFILE]}>
                  <BusinessRegistration />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Business Management Routes - Using Unified CMS */}
          <Route element={<BusinessManagementLayout />}>
            {/* Unified Dashboard - requires analytics/reports permission */}
            <Route
              path={`${business}/dashboard`}
              element={
                <ProtectedRoute 
                  requiredAnyPermissions={[P.VIEW_DASHBOARD, P.VIEW_REPORTS, P.VIEW_ANALYTICS]}
                >
                  <UnifiedDashboard />
                </ProtectedRoute>
              }
            />

            {/* Unified Business Profile - requires view/manage business profile permission */}
            <Route
              path={`${business}/business-profile`}
              element={
                <ProtectedRoute 
                  requiredAnyPermissions={[P.VIEW_BUSINESS_PROFILE, P.MANAGE_BUSINESS_PROFILE]}
                >
                  <UnifiedBusinessProfile />
                </ProtectedRoute>
              }
            />

            {/* Unified Reviews - requires review management permission */}
            <Route
              path={`${business}/reviews`}
              element={
                <ProtectedRoute 
                  requiredAnyPermissions={[P.VIEW_REVIEWS, P.MANAGE_REVIEWS]}
                >
                  <UnifiedReviews />
                </ProtectedRoute>
              }
            />

            {/* Unified Promotions - requires promotion management permission */}
            <Route
              path={`${business}/promotions`}
              element={
                <ProtectedRoute 
                  requiredAnyPermissions={[P.VIEW_PROMOTIONS, P.MANAGE_PROMOTIONS]}
                >
                  <UnifiedPromotions />
                </ProtectedRoute>
              }
            />

            {/* Unified Subscription - requires business settings permission */}
            <Route
              path={`${business}/subscription`}
              element={
                <ProtectedRoute 
                  requiredAnyPermissions={[P.MANAGE_SUBSCRIPTIONS, P.VIEW_PAYMENTS]}
                >
                  <UnifiedSubscription />
                </ProtectedRoute>
              }
            />

            {/* Unified Staff Management - requires staff management permission */}
            <Route
              path={`${business}/manage-staff`}
              element={
                <ProtectedRoute 
                  requiredAnyPermissions={[P.VIEW_STAFF, P.ADD_STAFF, P.MANAGE_STAFF_ROLES]}
                >
                  <UnifiedManageStaff />
                </ProtectedRoute>
              }
            />

            {/* Settings - requires business settings permission */}
            <Route
              path={`${business}/settings`}
              element={
                <ProtectedRoute 
                  requiredAnyPermissions={[P.MANAGE_BUSINESS_SETTINGS]}
                >
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
