/**
 * Report Controller
 * Handles report operations
 */
import { sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { extractProcedureResult, extractSingleResult } from '../utils/helpers.js';
import logger from '../config/logger.js';

/**
 * Create a report
 */
export const createReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { target_type, target_id, title, description, attachments = [] } = req.body;

    const id = crypto.randomUUID();
    await sequelize.query(
      'CALL InsertReport(?, ?, ?, ?, ?, ?)',
      { replacements: [id, userId, target_type, target_id, title, description] }
    );

    // Add attachments if any
    for (const attachment of attachments) {
      const attachmentId = crypto.randomUUID();
      await sequelize.query(
        'INSERT INTO report_attachments (id, report_id, file_url, file_name, file_type, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        { replacements: [attachmentId, id, attachment.file_url, attachment.file_name, attachment.file_type] }
      );
    }

    const queryResult = await sequelize.query('CALL GetReportById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.status(201).success(result, 'Report submitted successfully');
  } catch (error) {
    logger.error('Error creating report:', error);
    next(error);
  }
};

/**
 * Get report by ID
 */
export const getReport = async (req, res, next) => {
  try {
    const { id } = req.params;

    const queryResult = await sequelize.query('CALL GetReportById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Report not found');
    }

    res.success(result);
  } catch (error) {
    logger.error('Error fetching report:', error);
    next(error);
  }
};

/**
 * Get reports with filters
 */
export const getReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, targetType, targetId, reporterId } = req.query;

    let results;
    if (status) {
      const queryResult = await sequelize.query('CALL GetReportsByStatus(?)', {
        replacements: [status]
      });
      results = extractProcedureResult(queryResult);
    } else if (targetType && targetId) {
      const queryResult = await sequelize.query('CALL GetReportsByTargetTypeAndId(?, ?)', {
        replacements: [targetType, targetId]
      });
      results = extractProcedureResult(queryResult);
    } else if (reporterId) {
      const queryResult = await sequelize.query('CALL GetReportsByReporterId(?)', {
        replacements: [reporterId]
      });
      results = extractProcedureResult(queryResult);
    } else {
      const queryResult = await sequelize.query('CALL GetAllReports()');
      results = extractProcedureResult(queryResult);
    }

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedResults = results.slice(offset, offset + parseInt(limit));

    res.success({
      data: paginatedResults,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: results.length
      }
    });
  } catch (error) {
    logger.error('Error fetching reports:', error);
    next(error);
  }
};

/**
 * Update report status (admin)
 */
export const updateReportStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await sequelize.query('CALL UpdateReportStatus(?, ?)', {
      replacements: [id, status]
    });

    const queryResult = await sequelize.query('CALL GetReportById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.success(result, `Report status updated to ${status}`);
  } catch (error) {
    logger.error('Error updating report status:', error);
    next(error);
  }
};

/**
 * Add attachment to report
 */
export const addAttachment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { file_url, file_name, file_type } = req.body;

    const attachmentId = crypto.randomUUID();
    await sequelize.query(
      'INSERT INTO report_attachments (id, report_id, file_url, file_name, file_type, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      { replacements: [attachmentId, id, file_url, file_name, file_type] }
    );

    res.status(201).success({ id: attachmentId, file_url, file_name, file_type }, 'Attachment added');
  } catch (error) {
    logger.error('Error adding attachment:', error);
    next(error);
  }
};

/**
 * Get reports by target
 */
export const getReportsByTarget = async (req, res, next) => {
  try {
    const { targetType, targetId } = req.params;

    const queryResult = await sequelize.query('CALL GetReportsByTargetTypeAndId(?, ?)', {
      replacements: [targetType, targetId]
    });
    const results = extractProcedureResult(queryResult);

    res.success(results);
  } catch (error) {
    logger.error('Error fetching reports by target:', error);
    next(error);
  }
};

/**
 * Get report statistics (admin)
 */
export const getReportStats = async (req, res, next) => {
  try {
    const queryResult = await sequelize.query('CALL GetAllReports()');
    const allReports = extractProcedureResult(queryResult);

    const stats = {
      total: allReports.length,
      submitted: allReports.filter(r => r.status === 'submitted').length,
      underReview: allReports.filter(r => r.status === 'under_review').length,
      inProgress: allReports.filter(r => r.status === 'in_progress').length,
      resolved: allReports.filter(r => r.status === 'resolved').length,
      rejected: allReports.filter(r => r.status === 'rejected').length
    };

    res.success(stats);
  } catch (error) {
    logger.error('Error fetching report stats:', error);
    next(error);
  }
};

/**
 * Get my reports
 */
export const getMyReports = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const queryResult = await sequelize.query('CALL GetReportsByReporterId(?)', {
      replacements: [userId]
    });
    const results = extractProcedureResult(queryResult);

    let filtered = results;
    if (status) {
      filtered = filtered.filter(r => r.status === status);
    }

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedResults = filtered.slice(offset, offset + parseInt(limit));

    res.success({
      data: paginatedResults,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filtered.length
      }
    });
  } catch (error) {
    logger.error('Error fetching my reports:', error);
    next(error);
  }
};

export default {
  createReport,
  getReport,
  getReports,
  updateReportStatus,
  addAttachment,
  getReportsByTarget,
  getReportStats,
  getMyReports
};
