import express from "express";
import * as touristController from "../controller/auth/TouristController.js"; // Add `.js` extension
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

// Tourist registration is public (part of user signup flow)
router.post("/", touristController.createTourist);

// All other routes require authentication
router.get("/", authenticate, touristController.getAllTourists);

// Specific routes MUST come before parameterized routes
router.get("/user/:user_id", authenticate, touristController.getTouristByUserId);

// Parameterized routes
router.get("/:id", authenticate, touristController.getTouristById);
router.delete("/:id", authenticate, touristController.deleteTourist);
router.put("/:id", authenticate, touristController.updateTourist);

export default router;
