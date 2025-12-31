/**
 * Event Routes
 * Event management endpoints
 */
import { Router } from 'express';
import * as eventController from '../../controllers/event.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate, optionalAuth } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { eventValidation } from '../../validations/event.validation.js';

const router = Router();

/**
 * @route   GET /api/v1/events
 * @desc    Get all events (public)
 * @access  Public
 */
router.get(
  '/',
  optionalAuth,
  validateRequest(eventValidation.getAllEvents),
  asyncHandler(eventController.getAllEvents)
);

/**
 * @route   GET /api/v1/events/upcoming
 * @desc    Get upcoming events
 * @access  Public
 */
router.get(
  '/upcoming',
  asyncHandler(eventController.getUpcomingEvents)
);

/**
 * @route   GET /api/v1/events/featured
 * @desc    Get featured events
 * @access  Public
 */
router.get(
  '/featured',
  asyncHandler(eventController.getFeaturedEvents)
);

/**
 * @route   GET /api/v1/events/date-range
 * @desc    Get events by date range
 * @access  Public
 */
router.get(
  '/date-range',
  validateRequest(eventValidation.getEventsByDateRange),
  asyncHandler(eventController.getEventsByDateRange)
);

/**
 * @route   GET /api/v1/events/:id
 * @desc    Get event by ID
 * @access  Public
 */
router.get(
  '/:id',
  asyncHandler(eventController.getEvent)
);

// Protected routes (Tourism Admin only)
router.use(authenticate, authorizeRoles('Tourism Admin'));

/**
 * @route   POST /api/v1/events
 * @desc    Create an event
 * @access  Private/Tourism Admin
 */
router.post(
  '/',
  validateRequest(eventValidation.createEvent),
  asyncHandler(eventController.createEvent)
);

/**
 * @route   PATCH /api/v1/events/:id
 * @desc    Update an event
 * @access  Private/Tourism Admin
 */
router.patch(
  '/:id',
  validateRequest(eventValidation.updateEvent),
  asyncHandler(eventController.updateEvent)
);

/**
 * @route   PATCH /api/v1/events/:id/status
 * @desc    Update event status
 * @access  Private/Tourism Admin
 */
router.patch(
  '/:id/status',
  validateRequest(eventValidation.updateStatus),
  asyncHandler(eventController.updateEventStatus)
);

/**
 * @route   DELETE /api/v1/events/:id
 * @desc    Delete an event
 * @access  Private/Tourism Admin
 */
router.delete(
  '/:id',
  asyncHandler(eventController.deleteEvent)
);

export default router;
