import express from 'express';
import passport from 'passport';
import { requireAuth } from './googleAuth';

const router = express.Router();

// Start Google OAuth flow
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect to app
    res.redirect('/');
  }
);

// Get current user
router.get('/user', requireAuth, async (req, res) => {
  try {
    const user = req.user!;
    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Could not log out" });
    }
    res.clearCookie('connect.sid');
    res.json({ message: "Logged out successfully" });
  });
});

export { router as googleAuthRoutes };