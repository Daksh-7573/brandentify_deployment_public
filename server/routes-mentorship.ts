import { Request, Response, Router } from "express";
import { storage } from "./storage";
import { InsertMentorshipRequest, insertMentorshipRequestSchema } from "@shared/schema";
import { z } from "zod";

// Create a router for mentorship routes
const router = Router();

/**
 * Get mentorship requests for a mentor
 * GET /api/mentorship/mentor/:mentorId
 */
router.get("/api/mentorship/mentor/:mentorId", async (req: Request, res: Response) => {
  try {
    const mentorId = parseInt(req.params.mentorId, 10);
    if (isNaN(mentorId)) {
      return res.status(400).json({ message: "Invalid mentor ID" });
    }

    const requests = await storage.getMentorshipRequestsByMentorId(mentorId);
    res.json(requests);
  } catch (error) {
    console.error("[GET /mentorship/mentor/:mentorId] Error:", error);
    res.status(500).json({ message: "Failed to get mentorship requests" });
  }
});

/**
 * Get mentorship requests for a mentee
 * GET /api/mentorship/mentee/:menteeId
 */
router.get("/api/mentorship/mentee/:menteeId", async (req: Request, res: Response) => {
  try {
    const menteeId = parseInt(req.params.menteeId, 10);
    if (isNaN(menteeId)) {
      return res.status(400).json({ message: "Invalid mentee ID" });
    }

    const requests = await storage.getMentorshipRequestsByMenteeId(menteeId);
    res.json(requests);
  } catch (error) {
    console.error("[GET /mentorship/mentee/:menteeId] Error:", error);
    res.status(500).json({ message: "Failed to get mentorship requests" });
  }
});

/**
 * Create a mentorship request
 * POST /api/mentorship/request
 */
router.post("/api/mentorship/request", async (req: Request, res: Response) => {
  try {
    // Validate the request using zod
    const validatedData = insertMentorshipRequestSchema.parse(req.body);
    
    // Check if the mentee has already requested mentorship from this mentor
    const existingRequest = await storage.getMentorshipRequestByMentorAndMentee(
      validatedData.mentorId,
      validatedData.menteeId
    );
    
    if (existingRequest) {
      return res.status(409).json({ 
        message: "A mentorship request already exists between these users",
        requestId: existingRequest.id,
        status: existingRequest.status
      });
    }
    
    // Check if the mentee has reached the limit of active mentorships (5)
    const activeMentorshipCount = await storage.getActiveMentorshipCount(validatedData.menteeId);
    if (activeMentorshipCount >= 5) {
      return res.status(400).json({ message: "You have reached the maximum number of active mentorships (5)" });
    }
    
    // Create the mentorship request
    const request = await storage.createMentorshipRequest(validatedData);
    res.status(201).json(request);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid data", errors: error.errors });
    } else {
      console.error("[POST /mentorship/request] Error:", error);
      res.status(500).json({ message: "Failed to create mentorship request" });
    }
  }
});

/**
 * Update a mentorship request status
 * PATCH /api/mentorship/request/:requestId
 */
router.patch("/api/mentorship/request/:requestId", async (req: Request, res: Response) => {
  try {
    const requestId = parseInt(req.params.requestId, 10);
    if (isNaN(requestId)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }
    
    // Validate the request status
    const validStatus = z.enum(['accepted', 'rejected', 'expired', 'completed', 'terminated']).parse(req.body.status);
    
    // Update the request status
    const updatedRequest = await storage.updateMentorshipRequestStatus(requestId, validStatus);
    
    if (!updatedRequest) {
      return res.status(404).json({ message: "Mentorship request not found" });
    }
    
    // If the request is accepted, create an active mentorship
    if (validStatus === 'accepted') {
      // Create the active mentorship
      const activeMentorship = await storage.createActiveMentorship({
        mentorId: updatedRequest.mentorId,
        menteeId: updatedRequest.menteeId,
        requestId: updatedRequest.id,
        status: 'active'
      });
      
      // Return both the updated request and the new active mentorship
      return res.json({
        request: updatedRequest,
        mentorship: activeMentorship
      });
    }
    
    res.json(updatedRequest);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid status", errors: error.errors });
    } else {
      console.error("[PATCH /mentorship/request/:requestId] Error:", error);
      res.status(500).json({ message: "Failed to update mentorship request" });
    }
  }
});

/**
 * Get active mentorships for a mentor
 * GET /api/mentorship/active/mentor/:mentorId
 */
router.get("/api/mentorship/active/mentor/:mentorId", async (req: Request, res: Response) => {
  try {
    const mentorId = parseInt(req.params.mentorId, 10);
    if (isNaN(mentorId)) {
      return res.status(400).json({ message: "Invalid mentor ID" });
    }

    const mentorships = await storage.getActiveMentorshipsByMentorId(mentorId);
    res.json(mentorships);
  } catch (error) {
    console.error("[GET /mentorship/active/mentor/:mentorId] Error:", error);
    res.status(500).json({ message: "Failed to get active mentorships" });
  }
});

