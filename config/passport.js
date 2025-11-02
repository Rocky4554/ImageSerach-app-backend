import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '..', '.env') });

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/user.js';


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});


passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'dummy-client-id',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-secret',
  callbackURL: 'http://localhost:5000/api/auth/google/callback'
},
async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    
    if (!user) {
      user = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        avatar: profile.photos[0].value,
        provider: 'google'
      });
    }
    
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));


passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID || 'dummy-app-id',
  clientSecret: process.env.FACEBOOK_APP_SECRET || 'dummy-secret',
  callbackURL: 'http://localhost:5000/api/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'emails', 'photos']
},
async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ facebookId: profile.id });
    
    if (!user) {
      user = await User.create({
        facebookId: profile.id,
        email: profile.emails ? profile.emails[0].value : `fb_${profile.id}@facebook.com`,
        name: profile.displayName,
        avatar: profile.photos ? profile.photos[0].value : '',
        provider: 'facebook'
      });
    }
    
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));


passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID || 'dummy-client-id',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || 'dummy-secret',
  callbackURL: 'http://localhost:5000/api/auth/github/callback'
},
async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('GitHub profile received:', profile.id, profile.username);
    
    let user = await User.findOne({ githubId: profile.id });
    
    if (!user) {
      const email = profile.emails && profile.emails.length > 0 
        ? profile.emails[0].value 
        : `gh_${profile.id}@github.com`;
        
      user = await User.create({
        githubId: profile.id,
        email: email,
        name: profile.displayName || profile.username,
        avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : profile._json.avatar_url,
        provider: 'github'
      });
      
      console.log('New GitHub user created:', user.email);
    }
    
    return done(null, user);
  } catch (error) {
    console.error('GitHub auth error:', error);
    return done(error, null);
  }
}));