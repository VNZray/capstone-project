import express from "express";
import * as userController from "../controller/userController.js"; // Add `.js` extension

const router = express.Router();

// User role management
router.get("/", userController.getAllUserRoles);
router.get("/:id", userController.getUserRoleById);
router.get("/users/:user_role_id", userController.getUsersByRoleId);
router.post("/", userController.insertUserRole);
router.put("/:id", userController.updateUserRole);
router.put("/role", userController.updateUserRoleByName);

// Login
router.post("/login", userController.loginUser);

export default router;
