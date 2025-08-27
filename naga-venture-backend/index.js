import express from "express";
import cors from "cors";
import "dotenv/config";

import userRoutes from "./routes/users.js";
import businessRoutes from "./routes/business.js";
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

const app = express();
const PORT = 3000;

// Define all routes in one place
const routes = [
  { path: "/api/users", handler: userRoutes },
  { path: "/api/business", handler: businessRoutes },
  { path: "/api/tourist", handler: touristRoutes },
  { path: "/api/tourism", handler: tourismRoutes },
  { path: "/api/owner", handler: ownerRoutes },
  { path: "/api/address", handler: addressRoutes },
  { path: "/api/category-and-type", handler: categoryAndTypeRoutes },
  { path: "/api/external-booking", handler: externalBookingRoutes },
  { path: "/api/amenities", handler: amenityRoutes },
  { path: "/api/tourist-spots", handler: touristSpotRoutes },
  { path: "/api/approval", handler: approvalRoutes },
  { path: "/api/permit", handler: permitRoutes },
  { path: "/api/room", handler: roomRoutes },
];

app.use(cors());
app.use(express.json());

// Register routes dynamically
routes.forEach((route) => {
  app.use(route.path, route.handler);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log("✅ Connected to MariaDB (Promise Pool)");
  console.log("✅ API is ready to use\n");

  // Log all registered API URLs
  console.log("📌 Available API Endpoints:");
  routes.forEach((route) => {
    console.log(`${`http://localhost:${PORT}${route.path}`}`);
  });

  console.log("\nCTRL + C to stop the server\n");
});
