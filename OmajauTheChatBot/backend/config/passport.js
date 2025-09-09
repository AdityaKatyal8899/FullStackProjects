const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { GoogleUser, GithubUser, findUserByProviderId, findUserAcrossCollections } = require('../models/User');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, { id: user._id, collection: user.constructor.modelName });
});

// Deserialize user from session
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

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_REDIRECT_URI,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Google ID
    const existingGoogleUser = await findUserByProviderId('google', profile.id);
    
    if (existingGoogleUser) {
      return done(null, existingGoogleUser.user);
    }

    // Check if user exists with the same email in any collection
    const email = profile.emails[0].value;
    const existingUser = await findUserAcrossCollections(email);
    
    if (existingUser) {
      return done(new Error(`An account with email ${email} already exists. Please sign in with your existing method.`), null);
    }

    // Create new Google user
    const newGoogleUser = new GoogleUser({
      googleId: profile.id,
      email: email,
      name: profile.displayName,
      avatar: profile.photos[0]?.value || null,
      provider: 'google',
    });

    await newGoogleUser.save();
    return done(null, newGoogleUser);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, null);
  }
}));

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_REDIRECT_URI,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this GitHub ID
    const existingGithubUser = await findUserByProviderId('github', profile.id);
    
    if (existingGithubUser) {
      return done(null, existingGithubUser.user);
    }

    // Check if user exists with the same email in any collection
    const email = profile.emails[0]?.value;
    
    if (!email) {
      return done(new Error('GitHub account must have a public email address'), null);
    }

    const existingUser = await findUserAcrossCollections(email);
    
    if (existingUser) {
      return done(new Error(`An account with email ${email} already exists. Please sign in with your existing method.`), null);
    }

    // Create new GitHub user
    const newGithubUser = new GithubUser({
      githubId: profile.id,
      email: email,
      name: profile.displayName || profile.username,
      username: profile.username,
      avatar: profile.photos[0]?.value || null,
      provider: 'github',
    });

    await newGithubUser.save();
    return done(null, newGithubUser);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return done(error, null);
  }
}));

module.exports = passport;
