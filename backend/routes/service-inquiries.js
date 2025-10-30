import express from "express";
import * as serviceInquiryController from "../controller/serviceInquiryController.js";

const router = express.Router();

// ==================== SERVICE INQUIRY ROUTES ====================

// Get all inquiries (admin)
router.get("/", serviceInquiryController.getAllServiceInquiries);

// Create new inquiry
router.post("/", serviceInquiryController.createServiceInquiry);

// Get inquiries by business
router.get("/business/:businessId", serviceInquiryController.getServiceInquiriesByBusiness);

// Get inquiry stats for business
router.get("/business/:businessId/stats", serviceInquiryController.getServiceInquiryStats);

// Get popular services by inquiries
router.get("/business/:businessId/popular", serviceInquiryController.getPopularServicesByInquiries);

// Get inquiries by service
router.get("/service/:serviceId", serviceInquiryController.getServiceInquiriesByService);

// Get inquiries by user (query params: ?userId=xxx or ?guestId=xxx)
router.get("/user", serviceInquiryController.getServiceInquiriesByUser);

// Get single inquiry by ID
router.get("/:id", serviceInquiryController.getServiceInquiryById);

// Update inquiry status
router.put("/:id/status", serviceInquiryController.updateServiceInquiryStatus);

// Mark inquiry as viewed
router.put("/:id/viewed", serviceInquiryController.markServiceInquiryViewed);

// Update merchant notes
router.put("/:id/notes", serviceInquiryController.updateServiceInquiryNotes);

export default router;
