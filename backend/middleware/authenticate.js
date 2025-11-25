import jwt from 'jsonwebtoken';

// SECURITY: JWT secrets MUST be set via environment variables. No fallbacks.
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
if (!JWT_ACCESS_SECRET) {
  throw new Error('CRITICAL: JWT_ACCESS_SECRET environment variable is not set. Authentication cannot function securely.');
}

export function authenticate(req, res, next) {
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
    const payload = jwt.verify(token, JWT_ACCESS_SECRET);
    
    console.log('[authenticate] Token verified for user:', payload.id, 'role:', payload.role);
    
    req.user = {
      id: payload.id,
      email: payload.email,
      user_role_id: payload.role, // Mapped from 'role' in token
      role: payload.role, 
    };

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