/**
 * Get active mentorships for a mentee
 * GET /api/mentorship/active/mentee/:menteeId
 */
router.get("/api/mentorship/active/mentee/:menteeId", async (req: Request, res: Response) => {
  try {
    const menteeId = parseInt(req.params.menteeId, 10);
    if (isNaN(menteeId)) {
      return res.status(400).json({ message: "Invalid mentee ID" });
    }

    const mentorships = await storage.getActiveMentorshipsByMenteeId(menteeId);
    res.json(mentorships);
  } catch (error) {
    console.error("[GET /mentorship/active/mentee/:menteeId] Error:", error);
    res.status(500).json({ message: "Failed to get active mentorships" });
  }
});

/**
 * Update active mentorship status
 * PATCH /api/mentorship/active/:mentorshipId
 */
router.patch("/api/mentorship/active/:mentorshipId", async (req: Request, res: Response) => {
  try {
    const mentorshipId = parseInt(req.params.mentorshipId, 10);
    if (isNaN(mentorshipId)) {
      return res.status(400).json({ message: "Invalid mentorship ID" });
    }
    
    // Check which field is being updated
    if (req.body.status) {
      // Validate the mentorship status
      const validStatus = z.enum(['accepted', 'completed', 'terminated']).parse(req.body.status);
      
      // Update the mentorship status
      const updatedMentorship = await storage.updateActiveMentorshipStatus(mentorshipId, validStatus);
      
      if (!updatedMentorship) {
        return res.status(404).json({ message: "Active mentorship not found" });
      }
      
      return res.json(updatedMentorship);
    } else if (req.body.notes !== undefined) {
      // Update the mentorship notes
      const updatedMentorship = await storage.updateActiveMentorshipNotes(mentorshipId, req.body.notes);
      
      if (!updatedMentorship) {
        return res.status(404).json({ message: "Active mentorship not found" });
      }
      
      return res.json(updatedMentorship);
    } else {
      // If no valid field is being updated, return an error
      return res.status(400).json({ message: "Invalid update data" });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid data", errors: error.errors });
    } else {
      console.error("[PATCH /mentorship/active/:mentorshipId] Error:", error);
      res.status(500).json({ message: "Failed to update active mentorship" });
    }
  }
});

/**
 * Record mentorship activity (update lastActivityAt)
 * POST /api/mentorship/active/:mentorshipId/activity
 */
router.post("/api/mentorship/active/:mentorshipId/activity", async (req: Request, res: Response) => {
  try {
    const mentorshipId = parseInt(req.params.mentorshipId, 10);
    if (isNaN(mentorshipId)) {
      return res.status(400).json({ message: "Invalid mentorship ID" });
    }
    
    // Update the last activity timestamp
    const updatedMentorship = await storage.updateActiveMentorshipLastActivity(mentorshipId);
    
    if (!updatedMentorship) {
      return res.status(404).json({ message: "Active mentorship not found" });
    }
    
    res.json(updatedMentorship);
  } catch (error) {
    console.error("[POST /mentorship/active/:mentorshipId/activity] Error:", error);
    res.status(500).json({ message: "Failed to update mentorship activity" });
  }
});

/**
 * Submit feedback for a mentorship
 * POST /api/mentorship/feedback
 */
router.post("/api/mentorship/feedback", async (req: Request, res: Response) => {
  try {
    // Validate the feedback data
    const validatedData = insertMentorshipFeedbackSchema.parse(req.body);
    
    // Create the feedback
    const feedback = await storage.createMentorshipFeedback(validatedData);
    
    res.status(201).json(feedback);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid data", errors: error.errors });
    } else {
      console.error("[POST /mentorship/feedback] Error:", error);
      res.status(500).json({ message: "Failed to submit mentorship feedback" });
    }
  }
});

/**
 * Get feedback for a mentorship
 * GET /api/mentorship/:mentorshipId/feedback
 */
router.get("/api/mentorship/:mentorshipId/feedback", async (req: Request, res: Response) => {
  try {
    const mentorshipId = parseInt(req.params.mentorshipId, 10);
    if (isNaN(mentorshipId)) {
      return res.status(400).json({ message: "Invalid mentorship ID" });
    }
    
    const feedback = await storage.getMentorshipFeedbackByMentorshipId(mentorshipId);
    
    if (!feedback || feedback.length === 0) {
      return res.status(404).json({ message: "No feedback found for this mentorship" });
    }
    
    res.json(feedback);
  } catch (error) {
    console.error("[GET /mentorship/:mentorshipId/feedback] Error:", error);
    res.status(500).json({ message: "Failed to get mentorship feedback" });
  }
});

// Export the mentorship routes
export default router;