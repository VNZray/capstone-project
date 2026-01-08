import express from "express";
import * as businessAmenityController from "../controller/businessAmenityController.js"; // Add `.js` extension
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorizeRole.js";

const router = express.Router();

// Get all amenities (public)
router.get("/", businessAmenityController.getAllData);
// Manage amenities requires manage_business_profile permission
router.post("/", businessAmenityController.insertData);
router.put("/", authenticate, authorize('manage_business_profile'), businessAmenityController.updateData);
router.delete("/:id", authenticate, authorize('manage_business_profile'), businessAmenityController.deleteData);

export default router;

