/**
 * API v1 Routes Index
 * Aggregates all v1 API routes
 */
import { Router } from 'express';

// Auth & User
import authRoutes from './auth.route.js';
import userRoutes from './user.route.js';
import userRoleRoutes from './user-role.route.js';
import registrationRoutes from './registration.route.js';

// Profile Routes
import ownerRoutes from './owner.route.js';
import touristRoutes from './tourist.route.js';
import tourismRoutes from './tourism.route.js';

// Tourism Staff Management (Admin)
import tourismStaffManagementRoutes from './tourism-staff-management.route.js';

// Business
import businessRoutes from './business.route.js';
import businessSettingsRoutes from './business-settings.route.js';
import businessAmenityRoutes from './business-amenity.route.js';
import businessHoursRoutes from './business-hours.route.js';
import businessPoliciesRoutes from './business-policies.route.js';

// Booking
import bookingRoutes from './booking.route.js';
import externalBookingRoutes from './external-booking.route.js';

// Rooms & Accommodations
import roomRoutes from './room.route.js';
import roomAmenityRoutes from './room-amenity.route.js';
import roomPhotoRoutes from './room-photo.route.js';
import roomBlockedDatesRoutes from './room-blocked-dates.route.js';
import seasonalPricingRoutes from './seasonal-pricing.route.js';

// Products & Services
import productRoutes from './product.route.js';
import serviceRoutes from './service.route.js';
import shopCategoryRoutes from './shop-category.route.js';
import serviceInquiryRoutes from './service-inquiry.route.js';
import productReviewRoutes from './product-review.route.js';

// Orders & Payments
import orderRoutes from './order.route.js';
import paymentRoutes from './payment.route.js';
import discountRoutes from './discount.route.js';
import refundRoutes from './refund.route.js';

// Reviews & Favorites
import reviewRoutes from './review.route.js';
import favoriteRoutes from './favorite.route.js';
import replyRoutes from './reply.route.js';
import reviewPhotoRoutes from './review-photo.route.js';

// Staff & Notifications
import staffRoutes from './staff.route.js';
import notificationRoutes from './notification.route.js';
import notificationPreferencesRoutes from './notification-preferences.route.js';

// Tourism
import touristSpotRoutes from './tourist-spot.route.js';
import eventRoutes from './event.route.js';

// Admin & Reports
import approvalRoutes from './approval.route.js';
import reportRoutes from './report.route.js';
import permitRoutes from './permit.route.js';
import promotionRoutes from './promotion.route.js';

// Address & Location
import addressRoutes from './address.route.js';

// Amenities
import amenityRoutes from './amenity.route.js';

// Categories & Types
import categoryRoutes from './category.route.js';

// App Legal Policies
import appLegalPoliciesRoutes from './app-legal-policies.route.js';

// Roles & Permissions
import roleRoutes from './role.route.js';
import permissionRoutes from './permission.route.js';

const router = Router();

// Mount routes - Auth & User
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/user-roles', userRoleRoutes);
router.use('/registration', registrationRoutes);

// Mount routes - Profile (Owner, Tourist, Tourism)
router.use('/owners', ownerRoutes);
router.use('/tourists', touristRoutes);
router.use('/tourism', tourismRoutes);

// Mount routes - Tourism Staff Management (Admin)
router.use('/tourism-staff', tourismStaffManagementRoutes);

// Mount routes - Business
router.use('/businesses', businessRoutes);
router.use('/business-settings', businessSettingsRoutes);
router.use('/business-amenities', businessAmenityRoutes);
router.use('/business-hours', businessHoursRoutes);
router.use('/business-policies', businessPoliciesRoutes);

// Mount routes - Booking
router.use('/bookings', bookingRoutes);
router.use('/external-bookings', externalBookingRoutes);

// Mount routes - Rooms & Accommodations
router.use('/rooms', roomRoutes);
router.use('/room-amenities', roomAmenityRoutes);
router.use('/room-photos', roomPhotoRoutes);
router.use('/room-blocked-dates', roomBlockedDatesRoutes);
router.use('/seasonal-pricing', seasonalPricingRoutes);

// Mount routes - Products & Services
router.use('/products', productRoutes);
router.use('/services', serviceRoutes);
router.use('/shop-categories', shopCategoryRoutes);
router.use('/service-inquiries', serviceInquiryRoutes);
router.use('/product-reviews', productReviewRoutes);

// Mount routes - Orders & Payments
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/discounts', discountRoutes);
router.use('/refunds', refundRoutes);

// Mount routes - Reviews & Favorites
router.use('/reviews', reviewRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/replies', replyRoutes);
router.use('/review-photos', reviewPhotoRoutes);

// Mount routes - Staff & Notifications
router.use('/staff', staffRoutes);
router.use('/notifications', notificationRoutes);
router.use('/notification-preferences', notificationPreferencesRoutes);

// Mount routes - Tourism
router.use('/tourist-spots', touristSpotRoutes);
router.use('/events', eventRoutes);

// Mount routes - Admin & Reports
router.use('/approvals', approvalRoutes);
router.use('/reports', reportRoutes);
router.use('/permits', permitRoutes);
router.use('/promotions', promotionRoutes);

// Mount routes - Address & Location
router.use('/addresses', addressRoutes);

// Mount routes - Amenities
router.use('/amenities', amenityRoutes);

// Mount routes - Categories & Types
router.use('/categories', categoryRoutes);

// Mount routes - App Legal Policies
router.use('/app-legal-policies', appLegalPoliciesRoutes);

// Mount routes - Roles & Permissions
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);

export default router;
