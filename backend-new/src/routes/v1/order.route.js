/**
 * Order Routes
 * Order management endpoints
 */
import { Router } from 'express';
import * as orderController from '../../controllers/order.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { orderValidation } from '../../validations/order.validation.js';

const router = Router();

// All order routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/orders
 * @desc    Get my orders
 * @access  Private/Tourist
 */
router.get(
  '/',
  authorizeRoles('Tourist'),
  validateRequest(orderValidation.getMyOrders),
  asyncHandler(orderController.getMyOrders)
);

/**
 * @route   GET /api/v1/orders/business/:businessId
 * @desc    Get orders for a business
 * @access  Private/Business Staff
 */
router.get(
  '/business/:businessId',
  authorizeRoles('Business Owner', 'Manager', 'Sales Associate'),
  validateRequest(orderValidation.getBusinessOrders),
  asyncHandler(orderController.getBusinessOrders)
);

/**
 * @route   GET /api/v1/orders/business/:businessId/stats
 * @desc    Get order statistics for a business
 * @access  Private/Business Staff
 */
router.get(
  '/business/:businessId/stats',
  authorizeRoles('Business Owner', 'Manager'),
  asyncHandler(orderController.getOrderStats)
);

/**
 * @route   GET /api/v1/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
router.get(
  '/:id',
  asyncHandler(orderController.getOrder)
);

/**
 * @route   GET /api/v1/orders/number/:orderNumber
 * @desc    Get order by order number
 * @access  Private
 */
router.get(
  '/number/:orderNumber',
  asyncHandler(orderController.getOrderByNumber)
);

/**
 * @route   POST /api/v1/orders
 * @desc    Create an order
 * @access  Private/Tourist
 */
router.post(
  '/',
  authorizeRoles('Tourist'),
  validateRequest(orderValidation.createOrder),
  asyncHandler(orderController.createOrder)
);

/**
 * @route   PATCH /api/v1/orders/:id/status
 * @desc    Update order status
 * @access  Private/Business Staff
 */
router.patch(
  '/:id/status',
  authorizeRoles('Business Owner', 'Manager', 'Sales Associate'),
  validateRequest(orderValidation.updateStatus),
  asyncHandler(orderController.updateOrderStatus)
);

/**
 * @route   POST /api/v1/orders/:id/cancel
 * @desc    Cancel an order
 * @access  Private
 */
router.post(
  '/:id/cancel',
  validateRequest(orderValidation.cancelOrder),
  asyncHandler(orderController.cancelOrder)
);

/**
 * @route   POST /api/v1/orders/business/:businessId/verify-arrival
 * @desc    Verify arrival code for a business
 * @access  Private/Business Staff
 */
router.post(
  '/business/:businessId/verify-arrival',
  authorizeRoles('Business Owner', 'Manager', 'Sales Associate'),
  asyncHandler(orderController.verifyArrivalCode)
);

/**
 * @route   POST /api/v1/orders/:id/validate-arrival
 * @desc    Validate arrival code (legacy endpoint)
 * @access  Private/Business Staff
 */
router.post(
  '/:id/validate-arrival',
  authorizeRoles('Business Owner', 'Manager', 'Sales Associate'),
  validateRequest(orderValidation.validateArrivalCode),
  asyncHandler(orderController.validateArrivalCode)
);

/**
 * @route   POST /api/v1/orders/:id/confirm
 * @desc    Confirm an order (business accepts)
 * @access  Private/Business Staff
 */
router.post(
  '/:id/confirm',
  authorizeRoles('Business Owner', 'Manager', 'Sales Associate'),
  asyncHandler(orderController.confirmOrder)
);

/**
 * @route   POST /api/v1/orders/:id/prepare
 * @desc    Start preparing an order
 * @access  Private/Business Staff
 */
router.post(
  '/:id/prepare',
  authorizeRoles('Business Owner', 'Manager', 'Sales Associate'),
  asyncHandler(orderController.startPreparing)
);

/**
 * @route   POST /api/v1/orders/:id/arrived
 * @desc    Mark customer as arrived
 * @access  Private/Business Staff
 */
router.post(
  '/:id/arrived',
  authorizeRoles('Business Owner', 'Manager', 'Sales Associate'),
  asyncHandler(orderController.markCustomerArrived)
);

/**
 * @route   POST /api/v1/orders/:id/ready
 * @desc    Mark order as ready for pickup
 * @access  Private/Business Staff
 */
router.post(
  '/:id/ready',
  authorizeRoles('Business Owner', 'Manager', 'Sales Associate'),
  asyncHandler(orderController.markOrderReady)
);

/**
 * @route   POST /api/v1/orders/:id/picked-up
 * @desc    Mark order as picked up
 * @access  Private/Business Staff
 */
router.post(
  '/:id/picked-up',
  authorizeRoles('Business Owner', 'Manager', 'Sales Associate'),
  asyncHandler(orderController.markOrderPickedUp)
);

/**
 * @route   PUT /api/v1/orders/:id/payment-status
 * @desc    Update payment status
 * @access  Private/Business Staff
 */
router.put(
  '/:id/payment-status',
  authorizeRoles('Business Owner', 'Manager', 'Sales Associate'),
  asyncHandler(orderController.updatePaymentStatus)
);

/**
 * @route   POST /api/v1/orders/:id/complete
 * @desc    Complete an order
 * @access  Private/Business Staff
 */
router.post(
  '/:id/complete',
  authorizeRoles('Business Owner', 'Manager', 'Sales Associate'),
  asyncHandler(orderController.completeOrder)
);

export default router;
