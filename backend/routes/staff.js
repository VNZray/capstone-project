import express from "express";
import * as staffController from "../controller/auth/StaffController.js";

const router = express.Router();

// CRUD
router.post("/", staffController.insertStaff);
router.get("/", staffController.getAllStaff);
router.get("/:id", staffController.getStaffById);
router.put("/:id", staffController.updateStaffById);
router.delete("/:id", staffController.deleteStaffById);

// Foreign key lookups
router.get("/user/:user_id", staffController.getStaffByUserId);

export default router;
