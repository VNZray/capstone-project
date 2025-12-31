/**
 * Role Routes
 * Role management endpoints
 */
import { Router } from 'express';
import * as roleController from '../../controllers/role.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';

const router = Router();

// All routes require authentication and admin access
router.use(authenticate);
router.use(authorizeRoles('Tourism Admin', 'Admin'));

// Routes
router.get('/', asyncHandler(roleController.getAllRoles));
router.get('/:id', asyncHandler(roleController.getRoleById));
router.get('/name/:name', asyncHandler(roleController.getRoleByName));
router.get('/:id/permissions', asyncHandler(roleController.getRolePermissions));

router.post('/', asyncHandler(roleController.createRole));

router.put('/:id', asyncHandler(roleController.updateRole));
router.put('/:id/permissions', asyncHandler(roleController.updateRolePermissions));

router.delete('/:id', asyncHandler(roleController.deleteRole));

export default router;
