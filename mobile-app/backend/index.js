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

// ========================================
// MOBILE BACKEND - Port 5000
// ========================================
// This backend handles ONLY mobile-specific functionality:
// - Authentication (for tourists)
// - Bookings (create, manage bookings)
// - Orders (create, manage orders)
// - Payments (PayMongo integration)
// - Notifications
// - User profile & favorites
//
// Other data is fetched from:
// - Business Backend (port 4000): Accommodation, rooms, products, business data
// - Tourism Backend (port 3000): Events, tourist spots, emergency facilities
// ========================================

// Mobile-specific routes only
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import userRolesRoutes from "./routes/userRoles.js";
import touristRoutes from "./routes/tourist.js";
import addressRoutes from "./routes/address.js";
import bookingRoutes from "./routes/booking.js";
import orderRoutes from "./routes/orders.js";
import paymentRoutes from "./routes/payment.js";
import refundRoutes from "./routes/refunds.js";
import notificationRoutes from "./routes/notifications.js";
import notificationPreferencesRoutes from "./routes/notificationPreferences.js";
import favoriteRoutes from "./routes/favorite.js";

const app = express();
const PORT = process.env.PORT;

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

// Simple ANSI color helpers
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

// Mobile-specific route sections
const routeSections = [
  {
    section: "Auth & Users",
    routes: [
      { path: "/api/auth", handler: authRoutes, label: "Authentication" },
      { path: "/api/users", handler: userRoutes, label: "Users" },
      { path: "/api/user-roles", handler: userRolesRoutes, label: "User Roles" },
      { path: "/api/tourist", handler: touristRoutes, label: "Tourist Profile" },
      { path: "/api/address", handler: addressRoutes, label: "Address Lookup" },
    ],
  },
  {
    section: "Bookings & Orders",
    routes: [
      { path: "/api/booking", handler: bookingRoutes, label: "Online Bookings" },
      { path: "/api/orders", handler: orderRoutes, label: "Orders" },
      { path: "/api/payment", handler: paymentRoutes, label: "Payments" },
      { path: "/api/refunds", handler: refundRoutes, label: "Refunds" },
    ],
  },
  {
    section: "User Features",
    routes: [
      { path: "/api/notifications", handler: notificationRoutes, label: "Notifications" },
      { path: "/api/notification-preferences", handler: notificationPreferencesRoutes, label: "Push Tokens" },
      { path: "/api/favorite", handler: favoriteRoutes, label: "Favorites" },
    ],
  },
];

// Flattened list for registration
const routes = routeSections.flatMap((s) => s.routes);

// CORS configuration - allow mobile apps and all frontends
const isProduction = process.env.NODE_ENV === "production";

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // List of allowed origins for all frontends
      const allowedOrigins = [
        "http://localhost:5173",  // Tourism frontend
        "http://localhost:6173",  // Business frontend
        "http://localhost:3000",  // Tourism backend
        "http://localhost:4000",  // Business backend
        "http://localhost:5000",  // Mobile backend
        "http://localhost:8081",  // Expo dev
        process.env.WEB_URL,
        process.env.FRONTEND_URL,
        process.env.FRONTEND_BASE_URL,
      ].filter(Boolean);

      if (allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        if (isProduction) {
          callback(new Error(`Origin ${origin} not allowed by CORS policy`), false);
        } else {
          console.warn("  ⚠️  Allowing for development");
          callback(null, true);
        }
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"],
  })
);
app.use(cookieParser());

