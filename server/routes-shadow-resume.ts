import { Request, Response } from "express";
import { storage } from "./storage";
import OpenAI from "openai";
import { analyzeResume } from "../openai-service-fix";
import { z } from "zod";

/**
 * Get shadow resume for a user
 * @param req Request object
 * @param res Response object
 */
export const getShadowResume = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    // Get the user's resume
    const resume = await storage.getResumeByUserId(userId);
    
    if (!resume) {
      return res.status(404).json({ error: "No resume found for this user" });
    }
    
    // Check if this is a shadow resume
    if (!resume.isShadowResume) {
      return res.status(400).json({ error: "This is not a shadow resume" });
    }
    
    return res.status(200).json({ resume });
  } catch (error) {
    console.error("Error getting shadow resume:", error);
    return res.status(500).json({ error: "Failed to get shadow resume" });
  }
};

/**
 * Update shadow resume properties
 * @param req Request object
 * @param res Response object
 */
export const updateShadowResume = async (req: Request, res: Response) => {
  try {
    const resumeId = parseInt(req.params.id);
    const userId = parseInt(req.body.userId);
    
    if (isNaN(resumeId)) {
      return res.status(400).json({ error: "Invalid resume ID" });
    }
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    // Get the existing resume
    const existingResume = await storage.getResumeByUserId(userId);
    
    if (!existingResume) {
      return res.status(404).json({ error: "No resume found for this user" });
    }
    
    if (existingResume.id !== resumeId) {
      return res.status(403).json({ error: "Unauthorized to modify this resume" });
    }
    
    // Update the resume properties
    const updatedResume = await storage.updateResume(resumeId, {
      themeStyle: req.body.themeStyle || existingResume.themeStyle,
      isDownloadable: req.body.isDownloadable !== undefined ? req.body.isDownloadable : existingResume.isDownloadable,
      visibility: req.body.visibility || existingResume.visibility
    });
    
    if (!updatedResume) {
      return res.status(500).json({ error: "Failed to update resume" });
    }
    
    return res.status(200).json({ resume: updatedResume });
  } catch (error) {
    console.error("Error updating shadow resume:", error);
    return res.status(500).json({ error: "Failed to update shadow resume" });
  }
};

/**
 * Generate resume content using Musk AI
 * @param req Request object
 * @param res Response object
 */
export const generateResumeContent = async (req: Request, res: Response) => {
  try {
    const { userId, section, prompt } = req.body;
    
    if (!userId || !section || !prompt) {
      return res.status(400).json({ error: "Missing required fields: userId, section, and prompt" });
    }
    
    // Check if OpenAI Key is set
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ 
        error: "AI service unavailable",
        message: "OpenAI API key is not configured"
      });
    }
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Get user data for context
    const user = await storage.getUser(parseInt(userId));
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Get user experiences, education, skills, etc. for context
    const experiences = await storage.getWorkExperiencesByUserId(parseInt(userId));
    const educations = await storage.getEducationsByUserId(parseInt(userId));
    const skills = await storage.getSkillsByUserId(parseInt(userId));
    const projects = await storage.getProjectsByUserId(parseInt(userId));
    
    // Build context for AI
    const context = {
      user: {
        name: user.name,
        title: user.title,
        industry: user.industry,
        location: user.location
      },
      profile: {
        experiences,
        educations,
        skills,
        projects
      },
      section,
      prompt
    };
    
    // The system prompt for generating resume content
    const systemPrompt = `
You are Musk, an AI career assistant with deep expertise in resume writing and professional development.
Your task is to generate high-quality content for a specific section of a resume based on the user's profile data and their specific request.

Section requested: ${section}
User prompt: ${prompt}

Follow these guidelines:
1. Generate professional, concise, and impactful content for the specified resume section
2. Focus on quantifiable achievements and results wherever possible
3. Use action verbs and industry-specific terminology appropriate for the user's field
4. Keep the tone professional and confident
5. Format the content appropriately for the section type:
   - For summaries: A cohesive paragraph of 3-5 sentences
   - For experience: Bullet points with clear accomplishments
   - For skills: Organized by categories and proficiency levels
   - For education: Structured, formal presentation
   - For projects: Clear descriptions with technologies and outcomes
   - For achievements: Impactful bullet points with results

Respond with only the generated content, no explanations or additional notes.
    `;
    
    // Generate resume content using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(context) }
      ],
      max_tokens: 1000,
    });
    
    const generatedContent = completion.choices[0].message.content;
    
    // Return the generated content
    return res.status(200).json({
      section,
      content: generatedContent,
      timestamp: new Date()
    });
    
  } catch (error) {
    console.error("Error generating resume content:", error);
    return res.status(500).json({ 
      error: "Failed to generate resume content",
      message: error instanceof Error ? error.message : "Unknown error occurred"
    });
  }
};

/**
 * Apply generated content to shadow resume
 * @param req Request object
 * @param res Response object
 */
export const applyGeneratedContent = async (req: Request, res: Response) => {
  try {
    const { userId, resumeId, section, content } = req.body;
    
    if (!userId || !resumeId || !section || !content) {
      return res.status(400).json({ error: "Missing required fields: userId, resumeId, section, and content" });
    }
    
    // Get the resume
    const resume = await storage.getResumeByUserId(parseInt(userId));
    
    if (!resume) {
      return res.status(404).json({ error: "No resume found for this user" });
    }
    
    if (resume.id !== parseInt(resumeId)) {
      return res.status(403).json({ error: "Unauthorized to modify this resume" });
    }
    
    // In a real implementation, we would update the content in the shadowResumes table
    // Since we're mocking the implementation, we'll just update the timestamp
    // Simulate Musk updating the resume content
    const updatedResume = await storage.updateResume(parseInt(resumeId), {
      isShadowResume: true // Just update a field to trigger the timestamp change
    });
    
    if (!updatedResume) {
      return res.status(500).json({ error: "Failed to update resume" });
    }
    
    return res.status(200).json({
      success: true,
      section,
      updatedAt: updatedResume.lastUpdatedByMusk
    });
    
  } catch (error) {
    console.error("Error applying generated content:", error);
    return res.status(500).json({ error: "Failed to apply generated content to resume" });
  }
};

/**
 * Create an initial shadow resume for a user
 * @param req Request object
 * @param res Response object
 */
export const createInitialShadowResume = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "Missing required field: userId" });
    }
    
    // Check if user already has a resume
    const existingResume = await storage.getResumeByUserId(parseInt(userId));
    
    if (existingResume) {
      return res.status(409).json({ 
        error: "User already has a resume", 
        resumeId: existingResume.id 
      });
    }
    
    // Get user data
    const user = await storage.getUser(parseInt(userId));
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Create a new shadow resume
    const newResume = await storage.createResume({
      userId: parseInt(userId),
      fileName: `${user.name?.replace(/\s+/g, '') || 'User'}_ShadowResume.pdf`,
      fileData: '', // Empty data initially
      isShadowResume: true,
      themeStyle: 'professional',
      isDownloadable: false,
      visibility: 'private'
    });
    
    return res.status(201).json({
      success: true,
      resume: newResume
    });
    
  } catch (error) {
    console.error("Error creating initial shadow resume:", error);
    return res.status(500).json({ error: "Failed to create initial shadow resume" });
  }
};