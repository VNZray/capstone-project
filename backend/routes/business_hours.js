import express from "express";
import * as businessController from "../controller/BusinessController.js"; // Add `.js` extension
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorizeRole.js";

const router = express.Router();

// Manage business hours requires manage_business_profile permission
router.post("/",  businessController.insertBusinessHours);
router.get("/", businessController.getBusinessHours);
router.get("/:businessId", businessController.getBusinessHoursByBusinessId);
router.put("/:id", authenticate, authorize('manage_business_profile'), businessController.updateBusinessHours);

export default router;
