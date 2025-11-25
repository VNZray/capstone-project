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
import { authenticate } from "../middleware/authenticate.js";
import { authorize, authorizeAny } from "../middleware/authorize.js";
import { getMyPermissions } from "../controller/auth/PermissionController.js";

const router = express.Router();

// NOTE: Define specific/static routes BEFORE dynamic ":id" routes to avoid route shadowing.
// Current user's permission list
router.get('/me', authenticate, getMyPermissions);

// Role-permissions endpoints
router.get("/role/:user_role_id", getPermissionsByRoleId);
router.post("/assign", assignPermissionToRole);
router.delete("/assign/:user_role_id/:permission_id", unassignPermissionFromRole);

// Permissions CRUD
// Only admins/officers should manage permissions; view can be broader if needed
router.get("/", getAllPermissions);
router.post("/", insertPermission);
router.get("/:id", getPermissionById);
router.put("/:id", updatePermissionById);
router.delete("/:id", deletePermissionById);

export default router;
