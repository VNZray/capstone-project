import express from "express";
import * as reportController from "../controller/reportController.js";

const router = express.Router();

// Get all reports
router.get("/", reportController.getAllReports);

// Create a new report
router.post("/", reportController.createReport);

// Get report by ID (with status history and attachments)
router.get("/:id", reportController.getReportById);

// Update report status
router.put("/:id/status", reportController.updateReportStatus);

// Delete report
router.delete("/:id", reportController.deleteReport);

// Get reports by reporter ID
router.get("/reporter/:reporterId", reportController.getReportsByReporterId);

// Get reports by target (business, event, etc.)
router.get("/target/:targetType/:targetId", reportController.getReportsByTarget);

// Get reports by status
router.get("/status/:status", reportController.getReportsByStatus);

export default router;
