import express from "express";
import * as businessSettingsController from "../controller/businessSettingsController.js";

const router = express.Router();

// ==================== BUSINESS SETTINGS ROUTES ====================

// Business Settings
router.get("/:businessId", businessSettingsController.getBusinessSettings);
router.put("/:businessId", businessSettingsController.upsertBusinessSettings);

export default router;
