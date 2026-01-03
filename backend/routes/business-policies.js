import express from "express";
import * as businessPoliciesController from "../controller/businessPoliciesController.js";

const router = express.Router();

// ==================== BUSINESS POLICIES ROUTES ====================

// Get all business policies (admin)
router.get("/", businessPoliciesController.getAllBusinessPolicies);

// Get business policies by business ID
router.get("/:businessId", businessPoliciesController.getBusinessPolicies);

// Create or update business policies
router.put("/:businessId", businessPoliciesController.upsertBusinessPolicies);

// Update house rules only
router.patch("/:businessId/house-rules", businessPoliciesController.updateHouseRules);

// Update policy texts only
router.patch("/:businessId/policy-texts", businessPoliciesController.updatePolicyTexts);

// Delete business policies
router.delete("/:businessId", businessPoliciesController.deleteBusinessPolicies);

export default router;
