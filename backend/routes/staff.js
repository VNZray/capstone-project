import express from "express";
import * as staffController from "../controller/auth/StaffController.js";

const router = express.Router();

// CRUD
router.post("/", staffController.insertStaff);
router.get("/", staffController.getAllStaff);

// Foreign key lookups (specific routes before generic :id)
router.get("/business/:business_id", staffController.getStaffByBusinessId);
router.get("/user/:user_id", staffController.getStaffByUserId);

// Generic ID route (after specific routes)
router.get("/:id", staffController.getStaffById);
router.put("/:id", staffController.updateStaffById);
router.delete("/:id", staffController.deleteStaffById);

export default router;
