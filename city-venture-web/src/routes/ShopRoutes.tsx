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
 * 
 * RBAC: Uses permission-based access control instead of hardcoded role names
 */
export default function ShopRoutes({ businessRoles: _businessRoles }: ShopRoutesProps) {
  const business = "/business";

  return (
    <Fragment>
      {/* Products - requires product management permissions */}
      <Route
        path={`${business}/store/products`}
        element={
          <ProtectedRoute 
            requiredAnyPermissions={['view_products', 'create_products', 'update_products']}
          >
            <Products />
          </ProtectedRoute>
        }
      />

      {/* Categories - requires product management permissions */}
      <Route
        path={`${business}/store/categories`}
        element={
          <ProtectedRoute 
            requiredAnyPermissions={['view_products', 'create_products', 'update_products']}
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
            requiredAnyPermissions={['view_services', 'create_services', 'update_services']}
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
            requiredAnyPermissions={['view_orders', 'create_orders', 'update_orders']}
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
            requiredAnyPermissions={['manage_discounts', 'view_products']}
          >
            <Discount />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${business}/store/discount/create`}
        element={
          <ProtectedRoute 
            requiredAnyPermissions={['manage_discounts']}
          >
            <DiscountForm />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${business}/store/discount/:id/edit`}
        element={
          <ProtectedRoute 
            requiredAnyPermissions={['manage_discounts']}
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
            requiredAnyPermissions={['manage_business_settings']}
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
            requiredAnyPermissions={['manage_promotions']}
          >
            <PromotionForm />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${business}/promotion/:id/edit`}
        element={
          <ProtectedRoute 
            requiredAnyPermissions={['manage_promotions']}
          >
            <PromotionForm />
          </ProtectedRoute>
        }
      />
    </Fragment>
  );
}
