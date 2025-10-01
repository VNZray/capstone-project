import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/src/context/AuthContext";

// Pages
import Login from "../pages/login";
import Register from "../pages/register";
import NotFound from "../pages/NotFound";

// App pages
import Dashboard from "../features/dashboard/Dashboard";

import Profile from "../features/profile/Profile";

// Layouts
import MainLayout from "../layout/MainLayout";
import AuthLayout from "../layout/AuthLayout";
import Approval from "../features/approval/Approval";
import Report from "../features/report/Report";
import Accommodation from "../features/services/accommodation/Accommodation";
import Shop from "../features/services/shop/Shop";
import Event from "../features/services/event/Event";
import Spot from "../features/services/tourist-spot/Spot";
import Room from "../features/services/accommodation/Room";
import Offer from "../features/services/shop/Offer";

export default function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/tourism/login" element={<Login />} />
          <Route path="/tourism/register" element={<Register />} />
          <Route path="/tourism" element={<Login />} />
        </Route>

        {/* Protected app routes */}
        <Route element={<MainLayout />}>
          <Route path="/tourism/dashboard" element={<Dashboard />} />
          <Route path="/tourism/approval" element={<Approval />} />
          <Route path="/tourism/reports" element={<Report />} />
          <Route path="/tourism/services/accommodation" element={<Accommodation />} />
          <Route path="/tourism/services/shop" element={<Shop />} />
          <Route path="/tourism/services/event" element={<Event />} />
          <Route path="/tourism/services/tourist-spot" element={<Spot />} />
          <Route path="/tourism/room/:id" element={<Room />} />
          <Route path="/tourism/offer/:id" element={<Offer />} />
          <Route path="/tourism/profile" element={<Profile />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
