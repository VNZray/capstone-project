/**
 * Sequelize Models Index
 * Centralizes model imports and associations
 */
import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Import core models
import UserRoleModel from './user-role.model.js';
import UserModel from './user.model.js';
import ProvinceModel from './province.model.js';
import MunicipalityModel from './municipality.model.js';
import BarangayModel from './barangay.model.js';
import OwnerModel from './owner.model.js';
import TouristModel from './tourist.model.js';

// Import business models
import BusinessModel from './business.model.js';
import BusinessPhotoModel from './business-photo.model.js';
import BusinessAmenityModel from './business-amenity.model.js';
import BusinessHoursModel from './business-hours.model.js';
import BusinessSettingsModel from './business-settings.model.js';
import BusinessPoliciesModel from './business-policies.model.js';

// Import room models
import RoomModel from './room.model.js';
import RoomPhotoModel from './room-photo.model.js';
import RoomAmenityModel from './room-amenity.model.js';
import RoomBlockedDatesModel from './room-blocked-dates.model.js';

// Import booking models
import BookingModel from './booking.model.js';
import ExternalBookingModel from './external-booking.model.js';

// Import payment models
import PaymentModel from './payment.model.js';
import RefundModel from './refund.model.js';
import WebhookEventModel from './webhook-event.model.js';

// Import amenity model
import AmenityModel from './amenity.model.js';

// Import review models
import ReviewAndRatingModel from './review.model.js';
import ReplyModel from './reply.model.js';
import ReviewPhotoModel from './review-photo.model.js';

// Import tourist spot models
import TouristSpotModel from './tourist-spot.model.js';
import TouristSpotImageModel from './tourist-spot-image.model.js';
import TouristSpotScheduleModel from './tourist-spot-schedule.model.js';

// Import product models
import ShopCategoryModel from './shop-category.model.js';
import ProductModel from './product.model.js';
import ProductStockModel from './product-stock.model.js';
import ServiceModel from './service.model.js';
import ServiceInquiryModel from './service-inquiry.model.js';
import DiscountModel from './discount.model.js';

// Import order models
import OrderModel from './order.model.js';
import OrderItemModel from './order-item.model.js';

// Import staff and notification models
import StaffModel from './staff.model.js';
import NotificationModel from './notification.model.js';
import NotificationPreferencesModel from './notification-preferences.model.js';

// Import other models
import ReportModel from './report.model.js';
import ReportAttachmentModel from './report-attachment.model.js';
import FavoriteModel from './favorite.model.js';
import PermitModel from './permit.model.js';
import PromotionModel from './promotion.model.js';
import EventModel from './event.model.js';
import ApprovalRecordModel from './approval-record.model.js';
import RefreshTokenModel from './refresh-token.model.js';

// Import category models
import CategoryModel from './category.model.js';
import EntityCategoryModel from './entity-category.model.js';

// Import legal policies model
import AppLegalPoliciesModel from './app-legal-policies.model.js';

// Initialize core models
const UserRole = UserRoleModel(sequelize, DataTypes);
const User = UserModel(sequelize, DataTypes);
const Province = ProvinceModel(sequelize, DataTypes);
const Municipality = MunicipalityModel(sequelize, DataTypes);
const Barangay = BarangayModel(sequelize, DataTypes);
const Owner = OwnerModel(sequelize, DataTypes);
const Tourist = TouristModel(sequelize, DataTypes);

// Initialize business models
const Business = BusinessModel(sequelize, DataTypes);
const BusinessPhoto = BusinessPhotoModel(sequelize, DataTypes);
const BusinessAmenity = BusinessAmenityModel(sequelize, DataTypes);
const BusinessHours = BusinessHoursModel(sequelize, DataTypes);
const BusinessSettings = BusinessSettingsModel(sequelize, DataTypes);
const BusinessPolicies = BusinessPoliciesModel(sequelize, DataTypes);

// Initialize room models
const Room = RoomModel(sequelize, DataTypes);
const RoomPhoto = RoomPhotoModel(sequelize, DataTypes);
const RoomAmenity = RoomAmenityModel(sequelize, DataTypes);
const RoomBlockedDates = RoomBlockedDatesModel(sequelize, DataTypes);

// Initialize booking models
const Booking = BookingModel(sequelize, DataTypes);
const ExternalBooking = ExternalBookingModel(sequelize, DataTypes);

// Initialize payment models
const Payment = PaymentModel(sequelize, DataTypes);
const Refund = RefundModel(sequelize, DataTypes);
const WebhookEvent = WebhookEventModel(sequelize, DataTypes);

// Initialize amenity model
const Amenity = AmenityModel(sequelize, DataTypes);

