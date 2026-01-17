/**
 * Tourist Routes (Mobile Backend)
 * Handles tourist profile management for the mobile app
 */

import express from "express";
import * as touristController from "../controller/auth/TouristController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// Tourist registration is public (part of user signup flow)
router.post("/", touristController.createTourist);

// Get tourist by user ID (needed for profile loading after login)
router.get("/user/:user_id", authenticate, touristController.getTouristByUserId);

// Get tourist by ID
router.get("/:id", authenticate, touristController.getTouristById);

// Update tourist profile
router.put("/:id", authenticate, touristController.updateTourist);

export default router;
