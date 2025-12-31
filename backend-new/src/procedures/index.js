/**
 * Stored Procedures Index
 * Aggregates all stored procedure modules for database setup
 */
import { createAddressProcedures, dropAddressProcedures } from './address.procedure.js';
import { createAmenityProcedures, dropAmenityProcedures } from './amenity.procedure.js';
import { createOrderProcedures, dropOrderProcedures } from './order.procedure.js';
import { createServiceInquiryProcedures, dropServiceInquiryProcedures } from './service-inquiry.procedure.js';
import { createBookingProcedures, dropBookingProcedures } from './booking.procedure.js';
import { createBusinessProcedures, dropBusinessProcedures } from './business.procedure.js';
import { createExternalBookingProcedures, dropExternalBookingProcedures } from './external-booking.procedure.js';
import { createOwnerProcedures, dropOwnerProcedures } from './owner.procedure.js';
import { createPaymentProcedures, dropPaymentProcedures } from './payment.procedure.js';
import { createPermitProcedures, dropPermitProcedures } from './permit.procedure.js';
import { createProductProcedures, dropProductProcedures } from './product.procedure.js';
import { createPromotionProcedures, dropPromotionProcedures } from './promotion.procedure.js';
import { createReportProcedures, dropReportProcedures } from './report.procedure.js';
import { createReviewProcedures, dropReviewProcedures } from './review.procedure.js';
import { createRoomPhotosProcedures, dropRoomPhotosProcedures } from './room-photos.procedure.js';
import { createRoomProcedures, dropRoomProcedures } from './room.procedure.js';
import { createShopCategoryProcedures, dropShopCategoryProcedures } from './shop-category.procedure.js';
import { createTourismProcedures, dropTourismProcedures } from './tourism.procedure.js';
import { createTouristProcedures, dropTouristProcedures } from './tourist.procedure.js';
import { createTouristSpotProcedures, dropTouristSpotProcedures } from './tourist-spot.procedure.js';
import { createUserProcedures, dropUserProcedures } from './user.procedure.js';

// Extracted from migrations
import { createDiscountProcedures, dropDiscountProcedures } from './discount.procedure.js';
import { createServiceProcedures, dropServiceProcedures } from './service.procedure.js';
import { createProductReviewProcedures, dropProductReviewProcedures } from './product-review.procedure.js';
import { createNotificationProcedures, dropNotificationProcedures } from './notification.procedure.js';
import { createBusinessSettingsProcedures, dropBusinessSettingsProcedures } from './business-settings.procedure.js';
import { createRegistrationProcedures, dropRegistrationProcedures } from './registration.procedure.js';
import { createRefreshTokenProcedures, dropRefreshTokenProcedures } from './refresh-token.procedure.js';
import { createFavoriteProcedures, dropFavoriteProcedures } from './favorite.procedure.js';
import { createRefundProcedures, dropRefundProcedures } from './refund.procedure.js';
import { createNotificationPreferencesProcedures, dropNotificationPreferencesProcedures } from './notification-preferences.procedure.js';
import { createBusinessPolicyProcedures, dropBusinessPolicyProcedures } from './business-policy.procedure.js';
import { createAppLegalPolicyProcedures, dropAppLegalPolicyProcedures } from './app-legal-policy.procedure.js';
import { createRoomBlockedDatesProcedures, dropRoomBlockedDatesProcedures } from './room-blocked-dates.procedure.js';
import { createSeasonalPricingProcedures, dropSeasonalPricingProcedures } from './seasonal-pricing.procedure.js';
import { createStaffProcedures, dropStaffProcedures } from './staff.procedure.js';
import { createPermissionsProcedures, dropPermissionsProcedures } from './permissions.procedure.js';
import { createWebhookEventProcedures, dropWebhookEventProcedures } from './webhook-event.procedure.js';
import { createReviewPhotoProcedures, dropReviewPhotoProcedures } from './review-photo.procedure.js';
import { createOrderAuditProcedures, dropOrderAuditProcedures } from './order-audit.procedure.js';
import { createPasswordResetTokenProcedures, dropPasswordResetTokenProcedures } from './password-reset-token.procedure.js';
import { createEmailVerificationTokenProcedures, dropEmailVerificationTokenProcedures } from './email-verification-token.procedure.js';
import { createBusinessPhotosProcedures, dropBusinessPhotosProcedures } from './business-photos.procedure.js';
import { createUserSessionProcedures, dropUserSessionProcedures } from './user-session.procedure.js';
import { createAuditLogProcedures, dropAuditLogProcedures } from './audit-log.procedure.js';
import { createProductImagesProcedures, dropProductImagesProcedures } from './product-images.procedure.js';
import { createBusinessCategoryProcedures, dropBusinessCategoryProcedures } from './business-category.procedure.js';
import { createCategoryProcedures, dropCategoryProcedures } from './category.procedure.js';
import { createEntityCategoryProcedures, dropEntityCategoryProcedures } from './entity-category.procedure.js';

