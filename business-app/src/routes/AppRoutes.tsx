import { Routes, Route } from "react-router-dom";

// Pages
import Login from "../pages/login";
import Register from "../pages/register";
import NotFound from "../pages/NotFound";

// App pages
import Dashboard from "../features/dashboard/Dashboard";
import MyBusiness from "../features/Listing/MyBusiness";
import ManageBusiness from "../features/business/ManageBusiness";
import Transactions from "../features/business/Transactions";
// Layout
import MainLayout from "../layout/MainLayout";
import AuthLayout from "../layout/AuthLayout";
import BusinessLayout from "../layout/BusinessLayout";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Business routes */}
      <Route element={<BusinessLayout />}>
        <Route path="/" element={<MyBusiness />} />
      </Route>

      {/* Protected app routes */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/manage-business" element={<ManageBusiness />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
