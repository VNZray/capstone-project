/**
 * Business Policies Routes
 * Business policies and house rules management endpoints
 */
import { Router } from 'express';
import * as businessPoliciesController from '../../controllers/business-policies.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';

const router = Router();

// Public routes
router.get('/business/:businessId', asyncHandler(businessPoliciesController.getBusinessPolicies));

// Protected routes
router.put(
  '/business/:businessId',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(businessPoliciesController.upsertBusinessPolicies)
);

router.delete(
  '/business/:businessId',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(businessPoliciesController.deleteBusinessPolicies)
);

export default router;
