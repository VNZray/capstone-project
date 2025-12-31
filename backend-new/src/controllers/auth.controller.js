/**
 * Auth Controller
 * Authentication endpoints (login, register, refresh, logout)
 */
import jwt from 'jsonwebtoken';
import { User, UserRole, Tourist, Owner } from '../models/index.js';
import { sequelize } from '../models/index.js';
import config from '../config/config.js';
import logger from '../config/logger.js';
import { ApiError } from '../utils/api-error.js';
import { generateOtp, generateSecureToken } from '../utils/helpers.js';
import { validatePassword } from '../utils/password-validation.js';

const { jwt: jwtConfig } = config;

/**
 * Generate JWT tokens
 */
const generateTokens = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.user_role_id
  };

  const accessToken = jwt.sign(payload, jwtConfig.accessSecret, {
    algorithm: jwtConfig.algorithm,
    expiresIn: jwtConfig.accessExpiry
  });

  const refreshToken = jwt.sign(
    { id: user.id },
    jwtConfig.refreshSecret,
    {
      algorithm: jwtConfig.algorithm,
      expiresIn: jwtConfig.refreshExpiry
    }
  );

  return { accessToken, refreshToken };
};

/**
 * Set refresh token as HttpOnly cookie
 */
const setRefreshTokenCookie = (res, refreshToken) => {
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.isProd,
    sameSite: 'strict',
    maxAge
  });
};

/**
 * Register a new user
 */
export const register = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { email, phone_number, password, role_type, ...profileData } = req.body;

    // Validate password
    const passwordValidation = validatePassword(password, {
      email,
      firstName: profileData.first_name,
      lastName: profileData.last_name
    });

    if (!passwordValidation.isValid) {
      throw new ApiError(400, 'Password does not meet requirements', passwordValidation.errors);
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [sequelize.Sequelize.Op.or]: [
          { email },
          { phone_number }
        ]
      }
    });

    if (existingUser) {
      throw new ApiError(409, 'User with this email or phone number already exists');
    }

    // Get role based on role_type
    const roleMapping = {
      tourist: 'Tourist',
      owner: 'Business Owner',
      business_owner: 'Business Owner'
    };

    const roleName = roleMapping[role_type] || 'Tourist';
    const role = await UserRole.findOne({ where: { role_name: roleName } });

    if (!role) {
      throw new ApiError(500, 'User role configuration error');
    }

    // Generate OTP for verification
    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create user
    const user = await User.create({
      email,
      phone_number,
      password,
      user_role_id: role.id,
      otp,
      otp_expires_at: otpExpiresAt,
      is_verified: false,
      is_active: false
    }, { transaction });

    // Create profile based on role
    if (roleName === 'Tourist') {
      await Tourist.create({
        user_id: user.id,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        middle_name: profileData.middle_name,
        suffix: profileData.suffix,
        birthdate: profileData.birthdate,
        gender: profileData.gender
      }, { transaction });
    } else if (roleName === 'Business Owner') {
      await Owner.create({
        user_id: user.id,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        middle_name: profileData.middle_name,
        suffix: profileData.suffix,
        birthdate: profileData.birthdate,
        gender: profileData.gender
      }, { transaction });
    }

    await transaction.commit();

    // TODO: Send OTP via email/SMS

    logger.info(`User registered: ${user.id} (${email})`);

    res.created({
      id: user.id,
      email: user.email,
      role: roleName,
      message: 'Please verify your account using the OTP sent to your email/phone'
    }, 'Registration successful');

  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Login user
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with password (using scope)
    const user = await User.scope('withPassword').findOne({
      where: { email },
      include: [{
        model: UserRole,
        as: 'role',
        attributes: ['id', 'role_name', 'permissions']
      }]
    });

    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Check if account is locked
    if (user.isLocked()) {
      const lockRemaining = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
      throw new ApiError(423, `Account is locked. Try again in ${lockRemaining} minutes`);
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      // Increment failed attempts
      user.failed_login_attempts += 1;

      // Lock account after 5 failed attempts
      if (user.failed_login_attempts >= 5) {
        user.locked_until = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        logger.warn(`Account locked due to failed attempts: ${user.id}`);
      }

      await user.save();
      throw new ApiError(401, 'Invalid email or password');
    }

    // Check if account is verified and active
    if (!user.is_verified) {
      throw new ApiError(403, 'Please verify your account first');
    }

    if (!user.is_active) {
      throw new ApiError(403, 'Your account has been deactivated');
    }

    // Reset failed attempts and update last login
    user.failed_login_attempts = 0;
    user.locked_until = null;
    user.last_login = new Date();
    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Set refresh token cookie
    setRefreshTokenCookie(res, refreshToken);

    logger.info(`User logged in: ${user.id}`);

    res.success({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role?.role_name,
        permissions: user.role?.permissions || []
      }
    }, 'Login successful');

  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (!token) {
      throw new ApiError(401, 'Refresh token required');
    }

    // Verify refresh token
    const payload = jwt.verify(token, jwtConfig.refreshSecret, {
      algorithms: [jwtConfig.algorithm]
    });

    // Get user
    const user = await User.findByPk(payload.id, {
      include: [{
        model: UserRole,
        as: 'role'
      }]
    });

    if (!user || !user.is_active) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Set new refresh token cookie
    setRefreshTokenCookie(res, newRefreshToken);

    res.success({ accessToken }, 'Token refreshed');

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Refresh token expired. Please login again'));
    }
    next(error);
  }
};

/**
 * Logout user
 */
export const logout = async (req, res) => {
  // Clear refresh token cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: config.isProd,
    sameSite: 'strict'
  });

  logger.info(`User logged out: ${req.user?.id}`);

  res.success(null, 'Logged out successfully');
};

/**
 * Verify OTP
 */
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.scope('withOtp').findOne({ where: { email } });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user.is_verified) {
      throw new ApiError(400, 'Account already verified');
    }

    if (!user.otp || user.otp !== otp) {
      throw new ApiError(400, 'Invalid OTP');
    }

    if (new Date() > new Date(user.otp_expires_at)) {
      throw new ApiError(400, 'OTP has expired');
    }

    // Verify and activate user
    user.is_verified = true;
    user.is_active = true;
    user.otp = null;
    user.otp_expires_at = null;
    await user.save();

    logger.info(`User verified: ${user.id}`);

    res.success(null, 'Account verified successfully');

  } catch (error) {
    next(error);
  }
};

/**
 * Resend OTP
 */
export const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user.is_verified) {
      throw new ApiError(400, 'Account already verified');
    }

    // Generate new OTP
    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    user.otp = otp;
    user.otp_expires_at = otpExpiresAt;
    await user.save();

    // TODO: Send OTP via email/SMS

    res.success(null, 'OTP sent successfully');

  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: UserRole,
          as: 'role',
          attributes: ['id', 'role_name', 'permissions']
        },
        {
          model: Tourist,
          as: 'tourist'
        },
        {
          model: Owner,
          as: 'owner'
        }
      ]
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.success(user, 'User profile retrieved');

  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  refreshToken,
  logout,
  verifyOtp,
  resendOtp,
  getMe
};
