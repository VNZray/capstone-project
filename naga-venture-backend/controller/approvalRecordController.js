import db from '../db.js';
import { handleDbError } from '../utils/errorHandler.js';

export const getApprovalRecords = async (req, res) => {
  try {
    const { entity_type, entity_id, decision, limit } = req.query;
    const params = [
      entity_type || null,
      entity_id || null,
      decision || null,
      limit ? parseInt(limit, 10) : 100
    ];
    const [data] = await db.query('CALL GetApprovalRecords(?,?,?,?)', params);
    res.json({ success: true, data: data[0] || [], message: 'Approval records retrieved successfully' });
  } catch (error) {
    console.error('Error fetching approval records:', error);
    return handleDbError(error, res);
  }
};
