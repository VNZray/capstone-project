import jwt from 'jsonwebtoken';
import db from '../db.js';

// SECURITY: JWT secrets MUST be set via environment variables. No fallbacks.
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
if (!JWT_ACCESS_SECRET) {
  throw new Error('CRITICAL: JWT_ACCESS_SECRET environment variable is not set. Authentication cannot function securely.');
}

export async function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    console.error('[authenticate] No authorization header');
    return res.status(401).json({ message: 'Authorization header required' });
  }

  if (!authHeader.startsWith('Bearer ')) {
    console.error('[authenticate] Invalid token format:', authHeader.substring(0, 20));
    return res.status(401).json({ message: 'Invalid token format (Bearer required)' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // SECURITY: Explicitly pin algorithm to prevent algorithm confusion attacks
    const payload = jwt.verify(token, JWT_ACCESS_SECRET, {
      algorithms: ['HS256'],
    });

    console.log('[authenticate] Token verified for user:', payload.id, 'role:', payload.role);

    req.user = {
      id: payload.id,
      email: payload.email,
      user_role_id: payload.role, // Mapped from 'role' in token
      role: payload.role,
    };

    // For tourist users, lookup and attach tourist_id
    // This is required for booking creation and other tourist-specific operations
    if (payload.role === 'Tourist') {
      try {
        const [touristRows] = await db.query(
          'SELECT id FROM tourist WHERE user_id = ?',
          [payload.id]
        );

        if (touristRows && touristRows.length > 0) {
          req.user.tourist_id = touristRows[0].id;
          console.log('[authenticate] Tourist ID attached:', req.user.tourist_id);
        } else {
          console.warn('[authenticate] No tourist record found for user:', payload.id);
          // Tourist record should exist, but don't fail auth if missing
          // Some endpoints may handle this gracefully
        }
      } catch (dbErr) {
        console.error('[authenticate] Error fetching tourist_id:', dbErr.message);
        // Don't fail authentication if tourist lookup fails
        // Let the endpoint handle the missing tourist_id
      }
    }

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      console.error('[authenticate] Token expired for request');
      return res.status(401).json({ message: 'Token expired' });
    }
    console.error('[authenticate] Invalid token:', err.message);
    return res.status(403).json({ message: 'Invalid token' });
  }
}
