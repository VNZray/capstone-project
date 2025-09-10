import db from "../db.js";
import { handleDbError } from "../utils/errorHandler.js";

// Get all reports using stored procedure
export async function getAllReports(request, response) {
  try {
    const [data] = await db.execute('CALL GetAllReports()');
    response.json(data);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// Get report by ID with status history using stored procedures
export async function getReportById(request, response) {
  const { id } = request.params;
  try {
    // Get report details using stored procedure
    const [reportData] = await db.execute('CALL GetReportById(?)', [id]);
    
    if (reportData.length === 0) {
      return response.status(404).json({ message: "Report not found" });
    }
    
    // Get status history using stored procedure
    const [statusHistory] = await db.execute('CALL GetReportStatusHistory(?)', [id]);
    
    // Get attachments using stored procedure
    const [attachments] = await db.execute('CALL GetReportAttachments(?)', [id]);
    
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

// Get reports by reporter ID using stored procedure
export async function getReportsByReporterId(request, response) {
  const { reporterId } = request.params;
  try {
    const [data] = await db.execute('CALL GetReportsByReporterId(?)', [reporterId]);
    response.json(data);
  } catch (error) {
    handleDbError(error, response);
  }
}

// Create a new report using stored procedure
export async function createReport(request, response) {
  try {
    const {
      reporter_id,
      target_type,
      target_id,
      title,
      description
    } = request.body;

    // Call stored procedure to create report
    const [result] = await db.execute(
      'CALL CreateReport(?, ?, ?, ?, ?, @report_id, @success, @message)',
      [reporter_id, target_type, target_id, title, description]
    );

    // Get the result values
    const [resultValues] = await db.execute(
      'SELECT @report_id as report_id, @success as success_flag, @message as message_text'
    );

    const { report_id, success_flag, message_text } = resultValues[0];

    if (!success_flag) {
      return response.status(400).json({ 
        message: message_text
      });
    }

    response.status(201).json({
      message: message_text,
      report_id: report_id
    });
  } catch (error) {
    handleDbError(error, response);
  }
}

// Update report status using stored procedure
export async function updateReportStatus(request, response) {
  const { id } = request.params;
  const { status, remarks, updated_by } = request.body;

  try {
    // Call stored procedure to update report status
    const [result] = await db.execute(
      'CALL UpdateReportStatus(?, ?, ?, ?, @success, @message)',
      [id, status, remarks, updated_by]
    );

    // Get the result values
    const [resultValues] = await db.execute(
      'SELECT @success as success_flag, @message as message_text'
    );

    const { success_flag, message_text } = resultValues[0];

    if (!success_flag) {
      return response.status(400).json({ 
        message: message_text
      });
    }

    response.json({ message: message_text });
  } catch (error) {
    handleDbError(error, response);
  }
}

// Delete a report using stored procedure
export async function deleteReport(request, response) {
  const { id } = request.params;
  try {
    // Call stored procedure to delete report
    const [result] = await db.execute(
      'CALL DeleteReport(?, @success, @message)',
      [id]
    );

    // Get the result values
    const [resultValues] = await db.execute(
      'SELECT @success as success_flag, @message as message_text'
    );

    const { success_flag, message_text } = resultValues[0];

    if (!success_flag) {
      return response.status(404).json({ message: message_text });
    }

    response.json({ message: message_text });
  } catch (error) {
    handleDbError(error, response);
  }
}

// Get reports by target type and ID using stored procedure
export async function getReportsByTarget(request, response) {
  const { targetType, targetId } = request.params;
  try {
    const [data] = await db.execute('CALL GetReportsByTarget(?, ?)', [targetType, targetId]);
    response.json(data);
  } catch (error) {
    handleDbError(error, response);
  }
}

// Get reports by status using stored procedure
export async function getReportsByStatus(request, response) {
  const { status } = request.params;
  try {
    const [data] = await db.execute('CALL GetReportsByStatus(?)', [status]);
    response.json(data);
  } catch (error) {
    handleDbError(error, response);
  }
}
