import express from 'express';
import { z } from 'zod';
import { hashPassword, verifyPassword, requireAuth } from './simpleAuth';
import { storage } from './storage';

const router = express.Router();

// Validation schemas
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(["patient", "provider", "admin"]).default("patient"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = signupSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = await storage.createUser({
      email,
      passwordHash,
      firstName,
      lastName,
      role,
    });

    // Create session
    req.session.userId = user.id;

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;
    res.status(201).json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Signup error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

// Sign in
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create session
    req.session.userId = user.id;

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get current user
router.get('/user', requireAuth, async (req, res) => {
  try {
    const user = req.user!;
    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Could not log out" });
    }
    res.clearCookie('connect.sid');
    res.json({ message: "Logged out successfully" });
  });
});

export { router as authRoutes };