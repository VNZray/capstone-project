import express from "express";
import * as reportController from "../controller/reportController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

// Get all reports
router.get("/", authenticate, authorizeRole("Admin", "Tourism Staff"), reportController.getAllReports);

// Create a new report
router.post("/", reportController.createReport);

// Get report by ID (with status history and attachments)
router.get("/:id", reportController.getReportById);

// Update report status
router.put("/:id/status", authenticate, authorizeRole("Admin", "Tourism Staff"), reportController.updateReportStatus);

// Delete report
router.delete("/:id", authenticate, authorizeRole("Admin"), reportController.deleteReport);

// Get reports by reporter ID
router.get("/reporter/:reporterId", reportController.getReportsByReporterId);

// Get reports by target (business, event, etc.)
router.get("/target/:targetType/:targetId", reportController.getReportsByTarget);

// Get reports by status
router.get("/status/:status", reportController.getReportsByStatus);

// Add single attachment
router.post("/:id/attachments", reportController.addReportAttachment);

// Bulk add attachments
router.post("/:id/attachments/bulk", reportController.bulkAddReportAttachments);

export default router;
