import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../utils/errorHandler.js";

// Get all reports
export async function getAllReports(request, response) {
  try {
    const [data] = await db.query(`
      SELECT 
        r.*,
        u.email as reporter_email,
        t.first_name as reporter_first_name,
        t.last_name as reporter_last_name,
        t.phone_number as reporter_contact
      FROM report r
      JOIN user u ON r.reporter_id = u.id
      LEFT JOIN tourist t ON u.tourist_id = t.id
      ORDER BY r.created_at DESC
    `);
    response.json(data);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// Get report by ID with status history
export async function getReportById(request, response) {
  const { id } = request.params;
  try {
    // Get report details
    const [reportData] = await db.query(`
      SELECT 
        r.*,
        u.email as reporter_email,
        t.first_name as reporter_first_name,
        t.last_name as reporter_last_name,
        t.phone_number as reporter_contact
      FROM report r
      JOIN user u ON r.reporter_id = u.id
      LEFT JOIN tourist t ON u.tourist_id = t.id
      WHERE r.id = ?
    `, [id]);
    
    if (reportData.length === 0) {
      return response.status(404).json({ message: "Report not found" });
    }
    
    // Get status history
    const [statusHistory] = await db.query(`
      SELECT 
        rsh.*,
        u.email as updated_by_email
      FROM report_status_history rsh
      LEFT JOIN user u ON rsh.updated_by = u.id
      WHERE rsh.report_id = ?
      ORDER BY rsh.updated_at ASC
    `, [id]);
    
    // Get attachments
    const [attachments] = await db.query(`
      SELECT * FROM report_attachment
      WHERE report_id = ?
      ORDER BY uploaded_at ASC
    `, [id]);
    
    const report = {
      ...reportData[0],
      status_history: statusHistory,
      attachments: attachments
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
    const [data] = await db.query(`
      SELECT * FROM report 
      WHERE reporter_id = ?
      ORDER BY created_at DESC
    `, [reporterId]);
    
    response.json(data);
  } catch (error) {
    handleDbError(error, response);
  }
}

// Create a new report
export async function createReport(request, response) {
  try {
    const reportId = uuidv4();
    const {
      reporter_id,
      target_type,
      target_id,
      title,
      description
    } = request.body;

    // Validate required fields
    if (!reporter_id || !target_type || !target_id || !title || !description) {
      return response.status(400).json({ 
        message: "All fields are required: reporter_id, target_type, target_id, title, description" 
      });
    }

    // Validate target_type
    const validTargetTypes = ["business", "event", "tourist_spot", "accommodation"];
    if (!validTargetTypes.includes(target_type)) {
      return response.status(400).json({ 
        message: "Invalid target_type. Must be one of: " + validTargetTypes.join(", ")
      });
    }

    // Insert the report
    await db.query(`
      INSERT INTO report (id, reporter_id, target_type, target_id, title, description, status)
      VALUES (?, ?, ?, ?, ?, ?, 'submitted')
    `, [reportId, reporter_id, target_type, target_id, title, description]);

    // Create initial status history entry
    const statusHistoryId = uuidv4();
    await db.query(`
      INSERT INTO report_status_history (id, report_id, status, remarks, updated_by)
      VALUES (?, ?, 'submitted', 'Report submitted by user', NULL)
    `, [statusHistoryId, reportId]);

    response.status(201).json({
      message: "Report created successfully",
      report_id: reportId
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
    // Validate status
    const validStatuses = ["submitted", "under_review", "in_progress", "resolved", "rejected"];
    if (!validStatuses.includes(status)) {
      return response.status(400).json({ 
        message: "Invalid status. Must be one of: " + validStatuses.join(", ")
      });
    }

    // Update report status
    const [result] = await db.query(`
      UPDATE report 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, id]);

    if (result.affectedRows === 0) {
      return response.status(404).json({ message: "Report not found" });
    }

    // Add status history entry
    const statusHistoryId = uuidv4();
    await db.query(`
      INSERT INTO report_status_history (id, report_id, status, remarks, updated_by)
      VALUES (?, ?, ?, ?, ?)
    `, [statusHistoryId, id, status, remarks || null, updated_by || null]);

    response.json({ message: "Report status updated successfully" });
  } catch (error) {
    handleDbError(error, response);
  }
}

// Delete a report (soft delete by updating status to 'deleted')
export async function deleteReport(request, response) {
  const { id } = request.params;
  try {
    const [result] = await db.query(`
      DELETE FROM report WHERE id = ?
    `, [id]);

    if (result.affectedRows === 0) {
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
    const [data] = await db.query(`
      SELECT 
        r.*,
        u.email as reporter_email
      FROM report r
      JOIN user u ON r.reporter_id = u.id
      WHERE r.target_type = ? AND r.target_id = ?
      ORDER BY r.created_at DESC
    `, [targetType, targetId]);
    
    response.json(data);
  } catch (error) {
    handleDbError(error, response);
  }
}

// Get reports by status (for filtering)
export async function getReportsByStatus(request, response) {
  const { status } = request.params;
  try {
    const [data] = await db.query(`
      SELECT 
        r.*,
        u.email as reporter_email
      FROM report r
      JOIN user u ON r.reporter_id = u.id
      WHERE r.status = ?
      ORDER BY r.created_at DESC
    `, [status]);
    
    response.json(data);
  } catch (error) {
    handleDbError(error, response);
  }
}
