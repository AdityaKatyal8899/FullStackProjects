const jwt = require('jsonwebtoken');
const { findUserAcrossCollections } = require('../models/User');

/**
 * =============================
 * JWT TOKEN GENERATION
 * =============================
 */

/**
 * Generates both access and refresh tokens for a given user ID
 * @param {string} userId
 * @returns {{accessToken: string, refreshToken: string}}
 */
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

/**
 * =============================
 * JWT TOKEN VERIFICATION
 * =============================
 */

/**
 * Middleware to verify access token in Authorization header
 * Attaches user info to req.user and collection to req.userCollection
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userResult = await findUserAcrossCollections(decoded.userId);

    if (!userResult) {
      return res.status(401).json({ success: false, message: 'Invalid token - user not found' });
    }

    if (!userResult.user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }

    req.user = userResult.user;
    req.userCollection = userResult.collection;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    console.error('Token verification error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during authentication' });
  }
};

/**
 * Verifies refresh token and returns decoded payload
 * @param {string} token
 * @returns {Object} decoded payload
 * @throws {Error} if token is invalid
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

/**
 * =============================
 * OPTIONAL AUTHENTICATION
 * =============================
 * Middleware that allows requests without token but attaches user if token is valid
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) return next();

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userResult = await findUserAcrossCollections(decoded.userId);

    if (userResult && userResult.user.isActive) {
      req.user = userResult.user;
      req.userCollection = userResult.collection;
    }

    next();
  } catch (error) {
    // Ignore errors for optional auth
    next();
  }
};

module.exports = {
  generateTokens,
  verifyToken,
  verifyRefreshToken,
  optionalAuth,
};
