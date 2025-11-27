import express from "express";
import * as userController from "../controller/auth/UserController.js"; // Add `.js` extension

const router = express.Router();

// User role management
router.get("/", userController.getAllUserRoles);
router.get("/role-for/:role_for", userController.getRolesByRoleFor);
router.get("/business/:business_id", userController.getRolesByBusinessId);
router.get("/users/:user_role_id", userController.getUsersByRoleId);
router.get("/:id", userController.getUserRoleById); // Re-enabled for mobile app login flow
router.post("/", userController.insertUserRole);
router.put("/:id", userController.updateUserRole);
router.put("/role", userController.updateUserRoleByName);

export default router;
