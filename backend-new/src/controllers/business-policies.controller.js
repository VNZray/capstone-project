/**
 * Business Policies Controller
 * Handles business policies and house rules
 */
import { BusinessPolicies, Business, sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';

/**
 * Get business policies by business ID
 */
export const getBusinessPolicies = async (req, res, next) => {
  try {
    const { businessId } = req.params;

    const policies = await BusinessPolicies.findOne({
      where: { business_id: businessId }
    });

    if (!policies) {
      // Return default empty policies
      return res.success({
        business_id: businessId,
        house_rules: null,
        cancellation_policy: null,
        check_in_policy: null,
        check_out_policy: null,
        payment_policy: null,
        refund_policy: null,
        pet_policy: null,
        smoking_policy: null,
        additional_policies: null
      });
    }

    res.success(policies);
  } catch (error) {
    next(error);
  }
};

/**
 * Create or update business policies
 */
export const upsertBusinessPolicies = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const {
      house_rules,
      cancellation_policy,
      check_in_policy,
      check_out_policy,
      payment_policy,
      refund_policy,
      pet_policy,
      smoking_policy,
      additional_policies
    } = req.body;

    const [policies, created] = await BusinessPolicies.findOrCreate({
      where: { business_id: businessId },
      defaults: {
        business_id: businessId,
        house_rules,
        cancellation_policy,
        check_in_policy,
        check_out_policy,
        payment_policy,
        refund_policy,
        pet_policy,
        smoking_policy,
        additional_policies
      }
    });

    if (!created) {
      await policies.update({
        house_rules: house_rules ?? policies.house_rules,
        cancellation_policy: cancellation_policy ?? policies.cancellation_policy,
        check_in_policy: check_in_policy ?? policies.check_in_policy,
        check_out_policy: check_out_policy ?? policies.check_out_policy,
        payment_policy: payment_policy ?? policies.payment_policy,
        refund_policy: refund_policy ?? policies.refund_policy,
        pet_policy: pet_policy ?? policies.pet_policy,
        smoking_policy: smoking_policy ?? policies.smoking_policy,
        additional_policies: additional_policies ?? policies.additional_policies
      });
    }

    res.success(policies, created ? 'Business policies created successfully' : 'Business policies updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete business policies
 */
export const deleteBusinessPolicies = async (req, res, next) => {
  try {
    const { businessId } = req.params;

    const deleted = await BusinessPolicies.destroy({
      where: { business_id: businessId }
    });

    if (deleted === 0) {
      throw ApiError.notFound('Business policies not found');
    }

    res.success(null, 'Business policies deleted successfully');
  } catch (error) {
    next(error);
  }
};
