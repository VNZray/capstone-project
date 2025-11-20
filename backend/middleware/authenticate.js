import jwt from 'jsonwebtoken';

// Authentication middleware: verifies JWT and attaches req.user
export function authenticate(req, res, next) {
  try {
    const auth = req.headers['authorization'] || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: 'Missing Bearer token' });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Attach minimal user context
    req.user = {
      id: payload.id,
      user_role_id: payload.user_role_id ?? null,
      email: payload.email ?? null,
      // Some clients embed role/role_name directly in the token; pass through if present
      role: payload.role || payload.role_name || null,
    };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
