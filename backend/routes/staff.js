import express from "express";
import * as staffController from "../controller/auth/StaffController.js";
import { authenticate } from '../middleware/authenticate.js';
import { authorizeScope, authorize, authorizeBusinessAccess } from '../middleware/authorizeRole.js';

const router = express.Router();

// Staff onboarding - creates user + staff in one transaction (requires add_staff permission)
router.post("/onboard", authenticate, authorize('add_staff'), staffController.onboardStaff);

// CRUD - All staff management requires authentication
router.post("/", authenticate, authorize('add_staff'), staffController.insertStaff);
// Platform admin can view all staff
router.get("/", authenticate, authorizeScope('platform'), authorize('view_all_profiles'), staffController.getAllStaff);

// Foreign key lookups (specific routes before generic :id)
// Business staff list - requires business access
router.get("/business/:business_id", authenticate, authorizeBusinessAccess('business_id'), staffController.getStaffByBusinessId);
router.get("/user/:user_id", authenticate, staffController.getStaffByUserId);

// Generic ID route (after specific routes)
router.get("/:id", authenticate, staffController.getStaffById);
router.put("/:id", authenticate, authorize('add_staff'), staffController.updateStaffById);
router.delete("/:id", authenticate, authorize('add_staff'), staffController.deleteStaffById);

export default router;
