import * as authService from '../../services/authService.js';

const COOKIE_NAME = 'refresh_token';
const IS_PROD = process.env.NODE_ENV === 'production';

/**
 * Cookie options for refresh token storage
 *
 * IMPORTANT: For cross-origin requests (different domain/IP between frontend and backend):
 * - In development: Use 'lax' for same-origin OR configure same localhost
 * - In production: Use 'strict' with HTTPS
 *
 * If frontend and backend are on different IPs/domains in development,
 * the cookie won't be sent with cross-origin requests unless SameSite is 'none' + Secure.
 * Since HTTP doesn't support Secure cookies, we need to use same-origin in dev.
 */
const getCookieOptions = (req) => {
  // Check if it's a cross-origin request
  const origin = req.get('origin') || '';
  const host = req.get('host') || '';

  // Determine if this is a same-origin request
  // In development, localhost:5173 -> localhost:3000 is cross-origin but same host
  const isSameHost = origin.includes('localhost') && host.includes('localhost');

  return {
    httpOnly: true,
    secure: IS_PROD, // Only use secure in production (HTTPS)
    // Use 'lax' in development - works for same-site navigation
    // For true cross-origin (different IPs), cookies may not work without HTTPS
    sameSite: IS_PROD ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/', // accessible to all routes (e.g. /api/auth/refresh)
    // In development, don't set domain to allow cross-origin with withCredentials
    // The cookie will be set for the backend's domain
  };
};

// Keep backward compatibility with static cookieOptions for places that don't have req
const cookieOptions = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: IS_PROD ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/'
};

export async function login(req, res) {
  try {
    const { email, password, client } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const { user, accessToken, refreshToken } = await authService.loginUser(email, password);

    // Build user response object with required action flags
    const userResponse = {
      id: user.id,
      email: user.email,
      user_role_id: user.user_role_id,
      must_change_password: user.must_change_password || false,
      profile_completed: user.profile_completed !== false, // Default to true if not set
    };

    // Web Client: Set HttpOnly Cookie
    if (client === 'web') {
      const options = getCookieOptions(req);
      console.log('[Login] Setting cookie for web client:', {
        cookieName: COOKIE_NAME,
        cookieOptions: options,
        refreshTokenPresent: !!refreshToken
      });
      res.cookie(COOKIE_NAME, refreshToken, options);
      // Do NOT return refreshToken in body for web
      return res.json({
        message: 'Login successful',
        accessToken,
        user: userResponse,
      });
    }

    // Mobile/Other: Return in Body
    return res.json({
      message: 'Login successful',
      accessToken,
      refreshToken, // Mobile needs this to store in SecureStore
      user: userResponse,
    });

  } catch (error) {
    console.error('Login error:', error);

    // Handle specific error codes
    if (error.code === 'ACCOUNT_NOT_VERIFIED') {
      return res.status(403).json({
        message: error.message,
        code: 'ACCOUNT_NOT_VERIFIED'
      });
    }

    if (error.code === 'ACCOUNT_DISABLED') {
      return res.status(403).json({
        message: error.message,
        code: 'ACCOUNT_DISABLED'
      });
    }

    // SECURITY: Always return 401 for auth failures with generic message
    // Do not reveal whether email exists or password was wrong
    const isAuthError = error.message === 'Invalid email or password';
    const status = isAuthError ? 401 : 500;
    const message = isAuthError ? error.message : 'Authentication failed';
    return res.status(status).json({ message });
  }
}

export async function refresh(req, res) {
  try {
    // Identify client type from request body or default to cookie presence
    const { client } = req.body || {};
    const isWebClient = client === 'web' || !!req.cookies?.[COOKIE_NAME];

    // Try getting token from Cookie (Web) or Body (Mobile)
    const refreshToken = req.cookies?.[COOKIE_NAME] || req.body?.refreshToken;

    // Debug logging
    console.log('[Refresh] Client type:', isWebClient ? 'web' : 'mobile');
    console.log('[Refresh] Cookie present:', !!req.cookies?.[COOKIE_NAME]);
    console.log('[Refresh] Body token present:', !!req.body?.refreshToken);
    console.log('[Refresh] Cookies received:', Object.keys(req.cookies || {}));

    if (!refreshToken) {
      console.log('[Refresh] No token found - returning 401');
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await authService.refreshAccessToken(refreshToken);

    // Web Client: Update Cookie
    if (isWebClient) {
      const options = getCookieOptions(req);
      console.log('[Refresh] Setting new cookie for web client:', {
        cookieName: COOKIE_NAME,
        cookieOptions: options,
        newRefreshTokenPresent: !!newRefreshToken
      });
      res.cookie(COOKIE_NAME, newRefreshToken, options);
      return res.json({ accessToken: newAccessToken });
    }

    // Mobile: Return in Body
    return res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });

  } catch (error) {
    console.error('Refresh error:', error.message);
    // Clear cookie if invalid
    res.clearCookie(COOKIE_NAME, { path: '/' });
    return res.status(403).json({ message: error.message || 'Invalid refresh token' });
  }
}

export async function logout(req, res) {
  try {
    const refreshToken = req.cookies?.[COOKIE_NAME] || req.body?.refreshToken;

    await authService.logout(refreshToken);

    res.clearCookie(COOKIE_NAME);
    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Error logging out' });
  }
}

export async function me(req, res) {
  // req.user is set by authenticate middleware
  if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
  }
  return res.json({ user: req.user });
}

