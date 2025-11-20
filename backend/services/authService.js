import db from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret_fallback';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret_fallback';
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7; // For DB calculation

// Helper to hash refresh tokens
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function generateTokens(user) {
  const accessToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.user_role_id, // Or map to role name if needed
    },
    JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    {
      id: user.id,
      familyId: uuidv4(), // New family for fresh login
      version: 0,
    },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}

export async function loginUser(email, password) {
  // 1. Verify credentials
  // Use Stored Procedure
  const [rows] = await db.query('CALL GetUserByEmail(?)', [email]);
  const users = rows[0]; // SP returns [[user], ...]
  
  if (!users || users.length === 0) {
    throw new Error('User not found');
  }
  
  const user = users[0];
  const isMatch = await bcrypt.compare(password, user.password);
  
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // 2. Generate tokens
  const { accessToken, refreshToken } = await generateTokens(user);
  const decodedRefresh = jwt.decode(refreshToken);

  // 3. Store refresh token hash
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(decodedRefresh.exp * 1000);
  
  // CALL InsertRefreshToken(token_hash, user_id, expires_at, family_id)
  await db.query('CALL InsertRefreshToken(?, ?, ?, ?)', [
    tokenHash,
    user.id,
    expiresAt,
    decodedRefresh.familyId
  ]);

  return { user, accessToken, refreshToken };
}

export async function refreshAccessToken(incomingRefreshToken) {
  let payload;
  try {
    payload = jwt.verify(incomingRefreshToken, JWT_REFRESH_SECRET);
  } catch (err) {
    throw new Error('Invalid refresh token');
  }

  const tokenHash = hashToken(incomingRefreshToken);

  // Check DB
  const [rows] = await db.query('CALL GetRefreshToken(?)', [tokenHash]);
  const tokens = rows[0];

  if (!tokens || tokens.length === 0) {
    // Token not found in DB. 
    // Could be expired and cleaned up, or malicious.
    // If it's a valid JWT but not in DB, it might be a reused token that was deleted/revoked?
    // For strict rotation, we expect to find it.
    throw new Error('Invalid refresh token (not found)');
  }

  const dbToken = tokens[0];

  // 1. Reuse Detection
  if (dbToken.revoked) {
    // Security Alert: This token was already used!
    // Revoke the entire family
    await db.query('CALL RevokeRefreshTokenFamily(?)', [dbToken.family_id]);
    throw new Error('Refresh token reuse detected - session invalidated');
  }

  // 2. Validate Expiry (DB Check)
  if (new Date() > new Date(dbToken.expires_at)) {
    // Should technically be caught by jwt.verify, but double check
    throw new Error('Refresh token expired');
  }

  // 3. Rotate Token
  // Revoke current token
  await db.query('UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = ?', [tokenHash]);

  // Issue new pair
  const newAccessToken = jwt.sign(
    {
      id: payload.id,
      email: payload.email, // Note: payload from refresh might not have email if not put in generateTokens
      // Better to fetch user fresh or put min info. 
      // Let's assume we fetch user or just rely on payload.
      // For robustness, let's fetch user ID to ensure existence?
      // But for speed, we trust the valid signed JWT + DB check.
      // We need the role though. The refresh token payload in generateTokens only had id/familyId.
      // We need to fetch the user to get the current role (in case it changed).
    },
    JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
  
  // Retrieve user to get current role for access token
  // We can use GetUserById existing SP
  const [userRows] = await db.query('CALL GetUserById(?)', [payload.id]);
  const user = userRows[0]?.[0];
  
  if (!user) {
      throw new Error('User not found during refresh');
  }

  // Re-sign access token with fresh user data
  const freshAccessToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.user_role_id,
    },
    JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  const newRefreshToken = jwt.sign(
    {
      id: user.id,
      familyId: dbToken.family_id, // Keep same family
      version: (payload.version || 0) + 1,
    },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  // Store new refresh token
  const newTokenHash = hashToken(newRefreshToken);
  const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await db.query('CALL InsertRefreshToken(?, ?, ?, ?)', [
    newTokenHash,
    user.id,
    newExpiresAt,
    dbToken.family_id
  ]);

  return { accessToken: freshAccessToken, refreshToken: newRefreshToken };
}

export async function revokeUserRefreshTokens(userId) {
  await db.query('CALL RevokeUserRefreshTokens(?)', [userId]);
}

export async function logout(incomingRefreshToken) {
    if (!incomingRefreshToken) return;
    const tokenHash = hashToken(incomingRefreshToken);
    // We can just delete it or revoke it.
    // Plan said "DeleteRefreshToken".
    await db.query('CALL DeleteRefreshToken(?)', [tokenHash]);
}

