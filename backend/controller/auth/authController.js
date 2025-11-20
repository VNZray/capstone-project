import * as authService from '../../services/authService.js';

const COOKIE_NAME = 'refresh_token';
const IS_PROD = process.env.NODE_ENV === 'production';

const cookieOptions = {
  httpOnly: true,
  secure: IS_PROD, // true in prod (https), false in dev (http)
  sameSite: IS_PROD ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/' // accessible to all routes (e.g. /api/auth/refresh)
};

export async function login(req, res) {
  try {
    const { email, password, client } = req.body || {};
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const { user, accessToken, refreshToken } = await authService.loginUser(email, password);

    // Web Client: Set HttpOnly Cookie
    if (client === 'web') {
      res.cookie(COOKIE_NAME, refreshToken, cookieOptions);
      // Do NOT return refreshToken in body for web
      return res.json({ 
        message: 'Login successful',
        accessToken, 
        user: {
            id: user.id,
            email: user.email,
            user_role_id: user.user_role_id,
            // Add other safe fields
        }
      });
    }

    // Mobile/Other: Return in Body
    return res.json({
      message: 'Login successful',
      accessToken,
      refreshToken, // Mobile needs this to store in SecureStore
      user: {
          id: user.id,
          email: user.email,
          user_role_id: user.user_role_id,
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    const status = error.message === 'User not found' || error.message === 'Invalid credentials' ? 401 : 500;
    return res.status(status).json({ message: error.message });
  }
}

export async function refresh(req, res) {
  try {
    // Try getting token from Cookie (Web) or Body (Mobile)
    const refreshToken = req.cookies?.[COOKIE_NAME] || req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await authService.refreshAccessToken(refreshToken);

    // Web: Update Cookie
    if (req.cookies?.[COOKIE_NAME]) {
      res.cookie(COOKIE_NAME, newRefreshToken, cookieOptions);
      return res.json({ accessToken: newAccessToken });
    }

    // Mobile: Return in Body
    return res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });

  } catch (error) {
    console.error('Refresh error:', error);
    // Clear cookie if invalid
    res.clearCookie(COOKIE_NAME);
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

