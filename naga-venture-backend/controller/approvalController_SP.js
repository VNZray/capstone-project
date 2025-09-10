import db from "../db.js";
import { handleDbError } from "../utils/errorHandler.js";

// Get all pending edit requests using stored procedure
export const getPendingEditRequests = async (req, res) => {
  try {
    const [rows] = await db.execute('CALL GetPendingEditRequests()');

    // Get current categories for each tourist spot
    for (let row of rows) {
      const [currentCategories] = await db.execute('CALL GetTouristSpotCategories(?)', [row.tourist_spot_id]);
      row.current_categories = currentCategories;
    }

    res.json({
      success: true,
      data: rows,
      message: "Pending edit requests retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching pending edit requests:", error);
    return handleDbError(error, res);
  }
};

// Get all pending tourist spots using stored procedure
export const getPendingTouristSpots = async (req, res) => {
  try {
    const [rows] = await db.execute('CALL GetPendingTouristSpots()');

    // Get categories for each tourist spot using stored procedure
    for (let row of rows) {
      const [categories] = await db.execute('CALL GetTouristSpotCategories(?)', [row.id]);
      row.categories = categories;
    }

    res.json({
      success: true,
      data: rows,
      message: "Pending tourist spots retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching pending tourist spots:", error);
    return handleDbError(error, res);
  }
};

// Approve tourist spot using stored procedure
export const approveTouristSpot = async (req, res) => {
  try {
    const { id } = req.params;

    // Call stored procedure to approve tourist spot
    const [result] = await db.execute(
      'CALL ApproveTouristSpot(?, @success, @message)',
      [id]
    );

    // Get the result values
    const [resultValues] = await db.execute(
      'SELECT @success as success_flag, @message as message_text'
    );

    const { success_flag, message_text } = resultValues[0];

    if (!success_flag) {
      return res.status(400).json({
        success: false,
        message: message_text,
      });
    }

    res.json({
      success: true,
      message: message_text,
    });
    
  } catch (error) {
    console.error("Error approving tourist spot:", error);
    return handleDbError(error, res);
  }
};

// Approve edit request using stored procedure
export const approveEditRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Call stored procedure to approve edit request
    const [result] = await db.execute(
      'CALL ApproveEditRequest(?, @success, @message)',
      [id]
    );

    // Get the result values
    const [resultValues] = await db.execute(
      'SELECT @success as success_flag, @message as message_text'
    );

    const { success_flag, message_text } = resultValues[0];

    if (!success_flag) {
      return res.status(400).json({
        success: false,
        message: message_text,
      });
    }

    res.json({
      success: true,
      message: message_text,
    });
  } catch (error) {
    console.error("Error approving edit request:", error);
    return handleDbError(error, res);
  }
};

// Reject edit request using stored procedure
export const rejectEditRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    console.log(
      `[approval] rejectEditRequest called for id=${id} reason=${String(reason)}`
    );

    // Call stored procedure to reject edit request
    const [result] = await db.execute(
      'CALL RejectEditRequest(?, ?, @success, @message)',
      [id, reason || ""]
    );

    // Get the result values
    const [resultValues] = await db.execute(
      'SELECT @success as success_flag, @message as message_text'
    );

    const { success_flag, message_text } = resultValues[0];

    if (!success_flag) {
      return res.status(404).json({
        success: false,
        message: message_text,
      });
    }

    // Get the updated record to return
    const [updatedRows] = await db.execute(
      "SELECT id, approval_status, remarks, reviewed_at FROM tourist_spot_edits WHERE id = ?",
      [id]
    );

    const updated = Array.isArray(updatedRows) && updatedRows.length > 0 ? updatedRows[0] : null;

    res.json({
      success: true,
      message: message_text,
      data: updated,
    });
  } catch (error) {
    console.error("Error rejecting edit request:", error);
    return handleDbError(error, res);
  }
};

// Reject tourist spot using stored procedure
export const rejectTouristSpot = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Call stored procedure to reject tourist spot
    const [result] = await db.execute(
      'CALL RejectTouristSpot(?, ?, @success, @message)',
      [id, reason || ""]
    );

    // Get the result values
    const [resultValues] = await db.execute(
      'SELECT @success as success_flag, @message as message_text'
    );

    const { success_flag, message_text } = resultValues[0];

    if (!success_flag) {
      return res.status(400).json({
        success: false,
        message: message_text,
      });
    }

    res.json({
      success: true,
      message: message_text,
    });
  } catch (error) {
    console.error("Error rejecting tourist spot:", error);
    return handleDbError(error, res);
  }
};
