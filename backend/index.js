import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { createServer } from "http";
import { initializeSocket } from "./services/socketService.js";
import { startTokenCleanupScheduler } from "./services/tokenCleanupService.js";
import {
  startAbandonedOrderCleanupScheduler,
  stopAbandonedOrderCleanupScheduler,
} from "./services/abandonedOrderCleanupService.js";
import * as webhookQueueService from "./services/webhookQueueService.js";
import { registerProcessor } from "./services/webhookProcessor.js";
import db from "./db.js";

import userRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";
import userRoleRoutes from "./routes/users_role.js";
import rolesRoutes from "./routes/roles.js";

import registrationRoutes from "./routes/registration.js";

import businessRoutes from "./routes/business.js";
import businessHoursRoutes from "./routes/business_hours.js";
import addressRoutes from "./routes/address.js";
import touristRoutes from "./routes/tourist.js";
import tourismRoutes from "./routes/tourism.js";
import categoryAndTypeRoutes from "./routes/category_and_type.js";
import ownerRoutes from "./routes/owner.js";
import externalBookingRoutes from "./routes/external_booking.js";
import touristSpotRoutes from "./routes/tourist_spot.js";
import approvalRoutes from "./routes/approval.js";
import amenityRoutes from "./routes/amenity.js";
import permitRoutes from "./routes/permit.js";
import roomRoutes from "./routes/room.js";
import reportRoutes from "./routes/report.js";
import roomAmenityRoutes from "./routes/room_amenities.js";
import businessAmenityRoutes from "./routes/business_amenities.js";
import bookingRoutes from "./routes/booking.js";
import paymentRoutes from "./routes/payment.js";
import staffRoutes from "./routes/staff.js";
import permissionRoutes from "./routes/permission.js";

// New Product/Service Management Routes
import productRoutes from "./routes/products.js";
import discountRoutes from "./routes/discounts.js";
import promotionRoutes from "./routes/promotions.js";
import serviceRoutes from "./routes/services.js";
import serviceInquiryRoutes from "./routes/service-inquiries.js";
import orderRoutes from "./routes/orders.js";
import productReviewRoutes from "./routes/product-reviews.js";
import notificationRoutes from "./routes/notifications.js";
import notificationPreferencesRoutes from "./routes/notificationPreferences.js";
import businessSettingsRoutes from "./routes/business-settings.js";
import businessPoliciesRoutes from "./routes/business-policies.js";
import appLegalPoliciesRoutes from "./routes/app-legal-policies.js";
import shopCategoryRoutes from "./routes/shop-categories.js";
import feedbackReviewRoutes from "./routes/feedback-reviews.js";
import feedbackReplyRoutes from "./routes/feedback-replies.js";
import feedbackReviewPhotoRoutes from "./routes/feedback-review-photos.js";
import roomPhotosRoutes from "./routes/room-photos.js";
import tourismStaffManagementRoutes from "./routes/tourism_staff_management.js";
import favoriteRoutes from "./routes/favorite.js";
import refundRoutes from "./routes/refunds.js";
import roomBlockedDatesRoutes from "./routes/room-blocked-dates.js";
import seasonalPricingRoutes from "./routes/seasonal-pricing.js";
import emergencyFacilitiesRoutes from "./routes/emergency-facilities.js";
import eventRoutes from "./routes/event.js";

const app = express();
const PORT = 3000;

// Create HTTP server for Socket.IO
const httpServer = createServer(app);

// Initialize Socket.IO
const io = initializeSocket(httpServer);

// Make io available to routes via app.locals
app.locals.io = io;

// Redirect bases for PayMongo payment return URLs
const FRONTEND_BASE_URL = (
  process.env.FRONTEND_BASE_URL || "http://localhost:5173"
).replace(/\/$/, "");
const MOBILE_DEEP_LINK_BASE = (
  process.env.MOBILE_DEEP_LINK_BASE || "cityventure://orders"
).replace(/\/$/, "");

// Simple ANSI color helpers (no external dependency needed)
const COLORS = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  magenta: "\x1b[35m",
  blue: "\x1b[34m",
};
const colorUrl = (url) => `${COLORS.cyan}${url}${COLORS.reset}`;
const colorLabel = (label) => `${COLORS.dim}${label}${COLORS.reset}`;
const colorSection = (title) =>
  `${COLORS.magenta}${COLORS.bold}${title}${COLORS.reset}`;
