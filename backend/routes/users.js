import express from "express";
import * as userController from "../controller/auth/UserController.js"; // Add `.js` extension

const router = express.Router();

// User CRUD
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.post("/", userController.insertUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

// User role management
router.get("/", userController.getAllUserRoles);
router.get("/:user_role_id", userController.getUsersByRoleId);
router.post("/", userController.insertUserRole);
router.put("/:id", userController.updateUserRole);
router.put("/role", userController.updateUserRoleByName);

// Login removed - use /api/auth/login
// router.post("/login", userController.loginUser);

export default router;
