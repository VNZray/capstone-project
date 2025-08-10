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

export default function AppRoutes() {
  const business_type = "Accommodation";
  return (
    <AuthProvider>
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Business routes */}
        <Route element={<BusinessLayout />}>
          <Route path="/" element={<MyBusiness />} />
          <Route path="/business-listing" element={<BusinessListing />} />
        </Route>

        {/* Protected app routes */}
        <Route element={<MainLayout />}>
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/bookings" element={<Bookings />} />

          {business_type === "Accommodation" ? (
            <>
              <Route
                path="/manage-business"
                element={<ManageAccommodation />}
              />
              <Route path="/dashboard" element={<AccommodationDashboard />} />
            </>
          ) : (
            <>
              <Route path="/manage-business" element={<ManageShop />} />
              <Route path="/dashboard" element={<ShopDashboard />} />
            </>
          )}
          <Route path="/rooms" element={<Room />} />
          <Route path="/offers" element={<Offer />} />

          <Route path="/manage-promotion" element={<ManagePromotion />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
