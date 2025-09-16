const { EmailUser, GoogleUser, GithubUser, findUserAcrossCollections, findUserByProviderId } = require('../models/User');
const { generateTokens, verifyRefreshToken } = require('../middleware/auth');

// Email/Password Signup
const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists across all collections
    const existingUser = await findUserAcrossCollections(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new email user
    const newUser = new EmailUser({
      email,
      password,
      name,
    });

    await newUser.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(newUser.email);

    // Update last login
    newUser.lastLogin = new Date();
    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser._id,
          email: newUser.email,
          name: newUser.name,
          avatar: newUser.avatar,
          isEmailVerified: newUser.isEmailVerified,
          provider: 'email',
          createdAt: newUser.createdAt,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

// Email/Password Signin
const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user across all collections
    const userResult = await findUserAcrossCollections(email);
    
    if (!userResult) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const { user, collection } = userResult;

    // Check if user is from email collection (can't login with OAuth users)
    if (collection !== 'EmailUser') {
      return res.status(401).json({
        success: false,
        message: `This email is registered with ${collection === 'GoogleUser' ? 'Google' : 'GitHub'}. Please use the appropriate login method.`
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts. Please try again later.'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.email);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
          provider: 'email',
          lastLogin: user.lastLogin,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

// Refresh Token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user across all collections
    const userResult = await findUserAcrossCollections(decoded.userId);
    
    if (!userResult) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token - user not found'
      });
    }

    if (!userResult.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Generate new tokens
    const tokens = generateTokens(userResult.user.email);

    res.json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: {
        tokens,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    });
  }
};

// Google OAuth Success Handler
const googleOAuthSuccess = async (req, res) => {
  try {
    const { user } = req;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Google authentication failed'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.email);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Redirect to OmajuChat callback page with tokens
    const returnUrl = 'http://localhost:3000/auth/callback';
    res.redirect(`${returnUrl}?token=${accessToken}&refreshToken=${refreshToken}&provider=google`);
  } catch (error) {
    console.error('Google OAuth success error:', error);
    const agentFrontendUrl = process.env.AGENT_FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${agentFrontendUrl}/auth/error?message=Authentication failed`);
  }
};

// GitHub OAuth Success Handler
const githubOAuthSuccess = async (req, res) => {
  try {
    const { user } = req;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'GitHub authentication failed'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.email);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Redirect to OmajuChat callback page with tokens
    const returnUrl = 'http://localhost:3000/auth/callback';
    res.redirect(`${returnUrl}?token=${accessToken}&refreshToken=${refreshToken}&provider=github`);
  } catch (error) {
    console.error('GitHub OAuth success error:', error);
    const agentFrontendUrl = process.env.AGENT_FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${agentFrontendUrl}/auth/error?message=Authentication failed`);
  }
};

// OAuth Failure Handler
const oauthFailure = (req, res) => {
  const agentFrontendUrl = process.env.AGENT_FRONTEND_URL || 'http://localhost:3000';
  res.redirect(`${agentFrontendUrl}/auth/error?message=Authentication failed`);
};

// Get Current User Profile
const getProfile = async (req, res) => {
  try {
    const user = req.user;
    const collection = req.userCollection;

    let provider = 'email';
    if (collection === 'GoogleUser') provider = 'google';
    if (collection === 'GithubUser') provider = 'github';

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          provider,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          ...(collection === 'EmailUser' && { isEmailVerified: user.isEmailVerified }),
          ...(collection === 'GithubUser' && { username: user.username }),
        },
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching profile'
    });
  }
};

// Logout (client-side token removal, but we can track it server-side if needed)
const logout = async (req, res) => {
  try {
    // In a more advanced implementation, you might want to blacklist the token
    // For now, we'll just return success as the client should remove the token
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout'
    });
  }
};

module.exports = {
  signup,
  signin,
  refreshToken,
  googleOAuthSuccess,
  githubOAuthSuccess,
  oauthFailure,
  getProfile,
  logout,
};
