/**
 * Service Inquiry Routes
 * Service inquiry management endpoints
 */
import { Router } from 'express';
import * as serviceInquiryController from '../../controllers/service-inquiry.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';

const router = Router();

// Public routes (for creating inquiries)
router.post('/', asyncHandler(serviceInquiryController.createServiceInquiry));

// User routes (require auth)
router.get('/user', authenticate, asyncHandler(serviceInquiryController.getServiceInquiriesByUser));
router.get('/:id', authenticate, asyncHandler(serviceInquiryController.getServiceInquiryById));

// Business/Admin routes
router.get(
  '/',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin'),
  asyncHandler(serviceInquiryController.getAllServiceInquiries)
);

router.get(
  '/business/:businessId',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(serviceInquiryController.getServiceInquiriesByBusiness)
);

router.get(
  '/service/:serviceId',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(serviceInquiryController.getServiceInquiriesByService)
);

router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(serviceInquiryController.updateServiceInquiryStatus)
);

router.patch(
  '/:id/viewed',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(serviceInquiryController.markServiceInquiryViewed)
);

router.post(
  '/:id/respond',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(serviceInquiryController.respondToServiceInquiry)
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(serviceInquiryController.deleteServiceInquiry)
);

export default router;
