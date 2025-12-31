/**
 * Server Entry Point
 * Initializes and starts the HTTP server
 */
import { createServer } from 'http';
import app from './app.js';
import config from './config/config.js';
import logger from './config/logger.js';
import { testConnection } from './config/database.js';
import { setupGracefulShutdown } from './utils/graceful-shutdown.js';

// ANSI color helpers for console output
const COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m'
};

const colorUrl = (url) => `${COLORS.cyan}${url}${COLORS.reset}`;
const colorLabel = (label) => `${COLORS.dim}${label}${COLORS.reset}`;
const colorMethod = (method) => {
  const methodColors = {
    GET: '\x1b[32m',    // Green
    POST: '\x1b[33m',   // Yellow
    PUT: '\x1b[34m',    // Blue
    PATCH: '\x1b[35m',  // Magenta
    DELETE: '\x1b[31m'  // Red
  };
  return `${methodColors[method] || COLORS.reset}${method.padEnd(7)}${COLORS.reset}`;
};

/**
 * Extract all routes from Express app (Express 5 compatible)
 */
const extractRoutes = (expressApp) => {
  const routes = [];

  const parseRegexpPath = (regexp, keys = []) => {
    if (!regexp) return '';

    let path = regexp.source || regexp.toString();

    // Clean up the regexp to extract path
    path = path
      .replace(/^\^/, '')
      .replace(/\?\(\?=\\\/\|\$\)$/, '')
      .replace(/\(\?=\\\/\|\$\)$/, '')
      .replace(/\\\/\?\(\?=\\\/\|\$\)$/i, '')
      .replace(/\$$/, '')
      .replace(/\\\//g, '/')
      .replace(/\(\?:\(\[\^\\\/\]\+\?\)\)/g, ':param')
      .replace(/\(\[\^\\\/\]\+\?\)/g, ':param')
      .replace(/\(\[\^\/\]\+\?\)/g, ':param');

    // Replace with actual param names if keys are available
    if (keys && keys.length > 0) {
      let paramIndex = 0;
      path = path.replace(/:param/g, () => `:${keys[paramIndex++]?.name || 'param'}`);
    }

    return path || '';
  };

  const extractFromStack = (stack, basePath = '') => {
    if (!stack || !Array.isArray(stack)) return;

    for (const layer of stack) {
      try {
        if (layer.route) {
          // This layer has a route (direct endpoint)
          const methods = Object.keys(layer.route.methods)
            .filter((m) => layer.route.methods[m])
            .map((m) => m.toUpperCase());
          const routePath = layer.route.path || '';
          methods.forEach((method) => {
            routes.push({ method, path: basePath + routePath });
          });
        } else if (layer.handle && typeof layer.handle === 'function') {
          // Check if this is a router middleware
          if (layer.handle.stack) {
            // It's a router - extract path and recurse
            let layerPath = '';
            if (layer.regexp) {
              layerPath = parseRegexpPath(layer.regexp, layer.keys);
            }
            if (layer.path) {
              layerPath = layer.path;
            }
            extractFromStack(layer.handle.stack, basePath + layerPath);
          }
        }
      } catch {
        // Skip problematic layers
      }
    }
  };

  // Try to extract from Express app router
  try {
    if (expressApp && expressApp._router && expressApp._router.stack) {
      extractFromStack(expressApp._router.stack);
    }
  } catch {
    // Extraction failed
  }

  // Clean up and sort routes
  return routes
    .map((r) => ({
      ...r,
      path: (r.path || '/').replace(/\/+/g, '/').replace(/\/$/, '') || '/'
    }))
    .filter((r, i, arr) =>
      r.path && r.method &&
      arr.findIndex((x) => x.path === r.path && x.method === r.method) === i
    )
    .sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));
};

/**
 * Get predefined routes for display (Express 5 fallback)
 */
