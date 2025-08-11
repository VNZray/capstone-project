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
import ManageAccommodation from "../features/accommodation/manage-business/ManageBusiness";
import ManageShop from "../features/shop/manage-business/ManageBusiness";
import Transactions from "../features/accommodation/transaction/Transactions";
import Profile from "../features/profile/Profile";
import Reviews from "../features/accommodation/reviews/Reviews";
import ManagePromotion from "../features/accommodation/promotion/ManagePromotion";

// Layouts
import MainLayout from "../layout/MainLayout";
import AuthLayout from "../layout/AuthLayout";
import BusinessLayout from "../layout/BusinessLayout";
import Room from "../features/accommodation/room/Room";
import Offer from "../features/shop/offers/Offer";
import Bookings from "../features/accommodation/bookings/Bookings";
import BusinessListing from "../features/listing/BusinessListing";
import ProtectedRoute from "./ProtectedRoute";
import Request from "../features/listing/Request";

export default function AppRoutes() {
  const business_type = "Accommodation";
  return (
    <AuthProvider>
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
            path="/business-listing"
            element={
              <ProtectedRoute>
                <BusinessListing />
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

          {business_type === "Accommodation" ? (
            <>
              <Route
                path="/manage-business"
                element={
                  <ProtectedRoute>
                    <ManageAccommodation />
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
                <Room />
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
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
