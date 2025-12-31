/**
 * Permission Routes
 * Permission management endpoints
 */
import { Router } from 'express';
import * as permissionController from '../../controllers/permission.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';

const router = Router();

// All routes require authentication and admin access
router.use(authenticate);
router.use(authorizeRoles('Tourism Admin', 'Admin'));

// Permission CRUD
router.get('/', asyncHandler(permissionController.getAllPermissions));
router.get('/categories', asyncHandler(permissionController.getPermissionCategories));
router.get('/category/:category', asyncHandler(permissionController.getPermissionsByCategory));
router.get('/:id', asyncHandler(permissionController.getPermissionById));

router.post('/', asyncHandler(permissionController.createPermission));

router.put('/:id', asyncHandler(permissionController.updatePermission));

router.delete('/:id', asyncHandler(permissionController.deletePermission));

// Role-Permission mapping
router.get('/role/:roleId', asyncHandler(permissionController.getRolePermissionsMap));
router.post('/role', asyncHandler(permissionController.assignPermissionToRole));
router.post('/role/bulk', asyncHandler(permissionController.bulkAssignPermissionsToRole));
router.delete('/role/:role_id/permission/:permission_id', asyncHandler(permissionController.removePermissionFromRole));

export default router;
