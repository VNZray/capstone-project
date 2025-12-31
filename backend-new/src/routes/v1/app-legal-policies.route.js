/**
 * App Legal Policies Routes
 * Application-level terms and privacy policy management
 */
import { Router } from 'express';
import * as appLegalPoliciesController from '../../controllers/app-legal-policies.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';

const router = Router();

// Public routes
router.get('/', asyncHandler(appLegalPoliciesController.getAppLegalPolicies));
router.get('/history', asyncHandler(appLegalPoliciesController.getAppLegalPoliciesHistory));
router.get('/version/:version', asyncHandler(appLegalPoliciesController.getAppLegalPoliciesByVersion));

// Protected routes (admin only)
router.put(
  '/',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin'),
  asyncHandler(appLegalPoliciesController.updateAppLegalPolicies)
);

export default router;
