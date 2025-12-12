import express from "express";
import * as staffController from "../controller/auth/StaffController.js";
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

// Staff onboarding - creates user + staff in one transaction
router.post("/onboard", authenticate, authorizeRole("Admin", "Business Owner", "Manager"), staffController.onboardStaff);

// CRUD - All staff management requires authentication
router.post("/", authenticate, authorizeRole("Admin", "Business Owner"), staffController.insertStaff);
router.get("/", authenticate, authorizeRole("Admin"), staffController.getAllStaff);

// Foreign key lookups (specific routes before generic :id)
router.get("/business/:business_id", authenticate, authorizeRole("Admin", "Business Owner", "Manager", "Staff"), staffController.getStaffByBusinessId);
router.get("/user/:user_id", authenticate, staffController.getStaffByUserId);

// Generic ID route (after specific routes)
router.get("/:id", authenticate, staffController.getStaffById);
router.put("/:id", authenticate, authorizeRole("Admin", "Business Owner"), staffController.updateStaffById);
router.delete("/:id", authenticate, authorizeRole("Admin", "Business Owner"), staffController.deleteStaffById);

export default router;
