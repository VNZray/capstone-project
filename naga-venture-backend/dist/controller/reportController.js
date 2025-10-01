import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../utils/errorHandler.js";

// Get all reports
export async function getAllReports(request, response) {
  try {
    const [data] = await db.query("CALL GetAllReports()");
    response.json(data[0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// Get report by ID with status history
export async function getReportById(request, response) {
  const { id } = request.params;
  try {
    const [data] = await db.query("CALL GetReportById(?)", [id]);

    const reportRows = data[0];
    if (!reportRows || reportRows.length === 0) {
      return response.status(404).json({ message: "Report not found" });
    }

    const statusHistoryRows = data[1] ?? [];
    const attachmentRows = data[2] ?? [];

    const report = {
      ...reportRows[0],
      status_history: statusHistoryRows,
      attachments: attachmentRows,
    };
    response.json(report);
  } catch (error) {
    handleDbError(error, response);
  }
}

// Get reports by reporter ID (for tourists to see their own reports)
export async function getReportsByReporterId(request, response) {
  const { reporterId } = request.params;
  try {
    const [data] = await db.query("CALL GetReportsByReporterId(?)", [reporterId]);
    response.json(data[0]);
  } catch (error) {
    handleDbError(error, response);
  }
}

// Create a new report
export async function createReport(request, response) {
  try {
    const reportId = uuidv4();
    const { reporter_id, target_type, target_id, title, description } = request.body;

    if (!reporter_id || !target_type || !target_id || !title || !description) {
      return response.status(400).json({
        message: "All fields are required: reporter_id, target_type, target_id, title, description",
      });
    }

    const validTargetTypes = ["business", "event", "tourist_spot", "accommodation"];
    if (!validTargetTypes.includes(target_type)) {
      return response.status(400).json({
        message: "Invalid target_type. Must be one of: " + validTargetTypes.join(", "),
      });
    }

    const params = [reportId, reporter_id, target_type, target_id, title, description];
    const placeholders = params.map(() => "?").join(",");
    const [result] = await db.query(`CALL InsertReport(${placeholders})`, params);

    const createdRow = result[0] ? result[0][0] : null;

    response.status(201).json({
      message: "Report created successfully",
      report_id: reportId,
      report: createdRow,
    });
  } catch (error) {
    handleDbError(error, response);
  }
}

// Update report status (for tourism staff)
export async function updateReportStatus(request, response) {
  const { id } = request.params;
  const { status, remarks, updated_by } = request.body;
  try {
    const validStatuses = ["submitted", "under_review", "in_progress", "resolved", "rejected"];
    if (!validStatuses.includes(status)) {
      return response.status(400).json({
        message: "Invalid status. Must be one of: " + validStatuses.join(", "),
      });
    }

    const [result] = await db.query("CALL UpdateReportStatus(?,?,?,?)", [id, status, remarks || null, updated_by || null]);
    const updatedRow = result[0] ? result[0][0] : null;
    if (!updatedRow) {
      return response.status(404).json({ message: "Report not found" });
    }
    response.json({ message: "Report status updated successfully", report: updatedRow });
  } catch (error) {
    handleDbError(error, response);
  }
}

// Delete a report (soft delete by updating status to 'deleted')
export async function deleteReport(request, response) {
  const { id } = request.params;
  try {
    const [data] = await db.query("CALL DeleteReport(?)", [id]);
    const affected = data[0] && data[0][0] ? data[0][0].affected_rows : 0;
    if (affected === 0) {
      return response.status(404).json({ message: "Report not found" });
    }
    response.json({ message: "Report deleted successfully" });
  } catch (error) {
    handleDbError(error, response);
  }
}

// Get reports by target type and ID (to see all reports for a specific business/event/etc.)
export async function getReportsByTarget(request, response) {
  const { targetType, targetId } = request.params;
  try {
    const [data] = await db.query("CALL GetReportsByTarget(?,?)", [targetType, targetId]);
    response.json(data[0]);
  } catch (error) {
    handleDbError(error, response);
  }
}

// Get reports by status (for filtering)
export async function getReportsByStatus(request, response) {
  const { status } = request.params;
  try {
    const [data] = await db.query("CALL GetReportsByStatus(?)", [status]);
    response.json(data[0]);
  } catch (error) {
    handleDbError(error, response);
  }
}
