import { Route } from "react-router-dom";
import { Fragment } from "react";
import ProtectedRoute from "./ProtectedRoute";
import * as P from "@/src/constants/permissions";

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
 * 
 * RBAC: Uses permission-based access control from constants/permissions.ts
 */
export default function ShopRoutes({ businessRoles: _businessRoles }: ShopRoutesProps) {
  const business = "/business";

  return (
    <Fragment>
      {/* Products - requires shop management permissions */}
      <Route
        path={`${business}/store/products`}
        element={
          <ProtectedRoute 
            requiredAnyPermissions={[P.VIEW_SHOP, P.MANAGE_SHOP]}
          >
            <Products />
          </ProtectedRoute>
        }
      />

      {/* Categories - requires shop management permissions */}
      <Route
        path={`${business}/store/categories`}
        element={
          <ProtectedRoute 
            requiredAnyPermissions={[P.VIEW_SHOP, P.MANAGE_SHOP]}
          >
            <Categories />
          </ProtectedRoute>
        }
      />

      {/* Services - requires service management permissions */}
      <Route
        path={`${business}/store/services`}
        element={
          <ProtectedRoute 
            requiredAnyPermissions={[P.VIEW_SERVICES, P.MANAGE_BUSINESS_SERVICES]}
          >
            <Services />
          </ProtectedRoute>
        }
      />

      {/* Orders - requires order management permissions */}
      <Route
        path={`${business}/store/orders`}
        element={
          <ProtectedRoute 
            requiredAnyPermissions={[P.VIEW_ORDERS, P.MANAGE_ORDERS]}
          >
            <Orders />
          </ProtectedRoute>
        }
      />

      {/* Discount - requires discount management permission */}
      <Route
        path={`${business}/store/discount`}
        element={
          <ProtectedRoute 
            requiredAnyPermissions={[P.MANAGE_DISCOUNTS, P.VIEW_SHOP]}
          >
            <Discount />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${business}/store/discount/create`}
        element={
          <ProtectedRoute 
            requiredAnyPermissions={[P.MANAGE_DISCOUNTS]}
          >
            <DiscountForm />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${business}/store/discount/:id/edit`}
        element={
          <ProtectedRoute 
            requiredAnyPermissions={[P.MANAGE_DISCOUNTS]}
          >
            <DiscountForm />
          </ProtectedRoute>
        }
      />

      {/* Shop Settings - requires business settings permission */}
      <Route
        path={`${business}/store/settings`}
        element={
          <ProtectedRoute 
            requiredAnyPermissions={[P.MANAGE_BUSINESS_SETTINGS]}
          >
            <ShopSettings />
          </ProtectedRoute>
        }
      />

      {/* Shop Promotion Form - requires promotion management permission */}
      <Route
        path={`${business}/promotion/create`}
        element={
          <ProtectedRoute 
            requiredAnyPermissions={[P.MANAGE_PROMOTIONS]}
          >
            <PromotionForm />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${business}/promotion/:id/edit`}
        element={
          <ProtectedRoute 
            requiredAnyPermissions={[P.MANAGE_PROMOTIONS]}
          >
            <PromotionForm />
          </ProtectedRoute>
        }
      />
    </Fragment>
  );
}
