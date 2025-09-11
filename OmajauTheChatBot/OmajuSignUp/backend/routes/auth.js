const express = require('express');
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const {
  signup,
  signin,
  refreshToken,
  googleOAuthSuccess,
  githubOAuthSuccess,
  oauthFailure,
  getProfile,
  logout,
} = require('../controllers/authController');

const {
  validateSignup,
  validateSignin,
  validateRefreshToken,
  sanitizeInput,
} = require('../middleware/validation');

const { verifyToken } = require('../middleware/auth');

const router = express.Router();

/**
 * ========================
 * Rate Limiting
 * ========================
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window for sensitive operations
  message: {
    success: false,
    message: 'Too many attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * ========================
 * Middleware
 * ========================
 */
// Apply sanitization to all routes
router.use(sanitizeInput);

/**
 * ========================
 * Email/Password Authentication Routes
 * ========================
 */
router.post('/signup', authLimiter, validateSignup, signup);
router.post('/signin', strictAuthLimiter, validateSignin, signin);
router.post('/refresh-token', authLimiter, validateRefreshToken, refreshToken);

/**
 * ========================
 * Google OAuth Routes
 * ========================
 */
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/api/auth/failure',
    session: false,
  }),
  googleOAuthSuccess
);

/**
 * ========================
 * GitHub OAuth Routes
 * ========================
 */
router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get(
  '/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/api/auth/failure',
    session: false,
  }),
  githubOAuthSuccess
);

/**
 * ========================
 * OAuth Failure Route
 * ========================
 */
router.get('/failure', oauthFailure);

/**
 * ========================
 * Protected Routes
 * ========================
 */
router.get('/profile', verifyToken, getProfile);
router.post('/logout', verifyToken, logout);

/**
 * ========================
 * Health Check Route
 * ========================
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Authentication service is running',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
