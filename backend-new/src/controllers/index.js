/**
 * Controllers Index
 * Central export for all controller modules
 */

// Auth & User
export * as authController from './auth.controller.js';
export * as userController from './user.controller.js';

// Business
export * as businessController from './business.controller.js';
export * as businessSettingsController from './business-settings.controller.js';
export * as businessAmenityController from './business-amenity.controller.js';
export * as businessHoursController from './business-hours.controller.js';
export * as businessPoliciesController from './business-policies.controller.js';

// Booking & Room
export * as bookingController from './booking.controller.js';
export * as externalBookingController from './external-booking.controller.js';

// Rooms & Accommodations
export * as roomController from './room.controller.js';
export * as roomAmenityController from './room-amenity.controller.js';
export * as roomPhotoController from './room-photo.controller.js';
export * as roomBlockedDatesController from './room-blocked-dates.controller.js';
export * as seasonalPricingController from './seasonal-pricing.controller.js';

// Products & Services
export * as productController from './product.controller.js';
export * as serviceController from './service.controller.js';
export * as shopCategoryController from './shop-category.controller.js';
export * as serviceInquiryController from './service-inquiry.controller.js';
export * as productReviewController from './product-review.controller.js';

// Orders & Payments
export * as orderController from './order.controller.js';
export * as paymentController from './payment.controller.js';
export * as discountController from './discount.controller.js';
export * as refundController from './refund.controller.js';

// Reviews & Favorites
export * as reviewController from './review.controller.js';
export * as favoriteController from './favorite.controller.js';
export * as replyController from './reply.controller.js';
export * as reviewPhotoController from './review-photo.controller.js';

// Staff & Notifications
export * as staffController from './staff.controller.js';
export * as notificationController from './notification.controller.js';
export * as notificationPreferencesController from './notification-preferences.controller.js';

// Tourism
export * as touristSpotController from './tourist-spot.controller.js';
export * as eventController from './event.controller.js';

// Admin & Reports
export * as approvalController from './approval.controller.js';
export * as reportController from './report.controller.js';
export * as permitController from './permit.controller.js';
export * as promotionController from './promotion.controller.js';

// Address & Location
export * as addressController from './address.controller.js';

// Amenities
export * as amenityController from './amenity.controller.js';

// Categories & Types
export * as categoryController from './category.controller.js';

// App Legal Policies
export * as appLegalPoliciesController from './app-legal-policies.controller.js';

// Roles & Permissions
export * as roleController from './role.controller.js';
export * as permissionController from './permission.controller.js';

// Health
export * as healthController from './health.controller.js';
