import express from "express";
import * as serviceInquiryController from "../controller/serviceInquiryController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

// ==================== SERVICE INQUIRY ROUTES ====================

// Get all inquiries (admin)
router.get("/", authenticate, authorizeRole("Admin"), serviceInquiryController.getAllServiceInquiries);

// Create new inquiry
router.post("/", serviceInquiryController.createServiceInquiry);

// Get inquiries by business
router.get("/business/:businessId", authenticate, authorizeRole("Business Owner", "Staff", "Admin"), serviceInquiryController.getServiceInquiriesByBusiness);

// Get inquiry stats for business
router.get("/business/:businessId/stats", authenticate, authorizeRole("Business Owner", "Staff", "Admin"), serviceInquiryController.getServiceInquiryStats);

// Get popular services by inquiries
router.get("/business/:businessId/popular", authenticate, authorizeRole("Business Owner", "Staff", "Admin"), serviceInquiryController.getPopularServicesByInquiries);

// Get inquiries by service
router.get("/service/:serviceId", serviceInquiryController.getServiceInquiriesByService);

// Get inquiries by user (query params: ?userId=xxx or ?guestId=xxx)
router.get("/user", serviceInquiryController.getServiceInquiriesByUser);

// Get single inquiry by ID
router.get("/:id", serviceInquiryController.getServiceInquiryById);

// Update inquiry status
router.put("/:id/status", authenticate, authorizeRole("Business Owner", "Staff", "Admin"), serviceInquiryController.updateServiceInquiryStatus);

// Mark inquiry as viewed
router.put("/:id/viewed", authenticate, authorizeRole("Business Owner", "Staff", "Admin"), serviceInquiryController.markServiceInquiryViewed);

// Update merchant notes
router.put("/:id/notes", authenticate, authorizeRole("Business Owner", "Staff", "Admin"), serviceInquiryController.updateServiceInquiryNotes);

export default router;
