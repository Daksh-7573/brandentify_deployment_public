import express from 'express';
import { storage } from './storage';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * Demo mode login endpoint
 * Creates or reuses a demo user account for testing without authentication
 */
router.get('/login', async (req, res) => {
  try {
    // Generate a unique ID based on session or IP to potentially reuse the same demo account
    const clientIdentifier = req.session?.id || req.ip || uuidv4().substring(0, 8);
    const demoUsername = `demo_${clientIdentifier.replace(/[^a-zA-Z0-9]/g, '')}`;
    
    // Check if demo user already exists
    let user = await storage.getUserByUsername(demoUsername);
    
    if (!user) {
      // Create a new demo user if it doesn't exist
      const demoUser = {
        username: demoUsername,
        email: `${demoUsername}@demo.brandentifier.app`,
        name: "Demo User",
        password: null, // No password for demo accounts
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo&backgroundColor=b6e3f4",
        title: "Product Designer",
        aboutMe: "This is a demo account with pre-populated data for testing.",
        location: "San Francisco, CA",
        industry: "Technology",
        lookingFor: "Collaboration opportunities",
        availability: "Open to work",
        profileCompleted: 75,
        role: "user" as const,
        demoMode: true
      };
      
      // Create the user
      user = await storage.createUser(demoUser);
      console.log("Created new demo user:", demoUser.username);
      
      // Here you could add sample work experiences, projects, education, etc.
      // But for simplicity, we're just creating the basic user for now
    } else {
      console.log("Using existing demo user:", user.username);
    }
    
    // Send the user data back to the client
    res.json(user);
    
  } catch (error) {
    console.error("Error in demo mode login:", error);
    res.status(500).json({ message: "Failed to create demo user" });
  }
});

export default router;