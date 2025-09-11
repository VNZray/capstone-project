import { Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "@/src/context/AuthContext";

// Pages
import Login from "../pages/login";
import Register from "../pages/register";
import NotFound from "../pages/NotFound";

import AccommodationDashboard from "../features/accommodation/dashboard/Dashboard";
import ShopDashboard from "../features/shop/dashboard/Dashboard";
import MyBusiness from "../features/listing/MyBusiness";
import ManageShop from "../features/shop/manage-business/ManageBusiness";
import Transactions from "../features/accommodation/transaction/Transactions";
import Profile from "../features/profile/Profile";
import Reviews from "../features/accommodation/reviews/Reviews";
import ManagePromotion from "../features/accommodation/promotion/ManagePromotion";
import RoomPage from "../features/accommodation/room/Room";
import Offer from "../features/shop/offers/Offer";
import Bookings from "../features/accommodation/bookings/Bookings";
import Request from "../features/listing/Request";
import BusinessRegistration from "../features/listing/BusinessRegistration";
import BusinessProfile from "../features/accommodation/business-profile/BusinessProfile";
import RoomProfile from "../features/accommodation/room/RoomProfile";

// Layouts
import MainLayout from "../layout/MainLayout";
import AuthLayout from "../layout/AuthLayout";
import BusinessLayout from "../layout/BusinessLayout";

// Context providers
import { BusinessProvider } from "../context/BusinessContext";
import { RoomProvider } from "../context/RoomContext";

// Utils
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  // you can replace this with a real value from context later
  const business_type = "Accommodation";

  return (
    <AuthProvider>
      <Routes>
        {/* Auth routes (still inside AuthProvider) */}
        <Route element={<AuthLayout />}>
          <Route index element={<Login />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        {/* All business-related routes (including room routes) are inside BusinessProvider */}
        <Route element={<BusinessProvider><Outlet /></BusinessProvider>}>
          {/* Business management pages use BusinessLayout */}
          <Route element={<BusinessLayout />}>
            <Route
              path="business"
              element={
                <ProtectedRoute>
                  <MyBusiness />
                </ProtectedRoute>
              }
            />
            <Route
              path="request"
              element={
                <ProtectedRoute>
                  <Request />
                </ProtectedRoute>
              }
            />
            <Route
              path="business-registration"
              element={
                <ProtectedRoute>
                  <BusinessRegistration />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Main application pages (still within BusinessProvider) */}
          <Route element={<MainLayout />}>
            <Route
              path="transactions"
              element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              }
            />
            <Route
              path="bookings"
              element={
                <ProtectedRoute>
                  <Bookings />
                </ProtectedRoute>
              }
            />

            {business_type === "Accommodation" ? (
              <>
                <Route
                  path="business-profile"
                  element={
                    <ProtectedRoute>
                      <BusinessProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute>
                      <AccommodationDashboard />
                    </ProtectedRoute>
                  }
                />
              </>
            ) : (
              <>
                <Route
                  path="manage-business"
                  element={
                    <ProtectedRoute>
                      <ManageShop />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute>
                      <ShopDashboard />
                    </ProtectedRoute>
                  }
                />
              </>
            )}

            <Route
              path="offers"
              element={
                <ProtectedRoute>
                  <Offer />
                </ProtectedRoute>
              }
            />
            <Route
              path="manage-promotion"
              element={
                <ProtectedRoute>
                  <ManagePromotion />
                </ProtectedRoute>
              }
            />
            <Route
              path="reviews"
              element={
                <ProtectedRoute>
                  <Reviews />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Room routes: inside RoomProvider (and still inside BusinessProvider) */}
            <Route element={<RoomProvider><Outlet /></RoomProvider>}>
              <Route
                path="rooms"
                element={
                  <ProtectedRoute>
                    <RoomPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="room-profile"
                element={
                  <ProtectedRoute>
                    <RoomProfile />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
