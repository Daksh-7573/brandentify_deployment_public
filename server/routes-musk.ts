import express, { Request, Response } from "express";
import { storage } from "./storage";
import { z } from "zod";
import { openai } from "./services/fixed-openai-service";
import { generateResponse } from "./services/ai-service";

// Define the Musk chat message schema
const chatMessageSchema = z.object({
  userId: z.number(),
  message: z.string(),
  context: z.object({
    page: z.string().optional(),
    userId: z.number().optional(),
    section: z.string().optional(),
    data: z.any().optional(),
  }).optional(),
});

// Process chat messages with Musk AI
export const handleMuskChat = async (req: Request, res: Response) => {
  try {
    const { userId, message, context } = chatMessageSchema.parse(req.body);
    
    // Get the user
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Log the incoming message for debugging
    console.log(`[Musk] Received message from user ${userId}: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`);
    console.log(`[Musk] Context:`, context);
    
    // Store the user message
    const chatMessage = await storage.createChatMessage({
      userId,
      content: message,
      messageType: "musk_chat",
      sender: "user",
      timestamp: new Date()
    });
    
    // Enhance context with user profile data
    const enhancedContext = await enrichContextWithUserData(userId, context);
    
    // Generate AI response using the Musk persona
    const aiResponse = await generateMuskResponse(message, enhancedContext);
    
    // Store the AI response
    const aiMessage = await storage.createChatMessage({
      userId,
      content: aiResponse,
      messageType: "musk_chat",
      sender: "ai",
      timestamp: new Date()
    });
    
    return res.status(200).json({
      id: aiMessage.id,
      message: aiResponse
    });
  } catch (error) {
    console.error("Error in Musk chat handler:", error);
    return res.status(500).json({ message: "Error processing Musk chat request", error: String(error) });
  }
};

// Enrich context with user data for more personalized responses
async function enrichContextWithUserData(userId: number, context?: any) {
  try {
    // Get basic user data
    const user = await storage.getUser(userId);
    if (!user) return context;
    
    // Get the user's work experiences
    const workExperiences = await storage.getWorkExperiencesByUserId(userId);
    
    // Get the user's education
    const education = await storage.getEducationsByUserId(userId);
    
    // Get the user's skills
    const skills = await storage.getSkillsByUserId(userId);
    
    // Get the user's projects
    const projects = await storage.getProjectsByUserId(userId);
    
    // Get the user's latest pulses
    const pulses = await storage.getPulsesByUserId(userId);
    
    // Get hashtags the user follows
    const followedHashtags = await storage.getFollowedHashtagsByUserId(userId);
    
    return {
      ...context,
      user: {
        name: user.name,
        title: user.title,
        industry: user.industry,
        location: user.location,
        lookingFor: user.lookingFor,
        profileCompleted: user.profileCompleted
      },
      workExperiences: workExperiences.map(exp => ({
        company: exp.company,
        title: exp.title,
        startDate: exp.startDate,
        endDate: exp.endDate,
        description: exp.description,
        industry: exp.industry,
        skills: exp.skills
      })),
      education: education.map(edu => ({
        institution: edu.institution,
        degree: edu.degree,
        field: edu.field,
        startDate: edu.startDate,
        endDate: edu.endDate,
        description: edu.description
      })),
      skills: skills.map(skill => ({
        name: skill.name,
        level: skill.level
      })),
      projects: projects.map(project => ({
        title: project.title,
        description: project.description,
        startDate: project.startDate,
        endDate: project.endDate,
        skills: project.skills,
        url: project.url,
        industry: project.industry
      })),
      pulses: pulses.slice(0, 5).map(pulse => ({
        type: pulse.type,
        title: pulse.title,
        content: pulse.content,
        createdAt: pulse.createdAt
      })),
      interests: followedHashtags.map(tag => tag.tag)
    };
  } catch (error) {
    console.error("Error enriching context with user data:", error);
    return context;
  }
}

// Generate AI response using the Musk persona
async function generateMuskResponse(message: string, context: any) {
  try {
    // Define the system prompt for Musk's persona
    const systemPrompt = `You are Musk, an AI career strategist and personal brand coach on the Brandentifier platform. 
    
Your primary goals:
1. Help users build a strong professional brand
2. Provide personalized career advice based on their profile data
3. Guide users on how to use the platform effectively
4. Suggest career growth opportunities based on industry trends

Personality traits:
- Professional but friendly tone
- Data-driven insights
- Future-oriented thinking
- Growth mindset
- Empathetic to career challenges

When responding:
- Always personalize responses based on the user's profile data
- Include specific references to their skills, experience, or interests
- Provide actionable advice that they can implement
- Include "Quick Response Options:" at the end with 3-4 suggested follow-up questions
- Keep responses concise but valuable (200-300 words max)
- Highlight relevant Brandentifier features that could help them

User profile data: ${JSON.stringify(context)}`;

    // Use the AI service to generate a response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const response = completion.choices[0]?.message?.content || 
      "I'm sorry, I couldn't generate a response at the moment. Please try again.";
    
    // Log a snippet of the response for debugging
    console.log(`[Musk] Generated response (first 100 chars): ${response.substring(0, 100)}...`);
    
    return response;
  } catch (error) {
    console.error("Error generating Musk response:", error);
    return "I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";
  }
}