import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/src/context/AuthContext"; // adjust path

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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Login />} />
        </Route>

        {/* Protected app routes */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/approval" element={<Approval />} />
          <Route path="/reports" element={<Report />} />
          <Route path="/services/accommodation" element={<Accommodation />} />
          <Route path="/services/shop" element={<Shop />} />
          <Route path="/services/event" element={<Event />} />
          <Route path="/services/tourist-spot" element={<Spot />} />
          <Route path="/room/:id" element={<Room />} />
          <Route path="/offer/:id" element={<Offer />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
