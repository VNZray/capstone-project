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
router.get("/role/:user_role_id", authenticate, authorizeAny('manage_users', 'manage_services'), getPermissionsByRoleId);
router.post("/assign", authenticate, authorize('manage_users'), assignPermissionToRole);
router.delete("/assign/:user_role_id/:permission_id", authenticate, authorize('manage_users'), unassignPermissionFromRole);

// Permissions CRUD
// Only admins/officers should manage permissions; view can be broader if needed
router.get("/", authenticate, authorizeAny('manage_users', 'manage_services'), getAllPermissions);
router.post("/", authenticate, authorize('manage_users'), insertPermission);
router.get("/:id", authenticate, authorizeAny('manage_users', 'manage_services'), getPermissionById);
router.put("/:id", authenticate, authorize('manage_users'), updatePermissionById);
router.delete("/:id", authenticate, authorize('manage_users'), deletePermissionById);

export default router;