const getPredefinedRoutes = () => [
  // Health
  { method: 'GET', path: '/health' },
  { method: 'GET', path: '/health/db' },

  // Auth
  { method: 'POST', path: '/api/v1/auth/register' },
  { method: 'POST', path: '/api/v1/auth/login' },
  { method: 'POST', path: '/api/v1/auth/refresh' },
  { method: 'POST', path: '/api/v1/auth/logout' },
  { method: 'POST', path: '/api/v1/auth/verify-otp' },
  { method: 'POST', path: '/api/v1/auth/resend-otp' },
  { method: 'GET', path: '/api/v1/auth/me' },

  // Users
  { method: 'GET', path: '/api/v1/users' },
  { method: 'GET', path: '/api/v1/users/roles' },
  { method: 'GET', path: '/api/v1/users/role/:role_id' },
  { method: 'GET', path: '/api/v1/users/email/:email' },
  { method: 'GET', path: '/api/v1/users/:id' },
  { method: 'PUT', path: '/api/v1/users/:id' },
  { method: 'PATCH', path: '/api/v1/users/:id/status' },
  { method: 'DELETE', path: '/api/v1/users/:id' },

  // Businesses
  { method: 'GET', path: '/api/v1/businesses' },
  { method: 'POST', path: '/api/v1/businesses' },
  { method: 'GET', path: '/api/v1/businesses/owner/:id' },
  { method: 'GET', path: '/api/v1/businesses/approved' },
  { method: 'GET', path: '/api/v1/businesses/status/:status' },
  { method: 'GET', path: '/api/v1/businesses/:id' },
  { method: 'PUT', path: '/api/v1/businesses/:id' },
  { method: 'PATCH', path: '/api/v1/businesses/:id/status' },
  { method: 'DELETE', path: '/api/v1/businesses/:id' },

  // Business Settings
  { method: 'GET', path: '/api/v1/business-settings/:businessId' },
  { method: 'GET', path: '/api/v1/business-settings/:businessId/full' },
  { method: 'GET', path: '/api/v1/business-settings/:businessId/hours' },
  { method: 'GET', path: '/api/v1/business-settings/:businessId/policies' },
  { method: 'GET', path: '/api/v1/business-settings/:businessId/is-open' },
  { method: 'PUT', path: '/api/v1/business-settings/:businessId' },
  { method: 'PUT', path: '/api/v1/business-settings/:businessId/policies' },
  { method: 'PUT', path: '/api/v1/business-settings/:businessId/hours' },
  { method: 'PATCH', path: '/api/v1/business-settings/:businessId/hours/:day' },
  { method: 'POST', path: '/api/v1/business-settings/:businessId/initialize' },

  // Business Amenities
  { method: 'GET', path: '/api/v1/business-amenities' },
  { method: 'GET', path: '/api/v1/business-amenities/business/:businessId' },
  { method: 'GET', path: '/api/v1/business-amenities/:id' },
  { method: 'POST', path: '/api/v1/business-amenities' },
  { method: 'POST', path: '/api/v1/business-amenities/bulk' },
  { method: 'DELETE', path: '/api/v1/business-amenities/:id' },
  { method: 'DELETE', path: '/api/v1/business-amenities/business/:business_id/amenity/:amenity_id' },

  // Business Hours
  { method: 'GET', path: '/api/v1/business-hours/business/:businessId' },
  { method: 'GET', path: '/api/v1/business-hours/:id' },
  { method: 'POST', path: '/api/v1/business-hours' },
  { method: 'PUT', path: '/api/v1/business-hours/:id' },
  { method: 'DELETE', path: '/api/v1/business-hours/:id' },
  { method: 'DELETE', path: '/api/v1/business-hours/business/:businessId' },

  // Business Policies
  { method: 'GET', path: '/api/v1/business-policies/business/:businessId' },
  { method: 'PUT', path: '/api/v1/business-policies/business/:businessId' },
  { method: 'DELETE', path: '/api/v1/business-policies/business/:businessId' },

  // Bookings
  { method: 'GET', path: '/api/v1/bookings' },
  { method: 'GET', path: '/api/v1/bookings/room/:room_id' },
  { method: 'GET', path: '/api/v1/bookings/tourist/:tourist_id' },
  { method: 'GET', path: '/api/v1/bookings/business/:business_id' },
  { method: 'GET', path: '/api/v1/bookings/status/:status' },
  { method: 'GET', path: '/api/v1/bookings/available/:business_id' },
  { method: 'GET', path: '/api/v1/bookings/:id' },
  { method: 'POST', path: '/api/v1/bookings' },
  { method: 'PUT', path: '/api/v1/bookings/:id' },
  { method: 'PATCH', path: '/api/v1/bookings/:id/status' },
  { method: 'DELETE', path: '/api/v1/bookings/:id' },

  // External Bookings
  { method: 'GET', path: '/api/v1/external-bookings' },
  { method: 'GET', path: '/api/v1/external-bookings/:id' },
  { method: 'GET', path: '/api/v1/external-bookings/business/:businessId' },
  { method: 'GET', path: '/api/v1/external-bookings/room/:roomId' },
  { method: 'POST', path: '/api/v1/external-bookings' },
  { method: 'PUT', path: '/api/v1/external-bookings/:id' },
  { method: 'PATCH', path: '/api/v1/external-bookings/:id/status' },
  { method: 'DELETE', path: '/api/v1/external-bookings/:id' },

  // Rooms
  { method: 'GET', path: '/api/v1/rooms' },
  { method: 'GET', path: '/api/v1/rooms/business/:businessId' },
  { method: 'GET', path: '/api/v1/rooms/available/:businessId' },
  { method: 'GET', path: '/api/v1/rooms/:id' },
  { method: 'POST', path: '/api/v1/rooms' },
  { method: 'PUT', path: '/api/v1/rooms/:id' },
  { method: 'PATCH', path: '/api/v1/rooms/:id/status' },
  { method: 'DELETE', path: '/api/v1/rooms/:id' },

  // Room Amenities
  { method: 'GET', path: '/api/v1/room-amenities' },
  { method: 'GET', path: '/api/v1/room-amenities/room/:roomId' },
  { method: 'GET', path: '/api/v1/room-amenities/:id' },
  { method: 'POST', path: '/api/v1/room-amenities' },
  { method: 'POST', path: '/api/v1/room-amenities/bulk' },
  { method: 'DELETE', path: '/api/v1/room-amenities/:id' },
  { method: 'DELETE', path: '/api/v1/room-amenities/room/:room_id/amenity/:amenity_id' },

  // Room Photos
  { method: 'GET', path: '/api/v1/room-photos/room/:roomId' },
  { method: 'GET', path: '/api/v1/room-photos/:id' },
  { method: 'POST', path: '/api/v1/room-photos' },
  { method: 'POST', path: '/api/v1/room-photos/bulk' },
  { method: 'PUT', path: '/api/v1/room-photos/:id' },
  { method: 'PATCH', path: '/api/v1/room-photos/:id/primary' },
  { method: 'DELETE', path: '/api/v1/room-photos/:id' },
  { method: 'DELETE', path: '/api/v1/room-photos/room/:roomId' },

  // Room Blocked Dates
  { method: 'GET', path: '/api/v1/room-blocked-dates' },
  { method: 'GET', path: '/api/v1/room-blocked-dates/:id' },
  { method: 'GET', path: '/api/v1/room-blocked-dates/room/:roomId' },
  { method: 'GET', path: '/api/v1/room-blocked-dates/business/:businessId' },
  { method: 'GET', path: '/api/v1/room-blocked-dates/room/:roomId/range' },
  { method: 'GET', path: '/api/v1/room-blocked-dates/room/:roomId/availability' },
  { method: 'POST', path: '/api/v1/room-blocked-dates' },
  { method: 'PUT', path: '/api/v1/room-blocked-dates/:id' },
  { method: 'DELETE', path: '/api/v1/room-blocked-dates/:id' },

  // Seasonal Pricing
  { method: 'GET', path: '/api/v1/seasonal-pricing' },
  { method: 'GET', path: '/api/v1/seasonal-pricing/:id' },
  { method: 'GET', path: '/api/v1/seasonal-pricing/business/:businessId' },
  { method: 'GET', path: '/api/v1/seasonal-pricing/room/:roomId' },
  { method: 'GET', path: '/api/v1/seasonal-pricing/room/:roomId/calculate' },
  { method: 'GET', path: '/api/v1/seasonal-pricing/room/:roomId/calculate-range' },
  { method: 'POST', path: '/api/v1/seasonal-pricing' },
  { method: 'PUT', path: '/api/v1/seasonal-pricing/:id' },
  { method: 'DELETE', path: '/api/v1/seasonal-pricing/:id' },

  // Products
  { method: 'GET', path: '/api/v1/products/business/:businessId' },
  { method: 'GET', path: '/api/v1/products/business/:businessId/best-sellers' },
  { method: 'GET', path: '/api/v1/products/:id' },
  { method: 'GET', path: '/api/v1/products/:id/availability' },
  { method: 'GET', path: '/api/v1/products/low-stock' },
  { method: 'POST', path: '/api/v1/products' },
  { method: 'PATCH', path: '/api/v1/products/:id' },
  { method: 'PATCH', path: '/api/v1/products/:id/stock' },
  { method: 'DELETE', path: '/api/v1/products/:id' },

  // Services
  { method: 'GET', path: '/api/v1/services/business/:businessId' },
  { method: 'GET', path: '/api/v1/services/:id' },
  { method: 'POST', path: '/api/v1/services' },
  { method: 'PATCH', path: '/api/v1/services/:id' },
  { method: 'DELETE', path: '/api/v1/services/:id' },
  { method: 'POST', path: '/api/v1/services/:id/inquiries' },
  { method: 'GET', path: '/api/v1/services/:id/inquiries' },
  { method: 'GET', path: '/api/v1/services/business/:businessId/inquiries' },
  { method: 'PATCH', path: '/api/v1/services/inquiries/:inquiryId/status' },

  // Shop Categories
  { method: 'GET', path: '/api/v1/shop-categories/business/:businessId' },
  { method: 'GET', path: '/api/v1/shop-categories/business/:businessId/with-counts' },
  { method: 'GET', path: '/api/v1/shop-categories/:id' },
  { method: 'POST', path: '/api/v1/shop-categories' },
  { method: 'PATCH', path: '/api/v1/shop-categories/:id' },
  { method: 'DELETE', path: '/api/v1/shop-categories/:id' },
  { method: 'POST', path: '/api/v1/shop-categories/business/:businessId/reorder' },

  // Service Inquiries
  { method: 'POST', path: '/api/v1/service-inquiries' },
  { method: 'GET', path: '/api/v1/service-inquiries/user' },
  { method: 'GET', path: '/api/v1/service-inquiries/:id' },
  { method: 'GET', path: '/api/v1/service-inquiries' },
  { method: 'GET', path: '/api/v1/service-inquiries/business/:businessId' },
  { method: 'GET', path: '/api/v1/service-inquiries/service/:serviceId' },
  { method: 'PATCH', path: '/api/v1/service-inquiries/:id/status' },
  { method: 'PATCH', path: '/api/v1/service-inquiries/:id/viewed' },
  { method: 'POST', path: '/api/v1/service-inquiries/:id/respond' },
  { method: 'DELETE', path: '/api/v1/service-inquiries/:id' },

  // Product Reviews
  { method: 'GET', path: '/api/v1/product-reviews' },
  { method: 'GET', path: '/api/v1/product-reviews/product/:productId' },
  { method: 'GET', path: '/api/v1/product-reviews/product/:productId/summary' },
  { method: 'GET', path: '/api/v1/product-reviews/:id' },
  { method: 'GET', path: '/api/v1/product-reviews/user/:userId' },
  { method: 'POST', path: '/api/v1/product-reviews' },
  { method: 'PUT', path: '/api/v1/product-reviews/:id' },
  { method: 'DELETE', path: '/api/v1/product-reviews/:id' },

  // Orders
  { method: 'GET', path: '/api/v1/orders' },
  { method: 'GET', path: '/api/v1/orders/business/:businessId' },
  { method: 'GET', path: '/api/v1/orders/business/:businessId/stats' },
  { method: 'GET', path: '/api/v1/orders/:id' },
  { method: 'GET', path: '/api/v1/orders/number/:orderNumber' },
  { method: 'POST', path: '/api/v1/orders' },
  { method: 'PATCH', path: '/api/v1/orders/:id/status' },
  { method: 'POST', path: '/api/v1/orders/:id/cancel' },
  { method: 'POST', path: '/api/v1/orders/:id/validate-arrival' },
  { method: 'POST', path: '/api/v1/orders/:id/complete' },

  // Payments
  { method: 'POST', path: '/api/v1/payments/webhook' },
  { method: 'GET', path: '/api/v1/payments' },
  { method: 'GET', path: '/api/v1/payments/stats' },
  { method: 'GET', path: '/api/v1/payments/:id' },
  { method: 'POST', path: '/api/v1/payments' },
  { method: 'PATCH', path: '/api/v1/payments/:id/status' },
  { method: 'POST', path: '/api/v1/payments/:id/refund' },
  { method: 'GET', path: '/api/v1/payments/refunds/:refundId' },
  { method: 'PATCH', path: '/api/v1/payments/refunds/:refundId/status' },
  { method: 'POST', path: '/api/v1/payments/expire-pending' },

  // Discounts
  { method: 'GET', path: '/api/v1/discounts/business/:businessId/active' },
  { method: 'POST', path: '/api/v1/discounts/validate' },
  { method: 'POST', path: '/api/v1/discounts/apply' },
  { method: 'GET', path: '/api/v1/discounts/business/:businessId' },
  { method: 'GET', path: '/api/v1/discounts/:id' },
  { method: 'POST', path: '/api/v1/discounts' },
  { method: 'PATCH', path: '/api/v1/discounts/:id' },
  { method: 'PATCH', path: '/api/v1/discounts/:id/toggle' },
  { method: 'DELETE', path: '/api/v1/discounts/:id' },

  // Refunds
  { method: 'GET', path: '/api/v1/refunds' },
  { method: 'GET', path: '/api/v1/refunds/:id' },
  { method: 'GET', path: '/api/v1/refunds/payment/:paymentId' },
  { method: 'GET', path: '/api/v1/refunds/user/:userId' },
  { method: 'POST', path: '/api/v1/refunds' },
  { method: 'POST', path: '/api/v1/refunds/:id/cancel' },
  { method: 'POST', path: '/api/v1/refunds/:id/process' },

  // Reviews
  { method: 'GET', path: '/api/v1/reviews/business/:businessId' },
  { method: 'GET', path: '/api/v1/reviews/business/:businessId/rating' },
  { method: 'GET', path: '/api/v1/reviews/:id' },
  { method: 'GET', path: '/api/v1/reviews/my-reviews' },
  { method: 'POST', path: '/api/v1/reviews' },
  { method: 'PATCH', path: '/api/v1/reviews/:id' },
  { method: 'DELETE', path: '/api/v1/reviews/:id' },
  { method: 'POST', path: '/api/v1/reviews/:id/reply' },
  { method: 'POST', path: '/api/v1/reviews/:id/photos' },

  // Favorites
  { method: 'GET', path: '/api/v1/favorites' },
  { method: 'GET', path: '/api/v1/favorites/type/:type' },
  { method: 'GET', path: '/api/v1/favorites/check' },
  { method: 'GET', path: '/api/v1/favorites/count' },
  { method: 'POST', path: '/api/v1/favorites' },
  { method: 'POST', path: '/api/v1/favorites/toggle' },
  { method: 'DELETE', path: '/api/v1/favorites' },
  { method: 'DELETE', path: '/api/v1/favorites/clear' },

  // Replies
  { method: 'GET', path: '/api/v1/replies/review/:reviewId' },
  { method: 'GET', path: '/api/v1/replies/:id' },
  { method: 'POST', path: '/api/v1/replies' },
  { method: 'PUT', path: '/api/v1/replies/:id' },
  { method: 'DELETE', path: '/api/v1/replies/:id' },
  { method: 'GET', path: '/api/v1/replies/user/:userId' },

  // Review Photos
  { method: 'GET', path: '/api/v1/review-photos/review/:reviewId' },
  { method: 'GET', path: '/api/v1/review-photos/:id' },
  { method: 'POST', path: '/api/v1/review-photos' },
  { method: 'POST', path: '/api/v1/review-photos/bulk' },
  { method: 'PUT', path: '/api/v1/review-photos/:id' },
  { method: 'DELETE', path: '/api/v1/review-photos/:id' },
  { method: 'DELETE', path: '/api/v1/review-photos/review/:reviewId' },

  // Staff
  { method: 'GET', path: '/api/v1/staff/my-profile' },
  { method: 'GET', path: '/api/v1/staff/business/:businessId' },
  { method: 'GET', path: '/api/v1/staff/business/:businessId/count' },
  { method: 'GET', path: '/api/v1/staff/:id' },
  { method: 'POST', path: '/api/v1/staff' },
  { method: 'POST', path: '/api/v1/staff/invite' },
  { method: 'PATCH', path: '/api/v1/staff/:id' },
  { method: 'PATCH', path: '/api/v1/staff/:id/status' },
  { method: 'DELETE', path: '/api/v1/staff/:id' },

  // Notifications
  { method: 'GET', path: '/api/v1/notifications' },
  { method: 'GET', path: '/api/v1/notifications/unread-count' },
  { method: 'GET', path: '/api/v1/notifications/preferences' },
  { method: 'PUT', path: '/api/v1/notifications/preferences' },
  { method: 'PATCH', path: '/api/v1/notifications/:id/read' },
  { method: 'PATCH', path: '/api/v1/notifications/read-all' },
  { method: 'DELETE', path: '/api/v1/notifications/:id' },
  { method: 'POST', path: '/api/v1/notifications/test' },

  // Notification Preferences
  { method: 'GET', path: '/api/v1/notification-preferences/me' },
  { method: 'PUT', path: '/api/v1/notification-preferences/me' },
  { method: 'POST', path: '/api/v1/notification-preferences/push-token' },
  { method: 'DELETE', path: '/api/v1/notification-preferences/push-token' },
  { method: 'DELETE', path: '/api/v1/notification-preferences/me' },
  { method: 'GET', path: '/api/v1/notification-preferences/user/:userId' },
  { method: 'GET', path: '/api/v1/notification-preferences/user/:userId/push-token' },

  // Tourist Spots
  { method: 'GET', path: '/api/v1/tourist-spots' },
  { method: 'GET', path: '/api/v1/tourist-spots/featured' },
  { method: 'GET', path: '/api/v1/tourist-spots/category/:category' },
  { method: 'GET', path: '/api/v1/tourist-spots/:id' },
  { method: 'POST', path: '/api/v1/tourist-spots' },
  { method: 'PATCH', path: '/api/v1/tourist-spots/:id' },
  { method: 'PATCH', path: '/api/v1/tourist-spots/:id/status' },
  { method: 'PATCH', path: '/api/v1/tourist-spots/:id/schedule' },
  { method: 'DELETE', path: '/api/v1/tourist-spots/:id' },
  { method: 'POST', path: '/api/v1/tourist-spots/:id/images' },
  { method: 'DELETE', path: '/api/v1/tourist-spots/:id/images/:imageId' },

  // Events
  { method: 'GET', path: '/api/v1/events' },
  { method: 'GET', path: '/api/v1/events/upcoming' },
  { method: 'GET', path: '/api/v1/events/featured' },
  { method: 'GET', path: '/api/v1/events/date-range' },
  { method: 'GET', path: '/api/v1/events/:id' },
  { method: 'POST', path: '/api/v1/events' },
  { method: 'PATCH', path: '/api/v1/events/:id' },
  { method: 'PATCH', path: '/api/v1/events/:id/status' },
  { method: 'DELETE', path: '/api/v1/events/:id' },

  // Approvals
  { method: 'GET', path: '/api/v1/approvals/pending' },
  { method: 'GET', path: '/api/v1/approvals/:id' },
  { method: 'GET', path: '/api/v1/approvals/:entityType/:entityId' },
  { method: 'POST', path: '/api/v1/approvals/:entityType/:entityId/approve' },
  { method: 'POST', path: '/api/v1/approvals/:entityType/:entityId/reject' },
  { method: 'POST', path: '/api/v1/approvals/:entityType/:entityId/request-changes' },

  // Reports
  { method: 'GET', path: '/api/v1/reports' },
  { method: 'GET', path: '/api/v1/reports/stats' },
  { method: 'GET', path: '/api/v1/reports/my-reports' },
  { method: 'GET', path: '/api/v1/reports/target/:targetType/:targetId' },
  { method: 'GET', path: '/api/v1/reports/:id' },
  { method: 'POST', path: '/api/v1/reports' },
  { method: 'PATCH', path: '/api/v1/reports/:id/status' },
  { method: 'POST', path: '/api/v1/reports/:id/attachments' },

  // Permits
  { method: 'GET', path: '/api/v1/permits' },
  { method: 'GET', path: '/api/v1/permits/expiring' },
  { method: 'GET', path: '/api/v1/permits/expired' },
  { method: 'GET', path: '/api/v1/permits/business/:businessId' },
  { method: 'GET', path: '/api/v1/permits/:id' },
  { method: 'POST', path: '/api/v1/permits' },
  { method: 'PATCH', path: '/api/v1/permits/:id' },
  { method: 'PATCH', path: '/api/v1/permits/:id/status' },
  { method: 'DELETE', path: '/api/v1/permits/:id' },
  { method: 'POST', path: '/api/v1/permits/check-expired' },

  // Promotions
  { method: 'GET', path: '/api/v1/promotions/featured' },
  { method: 'GET', path: '/api/v1/promotions/business/:businessId/active' },
  { method: 'GET', path: '/api/v1/promotions/:id' },
  { method: 'GET', path: '/api/v1/promotions/business/:businessId' },
  { method: 'POST', path: '/api/v1/promotions' },
  { method: 'PATCH', path: '/api/v1/promotions/:id' },
  { method: 'PATCH', path: '/api/v1/promotions/:id/toggle' },
  { method: 'DELETE', path: '/api/v1/promotions/:id' },

  // Addresses
  { method: 'GET', path: '/api/v1/addresses/provinces' },
  { method: 'GET', path: '/api/v1/addresses/provinces/:id' },
  { method: 'GET', path: '/api/v1/addresses/provinces/:id/municipalities' },
  { method: 'GET', path: '/api/v1/addresses/municipalities' },
  { method: 'GET', path: '/api/v1/addresses/municipalities/:id' },
  { method: 'GET', path: '/api/v1/addresses/municipalities/:id/barangays' },
  { method: 'GET', path: '/api/v1/addresses/barangays' },
  { method: 'GET', path: '/api/v1/addresses/barangays/:id' },
  { method: 'GET', path: '/api/v1/addresses/barangays/:id/full-address' },

  // Amenities
  { method: 'GET', path: '/api/v1/amenities' },
  { method: 'GET', path: '/api/v1/amenities/:id' },
  { method: 'POST', path: '/api/v1/amenities' },
  { method: 'PUT', path: '/api/v1/amenities/:id' },
  { method: 'DELETE', path: '/api/v1/amenities/:id' },

  // Categories
  { method: 'GET', path: '/api/v1/categories' },
  { method: 'GET', path: '/api/v1/categories/tree' },
  { method: 'GET', path: '/api/v1/categories/type/:type' },
  { method: 'GET', path: '/api/v1/categories/business-types' },
  { method: 'GET', path: '/api/v1/categories/business-categories' },
  { method: 'GET', path: '/api/v1/categories/parent/:parentId' },
  { method: 'GET', path: '/api/v1/categories/:id' },
  { method: 'POST', path: '/api/v1/categories' },
  { method: 'PUT', path: '/api/v1/categories/:id' },
  { method: 'DELETE', path: '/api/v1/categories/:id' },

  // App Legal Policies
  { method: 'GET', path: '/api/v1/app-legal-policies' },
  { method: 'GET', path: '/api/v1/app-legal-policies/history' },
  { method: 'GET', path: '/api/v1/app-legal-policies/version/:version' },
  { method: 'PUT', path: '/api/v1/app-legal-policies' },

  // Roles
  { method: 'GET', path: '/api/v1/roles' },
  { method: 'GET', path: '/api/v1/roles/:id' },
  { method: 'GET', path: '/api/v1/roles/name/:name' },
  { method: 'GET', path: '/api/v1/roles/:id/permissions' },
  { method: 'POST', path: '/api/v1/roles' },
  { method: 'PUT', path: '/api/v1/roles/:id' },
  { method: 'PUT', path: '/api/v1/roles/:id/permissions' },
  { method: 'DELETE', path: '/api/v1/roles/:id' },

  // Permissions
  { method: 'GET', path: '/api/v1/permissions' },
  { method: 'GET', path: '/api/v1/permissions/categories' },
  { method: 'GET', path: '/api/v1/permissions/category/:category' },
  { method: 'GET', path: '/api/v1/permissions/:id' },
  { method: 'POST', path: '/api/v1/permissions' },
  { method: 'PUT', path: '/api/v1/permissions/:id' },
  { method: 'DELETE', path: '/api/v1/permissions/:id' },
  { method: 'GET', path: '/api/v1/permissions/role/:roleId' },
  { method: 'POST', path: '/api/v1/permissions/role' },
  { method: 'POST', path: '/api/v1/permissions/role/bulk' },
  { method: 'DELETE', path: '/api/v1/permissions/role/:role_id/permission/:permission_id' },
];

