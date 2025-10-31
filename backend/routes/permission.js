import express from "express";
import {
	// Permissions CRUD
	getAllPermissions,
	getPermissionById,
	insertPermission,
	updatePermissionById,
	deletePermissionById,
	// Role-permissions
	getPermissionsByRoleId,
	assignPermissionToRole,
	unassignPermissionFromRole,
} from "../controller/auth/PermissionController.js";

const router = express.Router();

// Permissions CRUD
router.get("/", getAllPermissions);
router.get("/:id", getPermissionById);
router.post("/", insertPermission);
router.put("/:id", updatePermissionById);
router.delete("/:id", deletePermissionById);

// Role-permissions endpoints
router.get("/role/:user_role_id", getPermissionsByRoleId);
router.post("/assign", assignPermissionToRole);
router.delete("/assign/:user_role_id/:permission_id", unassignPermissionFromRole);

export default router;
