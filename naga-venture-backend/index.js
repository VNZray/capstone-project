import express from "express";
import cors from "cors";
import "dotenv/config";

import userRoutes from "./routes/users.js";
import userRoleRoutes from "./routes/users_role.js";

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
import guestRoutes from "./routes/guest.js";
import bookingRoutes from "./routes/booking.js";
import paymentRoutes from "./routes/paymentRoutes.js";

// New Product/Service Management Routes
import productRoutes from "./routes/products.js";
import discountRoutes from "./routes/discounts.js";
import serviceRoutes from "./routes/services.js";
import orderRoutes from "./routes/orders.js";
import productReviewRoutes from "./routes/product-reviews.js";

const app = express();
const PORT = 3000;

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
const colorSection = (title) => `${COLORS.magenta}${COLORS.bold}${title}${COLORS.reset}`;
const colorServer = (text) => `${COLORS.green}${text}${COLORS.reset}`;

// Route sections for clearer organization & logging
// Each route can optionally include a 'label' to show a friendlier name in logs.
const routeSections = [
  {
    section: "Auth & Users",
    routes: [
      { path: "/api/user-roles", handler: userRoleRoutes, label: "User Roles" },
      { path: "/api/users", handler: userRoutes, label: "Users" },
      { path: "/api/owner", handler: ownerRoutes, label: "Owners" },
    ],
  },
  {
    section: "Business Core",
    routes: [
      { path: "/api/business", handler: businessRoutes, label: "Businesses" },
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
      { path: "/api/permit", handler: permitRoutes, label: "Permits" },
    ],
  },
  {
    section: "Tourism & Spots",
    routes: [
      { path: "/api/tourism", handler: tourismRoutes, label: "Tourism" },
      { path: "/api/tourist", handler: touristRoutes, label: "Tourists" },
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
      { path: "/api/guest", handler: guestRoutes, label: "Guests" },
      { path: "/api/booking", handler: bookingRoutes, label: "Bookings" },
      {
        path: "/api/external-booking",
        handler: externalBookingRoutes,
        label: "External Booking",
      },
      { path: "/api/payment", handler: paymentRoutes, label: "Payments" },
    ],
  },
  {
    section: "Commerce (Products & Services)",
    routes: [
      { path: "/api/products", handler: productRoutes, label: "Products" },
      { path: "/api/discounts", handler: discountRoutes, label: "Discounts" },
      { path: "/api/services", handler: serviceRoutes, label: "Services" },
      { path: "/api/orders", handler: orderRoutes, label: "Orders" },
      {
        path: "/api/product-reviews",
        handler: productReviewRoutes,
        label: "Product Reviews",
      },
    ],
  },
];

// Flattened list for registration
const routes = routeSections.flatMap((s) => s.routes);

app.use(cors());
app.use(express.json());

// Register routes dynamically
routes.forEach((route) => {
  app.use(route.path, route.handler);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(colorServer(`🚀 Server running at http://localhost:${PORT}`));
  console.log(colorServer(`🌐 Also accessible at http://192.168.111.111:${PORT}`));
  console.log(colorServer("✅ Connected to MariaDB (Promise Pool)"));
  console.log(colorServer("✅ API is ready to use\n"));

  // Grouped endpoint logging
  console.log(`${COLORS.bold}📌 Available API Endpoints (Grouped):${COLORS.reset}`);
  routeSections.forEach((section) => {
    console.log(`\n▶ ${colorSection(section.section)}`);
    section.routes.forEach((r) => {
      const label = r.label ? ` (${r.label})` : "";
      console.log(
        `   • ${colorUrl(`http://localhost:${PORT}${r.path}`)}${label ? " " + colorLabel(label) : ""}`
      );
    });
  });

  console.log("\nCTRL + C to stop the server\n");
});