/**
 * All procedure modules with create and drop functions
 * Order matters: base tables first, then dependent tables
 */
const procedureModules = [
  // Core entities
  { name: 'Address', create: createAddressProcedures, drop: dropAddressProcedures },
  { name: 'User', create: createUserProcedures, drop: dropUserProcedures },
  { name: 'Tourist', create: createTouristProcedures, drop: dropTouristProcedures },
  { name: 'Tourism', create: createTourismProcedures, drop: dropTourismProcedures },
  { name: 'Owner', create: createOwnerProcedures, drop: dropOwnerProcedures },

  // Business entities
  { name: 'Business', create: createBusinessProcedures, drop: dropBusinessProcedures },
  { name: 'Amenity', create: createAmenityProcedures, drop: dropAmenityProcedures },
  { name: 'Permit', create: createPermitProcedures, drop: dropPermitProcedures },
  { name: 'TouristSpot', create: createTouristSpotProcedures, drop: dropTouristSpotProcedures },

  // Room and booking
  { name: 'Room', create: createRoomProcedures, drop: dropRoomProcedures },
  { name: 'RoomPhotos', create: createRoomPhotosProcedures, drop: dropRoomPhotosProcedures },
  { name: 'Booking', create: createBookingProcedures, drop: dropBookingProcedures },
  { name: 'ExternalBooking', create: createExternalBookingProcedures, drop: dropExternalBookingProcedures },
  { name: 'Payment', create: createPaymentProcedures, drop: dropPaymentProcedures },

  // Shop and products
  { name: 'ShopCategory', create: createShopCategoryProcedures, drop: dropShopCategoryProcedures },
  { name: 'Product', create: createProductProcedures, drop: dropProductProcedures },
  { name: 'Order', create: createOrderProcedures, drop: dropOrderProcedures },

  // Services
  { name: 'ServiceInquiry', create: createServiceInquiryProcedures, drop: dropServiceInquiryProcedures },

  // Marketing and feedback
  { name: 'Promotion', create: createPromotionProcedures, drop: dropPromotionProcedures },
  { name: 'Review', create: createReviewProcedures, drop: dropReviewProcedures },
  { name: 'Report', create: createReportProcedures, drop: dropReportProcedures },

  // === Extracted from migrations ===
  // Discount management
  { name: 'Discount', create: createDiscountProcedures, drop: dropDiscountProcedures },

  // Service management
  { name: 'Service', create: createServiceProcedures, drop: dropServiceProcedures },

  // Product reviews
  { name: 'ProductReview', create: createProductReviewProcedures, drop: dropProductReviewProcedures },

  // Notifications
  { name: 'Notification', create: createNotificationProcedures, drop: dropNotificationProcedures },
  { name: 'NotificationPreferences', create: createNotificationPreferencesProcedures, drop: dropNotificationPreferencesProcedures },

  // Business settings and policies
  { name: 'BusinessSettings', create: createBusinessSettingsProcedures, drop: dropBusinessSettingsProcedures },
  { name: 'BusinessPolicy', create: createBusinessPolicyProcedures, drop: dropBusinessPolicyProcedures },

  // Registration
  { name: 'Registration', create: createRegistrationProcedures, drop: dropRegistrationProcedures },

  // Authentication
  { name: 'RefreshToken', create: createRefreshTokenProcedures, drop: dropRefreshTokenProcedures },

  // Favorites
  { name: 'Favorite', create: createFavoriteProcedures, drop: dropFavoriteProcedures },

  // Refunds
  { name: 'Refund', create: createRefundProcedures, drop: dropRefundProcedures },

  // App legal policies
  { name: 'AppLegalPolicy', create: createAppLegalPolicyProcedures, drop: dropAppLegalPolicyProcedures },

  // Room availability
  { name: 'RoomBlockedDates', create: createRoomBlockedDatesProcedures, drop: dropRoomBlockedDatesProcedures },
  { name: 'SeasonalPricing', create: createSeasonalPricingProcedures, drop: dropSeasonalPricingProcedures },

  // Staff management
  { name: 'Staff', create: createStaffProcedures, drop: dropStaffProcedures },

  // Permissions and RBAC
  { name: 'Permissions', create: createPermissionsProcedures, drop: dropPermissionsProcedures },

  // Webhook events
  { name: 'WebhookEvent', create: createWebhookEventProcedures, drop: dropWebhookEventProcedures },

  // Review photos
  { name: 'ReviewPhoto', create: createReviewPhotoProcedures, drop: dropReviewPhotoProcedures },

  // Order audit
  { name: 'OrderAudit', create: createOrderAuditProcedures, drop: dropOrderAuditProcedures },

  // Password reset tokens
  { name: 'PasswordResetToken', create: createPasswordResetTokenProcedures, drop: dropPasswordResetTokenProcedures },

  // Email verification tokens
  { name: 'EmailVerificationToken', create: createEmailVerificationTokenProcedures, drop: dropEmailVerificationTokenProcedures },

  // Business photos
  { name: 'BusinessPhotos', create: createBusinessPhotosProcedures, drop: dropBusinessPhotosProcedures },

  // User sessions
  { name: 'UserSession', create: createUserSessionProcedures, drop: dropUserSessionProcedures },

  // Audit log
  { name: 'AuditLog', create: createAuditLogProcedures, drop: dropAuditLogProcedures },

  // Product images
  { name: 'ProductImages', create: createProductImagesProcedures, drop: dropProductImagesProcedures },

  // Business categories
  { name: 'BusinessCategory', create: createBusinessCategoryProcedures, drop: dropBusinessCategoryProcedures },

  // Categories (hierarchical)
  { name: 'Category', create: createCategoryProcedures, drop: dropCategoryProcedures },

  // Entity categories (junction table)
  { name: 'EntityCategory', create: createEntityCategoryProcedures, drop: dropEntityCategoryProcedures },
];