const colorServer = (text) => `${COLORS.green}${text}${COLORS.reset}`;

// Route sections for clearer organization & logging
// Each route can optionally include a 'label' to show a friendlier name in logs.
const routeSections = [
  {
    section: "Auth & Users",
    routes: [
      { path: "/api/auth", handler: authRoutes, label: "Authentication" },
      { path: "/api/user-roles", handler: userRoleRoutes, label: "User Roles" },
      { path: "/api/users", handler: userRoutes, label: "Users" },
      { path: "/api/owner", handler: ownerRoutes, label: "Owners" },
      { path: "/api/tourism", handler: tourismRoutes, label: "Tourism" },
      {
        path: "/api/tourism-staff",
        handler: tourismStaffManagementRoutes,
        label: "Tourism Staff (Admin)",
      },
      { path: "/api/tourist", handler: touristRoutes, label: "Tourists" },
      { path: "/api/staff", handler: staffRoutes, label: "Staff" },
      {
        path: "/api/permissions",
        handler: permissionRoutes,
        label: "Permissions & Role Permissions",
      },
      {
        path: "/api/roles",
        handler: rolesRoutes,
        label: "Role Management (Enhanced RBAC)",
      },
    ],
  },
  {
    section: "Business Core",
    routes: [
      { path: "/api/business", handler: businessRoutes, label: "Businesses" },
      {
        path: "/api/registration",
        handler: registrationRoutes,
        label: "Business Registrations",
      },
      { path: "/api/address", handler: addressRoutes, label: "Addresses" },
      {
        path: "/api/business-hours",
        handler: businessHoursRoutes,
        label: "Business Hours",
      },
      {
        path: "/api/category-and-type",
        handler: categoryAndTypeRoutes,
        label: "Categories & Types",
      },
      { path: "/api/amenities", handler: amenityRoutes, label: "Amenities" },
      {
        path: "/api/business-amenities",
        handler: businessAmenityRoutes,
        label: "Business Amenities",
      },
      { path: "/api/room", handler: roomRoutes, label: "Rooms" },
      {
        path: "/api/room-amenities",
        handler: roomAmenityRoutes,
        label: "Room Amenities",
      },
      {
        path: "/api/room-photos",
        handler: roomPhotosRoutes,
        label: "Room Photos",
      },
      { path: "/api/permit", handler: permitRoutes, label: "Permits" },
    ],
  },
  {
    section: "Tourism & Spots",
    routes: [
      {
        path: "/api/tourist-spots",
        handler: touristSpotRoutes,
        label: "Tourist Spots",
      },
      {
        path: "/api/events",
        handler: eventRoutes,
        label: "Events",
      },
      { path: "/api/reports", handler: reportRoutes, label: "Reports" },
      {
        path: "/api/approval",
        handler: approvalRoutes,
        label: "Approval Workflow",
      },
      {
        path: "/api/emergency-facilities",
        handler: emergencyFacilitiesRoutes,
        label: "Emergency Facilities",
      },
    ],
  },
  {
    section: "Bookings & Stay",
    routes: [
      { path: "/api/booking", handler: bookingRoutes, label: "Bookings" },
      {
        path: "/api/external-booking",
        handler: externalBookingRoutes,
        label: "External Booking",
      },
      { path: "/api/payment", handler: paymentRoutes, label: "Payments" },
      { path: "/api/refunds", handler: refundRoutes, label: "Refunds" },
      {
        path: "/api/room-blocked-dates",
        handler: roomBlockedDatesRoutes,
        label: "Room Blocked Dates",
      },
      {
        path: "/api/seasonal-pricing",
        handler: seasonalPricingRoutes,
        label: "Seasonal Pricing",
      },
      // REMOVED: { path: "/api/payments", handler: paymentRoutes } - duplicate route removed per ORDERING_SYSTEM_AUDIT.md Phase 1
    ],
  },
  {
    section: "Commerce (Products & Services)",
    routes: [
      {
        path: "/api/shop-categories",
        handler: shopCategoryRoutes,
        label: "Shop Categories (Unified)",
      },
      { path: "/api/products", handler: productRoutes, label: "Products" },
      { path: "/api/discounts", handler: discountRoutes, label: "Discounts" },
      {
        path: "/api/promotions",
        handler: promotionRoutes,
        label: "Promotions",
      },
      {
        path: "/api/services",
        handler: serviceRoutes,
        label: "Services (Display Only)",
      },
      {
        path: "/api/service-inquiries",
        handler: serviceInquiryRoutes,
        label: "Service Inquiries",
      },
      { path: "/api/orders", handler: orderRoutes, label: "Orders" },
      {
        path: "/api/product-reviews",
        handler: productReviewRoutes,
        label: "Product Reviews",
      },
      {
        path: "/api/notifications",
        handler: notificationRoutes,
        label: "Notifications",
      },
      {
        path: "/api/notification-preferences",
        handler: notificationPreferencesRoutes,
        label: "Notification Preferences & Push Tokens",
      },
      {
        path: "/api/business-settings",
        handler: businessSettingsRoutes,
        label: "Business Settings",
      },
      {
        path: "/api/business-policies",
        handler: businessPoliciesRoutes,
        label: "Business Policies & House Rules",
      },
      {
        path: "/api/app-legal-policies",
        handler: appLegalPoliciesRoutes,
        label: "App Legal Policies (Terms & Privacy)",
      },
    ],
  },
  {
    section: "Feedback & Reviews",
    routes: [
      {
        path: "/api/reviews",
        handler: feedbackReviewRoutes,
        label: "Reviews (Generic)",
      },
      { path: "/api/replies", handler: feedbackReplyRoutes, label: "Replies" },
      {
        path: "/api/review-photos",
        handler: feedbackReviewPhotoRoutes,
        label: "Review Photos",
      },
      { path: "/api/favorite", handler: favoriteRoutes, label: "Favorites" },
    ],
  },

];

