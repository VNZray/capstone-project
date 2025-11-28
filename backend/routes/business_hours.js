import express from "express";
import * as businessController from "../controller/BusinessController.js"; // Add `.js` extension
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

router.post("/", authenticate, authorizeRole("Business Owner", "Staff", "Admin"), businessController.insertBusinessHours);
router.get("/", businessController.getBusinessHours);
router.get("/:businessId", businessController.getBusinessHoursByBusinessId);
router.put("/:id", authenticate, authorizeRole("Business Owner", "Staff", "Admin"), businessController.updateBusinessHours);

export default router;