/**
 * Create all stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createAllProcedures(sequelize) {
  console.log('📦 Creating stored procedures...\n');

  for (const module of procedureModules) {
    try {
      console.log(`  Creating ${module.name} procedures...`);
      await module.create(sequelize);
      console.log(`  ✅ ${module.name} procedures created`);
    } catch (error) {
      console.error(`  ❌ Failed to create ${module.name} procedures:`, error.message);
      throw error;
    }
  }

  console.log('\n✅ All stored procedures created successfully');
}

/**
 * Drop all stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropAllProcedures(sequelize) {
  console.log('🗑️  Dropping stored procedures...\n');

  // Drop in reverse order to handle dependencies
  const reversedModules = [...procedureModules].reverse();

  for (const module of reversedModules) {
    try {
      console.log(`  Dropping ${module.name} procedures...`);
      await module.drop(sequelize);
      console.log(`  ✅ ${module.name} procedures dropped`);
    } catch (error) {
      // Log but continue - procedure might not exist
      console.warn(`  ⚠️  Warning dropping ${module.name} procedures:`, error.message);
    }
  }

  console.log('\n✅ All stored procedures dropped');
}

/**
 * Recreate all stored procedures (drop then create)
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function recreateAllProcedures(sequelize) {
  console.log('🔄 Recreating all stored procedures...\n');

  await dropAllProcedures(sequelize);
  console.log('');
  await createAllProcedures(sequelize);

  console.log('\n🎉 All stored procedures recreated successfully');
}

export { procedureModules };
