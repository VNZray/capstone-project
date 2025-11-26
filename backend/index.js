import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { createServer } from "http";
import { initializeSocket } from "./services/socketService.js";

import userRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";
import userRoleRoutes from "./routes/users_role.js";

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
import businessSettingsRoutes from "./routes/business-settings.js";
import shopCategoryRoutes from "./routes/shop-categories.js";
import feedbackReviewRoutes from "./routes/feedback-reviews.js";
import feedbackReplyRoutes from "./routes/feedback-replies.js";
import feedbackReviewPhotoRoutes from "./routes/feedback-review-photos.js";
import roomPhotosRoutes from "./routes/room-photos.js";
import tourismStaffManagementRoutes from "./routes/tourism_staff_management.js";

const app = express();
const PORT = 3000;

// Create HTTP server for Socket.IO
const httpServer = createServer(app);

// Initialize Socket.IO
const io = initializeSocket(httpServer);

// Make io available to routes via app.locals
app.locals.io = io;

// Redirect bases for PayMongo payment return URLs
const FRONTEND_BASE_URL = (process.env.FRONTEND_BASE_URL || "http://localhost:5173").replace(/\/$/, "");
const MOBILE_DEEP_LINK_BASE = (process.env.MOBILE_DEEP_LINK_BASE || "cityventure://orders").replace(/\/$/, "");

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
      { path: "/api/tourism-staff", handler: tourismStaffManagementRoutes, label: "Tourism Staff (Admin)" },
      { path: "/api/tourist", handler: touristRoutes, label: "Tourists" },
      { path: "/api/staff", handler: staffRoutes, label: "Staff" },
  { path: "/api/permissions", handler: permissionRoutes, label: "Permissions & Role Permissions" },

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
      { path: "/api/reports", handler: reportRoutes, label: "Reports" },
      {
        path: "/api/approval",
        handler: approvalRoutes,
        label: "Approval Workflow",
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
      { path: "/api/payments", handler: paymentRoutes, label: "Payments (alias)" },
    ],
  },
  {
    section: "Commerce (Products & Services)",
    routes: [
      { path: "/api/shop-categories", handler: shopCategoryRoutes, label: "Shop Categories (Unified)" },
      { path: "/api/products", handler: productRoutes, label: "Products" },
      { path: "/api/discounts", handler: discountRoutes, label: "Discounts" },
      { path: "/api/promotions", handler: promotionRoutes, label: "Promotions" },
      { path: "/api/services", handler: serviceRoutes, label: "Services (Display Only)" },
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
        path: "/api/business-settings",
        handler: businessSettingsRoutes,
        label: "Business Settings",
      },
    ],
  },
  {
    section: "Feedback & Reviews",
    routes: [
      { path: "/api/reviews", handler: feedbackReviewRoutes, label: "Reviews (Generic)" },
      { path: "/api/replies", handler: feedbackReplyRoutes, label: "Replies" },
      { path: "/api/review-photos", handler: feedbackReviewPhotoRoutes, label: "Review Photos" },
    ],
  },
];

// Flattened list for registration
const routes = routeSections.flatMap((s) => s.routes);

// CORS configuration for authentication with credentials
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.WEB_URL,
      process.env.FRONTEND_URL,
      process.env.FRONTEND_BASE_URL,
    ].filter(Boolean); // Remove undefined values
    
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(null, true); // Allow for development - tighten in production
    }
  },
  credentials: true, // Allow cookies to be sent/received
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie'], // Expose Set-Cookie header for cross-origin
}));
app.use(cookieParser());

// Raw body parser for webhook signature verification
// Must come BEFORE express.json() to capture raw body
["/api/payment/webhook", "/api/payments/webhook"].forEach((path) => {
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
// PayMongo requires http/https URLs, but the mobile app expects a custom scheme (cityventure://orders/...).
// These handlers take the web redirect and bounce users back into the app, with a web fallback.
const sendPaymongoRedirect = (res, orderId, status) => {
  // Support both Expo Go (exp://) and production builds (cityventure://)
  const isExpoDev = process.env.EXPO_DEV === 'true';
  const expoHost = process.env.EXPO_DEV_HOST || '192.168.1.1:8081';
  
  // Use Expo Go universal link format: exp://HOST:PORT/--/(screens)/payment-success
  const appUrl = isExpoDev 
    ? `exp://${expoHost}/--/(screens)/payment-${status}?orderId=${orderId}`
    : `${MOBILE_DEEP_LINK_BASE}/${orderId}/payment-${status}`;
  
  const webFallback = `${FRONTEND_BASE_URL}/orders/${orderId}/payment-${status}`;

  // Prevent caching to avoid redirect loops
  res.set({
    'Content-Type': 'text/html',
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  res.send(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Payment ${status === 'success' ? 'Successful' : 'Cancelled'}</title>
  </head>
  <body style="font-family: sans-serif; text-align: center; padding: 24px;">
    <h1>Payment ${status === 'success' ? 'Successful! ✅' : 'Cancelled ❌'}</h1>
    <p>Redirecting to app...</p>
    <p><a href="${appUrl}">Click here if not redirected automatically</a></p>
    <script>
      // Redirect ONCE using sessionStorage to prevent loops
      if (!sessionStorage.getItem('payment_redirected_${orderId}')) {
        sessionStorage.setItem('payment_redirected_${orderId}', 'true');
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

// ========== ENVIRONMENT VALIDATION ==========
// Validate critical environment variables on startup
function validateEnvironment() {
  const required = {
    'JWT_ACCESS_SECRET': process.env.JWT_ACCESS_SECRET,
    'DB_HOST': process.env.DB_HOST,
    'DB_USER': process.env.DB_USER,
    'DB_NAME': process.env.DB_NAME,
  };

  const optional = {
    'PAYMONGO_SECRET_KEY': process.env.PAYMONGO_SECRET_KEY,
    'PAYMONGO_PUBLIC_KEY': process.env.PAYMONGO_PUBLIC_KEY,
    'PAYMONGO_WEBHOOK_SECRET': process.env.PAYMONGO_WEBHOOK_SECRET,
    'FRONTEND_BASE_URL': process.env.FRONTEND_BASE_URL,
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
    console.error(`${COLORS.bold}❌ CRITICAL: Missing required environment variables:${COLORS.reset}`);
    missing.forEach(key => console.error(`   - ${key}`));
    console.error(`\nPlease configure these in your .env file before starting the server.\n`);
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn(`${COLORS.yellow}⚠️  Warning: Missing optional environment variables:${COLORS.reset}`);
    warnings.forEach(key => {
      console.warn(`   - ${key}`);
      if (key.includes('PAYMONGO')) {
        console.warn(`     (PayMongo payments will not work without this)`);
      }
    });
    console.warn('');
  }
}

// Validate environment before starting server
validateEnvironment();

// Start server with Socket.IO
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(colorServer(`🚀 Server running at http://localhost:${PORT}`));
  console.log(
    colorServer(`🌐 Also accessible at http://192.168.111.111:${PORT}`)
  );
  console.log(colorServer("✅ Connected to MariaDB (Promise Pool)"));
  console.log(colorServer("✅ Environment validated"));
  console.log(colorServer("✅ API is ready to use\n"));

  // Quick access to Tourism Admin Login
  const frontendBase = process.env.FRONTEND_URL || process.env.WEB_URL || "http://localhost:5173";
  const tourismLogin = `${frontendBase.replace(/\/$/, "")}/tourism/login`;
  console.log(`${COLORS.bold}🔗 Tourism Admin Login:${COLORS.reset} ${colorUrl(tourismLogin)}\n`);

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
