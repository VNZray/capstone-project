/**
 * Auth Validation Schemas
 * Joi validation for authentication endpoints
 */
import Joi from 'joi';
import { commonValidations } from '../middlewares/validate-request.js';

export const authValidation = {
  register: {
    body: Joi.object({
      email: commonValidations.email.required(),
      phone_number: commonValidations.phone.required(),
      password: commonValidations.password.required(),
      role_type: Joi.string().valid('tourist', 'owner', 'business_owner').default('tourist'),
      first_name: Joi.string().min(2).max(25).required(),
      last_name: Joi.string().min(2).max(25).required(),
      middle_name: Joi.string().max(25).allow(null, ''),
      suffix: Joi.string().max(10).allow(null, ''),
      birthdate: Joi.date().iso().max('now').allow(null),
      gender: Joi.string().valid('Male', 'Female', 'Other').allow(null)
    })
  },

  login: {
    body: Joi.object({
      email: commonValidations.email.required(),
      password: Joi.string().required()
    })
  },

  verifyOtp: {
    body: Joi.object({
      email: commonValidations.email.required(),
      otp: Joi.string().length(6).pattern(/^\d+$/).required()
        .messages({
          'string.pattern.base': 'OTP must contain only digits',
          'string.length': 'OTP must be exactly 6 digits'
        })
    })
  },

  resendOtp: {
    body: Joi.object({
      email: commonValidations.email.required()
    })
  },

  forgotPassword: {
    body: Joi.object({
      email: commonValidations.email.required()
    })
  },

  resetPassword: {
    body: Joi.object({
      token: Joi.string().required(),
      password: commonValidations.password.required(),
      confirmPassword: Joi.string().valid(Joi.ref('password')).required()
        .messages({
          'any.only': 'Passwords do not match'
        })
    })
  },

  changePassword: {
    body: Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: commonValidations.password.required(),
      confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
        .messages({
          'any.only': 'Passwords do not match'
        })
    })
  }
};

export default authValidation;
