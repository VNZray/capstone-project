/**
 * Authentication Service
 * JWT token management and user authentication
 */
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/config.js';
import { User, UserRole, RefreshToken } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';

const { jwt: jwtConfig } = config;

/**
 * Hash a refresh token for secure storage
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate access and refresh tokens for a user
 * @param {Object} user - User object with id, email, role
 * @returns {Promise<{accessToken: string, refreshToken: string}>}
 */
export async function generateTokens(user) {
  // Fetch role name if not provided
  let roleName = user.role_name || user.role;
  if (!roleName && user.user_role_id) {
    const role = await UserRole.findByPk(user.user_role_id);
    roleName = role?.role_name || null;
  }

  const accessToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: roleName,
    },
    jwtConfig.accessSecret,
    {
      expiresIn: jwtConfig.accessExpiresIn,
      algorithm: jwtConfig.algorithm,
    }
  );

  const refreshToken = jwt.sign(
    {
      id: user.id,
      familyId: uuidv4(),
      version: 0,
    },
    jwtConfig.refreshSecret,
    {
      expiresIn: jwtConfig.refreshExpiresIn,
      algorithm: jwtConfig.algorithm,
    }
  );

  return { accessToken, refreshToken };
}

/**
 * Authenticate user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{user: Object, accessToken: string, refreshToken: string}>}
 */
export async function loginUser(email, password) {
  const GENERIC_AUTH_ERROR = 'Invalid email or password';

  // Find user with role
  const user = await User.findOne({
    where: { email },
    include: [{
      model: UserRole,
      as: 'role',
      attributes: ['id', 'role_name', 'permissions'],
    }],
  });

  if (!user) {
    // Perform dummy bcrypt to prevent timing attacks
    await bcrypt.compare(password, '$2b$12$dummyhashfortimingattack');
    throw new ApiError(401, GENERIC_AUTH_ERROR);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, GENERIC_AUTH_ERROR);
  }

  // Check account status
  if (!user.is_verified) {
    const error = new ApiError(403, 'Account not verified. Please check your email.');
    error.code = 'ACCOUNT_NOT_VERIFIED';
    throw error;
  }

  if (!user.is_active) {
    const error = new ApiError(403, 'Account is disabled. Please contact support.');
    error.code = 'ACCOUNT_DISABLED';
    throw error;
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateTokens({
    id: user.id,
    email: user.email,
    role_name: user.role?.role_name,
    user_role_id: user.user_role_id,
  });

  // Store refresh token hash
  const decodedRefresh = jwt.decode(refreshToken);
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(decodedRefresh.exp * 1000);

  await RefreshToken.create({
    id: uuidv4(),
    token_hash: tokenHash,
    user_id: user.id,
    expires_at: expiresAt,
    family_id: decodedRefresh.familyId,
  });

  logger.info(`User logged in: ${user.id}`);

  return {
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role?.role_name,
      is_verified: user.is_verified,
      must_change_password: user.must_change_password,
      profile_completed: user.profile_completed,
    },
    accessToken,
    refreshToken,
  };
}

/**
 * Refresh access token using refresh token
 * @param {string} incomingRefreshToken - The refresh token
 * @returns {Promise<{accessToken: string, refreshToken: string}>}
 */
export async function refreshAccessToken(incomingRefreshToken) {
  let payload;
  try {
    payload = jwt.verify(incomingRefreshToken, jwtConfig.refreshSecret, {
      algorithms: [jwtConfig.algorithm],
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Refresh token expired');
    }
    throw new ApiError(401, 'Invalid refresh token');
  }

  const tokenHash = hashToken(incomingRefreshToken);

  // Find the token in database
  const storedToken = await RefreshToken.findOne({
    where: { token_hash: tokenHash },
  });

  if (!storedToken) {
    // Token reuse detected - revoke entire family
    await RefreshToken.update(
      { revoked: true },
      { where: { family_id: payload.familyId } }
    );
    logger.warn(`Token reuse detected for user ${payload.id}, family ${payload.familyId}`);
    throw new ApiError(401, 'Token reuse detected. Please login again.');
  }

  if (storedToken.revoked) {
    throw new ApiError(401, 'Token has been revoked');
  }

  // Get user
  const user = await User.findByPk(payload.id, {
    include: [{
      model: UserRole,
      as: 'role',
      attributes: ['id', 'role_name', 'permissions'],
    }],
  });

  if (!user || !user.is_active) {
    throw new ApiError(401, 'User not found or inactive');
  }

  // Rotate tokens
  await storedToken.update({ revoked: true });

  const { accessToken, refreshToken } = await generateTokens({
    id: user.id,
    email: user.email,
    role_name: user.role?.role_name,
    user_role_id: user.user_role_id,
  });

  // Store new refresh token
  const decodedRefresh = jwt.decode(refreshToken);
  const newTokenHash = hashToken(refreshToken);
  const expiresAt = new Date(decodedRefresh.exp * 1000);

  await RefreshToken.create({
    id: uuidv4(),
    token_hash: newTokenHash,
    user_id: user.id,
    expires_at: expiresAt,
    family_id: payload.familyId,
    version: (payload.version || 0) + 1,
  });

  return { accessToken, refreshToken };
}

/**
 * Logout user by revoking refresh token
 * @param {string} refreshToken - The refresh token to revoke
 */
export async function logoutUser(refreshToken) {
  if (!refreshToken) return;

  const tokenHash = hashToken(refreshToken);
  await RefreshToken.update(
    { revoked: true },
    { where: { token_hash: tokenHash } }
  );
}

/**
 * Revoke all refresh tokens for a user
 * @param {string} userId - User ID
 */
export async function revokeAllUserTokens(userId) {
  await RefreshToken.update(
    { revoked: true },
    { where: { user_id: userId, revoked: false } }
  );
  logger.info(`All tokens revoked for user ${userId}`);
}

export default {
  generateTokens,
  loginUser,
  refreshAccessToken,
  logoutUser,
  revokeAllUserTokens,
};
