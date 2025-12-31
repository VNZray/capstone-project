/**
 * Approval Controller
 * Handles approval operations
 */
import { sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';

/**
 * Create approval record
 */
export const createApproval = async (req, res, next) => {
  try {
    const { target_type, target_id, submitted_by, notes } = req.body;

    const id = crypto.randomUUID();
    await sequelize.query(
      `INSERT INTO approval_records
        (id, target_type, target_id, status, submitted_by, notes, created_at, updated_at)
       VALUES (?, ?, ?, 'pending', ?, ?, NOW(), NOW())`,
      { replacements: [id, target_type, target_id, submitted_by, notes] }
    );

    const [results] = await sequelize.query(
      'SELECT * FROM approval_records WHERE id = ?',
      { replacements: [id] }
    );

    res.status(201).success(results[0], 'Approval request submitted');
  } catch (error) {
    logger.error('Error creating approval:', error);
    next(error);
  }
};

/**
 * Get approval by ID
 */
export const getApproval = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [results] = await sequelize.query(
      'SELECT * FROM approval_records WHERE id = ?',
      { replacements: [id] }
    );

    if (!results || results.length === 0) {
      throw ApiError.notFound('Approval record not found');
    }

    res.success(results[0]);
  } catch (error) {
    logger.error('Error fetching approval:', error);
    next(error);
  }
};

/**
 * Get approvals with filters
 */
export const getApprovals = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, targetType, targetId } = req.query;

    let query = 'SELECT * FROM approval_records WHERE 1=1';
    const replacements = [];

    if (status) {
      query += ' AND status = ?';
      replacements.push(status);
    }
    if (targetType) {
      query += ' AND target_type = ?';
      replacements.push(targetType);
    }
    if (targetId) {
      query += ' AND target_id = ?';
      replacements.push(targetId);
    }

    query += ' ORDER BY created_at DESC';

    const [results] = await sequelize.query(query, { replacements });

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
    logger.error('Error fetching approvals:', error);
    next(error);
  }
};

/**
 * Approve request
 */
export const approveRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reviewedBy = req.user.id;
    const { notes } = req.body;

    await sequelize.query(
      `UPDATE approval_records
       SET status = 'approved', reviewed_by = ?, reviewed_at = NOW(), reviewer_notes = ?, updated_at = NOW()
       WHERE id = ?`,
      { replacements: [reviewedBy, notes, id] }
    );

    const [results] = await sequelize.query(
      'SELECT * FROM approval_records WHERE id = ?',
      { replacements: [id] }
    );

    res.success(results[0], 'Request approved');
  } catch (error) {
    logger.error('Error approving request:', error);
    next(error);
  }
};

/**
 * Reject request
 */
export const rejectRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reviewedBy = req.user.id;
    const { notes } = req.body;

    if (!notes) {
      throw ApiError.badRequest('Rejection reason is required');
    }

    await sequelize.query(
      `UPDATE approval_records
       SET status = 'rejected', reviewed_by = ?, reviewed_at = NOW(), reviewer_notes = ?, updated_at = NOW()
       WHERE id = ?`,
      { replacements: [reviewedBy, notes, id] }
    );

    const [results] = await sequelize.query(
      'SELECT * FROM approval_records WHERE id = ?',
      { replacements: [id] }
    );

    res.success(results[0], 'Request rejected');
  } catch (error) {
    logger.error('Error rejecting request:', error);
    next(error);
  }
};

/**
 * Request revision
 */
export const requestRevision = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reviewedBy = req.user.id;
    const { notes } = req.body;

    if (!notes) {
      throw ApiError.badRequest('Revision notes are required');
    }

    await sequelize.query(
      `UPDATE approval_records
       SET status = 'needs_revision', reviewed_by = ?, reviewed_at = NOW(), reviewer_notes = ?, updated_at = NOW()
       WHERE id = ?`,
      { replacements: [reviewedBy, notes, id] }
    );

    const [results] = await sequelize.query(
      'SELECT * FROM approval_records WHERE id = ?',
      { replacements: [id] }
    );

    res.success(results[0], 'Revision requested');
  } catch (error) {
    logger.error('Error requesting revision:', error);
    next(error);
  }
};

/**
 * Resubmit for approval
 */
export const resubmit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    await sequelize.query(
      `UPDATE approval_records
       SET status = 'pending', notes = ?, reviewed_by = NULL, reviewed_at = NULL, reviewer_notes = NULL, updated_at = NOW()
       WHERE id = ?`,
      { replacements: [notes, id] }
    );

    const [results] = await sequelize.query(
      'SELECT * FROM approval_records WHERE id = ?',
      { replacements: [id] }
    );

    res.success(results[0], 'Resubmitted for approval');
  } catch (error) {
    logger.error('Error resubmitting:', error);
    next(error);
  }
};

/**
 * Get pending approvals count
 */
export const getPendingCount = async (req, res, next) => {
  try {
    const { targetType } = req.query;

    let query = "SELECT COUNT(*) as count FROM approval_records WHERE status = 'pending'";
    const replacements = [];

    if (targetType) {
      query += ' AND target_type = ?';
      replacements.push(targetType);
    }

    const [results] = await sequelize.query(query, { replacements });

    res.success({ count: results[0]?.count || 0 });
  } catch (error) {
    logger.error('Error fetching pending count:', error);
    next(error);
  }
};

/**
 * Get approval history for a target
 */
export const getApprovalHistory = async (req, res, next) => {
  try {
    const { targetType, targetId } = req.params;

    const [results] = await sequelize.query(
      'SELECT * FROM approval_records WHERE target_type = ? AND target_id = ? ORDER BY created_at DESC',
      { replacements: [targetType, targetId] }
    );

    res.success(results);
  } catch (error) {
    logger.error('Error fetching approval history:', error);
    next(error);
  }
};

export default {
  createApproval,
  getApproval,
  getApprovals,
  approveRequest,
  rejectRequest,
  requestRevision,
  resubmit,
  getPendingCount,
  getApprovalHistory
};
