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

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/tourist", touristRoutes);
app.use("/api/tourism", tourismRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/category-and-type", categoryAndTypeRoutes);


app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log("API URL: http://localhost:3000/api/users");
  console.log("API URL: http://localhost:3000/api/business");
  console.log("API URL: http://localhost:3000/api/tourist");
  console.log("API URL: http://localhost:3000/api/tourism");
  console.log("API URL: http://localhost:3000/api/owner");
  console.log("API URL: http://localhost:3000/api/address");
  console.log("API URL: http://localhost:3000/api/category-and-type");
  console.log("✅ Connected to MariaDB (Promise Pool)");
  console.log("✅ API is ready to use");
  console.log("\nCTRL + C tp stop the server\n");
});