// Initialize review models
const ReviewAndRating = ReviewAndRatingModel(sequelize, DataTypes);
const Reply = ReplyModel(sequelize, DataTypes);
const ReviewPhoto = ReviewPhotoModel(sequelize, DataTypes);

// Initialize tourist spot models
const TouristSpot = TouristSpotModel(sequelize, DataTypes);
const TouristSpotImage = TouristSpotImageModel(sequelize, DataTypes);
const TouristSpotSchedule = TouristSpotScheduleModel(sequelize, DataTypes);

// Initialize product models
const ShopCategory = ShopCategoryModel(sequelize, DataTypes);
const Product = ProductModel(sequelize, DataTypes);
const ProductStock = ProductStockModel(sequelize, DataTypes);
const Service = ServiceModel(sequelize, DataTypes);
const ServiceInquiry = ServiceInquiryModel(sequelize, DataTypes);
const Discount = DiscountModel(sequelize, DataTypes);

// Initialize order models
const Order = OrderModel(sequelize, DataTypes);
const OrderItem = OrderItemModel(sequelize, DataTypes);

// Initialize staff and notification models
const Staff = StaffModel(sequelize, DataTypes);
const Notification = NotificationModel(sequelize, DataTypes);
const NotificationPreferences = NotificationPreferencesModel(sequelize, DataTypes);

// Initialize other models
const Report = ReportModel(sequelize, DataTypes);
const ReportAttachment = ReportAttachmentModel(sequelize, DataTypes);
const Favorite = FavoriteModel(sequelize, DataTypes);
const Permit = PermitModel(sequelize, DataTypes);
const Promotion = PromotionModel(sequelize, DataTypes);
const Event = EventModel(sequelize, DataTypes);
const ApprovalRecord = ApprovalRecordModel(sequelize, DataTypes);
const RefreshToken = RefreshTokenModel(sequelize, DataTypes);

// Initialize category models
const Category = CategoryModel(sequelize, DataTypes);
const EntityCategory = EntityCategoryModel(sequelize, DataTypes);

// Initialize legal policies model
const AppLegalPolicies = AppLegalPoliciesModel(sequelize, DataTypes);

// Define all models
const models = {
  // Core
  UserRole,
  User,
  Province,
  Municipality,
  Barangay,
  Owner,
  Tourist,
  // Business
  Business,
  BusinessPhoto,
  BusinessAmenity,
  BusinessHours,
  BusinessSettings,
  BusinessPolicies,
  // Room
  Room,
  RoomPhoto,
  RoomAmenity,
  RoomBlockedDates,
  // Booking
  Booking,
  ExternalBooking,
  // Payment
  Payment,
  Refund,
  WebhookEvent,
  // Amenity
  Amenity,
  // Reviews
  ReviewAndRating,
  Reply,
  ReviewPhoto,
  // Tourist Spots
  TouristSpot,
  TouristSpotImage,
  TouristSpotSchedule,
  // Products
  ShopCategory,
  Product,
  ProductStock,
  Service,
  ServiceInquiry,
  Discount,
  // Orders
  Order,
  OrderItem,
  // Staff & Notifications
  Staff,
  Notification,
  NotificationPreferences,
  // Other
  Report,
  ReportAttachment,
  Favorite,
  Permit,
  Promotion,
  Event,
  ApprovalRecord,
  RefreshToken,
  // Categories
  Category,
  EntityCategory,
  // Legal Policies
  AppLegalPolicies
};

// Setup associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Export sequelize instance and models
export {
  sequelize,
  Sequelize,
  // Core
  UserRole,
  User,
  Province,
  Municipality,
  Barangay,
  Owner,
  Tourist,
  // Business
  Business,
  BusinessPhoto,
  BusinessAmenity,
  BusinessHours,
  BusinessSettings,
  BusinessPolicies,
  // Room
  Room,
  RoomPhoto,
  RoomAmenity,
  RoomBlockedDates,
  // Booking
  Booking,
  ExternalBooking,
  // Payment
  Payment,
  Refund,
  WebhookEvent,
  // Amenity
  Amenity,
  // Reviews
  ReviewAndRating,
  Reply,
  ReviewPhoto,
  // Tourist Spots
  TouristSpot,
  TouristSpotImage,
  TouristSpotSchedule,
  // Products
  ShopCategory,
  Product,
  ProductStock,
  Service,
  ServiceInquiry,
  Discount,
  // Orders
  Order,
  OrderItem,
  // Staff & Notifications
  Staff,
  Notification,
  NotificationPreferences,
  // Other
  Report,
  ReportAttachment,
  Favorite,
  Permit,
  Promotion,
  Event,
  ApprovalRecord,
  RefreshToken,
  // Categories
  Category,
  EntityCategory,
  // Legal Policies
  AppLegalPolicies
};

export default models;
