import bcrypt from 'bcrypt';
import { RequestHandler } from 'express';
import { storage } from './storage';

export interface AuthUser {
  id: string;
  email: string;
  role: 'patient' | 'provider' | 'admin';
}

// Simple password hashing
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Authentication middleware
export const requireAuth: RequestHandler = async (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Optional: Role-based middleware
export function requireRole(role: 'patient' | 'provider' | 'admin'): RequestHandler {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
    interface Session {
      userId?: string;
    }
  }
}