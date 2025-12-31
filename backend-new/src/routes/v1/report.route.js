/**
 * Report Routes
 * Report management endpoints
 */
import { Router } from 'express';
import * as reportController from '../../controllers/report.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { reportValidation } from '../../validations/report.validation.js';

const router = Router();

// All report routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/reports
 * @desc    Get all reports (admin)
 * @access  Private/Tourism Admin
 */
router.get(
  '/',
  authorizeRoles('Tourism Admin'),
  validateRequest(reportValidation.getReports),
  asyncHandler(reportController.getReports)
);

/**
 * @route   GET /api/v1/reports/stats
 * @desc    Get report statistics
 * @access  Private/Tourism Admin
 */
router.get(
  '/stats',
  authorizeRoles('Tourism Admin'),
  asyncHandler(reportController.getReportStats)
);

/**
 * @route   GET /api/v1/reports/my-reports
 * @desc    Get my submitted reports
 * @access  Private/Tourist
 */
router.get(
  '/my-reports',
  authorizeRoles('Tourist'),
  asyncHandler(reportController.getMyReports)
);

/**
 * @route   GET /api/v1/reports/target/:targetType/:targetId
 * @desc    Get reports for a specific target
 * @access  Private/Tourism Admin
 */
router.get(
  '/target/:targetType/:targetId',
  authorizeRoles('Tourism Admin'),
  asyncHandler(reportController.getReportsByTarget)
);

/**
 * @route   GET /api/v1/reports/:id
 * @desc    Get report by ID
 * @access  Private
 */
router.get(
  '/:id',
  asyncHandler(reportController.getReport)
);

/**
 * @route   POST /api/v1/reports
 * @desc    Create a report
 * @access  Private/Tourist
 */
router.post(
  '/',
  authorizeRoles('Tourist'),
  validateRequest(reportValidation.createReport),
  asyncHandler(reportController.createReport)
);

/**
 * @route   PATCH /api/v1/reports/:id/status
 * @desc    Update report status
 * @access  Private/Tourism Admin
 */
router.patch(
  '/:id/status',
  authorizeRoles('Tourism Admin'),
  validateRequest(reportValidation.updateStatus),
  asyncHandler(reportController.updateReportStatus)
);

/**
 * @route   POST /api/v1/reports/:id/attachments
 * @desc    Add attachment to report
 * @access  Private
 */
router.post(
  '/:id/attachments',
  validateRequest(reportValidation.addAttachment),
  asyncHandler(reportController.addAttachment)
);

export default router;
