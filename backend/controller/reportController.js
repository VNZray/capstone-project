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
  let { status, remarks, updated_by } = request.body;
  try {
    const validStatuses = ["submitted", "under_review", "in_progress", "resolved", "rejected"];
    if (!validStatuses.includes(status)) {
      return response.status(400).json({
        message: "Invalid status. Must be one of: " + validStatuses.join(", "),
      });
    }

    // Set default remarks if blank
    if (!remarks || remarks.trim() === "") {
      switch (status) {
        case "submitted":
          remarks = "Report submitted.";
          break;
        case "under_review":
          remarks = "Report is now under review.";
          break;
        case "in_progress":
          remarks = "Report is being processed.";
          break;
        case "resolved":
          remarks = "Report has been resolved.";
          break;
        case "rejected":
          remarks = "Report has been rejected.";
          break;
        default:
          remarks = null;
      }
    }

    const [result] = await db.query("CALL UpdateReportStatus(?,?,?,?)", [id, status, remarks, updated_by || null]);
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

// Add a single attachment to a report
export async function addReportAttachment(request, response) {
  const { id } = request.params; // report id
  const { file_url, file_name, file_type, file_size } = request.body;
  try {
    if (!file_url || !file_name) {
      return response.status(400).json({ message: "file_url and file_name are required" });
    }
    const attachmentId = uuidv4();
    const params = [attachmentId, id, file_url, file_name, file_type || null, file_size || null];
    const placeholders = params.map(() => "?").join(",");
    const [result] = await db.query(`CALL InsertReportAttachment(${placeholders})`, params);
    const row = result[0] ? result[0][0] : null;
    response.status(201).json({ message: "Attachment added", attachment: row });
  } catch (error) {
    handleDbError(error, response);
  }
}

// Bulk add attachments (expects array attachments in body)
export async function bulkAddReportAttachments(request, response) {
  const { id } = request.params; // report id
  const { attachments } = request.body;
  try {
    if (!Array.isArray(attachments) || attachments.length === 0) {
      return response.status(400).json({ message: "attachments must be a non-empty array" });
    }
    // Validate minimal fields
    for (const a of attachments) {
      if (!a.file_url || !a.file_name) {
        return response.status(400).json({ message: "Each attachment needs file_url and file_name" });
      }
    }
    const json = JSON.stringify(attachments.map(a => ({
      file_url: a.file_url,
      file_name: a.file_name,
      file_type: a.file_type || null,
      file_size: a.file_size || null,
    })));
    const [data] = await db.query("CALL BulkInsertReportAttachments(?, ?)", [id, json]);
    response.status(201).json({ message: "Attachments added", attachments: data[0] });
  } catch (error) {
    handleDbError(error, response);
  }
}