/**
 * Print server startup information
 */
const printStartupInfo = (port, app) => {
  const divider = '═'.repeat(60);
  const thinDivider = '─'.repeat(60);

  console.log(`\n${COLORS.green}${divider}${COLORS.reset}`);
  console.log(`${COLORS.bold}  🚀 CityVenture API Server${COLORS.reset}`);
  console.log(`${COLORS.green}${divider}${COLORS.reset}\n`);

  console.log(`  ${colorLabel('Environment:')}  ${COLORS.yellow}${config.env}${COLORS.reset}`);
  console.log(`  ${colorLabel('Port:')}         ${COLORS.cyan}${port}${COLORS.reset}`);
  console.log(`  ${colorLabel('Node:')}         ${process.version}`);
  console.log(`  ${colorLabel('Base URL:')}     ${colorUrl(`http://localhost:${port}`)}`);
  console.log();

  // Extract and display all routes
  let routes = extractRoutes(app);

  // Fallback to predefined routes if extraction fails
  if (routes.length === 0) {
    routes = getPredefinedRoutes();
  }

  console.log(`  ${COLORS.bold}📍 Registered Routes (${routes.length}):${COLORS.reset}`);
  console.log(`  ${COLORS.dim}${thinDivider}${COLORS.reset}`);

  // Group routes by base path
  const groupedRoutes = {};
  routes.forEach(({ method, path }) => {
    const basePath = path.split('/').slice(0, 4).join('/') || '/';
    if (!groupedRoutes[basePath]) {
      groupedRoutes[basePath] = [];
    }
    groupedRoutes[basePath].push({ method, path });
  });

  Object.keys(groupedRoutes).sort().forEach((group) => {
    console.log(`\n  ${COLORS.bold}${COLORS.blue}${group}${COLORS.reset}`);
    groupedRoutes[group].forEach(({ method, path }) => {
      console.log(`    ${colorMethod(method)} ${path}`);
    });
  });

  console.log(`\n${COLORS.green}${divider}${COLORS.reset}\n`);
};

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Create HTTP server
    const httpServer = createServer(app);

    // Setup graceful shutdown
    setupGracefulShutdown(httpServer);

    // Start listening
    const port = config.port;

    httpServer.listen(port, () => {
      printStartupInfo(port, app);
      logger.info(`Server started on port ${port}`);
    });

    // Handle server errors
    httpServer.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${port} is already in use`);
        process.exit(1);
      }
      throw error;
    });

    return httpServer;
  } catch (error) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();

export default startServer;
