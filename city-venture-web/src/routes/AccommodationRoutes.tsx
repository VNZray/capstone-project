import { Route, Outlet } from "react-router-dom";
import { Fragment } from "react";
import ProtectedRoute from "./ProtectedRoute";

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
 */
export default function AccommodationRoutes({
  businessRoles,
}: AccommodationRoutesProps) {
  const business = "/business";

  return (
    <Fragment>
      {/* Transactions */}
      <Route
        path={`${business}/transactions`}
        element={
          <ProtectedRoute requiredRoles={businessRoles}>
            <Transactions />
          </ProtectedRoute>
        }
      />

      {/* Bookings */}
      <Route
        path={`${business}/bookings`}
        element={
          <ProtectedRoute requiredRoles={businessRoles}>
            <Bookings />
          </ProtectedRoute>
        }
      />

      {/* Accommodation Promotion Form */}
      <Route
        path={`${business}/create-promotion`}
        element={
          <ProtectedRoute requiredRoles={businessRoles}>
            <AccommodationPromotionForm />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${business}/edit-promotion/:id`}
        element={
          <ProtectedRoute requiredRoles={businessRoles}>
            <AccommodationPromotionForm />
          </ProtectedRoute>
        }
      />

      {/* Room Routes with RoomProvider */}
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
            <ProtectedRoute requiredRoles={businessRoles}>
              <RoomPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={`${business}/room-profile`}
          element={
            <ProtectedRoute requiredRoles={businessRoles}>
              <RoomProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path={`${business}/room-edit`}
          element={
            <ProtectedRoute requiredRoles={businessRoles}>
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
            <ProtectedRoute requiredRoles={businessRoles}>
              <Notification />
            </ProtectedRoute>
          }
        />
      </Route>
    </Fragment>
  );
}
