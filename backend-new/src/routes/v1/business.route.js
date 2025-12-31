/**
 * Business Routes
 * Business management endpoints - matches old backend patterns
 */
import { Router } from 'express';
import * as businessController from '../../controllers/business.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate, optionalAuth } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';

const router = Router();

// GET all businesses
router.get('/', asyncHandler(businessController.getAllBusiness));

// POST new business
router.post('/', authenticate, asyncHandler(businessController.insertBusiness));

// GET businesses by owner ID - place before :id to avoid shadowing
router.get('/owner/:id', authenticate, asyncHandler(businessController.getBusinessByOwnerId));

// GET approved/active businesses
router.get('/approved', asyncHandler(businessController.getApprovedBusinesses));

// GET businesses by status
router.get('/status/:status', asyncHandler(businessController.getBusinessesByStatus));

// GET business by ID
router.get('/:id', asyncHandler(businessController.getBusinessById));

// PUT update business
router.put('/:id', authenticate, asyncHandler(businessController.updateBusiness));

// PATCH update business status
router.patch('/:id/status', authenticate, authorizeRoles('Tourism Admin'), asyncHandler(businessController.updateBusinessStatus));

// DELETE business
router.delete('/:id', authenticate, authorizeRoles('Tourism Admin'), asyncHandler(businessController.deleteBusiness));

export default router;