// Flattened list for registration
const routes = routeSections.flatMap((s) => s.routes);

// CORS configuration for authentication with credentials
const isProduction = process.env.NODE_ENV === "production";

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // List of allowed origins
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:3000",
        process.env.WEB_URL,
        process.env.FRONTEND_URL,
        process.env.FRONTEND_BASE_URL,
      ].filter(Boolean); // Remove undefined values

      if (allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        // SECURITY: In production, reject unknown origins. In development, allow with warning.
        if (isProduction) {
          callback(
            new Error(`Origin ${origin} not allowed by CORS policy`),
            false
          );
        } else {
          console.warn(
            "  ⚠️  Allowing for development - this would be blocked in production"
          );
          callback(null, true);
        }
      }
    },
    credentials: true, // Allow cookies to be sent/received
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"], // Expose Set-Cookie header for cross-origin
  })
);
app.use(cookieParser());

// Raw body parser for webhook signature verification
// Must come BEFORE express.json() to capture raw body
["/api/payment/webhook", "/api/payment/webhook"].forEach((path) => {
  app.use(path, express.raw({ type: "application/json" }), (req, res, next) => {
    req.rawBody = req.body.toString("utf8");
    next();
  });
});

app.use(express.json());

// Register routes dynamically
routes.forEach((route) => {
  app.use(route.path, route.handler);
});

