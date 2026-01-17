import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { createServer } from "http";

// Available routes in tourism-management backend
import userRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";
import userRoleRoutes from "./routes/users_role.js";
import rolesRoutes from "./routes/roles.js";
import categoryAndTypeRoutes from "./routes/category_and_type.js";
import permissionRoutes from "./routes/permission.js";
import notificationRoutes from "./routes/notifications.js";
import appLegalPoliciesRoutes from "./routes/app-legal-policies.js";
import feedbackReviewRoutes from "./routes/feedback-reviews.js";
import feedbackReplyRoutes from "./routes/feedback-replies.js";
import feedbackReviewPhotoRoutes from "./routes/feedback-review-photos.js";
import addressRoutes from "./routes/address.js";

// Tourism-specific routes
import tourismRoutes from "./routes/tourism.js";
import tourismStaffManagementRoutes from "./routes/tourism_staff_management.js";
import touristSpotRoutes from "./routes/tourist_spot.js";
import approvalRoutes from "./routes/approval.js";
import eventRoutes from "./routes/event.js";

const app = express();
const PORT = process.env.PORT;

// Create HTTP server
const httpServer = createServer(app);

// Redirect bases for frontend URLs
const FRONTEND_BASE_URL = (
  process.env.FRONTEND_BASE_URL || "http://localhost:5173"
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
    section: "Tourism Administration",
    routes: [
      { path: "/api/tourism", handler: tourismRoutes, label: "Tourism Staff" },
      { path: "/api/tourism-staff", handler: tourismStaffManagementRoutes, label: "Tourism Staff Management (Admin)" },
      { path: "/api/tourist-spots", handler: touristSpotRoutes, label: "Tourist Spots" },
      { path: "/api/approval", handler: approvalRoutes, label: "Approval Workflows" },
      { path: "/api/events", handler: eventRoutes, label: "Events Management" },
    ],
  },
  {
    section: "Core",
    routes: [

      { path: "/api/address", handler: addressRoutes, label: "Addresses" },

      {
        path: "/api/category-and-type",
        handler: categoryAndTypeRoutes,
        label: "Categories & Types",
      },
      {
        path: "/api/notifications",
        handler: notificationRoutes,
        label: "Notifications",
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

app.use(express.json());

// Register routes dynamically
routes.forEach((route) => {
  app.use(route.path, route.handler);
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

  const missing = [];

  // Check required variables
  Object.entries(required).forEach(([key, value]) => {
    if (!value) {
      missing.push(key);
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
}

// Validate environment before starting server
validateEnvironment();

// Start server
httpServer.listen(PORT, "0.0.0.0", async () => {
  console.log(colorServer(`🚀 Tourism Management Server running at http://localhost:${PORT}`));
  console.log(colorServer("✅ Connected to MariaDB (Promise Pool)"));
  console.log(colorServer("✅ Environment validated"));
  console.log(colorServer("✅ API is ready to use\n"));

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
function gracefulShutdown(signal) {
  console.log(
    `\n${COLORS.yellow}${signal} received. Shutting down gracefully...${COLORS.reset}`
  );

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
