/**
 * App Legal Policies Controller
 * Handles application-level terms of service and privacy policies
 */
import { AppLegalPolicies, sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';

/**
 * Get current active legal policies
 */
export const getAppLegalPolicies = async (req, res, next) => {
  try {
    const policies = await AppLegalPolicies.findOne({
      where: { is_active: true },
      order: [['version', 'DESC']]
    });

    if (!policies) {
      // Return default empty policies
      return res.success({
        terms_and_conditions: null,
        privacy_policy: null,
        version: 1,
        is_active: true
      });
    }

    res.success(policies);
  } catch (error) {
    next(error);
  }
};

/**
 * Get legal policies history (all versions)
 */
export const getAppLegalPoliciesHistory = async (req, res, next) => {
  try {
    const policies = await AppLegalPolicies.findAll({
      order: [['version', 'DESC']]
    });

    res.success(policies);
  } catch (error) {
    next(error);
  }
};

/**
 * Get legal policies by version
 */
export const getAppLegalPoliciesByVersion = async (req, res, next) => {
  try {
    const { version } = req.params;

    const policies = await AppLegalPolicies.findOne({
      where: { version: parseInt(version) }
    });

    if (!policies) {
      throw ApiError.notFound('Version not found');
    }

    res.success(policies);
  } catch (error) {
    next(error);
  }
};

/**
 * Update legal policies (creates new version)
 */
export const updateAppLegalPolicies = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { terms_and_conditions, privacy_policy } = req.body;
    const updatedBy = req.user?.id || null;

    // Get current version
    const currentPolicies = await AppLegalPolicies.findOne({
      where: { is_active: true },
      order: [['version', 'DESC']],
      transaction
    });

    const newVersion = currentPolicies ? currentPolicies.version + 1 : 1;

    // Deactivate all previous versions
    await AppLegalPolicies.update(
      { is_active: false },
      { where: { is_active: true }, transaction }
    );

    // Create new version
    const newPolicies = await AppLegalPolicies.create({
      terms_and_conditions,
      privacy_policy,
      version: newVersion,
      is_active: true,
      updated_by: updatedBy
    }, { transaction });

    await transaction.commit();

    res.success(newPolicies, 'Legal policies updated successfully');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};