// PayMongo redirect bridge:
// PayMongo requires http/https URLs, but the mobile app expects a custom scheme (cityventure://...).
// These handlers take the web redirect and bounce users back into the app, with a web fallback.
const sendPaymongoRedirect = (res, referenceId, status, type = "order") => {
  // Support both Expo Go (exp://) and production builds (cityventure://)
  const isExpoDev = process.env.EXPO_DEV === "true";
  const expoHost = process.env.EXPO_DEV_HOST || "192.168.1.1:8081";

  // Determine route path and query param based on type (order vs booking)
  // Route paths must match Expo Router file-based routes
  const isBooking = type === "booking";
  // Orders use /(checkout)/payment-success at root level
  // Bookings use /(tabs)/(home)/(accommodation)/room/booking-success
  const routePath = isBooking
    ? "(tabs)/(home)/(accommodation)/room/booking"
    : "(checkout)/payment";
  const queryParam = isBooking
    ? `paymentSuccess=1&bookingId=${referenceId}`
    : `orderId=${referenceId}`;


  // Expo Go deep link format: exp://HOST:PORT/--/path
  // For Expo Router, the path should match the file-based route
  let appUrl;
  if (isExpoDev) {
    // Expo Go format - use query params for data
    appUrl = `exp://${expoHost}/--/${routePath}-${status}?${queryParam}`;
  } else {
    // Production build with custom scheme
    appUrl = `cityventure://${routePath}-${status}?${queryParam}`;
  }

  console.log(
    `[PayMongo Redirect] type: ${type}, isExpoDev: ${isExpoDev}, appUrl: ${appUrl}`
  );

  const webFallback = isBooking
    ? `${FRONTEND_BASE_URL}/bookings/${referenceId}/payment-${status}`
    : `${FRONTEND_BASE_URL}/orders/${referenceId}/payment-${status}`;

  // Prevent caching to avoid redirect loops
  res.set({
    "Content-Type": "text/html",
    "Cache-Control": "no-store, no-cache, must-revalidate, private",
    Pragma: "no-cache",
    Expires: "0",
  });

  res.send(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Payment ${status === "success" ? "Successful" : "Cancelled"}</title>
  </head>
  <body style="font-family: sans-serif; text-align: center; padding: 24px;">
    <h1>Payment ${status === "success" ? "Successful! ✅" : "Cancelled ❌"}</h1>
    <p>Redirecting to app...</p>
    <p><a href="${appUrl}">Click here if not redirected automatically</a></p>
    <script>
      // Redirect ONCE using sessionStorage to prevent loops
      if (!sessionStorage.getItem('payment_redirected_${referenceId}')) {
        sessionStorage.setItem('payment_redirected_${referenceId}', 'true');
        window.location.replace('${appUrl}');

        // Fallback to web after 2 seconds if app doesn't open
        setTimeout(function() {
          if (document.visibilityState === 'visible') {
            window.location.replace('${webFallback}');
          }
        }, 2000);
      }
    </script>
  </body>
</html>`);
};

app.get("/orders/:orderId/payment-success", (req, res) => {
  const orderId = req.params.orderId || req.query.order_id;
  if (!orderId) {
    return res.status(400).send("Missing orderId");
  }
  sendPaymongoRedirect(res, orderId, "success");
});

app.get("/orders/:orderId/payment-cancel", (req, res) => {
  const orderId = req.params.orderId || req.query.order_id;
  if (!orderId) {
    return res.status(400).send("Missing orderId");
  }
  sendPaymongoRedirect(res, orderId, "cancel");
});

// Booking payment redirect routes (for accommodation bookings)
// These routes check the actual payment status before redirecting
app.get("/bookings/:bookingId/payment-success", async (req, res) => {
  const bookingId = req.params.bookingId;
  if (!bookingId) {
    return res.status(400).send("Missing bookingId");
  }


  try {
    // Check the actual payment status from the database
    // The webhook may have already updated this to 'failed'
    const [rows] = await db.query(
      `SELECT p.status as payment_status, p.payment_intent_id
       FROM payment p
       WHERE p.payment_for_id = ? AND p.payment_for = 'booking'
       ORDER BY p.created_at DESC
       LIMIT 1`,
      [bookingId]
    );


    const payment = rows?.[0];


    // If payment exists and is marked as failed, redirect to cancel flow
    if (
      payment &&
      (payment.payment_status === "failed" ||
        payment.payment_status === "cancelled")
    ) {
      console.log(
        `[PayMongo Redirect] Payment for booking ${bookingId} is ${payment.payment_status}, redirecting to cancel`
      );
      return sendPaymongoRedirect(res, bookingId, "cancel", "booking");
    }


    // Otherwise proceed with success redirect
    // Note: The mobile app will still verify the actual PayMongo status
    sendPaymongoRedirect(res, bookingId, "success", "booking");
  } catch (error) {
    console.error(`[PayMongo Redirect] Error checking payment status:`, error);
    // On error, proceed with success and let mobile verify
    sendPaymongoRedirect(res, bookingId, "success", "booking");
  }
});

app.get("/bookings/:bookingId/payment-cancel", (req, res) => {
  const bookingId = req.params.bookingId;
  if (!bookingId) {
    return res.status(400).send("Missing bookingId");
  }
  sendPaymongoRedirect(res, bookingId, "cancel", "booking");
});

// ========== ENVIRONMENT VALIDATION ==========
// Validate critical environment variables on startup
function validateEnvironment() {
  const required = {
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_NAME: process.env.DB_NAME,
  };

  const optional = {
    PAYMONGO_SECRET_KEY: process.env.PAYMONGO_SECRET_KEY,
    PAYMONGO_PUBLIC_KEY: process.env.PAYMONGO_PUBLIC_KEY,
    PAYMONGO_WEBHOOK_SECRET: process.env.PAYMONGO_WEBHOOK_SECRET,
    FRONTEND_BASE_URL: process.env.FRONTEND_BASE_URL,
  };

  const missing = [];
  const warnings = [];

  // Check required variables
  Object.entries(required).forEach(([key, value]) => {
    if (!value) {
      missing.push(key);
    }
  });

  // Check optional but important variables
  Object.entries(optional).forEach(([key, value]) => {
    if (!value) {
      warnings.push(key);
    }
  });

  if (missing.length > 0) {
    console.error(
      `${COLORS.bold}❌ CRITICAL: Missing required environment variables:${COLORS.reset}`
    );
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error(
      `\nPlease configure these in your .env file before starting the server.\n`
    );
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn(
      `${COLORS.yellow}⚠️  Warning: Missing optional environment variables:${COLORS.reset}`
    );
    warnings.forEach((key) => {
      console.warn(`   - ${key}`);
      if (key.includes("PAYMONGO")) {
        console.warn(`     (PayMongo payments will not work without this)`);
      }
    });
    console.warn("");
  }
}

// Validate environment before starting server
validateEnvironment();

// Start server with Socket.IO
httpServer.listen(PORT, "0.0.0.0", async () => {
  console.log(colorServer(`🚀 Server running at http://localhost:${PORT}`));
  console.log(
    colorServer(`🌐 Also accessible at http://192.168.111.111:${PORT}`)
  );
  console.log(colorServer("✅ Connected to MariaDB (Promise Pool)"));
  console.log(colorServer("✅ Environment validated"));
  console.log(colorServer("✅ API is ready to use\n"));

  // Start token cleanup scheduler (runs every 6 hours)
  startTokenCleanupScheduler();
  console.log(colorServer("✅ Token cleanup scheduler started"));

  // Start abandoned order cleanup scheduler (runs every 15 minutes)
  // Handles expired payment intents, restores stock, and marks abandoned orders as failed
  startAbandonedOrderCleanupScheduler();
  console.log(colorServer("✅ Abandoned order cleanup scheduler started"));

  // Initialize webhook queue for async PayMongo webhook processing
  try {
    const queue = await webhookQueueService.initializeQueue();
    if (queue) {
      registerProcessor(queue);
      console.log(colorServer("✅ Webhook queue initialized (Redis)"));
    } else {
      console.warn(
        `${COLORS.yellow}⚠️  Webhook queue not initialized (Redis unavailable - using sync fallback)${COLORS.reset}`
      );
    }
  } catch (queueError) {
    console.warn(
      `${COLORS.yellow}⚠️  Webhook queue init failed: ${queueError.message}${COLORS.reset}`
    );
  }

  // Quick access to Tourism Admin Login
  const frontendBase =
    process.env.FRONTEND_URL || process.env.WEB_URL || "http://localhost:5173";
  const tourismLogin = `${frontendBase.replace(/\/$/, "")}/tourism/login`;
  console.log(
    `${COLORS.bold}🔗 Tourism Admin Login:${COLORS.reset} ${colorUrl(
      tourismLogin
    )}\n`
  );

  // Grouped endpoint logging
  console.log(
    `${COLORS.bold}📌 Available API Endpoints (Grouped):${COLORS.reset}`
  );
  routeSections.forEach((section) => {
    console.log(`\n▶ ${colorSection(section.section)}`);
    section.routes.forEach((r) => {
      const label = r.label ? ` (${r.label})` : "";
      console.log(
        `   • ${colorUrl(`http://localhost:${PORT}${r.path}`)}${
          label ? " " + colorLabel(label) : ""
        }`
      );
    });
  });

  console.log("\nCTRL + C to stop the server\n");
});

// ========== GRACEFUL SHUTDOWN ==========
async function gracefulShutdown(signal) {
  console.log(
    `\n${COLORS.yellow}${signal} received. Shutting down gracefully...${COLORS.reset}`
  );

  try {
    // Close webhook queue
    await webhookQueueService.shutdownQueue();
    console.log(colorServer("✅ Webhook queue closed"));
  } catch (err) {
    console.error("Error closing webhook queue:", err);
  }

  // Stop cleanup schedulers
  stopAbandonedOrderCleanupScheduler();
  console.log(colorServer("✅ Abandoned order cleanup scheduler stopped"));

  // Close HTTP server
  httpServer.close(() => {
    console.log(colorServer("✅ HTTP server closed"));
    process.exit(0);
  });


  // Force exit after 10 seconds
  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
