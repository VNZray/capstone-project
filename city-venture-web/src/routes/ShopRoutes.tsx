import { Route } from "react-router-dom";
import { Fragment } from "react";
import ProtectedRoute from "./ProtectedRoute";

// Shop-specific imports
import Products from "../features/business/has-store/store/Products";
import Categories from "../features/business/has-store/store/Categories";
import Services from "../features/business/has-store/store/Services";
import Orders from "../features/business/has-store/store/Orders";
import Discount from "../features/business/has-store/store/Discount";
import DiscountForm from "../features/business/has-store/store/DiscountForm";
import ShopSettings from "../features/business/has-store/store/Settings";
import PromotionForm from "../features/business/has-store/promotion/PromotionForm";

interface ShopRoutesProps {
  businessRoles: string[];
}

/**
 * Shop-specific routes for businesses with store capabilities
 * Includes products, categories, services, orders, discounts, and promotions
 */
export default function ShopRoutes({ businessRoles }: ShopRoutesProps) {
  const business = "/business";

  return (
    <Fragment>
      {/* Products */}
      <Route
        path={`${business}/store/products`}
        element={
          <ProtectedRoute requiredRoles={businessRoles}>
            <Products />
          </ProtectedRoute>
        }
      />

      {/* Categories */}
      <Route
        path={`${business}/store/categories`}
        element={
          <ProtectedRoute requiredRoles={businessRoles}>
            <Categories />
          </ProtectedRoute>
        }
      />

      {/* Services */}
      <Route
        path={`${business}/store/services`}
        element={
          <ProtectedRoute requiredRoles={businessRoles}>
            <Services />
          </ProtectedRoute>
        }
      />

      {/* Orders */}
      <Route
        path={`${business}/store/orders`}
        element={
          <ProtectedRoute requiredRoles={businessRoles}>
            <Orders />
          </ProtectedRoute>
        }
      />

      {/* Discount */}
      <Route
        path={`${business}/store/discount`}
        element={
          <ProtectedRoute requiredRoles={businessRoles}>
            <Discount />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${business}/store/discount/create`}
        element={
          <ProtectedRoute requiredRoles={businessRoles}>
            <DiscountForm />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${business}/store/discount/:id/edit`}
        element={
          <ProtectedRoute requiredRoles={businessRoles}>
            <DiscountForm />
          </ProtectedRoute>
        }
      />

      {/* Shop Settings */}
      <Route
        path={`${business}/store/settings`}
        element={
          <ProtectedRoute requiredRoles={businessRoles}>
            <ShopSettings />
          </ProtectedRoute>
        }
      />

      {/* Shop Promotion Form */}
      <Route
        path={`${business}/promotion/create`}
        element={
          <ProtectedRoute requiredRoles={businessRoles}>
            <PromotionForm />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${business}/promotion/:id/edit`}
        element={
          <ProtectedRoute requiredRoles={businessRoles}>
            <PromotionForm />
          </ProtectedRoute>
        }
      />
    </Fragment>
  );
}
