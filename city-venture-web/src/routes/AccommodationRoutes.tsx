import { Route, Outlet } from "react-router-dom";
import { Fragment } from "react";
import ProtectedRoute from "./ProtectedRoute";
import * as P from "@/src/constants/permissions";

// Accommodation-specific imports
import Transactions from "../features/business/has-booking/transaction/Transactions";
import Bookings from "../features/business/has-booking/bookings/Bookings";
import { RoomProvider } from "../context/RoomContext";
import RoomPage from "../features/business/has-booking/room/Room";
import RoomProfile from "../features/business/has-booking/room/RoomProfile";
import RoomEdit from "../features/business/has-booking/room/RoomEdit";
import AccommodationPromotionForm from "../features/business/has-booking/promotion/components/PromotionForm";
import Notification from "../features/business/has-booking/notfication/Notification";

interface AccommodationRoutesProps {
  businessRoles: string[];
}

/**
 * Accommodation-specific routes for businesses with booking capabilities
 * Includes transactions, bookings, rooms, and notifications
 * 
 * RBAC: Uses permission-based access control from constants/permissions.ts
 */
export default function AccommodationRoutes({
  businessRoles: _businessRoles,
}: AccommodationRoutesProps) {
  const business = "/business";

  return (
    <Fragment>
      {/* Transactions - requires transaction/payment view permissions */}
      <Route
        path={`${business}/transactions`}
        element={
          <ProtectedRoute 
            requiredAnyPermissions={[P.VIEW_TRANSACTIONS, P.VIEW_PAYMENTS]}
          >
            <Transactions />
          </ProtectedRoute>
        }
      />

      {/* Bookings - requires booking management permissions */}
      <Route
        path={`${business}/bookings`}
        element={
          <ProtectedRoute 
            requiredAnyPermissions={[P.VIEW_BOOKINGS, P.MANAGE_BOOKINGS]}
          >
            <Bookings />
          </ProtectedRoute>
        }
      />

      {/* Accommodation Promotion Form - requires promotion management permission */}
      <Route
        path={`${business}/create-promotion`}
        element={
          <ProtectedRoute 
            requiredAnyPermissions={[P.MANAGE_PROMOTIONS]}
          >
            <AccommodationPromotionForm />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${business}/edit-promotion/:id`}
        element={
          <ProtectedRoute 
            requiredAnyPermissions={[P.MANAGE_PROMOTIONS]}
          >
            <AccommodationPromotionForm />
          </ProtectedRoute>
        }
      />

      {/* Room Routes with RoomProvider - requires room management permissions */}
      <Route
        element={
          <RoomProvider>
            <Outlet />
          </RoomProvider>
        }
      >
        <Route
          path={`${business}/rooms`}
          element={
            <ProtectedRoute 
              requiredAnyPermissions={[P.MANAGE_ROOMS, P.VIEW_BOOKINGS]}
            >
              <RoomPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={`${business}/room-profile`}
          element={
            <ProtectedRoute 
              requiredAnyPermissions={[P.MANAGE_ROOMS, P.VIEW_BOOKINGS]}
            >
              <RoomProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path={`${business}/room-edit`}
          element={
            <ProtectedRoute 
              requiredAnyPermissions={[P.MANAGE_ROOMS]}
            >
              <RoomEdit />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Notification Route with RoomProvider */}
      <Route
        element={
          <RoomProvider>
            <Outlet />
          </RoomProvider>
        }
      >
        <Route
          path={`${business}/notification`}
          element={
            <ProtectedRoute 
              requiredAnyPermissions={[P.SEND_NOTIFICATIONS, P.VIEW_BOOKINGS]}
            >
              <Notification />
            </ProtectedRoute>
          }
        />
      </Route>
    </Fragment>
  );
}
