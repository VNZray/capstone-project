import express from "express";
import * as serviceInquiryController from "../controller/serviceInquiryController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeScope, authorize, authorizeBusinessAccess } from "../middleware/authorizeRole.js";

const router = express.Router();

// ==================== SERVICE INQUIRY ROUTES ====================

// Get all inquiries (platform admin only)
router.get("/", authenticate, authorizeScope('platform'), authorize('view_all_profiles'), serviceInquiryController.getAllServiceInquiries);

// Create new inquiry (public)
router.post("/", serviceInquiryController.createServiceInquiry);

// Get inquiries by business (requires business access)
router.get("/business/:businessId", authenticate, authorizeBusinessAccess('businessId'), serviceInquiryController.getServiceInquiriesByBusiness);

// Get inquiry stats for business
router.get("/business/:businessId/stats", authenticate, authorizeBusinessAccess('businessId'), serviceInquiryController.getServiceInquiryStats);

// Get popular services by inquiries
router.get("/business/:businessId/popular", authenticate, authorizeBusinessAccess('businessId'), serviceInquiryController.getPopularServicesByInquiries);

// Get inquiries by service (public)
router.get("/service/:serviceId", serviceInquiryController.getServiceInquiriesByService);

// Get inquiries by user (query params: ?userId=xxx or ?guestId=xxx)
router.get("/user", serviceInquiryController.getServiceInquiriesByUser);

// Get single inquiry by ID
router.get("/:id", serviceInquiryController.getServiceInquiryById);

// Update inquiry status (requires manage_services permission)
router.put("/:id/status", authenticate, authorize('manage_services'), serviceInquiryController.updateServiceInquiryStatus);

// Mark inquiry as viewed
router.put("/:id/viewed", authenticate, authorize('manage_services'), serviceInquiryController.markServiceInquiryViewed);

// Update merchant notes
router.put("/:id/notes", authenticate, authorize('manage_services'), serviceInquiryController.updateServiceInquiryNotes);

export default router;
