import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/src/context/AuthContext"; // adjust path

// Pages
import Login from "../pages/login";
import Register from "../pages/register";
import NotFound from "../pages/NotFound";

// App pages
import AccommodationDashboard from "../features/accommodation/dashboard/Dashboard";
import ShopDashboard from "../features/shop/dashboard/Dashboard";

import MyBusiness from "../features/listing/MyBusiness";
import ManageShop from "../features/shop/manage-business/ManageBusiness";
import Transactions from "../features/accommodation/transaction/Transactions";
import Profile from "../features/profile/Profile";
import Reviews from "../features/accommodation/reviews/Reviews";
import ManagePromotion from "../features/accommodation/promotion/ManagePromotion";

// Layouts
import MainLayout from "../layout/MainLayout";
import AuthLayout from "../layout/AuthLayout";
import BusinessLayout from "../layout/BusinessLayout";
import RoomPage from "../features/accommodation/room/Room";
import Offer from "../features/shop/offers/Offer";
import Bookings from "../features/accommodation/bookings/Bookings";
import ProtectedRoute from "./ProtectedRoute";
import Request from "../features/listing/Request";
import { BusinessProvider } from "../context/BusinessContext";
import BusinessRegistration from "../features/listing/BusinessRegistration";
import BusinessProfile from "../features/accommodation/business-profile/BusinessProfile";
import Amenity from "../features/accommodation/amenity/Amenity";
import { RoomProvider } from "../context/RoomContext";
import RoomProfile from "../features/accommodation/room/RoomProfile";

export default function AppRoutes() {
  const business_type = "Accommodation";
  return (
    <AuthProvider>
      <BusinessProvider>
        <RoomProvider>
          <Routes>
            {/* Auth routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Login />} />
            </Route>

            {/* Business routes */}
            <Route element={<BusinessLayout />}>
              <Route
                path="/business"
                element={
                  <ProtectedRoute>
                    <MyBusiness />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/request"
                element={
                  <ProtectedRoute>
                    <Request />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/business-registration"
                element={
                  <ProtectedRoute>
                    <BusinessRegistration />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Protected app routes */}
            <Route element={<MainLayout />}>
              <Route
                path="/transactions"
                element={
                  <ProtectedRoute>
                    <Transactions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute>
                    <Bookings />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/amenities"
                element={
                  <ProtectedRoute>
                    <Amenity />
                  </ProtectedRoute>
                }
              />

              {business_type === "Accommodation" ? (
                <>
                  <Route
                    path="/business-profile"
                    element={
                      <ProtectedRoute>
                        <BusinessProfile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
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
                    path="/manage-business"
                    element={
                      <ProtectedRoute>
                        <ManageShop />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/dashboard" element={<ShopDashboard />} />
                </>
              )}
              <Route
                path="/rooms"
                element={
                  <ProtectedRoute>
                    <RoomPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/offers"
                element={
                  <ProtectedRoute>
                    <Offer />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/manage-promotion"
                element={
                  <ProtectedRoute>
                    <ManagePromotion />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reviews"
                element={
                  <ProtectedRoute>
                    <Reviews />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/room-profile"
                element={
                  <ProtectedRoute>
                    <RoomProfile />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </RoomProvider>
      </BusinessProvider>
    </AuthProvider>
  );
}
