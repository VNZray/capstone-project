import { Route, Outlet } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// Tourism/Admin imports
import AdminLayout from "../layout/AdminLayout";
import Dashboard from "@/src/features/admin/dashboard/Dashboard";
import Approval from "@/src/features/admin/approval/Approval";
import Report from "@/src/features/admin/report/Report";
import Accommodation from "@/src/features/admin/services/accommodation/Accommodation";
import Shop from "@/src/features/admin/services/shop/Shop";
import Event from "@/src/features/admin/services/event/Event";
import EventDetailsScreen from "@/src/features/admin/services/event/EventDetailsScreen";
import EventReviews from "@/src/features/admin/services/event/reviews/Reviews";
import Spot from "@/src/features/admin/services/tourist-spot/Spot";
import TouristSpotDetailsScreen from "@/src/features/admin/services/tourist-spot/TouristSpotDetailsScreen";
import TouristSpotReviews from "@/src/features/admin/services/tourist-spot/reviews/Reviews";
import { TouristSpotProvider } from "@/src/context/TouristSpotContext";
import ReportDetailsScreen from "@/src/features/admin/report/ReportDetailsScreen";
import TourismStaffManagement from "@/src/features/admin/tourism-staff/TourismStaffManagement";
import TourismSettings from "../features/admin/settings/Settings";
import UserAccounts from "../features/admin/users/UserAccounts";
import TourismProfile from "../features/admin/profile/Profile";
import { EmergencyFacilities } from "../features/admin/emergency-facilities";

interface TourismRoutesProps {
  tourismRoles: string[];
}

/**
 * Tourism/Admin portal routes
 * Includes dashboard, approvals, reports, services management, staff management, and settings
 */
export default function TourismRoutes({ tourismRoles }: TourismRoutesProps) {
  const tourism = "/tourism";

  return (
    <Route element={<AdminLayout />}>
      {/* Dashboard */}
      <Route
        path={`${tourism}/dashboard`}
        element={
          <ProtectedRoute requiredRoles={tourismRoles}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Approval (Admin only) */}
      <Route
        path={`${tourism}/approval`}
        element={
          <ProtectedRoute requiredRoles={["Admin"]}>
            <Approval />
          </ProtectedRoute>
        }
      />

      {/* Reports */}
      <Route
        path={`${tourism}/reports`}
        element={
          <ProtectedRoute requiredRoles={tourismRoles}>
            <Report />
          </ProtectedRoute>
        }
      />

      {/* Report Details */}
      <Route
        path={`${tourism}/reports/:id`}
        element={
          <ProtectedRoute requiredRoles={tourismRoles}>
            <ReportDetailsScreen />
          </ProtectedRoute>
        }
      />

      {/* Staff Management (Admin only) */}
      <Route
        path={`${tourism}/staff`}
        element={
          <ProtectedRoute requiredRoles={["Admin"]}>
            <TourismStaffManagement />
          </ProtectedRoute>
        }
      />

      {/* User Accounts (Admin only) */}
      <Route
        path={`${tourism}/users`}
        element={
          <ProtectedRoute requiredRoles={["Admin"]}>
            <UserAccounts />
          </ProtectedRoute>
        }
      />

      {/* Services - Accommodation */}
      <Route
        path={`${tourism}/services/accommodation`}
        element={
          <ProtectedRoute requiredRoles={tourismRoles}>
            <Accommodation />
          </ProtectedRoute>
        }
      />

      {/* Services - Shop */}
      <Route
        path={`${tourism}/services/shop`}
        element={
          <ProtectedRoute requiredRoles={tourismRoles}>
            <Shop />
          </ProtectedRoute>
        }
      />

      {/* Services - Event */}
      <Route
        path={`${tourism}/services/event`}
        element={
          <ProtectedRoute requiredRoles={tourismRoles}>
            <Event />
          </ProtectedRoute>
        }
      />

      {/* Event Reviews - must come before :id to match correctly */}
      <Route
        path={`${tourism}/services/event/:id/reviews`}
        element={
          <ProtectedRoute requiredRoles={tourismRoles}>
            <EventReviews />
          </ProtectedRoute>
        }
      />

      {/* Event Details */}
      <Route
        path={`${tourism}/services/event/:id`}
        element={
          <ProtectedRoute requiredRoles={tourismRoles}>
            <EventDetailsScreen />
          </ProtectedRoute>
        }
      />

      {/* Tourist Spot routes with TouristSpotProvider */}
      <Route
        element={
          <TouristSpotProvider>
            <Outlet />
          </TouristSpotProvider>
        }
      >
        <Route
          path={`${tourism}/services/tourist-spot`}
          element={
            <ProtectedRoute requiredRoles={tourismRoles}>
              <Spot />
            </ProtectedRoute>
          }
        />
        <Route
          path={`${tourism}/services/tourist-spot/:id`}
          element={
            <ProtectedRoute requiredRoles={tourismRoles}>
              <TouristSpotDetailsScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path={`${tourism}/services/tourist-spot/:id/reviews`}
          element={
            <ProtectedRoute requiredRoles={tourismRoles}>
              <TouristSpotReviews />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Tourism Profile */}
      <Route
        path={`tourism/profile`}
        element={
          <ProtectedRoute requiredRoles={tourismRoles}>
            <TourismProfile />
          </ProtectedRoute>
        }
      />

      {/* Settings */}
      <Route
        path={`${tourism}/settings`}
        element={
          <ProtectedRoute requiredRoles={tourismRoles}>
            <TourismSettings />
          </ProtectedRoute>
        }
      />

      {/* Emergency Facilities */}
      <Route
        path={`${tourism}/emergency-facilities`}
        element={
          <ProtectedRoute requiredRoles={tourismRoles}>
            <EmergencyFacilities />
          </ProtectedRoute>
        }
      />
    </Route>
  );
}
