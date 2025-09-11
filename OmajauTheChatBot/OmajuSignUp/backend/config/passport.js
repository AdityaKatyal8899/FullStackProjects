const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { GoogleUser, GithubUser, findUserByProviderId, findUserAcrossCollections } = require('../models/User');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, { id: user._id, collection: user.constructor.modelName });
});

passport.deserializeUser(async (sessionUser, done) => {
  try {
    let user;
    if (sessionUser.collection === 'GoogleUser') {
      user = await GoogleUser.findById(sessionUser.id);
    } else if (sessionUser.collection === 'GithubUser') {
      user = await GithubUser.findById(sessionUser.id);
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

/**
 * Google OAuth Strategy
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI || `${FRONTEND_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await findUserByProviderId('google', profile.id);
        if (existingUser) return done(null, existingUser.user);

        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("Google account must have an email address"), null);

        const duplicateUser = await findUserAcrossCollections(email);
        if (duplicateUser) return done(new Error(`An account with email ${email} already exists.`), null);

        const newUser = new GoogleUser({
          googleId: profile.id,
          email,
          name: profile.displayName,
          avatar: profile.photos?.[0]?.value || null,
          provider: 'google',
        });

        await newUser.save();
        done(null, newUser);
      } catch (error) {
        console.error('Google OAuth error:', error);
        done(error, null);
      }
    }
  )
);

/**
 * GitHub OAuth Strategy
 */
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_REDIRECT_URI || `${FRONTEND_URL}/api/auth/github/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await findUserByProviderId('github', profile.id);
        if (existingUser) return done(null, existingUser.user);

        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("GitHub account must have a public email address"), null);

        const duplicateUser = await findUserAcrossCollections(email);
        if (duplicateUser) return done(new Error(`An account with email ${email} already exists.`), null);

        const newUser = new GithubUser({
          githubId: profile.id,
          email,
          name: profile.displayName || profile.username,
          username: profile.username,
          avatar: profile.photos?.[0]?.value || null,
          provider: 'github',
        });

        await newUser.save();
        done(null, newUser);
      } catch (error) {
        console.error('GitHub OAuth error:', error);
        done(error, null);
      }
    }
  )
);

module.exports = passport;
