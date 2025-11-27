import db from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// SECURITY: JWT secrets MUST be set via environment variables. No fallbacks.
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_ACCESS_SECRET) {
  throw new Error('CRITICAL: JWT_ACCESS_SECRET environment variable is not set.');
}
if (!JWT_REFRESH_SECRET) {
  throw new Error('CRITICAL: JWT_REFRESH_SECRET environment variable is not set.');
}
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7; // For DB calculation

// Helper to hash refresh tokens
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function generateTokens(user) {
  // Fetch role name from user_role table
  let roleName = user.role_name; // Use if already provided
  if (!roleName && user.user_role_id) {
    const [roleRows] = await db.query(
      'SELECT role_name FROM user_role WHERE id = ?',
      [user.user_role_id]
    );
    roleName = roleRows && roleRows.length > 0 ? roleRows[0].role_name : null;
  }

  const accessToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: roleName, // Use role name instead of ID
    },
    JWT_ACCESS_SECRET,
    { 
      expiresIn: ACCESS_TOKEN_EXPIRY,
      algorithm: 'HS256' // SECURITY: Explicitly pin algorithm
    }
  );

  const refreshToken = jwt.sign(
    {
      id: user.id,
      familyId: uuidv4(), // New family for fresh login
      version: 0,
    },
    JWT_REFRESH_SECRET,
    { 
      expiresIn: '7d',
      algorithm: 'HS256' // SECURITY: Explicitly pin algorithm
    }
  );

  return { accessToken, refreshToken };
}

export async function loginUser(email, password) {
  // 1. Verify credentials
  // Use Stored Procedure
  const [rows] = await db.query('CALL GetUserByEmail(?)', [email]);
  const users = rows[0]; // SP returns [[user], ...]
  
  // SECURITY: Use generic error message to prevent user enumeration attacks
  // Do NOT reveal whether the email exists or the password was wrong
  const GENERIC_AUTH_ERROR = 'Invalid email or password';
  
  if (!users || users.length === 0) {
    // Perform dummy bcrypt comparison to prevent timing attacks
    await bcrypt.compare(password, '$2b$10$dummyhashfortimingattack');
    throw new Error(GENERIC_AUTH_ERROR);
  }
  
  const user = users[0];
  
  // Fetch role name
  if (user.user_role_id && !user.role_name) {
    const [roleRows] = await db.query(
      'SELECT role_name FROM user_role WHERE id = ?',
      [user.user_role_id]
    );
    if (roleRows && roleRows.length > 0) {
      user.role_name = roleRows[0].role_name;
    }
  }
  const isMatch = await bcrypt.compare(password, user.password);
  
  if (!isMatch) {
    throw new Error(GENERIC_AUTH_ERROR);
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
    // SECURITY: Explicitly pin algorithm to prevent algorithm confusion attacks
    payload = jwt.verify(incomingRefreshToken, JWT_REFRESH_SECRET, {
      algorithms: ['HS256'],
    });
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

  // Fetch role name
  let roleName = user.role_name;
  if (!roleName && user.user_role_id) {
    const [roleRows] = await db.query(
      'SELECT role_name FROM user_role WHERE id = ?',
      [user.user_role_id]
    );
    roleName = roleRows && roleRows.length > 0 ? roleRows[0].role_name : null;
  }

  // Re-sign access token with fresh user data
  const freshAccessToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: roleName, // Use role name instead of ID
    },
    JWT_ACCESS_SECRET,
    { 
      expiresIn: ACCESS_TOKEN_EXPIRY,
      algorithm: 'HS256' // SECURITY: Explicitly pin algorithm
    }
  );

  const newRefreshToken = jwt.sign(
    {
      id: user.id,
      familyId: dbToken.family_id, // Keep same family
      version: (payload.version || 0) + 1,
    },
    JWT_REFRESH_SECRET,
    { 
      expiresIn: '7d',
      algorithm: 'HS256' // SECURITY: Explicitly pin algorithm
    }
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
    await db.query('CALL DeleteRefreshToken(?)', [tokenHash]);
}

