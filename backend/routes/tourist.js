import express from "express";
import * as touristController from "../controller/auth/TouristController.js"; // Add `.js` extension
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

// Tourist registration is public (part of user signup flow)
router.post("/", touristController.createTourist);

// All other routes require authentication
router.get("/", authenticate, authorizeRole("Admin", "Tourism Head", "Tourism Officer"), touristController.getAllTourists);
router.get("/:id", authenticate, touristController.getTouristById);
router.delete("/:id", authenticate, authorizeRole("Admin"), touristController.deleteTourist);
router.put("/:id", authenticate, touristController.updateTourist);
router.get("/user/:user_id", authenticate, touristController.getTouristByUserId);

export default router;
