import passport from 'passport';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

export const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });
export const googleCallback = [
  passport.authenticate('google', { failureRedirect: `${CLIENT_URL}/login` }),
  (req, res) => {
    console.log('Google auth successful');
    res.redirect(CLIENT_URL);
  },
];

export const facebookAuth = passport.authenticate('facebook', { scope: ['email'] });
export const facebookCallback = [
  passport.authenticate('facebook', { failureRedirect: `${CLIENT_URL}/login` }),
  (req, res) => {
    console.log('Facebook auth successful');
    res.redirect(CLIENT_URL);
  },
];

export const githubAuth = [
  (req, res, next) => {
    console.log('🔍 GitHub OAuth initiated');
    next();
  },
  passport.authenticate('github', { scope: ['user:email'] }),
];

export const githubCallback = [
  passport.authenticate('github', { failureRedirect: `${CLIENT_URL}/login`, failureMessage: true }),
  (req, res) => {
    console.log('GitHub auth successful');
    console.log(' User:', req.user?.name);
    res.redirect(CLIENT_URL);
  },
];

export const logoutUser = (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.json({ message: 'Logged out successfully' });
  });
};

export const getUser = (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
        provider: req.user.provider,
      },
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
};
