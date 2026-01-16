import db from "../../db.js";
import { handleDbError } from "../../utils/errorHandler.js";

// ==================== APP LEGAL POLICIES ====================

/**
 * Get current active legal policies
 */
export async function getAppLegalPolicies(req, res) {
  try {
    const [data] = await db.query("CALL GetAppLegalPolicies()");

    if (!data || !data[0] || data[0].length === 0) {
      // Return default empty policies if not found
      return res.json({
        terms_and_conditions: null,
        privacy_policy: null,
        version: 1,
        is_active: true
      });
    }

    res.json(data[0][0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Get legal policies history (all versions)
 */
export async function getAppLegalPoliciesHistory(req, res) {
  try {
    const [data] = await db.query("CALL GetAppLegalPoliciesHistory()");
    res.json(data[0] || []);
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Update legal policies (creates new version)
 */
export async function updateAppLegalPolicies(req, res) {
  try {
    const { terms_and_conditions, privacy_policy } = req.body;

    // Get user ID from auth if available
    const updatedBy = req.user?.id || null;

    const [data] = await db.query(
      "CALL UpdateAppLegalPolicies(?, ?, ?)",
      [
        terms_and_conditions ?? null,
        privacy_policy ?? null,
        updatedBy
      ]
    );

    res.json({
      message: "Legal policies updated successfully",
      data: data[0][0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Get specific version of legal policies
 */
export async function getAppLegalPoliciesByVersion(req, res) {
  const { version } = req.params;

  try {
    const [data] = await db.query("CALL GetAppLegalPoliciesByVersion(?)", [parseInt(version)]);

    if (!data || !data[0] || data[0].length === 0) {
      return res.status(404).json({ message: "Version not found" });
    }

    res.json(data[0][0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}
