import express from "express";
import * as roomAmenityController from "../controller/accommodation/roomAmenityController.js"; // Add `.js` extension
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorizeRole.js";

const router = express.Router();

// Get all room amenities (public)
router.get("/", roomAmenityController.getAllData);

// Manage room amenities (requires manage_rooms permission)
router.post("/", authenticate, authorize('manage_rooms'), roomAmenityController.insertData);
router.put("/", authenticate, authorize('manage_rooms'), roomAmenityController.updateData);
router.delete("/:id", authenticate, authorize('manage_rooms'), roomAmenityController.deleteData);

export default router;