// Raw body parser for webhook signature verification
["/api/payment/webhook"].forEach((path) => {
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

// PayMongo redirect bridge for mobile deep linking
const sendPaymongoRedirect = (res, referenceId, status, type = "order") => {
  const isExpoDev = process.env.EXPO_DEV === "true";
  const expoHost = process.env.EXPO_DEV_HOST || "192.168.1.1:8081";

  const isBooking = type === "booking";
  const routePath = isBooking
    ? "(tabs)/(home)/(accommodation)/room/booking"
    : "(checkout)/payment";
  const queryParam = isBooking
    ? `paymentSuccess=1&bookingId=${referenceId}`
    : `orderId=${referenceId}`;

  let appUrl;
  if (isExpoDev) {
    appUrl = `exp://${expoHost}/--/${routePath}-${status}?${queryParam}`;
  } else {
    appUrl = `cityventure://${routePath}-${status}?${queryParam}`;
  }

  console.log(`[PayMongo Redirect] type: ${type}, appUrl: ${appUrl}`);

  const webFallback = isBooking
    ? `${FRONTEND_BASE_URL}/bookings/${referenceId}/payment-${status}`
    : `${FRONTEND_BASE_URL}/orders/${referenceId}/payment-${status}`;

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
    <p><a href="${appUrl}">Click here if not redirected</a></p>
    <script>
      if (!sessionStorage.getItem('payment_redirected_${referenceId}')) {
        sessionStorage.setItem('payment_redirected_${referenceId}', 'true');
        window.location.replace('${appUrl}');
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

// Order payment redirects
app.get("/orders/:orderId/payment-success", (req, res) => {
  const orderId = req.params.orderId || req.query.order_id;
  if (!orderId) return res.status(400).send("Missing orderId");
  sendPaymongoRedirect(res, orderId, "success");
});

app.get("/orders/:orderId/payment-cancel", (req, res) => {
  const orderId = req.params.orderId || req.query.order_id;
  if (!orderId) return res.status(400).send("Missing orderId");
  sendPaymongoRedirect(res, orderId, "cancel");
});

// Booking payment redirects
app.get("/bookings/:bookingId/payment-success", async (req, res) => {
  const bookingId = req.params.bookingId;
  if (!bookingId) return res.status(400).send("Missing bookingId");

  try {
    const [rows] = await db.query(
      `SELECT p.status as payment_status FROM payment p
       WHERE p.payment_for_id = ? AND p.payment_for = 'booking'
       ORDER BY p.created_at DESC LIMIT 1`,
      [bookingId]
    );

    const payment = rows?.[0];
    if (payment && (payment.payment_status === "failed" || payment.payment_status === "cancelled")) {
      return sendPaymongoRedirect(res, bookingId, "cancel", "booking");
    }

    sendPaymongoRedirect(res, bookingId, "success", "booking");
  } catch (error) {
    console.error(`[PayMongo Redirect] Error:`, error);
    sendPaymongoRedirect(res, bookingId, "success", "booking");
  }
});

app.get("/bookings/:bookingId/payment-cancel", (req, res) => {
  const bookingId = req.params.bookingId;
  if (!bookingId) return res.status(400).send("Missing bookingId");
  sendPaymongoRedirect(res, bookingId, "cancel", "booking");
});

// Environment validation
function validateEnvironment() {
  const required = {
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_NAME: process.env.DB_NAME,
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.error(`❌ Missing required env vars: ${missing.join(", ")}`);
    process.exit(1);
  }
}

validateEnvironment();

// Start server
httpServer.listen(PORT, "0.0.0.0", async () => {
  console.log(colorServer(`\n🚀 Mobile Backend running at http://localhost:${PORT}`));
  console.log(colorServer("✅ Connected to MariaDB"));
  console.log(colorServer("✅ API is ready\n"));

  startTokenCleanupScheduler();
  startAbandonedOrderCleanupScheduler();

  try {
    const queue = await webhookQueueService.initializeQueue();
    if (queue) {
      registerProcessor(queue);
      console.log(colorServer("✅ Webhook queue initialized"));
    }
  } catch (err) {
    console.warn(`⚠️  Webhook queue failed: ${err.message}`);
  }

  console.log(`${COLORS.bold}📌 Mobile API Endpoints:${COLORS.reset}`);
  routeSections.forEach((section) => {
    console.log(`\n▶ ${colorSection(section.section)}`);
    section.routes.forEach((r) => {
      console.log(`   • ${colorUrl(`http://localhost:${PORT}${r.path}`)} ${colorLabel(`(${r.label})`)}`);
    });
  });

  console.log(`\n${COLORS.bold}📡 Other backends to use:${COLORS.reset}`);
  console.log(`   • Business data: ${colorUrl("http://localhost:4000/api")}`);
  console.log(`   • Tourism data:  ${colorUrl("http://localhost:3000/api")}`);
  console.log("\nCTRL + C to stop\n");
});

// Graceful shutdown
async function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Shutting down...`);

  try {
    await webhookQueueService.shutdownQueue();
  } catch (err) {
    console.error("Webhook queue error:", err);
  }

  stopAbandonedOrderCleanupScheduler();

  httpServer.close(() => {
    console.log("Server closed");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("Force shutdown");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
