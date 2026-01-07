import express from "express";
import * as appLegalPoliciesController from "../controller/appLegalPoliciesController.js";

const router = express.Router();

// ==================== APP LEGAL POLICIES ROUTES ====================

// Get current active legal policies (public)
router.get("/", appLegalPoliciesController.getAppLegalPolicies);

// Get legal policies history (admin)
router.get("/history", appLegalPoliciesController.getAppLegalPoliciesHistory);

// Get specific version
router.get("/version/:version", appLegalPoliciesController.getAppLegalPoliciesByVersion);

// Update legal policies (admin - creates new version)
router.put("/", appLegalPoliciesController.updateAppLegalPolicies);

export default router;
