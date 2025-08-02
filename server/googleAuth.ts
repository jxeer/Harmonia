import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { RequestHandler } from 'express';
import { storage } from './storage';

export interface AuthUser {
  id: string;
  email: string;
  role: 'patient' | 'provider' | 'admin';
}

// Configure Google OAuth strategy
export function setupGoogleAuth() {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error('No email found from Google'), undefined);
      }

      // Check if user already exists
      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Create new user with Google info
        user = await storage.createUser({
          email,
          passwordHash: 'google-oauth', // Placeholder since Google handles auth
          firstName: profile.name?.givenName || '',
          lastName: profile.name?.familyName || '',
          role: 'patient', // Default role, can be changed during onboarding
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error, undefined);
    }
  }));

  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}

// Authentication middleware
export const requireAuth: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  next();
};

// Optional: Role-based middleware
export function requireRole(role: 'patient' | 'provider' | 'admin'): RequestHandler {
  return (req, res, next) => {
    if (!req.user || (req.user as any).role !== role) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: 'patient' | 'provider' | 'admin';
      firstName?: string;
      lastName?: string;
      isOnboarded?: boolean;
    }
  }
}