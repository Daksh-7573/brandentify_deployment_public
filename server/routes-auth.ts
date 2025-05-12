import express, { Router, Request, Response } from "express";
import { storage } from "./storage";
import crypto from "crypto";
import { z } from "zod";

// Simple authentication routes
export function setupAuthRoutes(): Router {
  const router = express.Router();

  // Define schema for login
  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });

  // Define schema for registration
  const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional(),
    username: z.string().min(3).optional(),
  });

  // Login route
  router.post("/login", async (req: Request, res: Response) => {
    try {
      // Validate request
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: result.error.format() 
        });
      }

      const { email, password } = result.data;

      // Hash the password for matching (simple approach since we're not using Firebase)
      const hashedPassword = crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");

      // Find user by email
      const user = await storage.getUserByEmail(email);

      if (!user) {
        // User not found
        return res.status(404).json({ message: "User not found" });
      }

      // In production, you would use a proper password hashing library like bcrypt
      // This is a simplified version for development
      if (user.password !== hashedPassword && user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Return user data (excluding password)
      const { password: _, ...userData } = user;
      res.json(userData);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Register route
  router.post("/register", async (req: Request, res: Response) => {
    try {
      // Validate request
      const result = registerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: result.error.format() 
        });
      }

      const { email, password, name, username } = result.data;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "Email already in use" });
      }

      // Generate a username if not provided
      let generatedUsername = username || email.split("@")[0];

      // Check if username is already taken
      const existingUsername = await storage.getUserByUsername(generatedUsername);
      if (existingUsername) {
        // Add a random number to make it unique
        const randomSuffix = Math.floor(Math.random() * 1000);
        generatedUsername = `${generatedUsername}${randomSuffix}`;
      }

      // Hash the password (simple approach since we're not using Firebase)
      const hashedPassword = crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");

      // Create user
      const newUser = await storage.createUser({
        username: generatedUsername,
        email: email,
        password: hashedPassword,
        name: name || generatedUsername,
        photoURL: null,
        profileCompleted: 0,
        emailVerified: true // Auto-verify for simplicity
      });

      // Return user data (excluding password)
      const { password: _, ...userData } = newUser;
      res.status(201).json(userData);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return router;
}