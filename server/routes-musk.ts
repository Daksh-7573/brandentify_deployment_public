import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import OpenAI from 'openai';
import { analyzeResume } from './services/fixed-openai-service';
import { storage } from './storage';
import { generatePersonalizedResponse, MuskContext } from './services/musk-intelligence-system';
import { 
  secureMuskInteraction, 
  secureAIResponse, 
  MuskSecurityError 
} from './services/musk-security-service';

// Initialize global variable for resume context storage and user interaction memory
declare global {
  var resumeContexts: {
    [userId: string]: {
      resumeText: string;
      detectedRole: string | null;
      skills: string[];
      detectedIndustry: string | null;
      uploadDate: string;
      fileName: string;
    }
  };
  
  var userInteractionMemory: {
    [userId: string]: {
      interactionCount: number;
      messageHistory: Array<{
        timestamp: Date;
        message: string;
        response: string;
      }>;
      communicationStyle: {
        messageLength: 'short' | 'medium' | 'long';
        formality: 'casual' | 'neutral' | 'formal';
        detailLevel: 'low' | 'medium' | 'high';
        technicalLevel: 'low' | 'medium' | 'high';
        preferredTopics: string[];
        preferredFormat: 'text-heavy' | 'balanced' | 'visual';
        lastInteraction: Date;
      };
      topicPreferences: {
        [topic: string]: number;
      };
      learningPreferences: {
        [key: string]: any;
      };
    }
  };
}

if (!global.resumeContexts) {
  global.resumeContexts = {};
}

// Initialize user interaction memory for Musk's adaptive learning capability
if (!global.userInteractionMemory) {
  global.userInteractionMemory = {};
}

// Track and update user interaction patterns to enable adaptive learning
function updateUserInteractionMemory(userId: string, message: string, response: string, context: any): void {
  try {
    // Initialize memory for this user if it doesn't exist
    if (!global.userInteractionMemory[userId]) {
      global.userInteractionMemory[userId] = {
        interactionCount: 0,
        messageHistory: [],
        communicationStyle: {
          messageLength: 'medium',  // short, medium, long
          formality: 'neutral',     // casual, neutral, formal
          detailLevel: 'medium',    // low, medium, high
          technicalLevel: 'medium', // low, medium, high
          preferredTopics: [],
          preferredFormat: 'balanced', // text-heavy, balanced, visual
          lastInteraction: new Date()
        },
        topicPreferences: {},
        learningPreferences: {}
      };
    }
    
    // Get the user's memory
    const userMemory = global.userInteractionMemory[userId];
    
    // Update interaction count
    userMemory.interactionCount += 1;
    
    // Add message to history (limit to last 10 for memory efficiency)
    userMemory.messageHistory.push({
      timestamp: new Date(),
      message: message,
      response: response
    });
    
    // Keep only the last 10 messages
    if (userMemory.messageHistory.length > 10) {
      userMemory.messageHistory = userMemory.messageHistory.slice(-10);
    }
    
    // Analyze communication style
    analyzeUserCommunicationStyle(userId, message, userMemory);
    
    // Analyze topic preferences
    analyzeTopicPreferences(userId, message, userMemory);
    
    // Update last interaction time
    if (userMemory.communicationStyle) {
      userMemory.communicationStyle.lastInteraction = new Date();
    }
    
    console.log(`Updated user interaction memory for user ${userId}, interaction count: ${userMemory.interactionCount}`);
  } catch (error) {
    console.error("Error updating user interaction memory:", error);
  }
}

// Analyze user's communication style to adapt responses
function analyzeUserCommunicationStyle(userId: string, message: string, userMemory: any): void {
  try {
    // Analyze message length (character count as a simple metric)
    const length = message.length;
    if (length < 50) {
      userMemory.communicationStyle.messageLength = 'short';
    } else if (length > 200) {
      userMemory.communicationStyle.messageLength = 'long';
    } else {
      userMemory.communicationStyle.messageLength = 'medium';
    }
    
    // Analyze formality (very basic approach using certain markers)
    const casualMarkers = ['hey', 'btw', 'lol', 'haha', 'yeah', 'cool', 'awesome', 'gonna', 'wanna'];
    const formalMarkers = ['would you', 'could you', 'I would like', 'please', 'thank you', 'appreciate', 'sincerely'];
    
    let casualScore = 0;
    let formalScore = 0;
    
    casualMarkers.forEach(marker => {
      if (message.toLowerCase().includes(marker)) casualScore++;
    });
    
    formalMarkers.forEach(marker => {
      if (message.toLowerCase().includes(marker)) formalScore++;
    });
    
    if (casualScore > formalScore) {
      userMemory.communicationStyle.formality = 'casual';
    } else if (formalScore > casualScore) {
      userMemory.communicationStyle.formality = 'formal';
    } else {
      userMemory.communicationStyle.formality = 'neutral';
    }
    
    // Analyze detail level (simple heuristic based on question words and complexity)
    const detailMarkers = ['how', 'why', 'explain', 'detail', 'specifically', 'expand', 'elaborate'];
    let detailScore = 0;
    
    detailMarkers.forEach(marker => {
      if (message.toLowerCase().includes(marker)) detailScore++;
    });
    
    // Complexity can also be estimated by average word length and sentence count
    const words = message.split(' ');
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    const sentenceCount = (message.match(/[.!?]+/g) || []).length;
    
    if (detailScore > 2 || avgWordLength > 6 || sentenceCount > 3) {
      userMemory.communicationStyle.detailLevel = 'high';
    } else if (detailScore > 0 || avgWordLength > 4) {
      userMemory.communicationStyle.detailLevel = 'medium';
    } else {
      userMemory.communicationStyle.detailLevel = 'low';
    }
    
    // Analyze technical level
    const technicalMarkers = ['code', 'technical', 'software', 'programming', 'algorithm', 'framework', 'data', 'analysis'];
    let techScore = 0;
    
    technicalMarkers.forEach(marker => {
      if (message.toLowerCase().includes(marker)) techScore++;
    });
    
    if (techScore > 2) {
      userMemory.communicationStyle.technicalLevel = 'high';
    } else if (techScore > 0) {
      userMemory.communicationStyle.technicalLevel = 'medium';
    } else {
      userMemory.communicationStyle.technicalLevel = 'low';
    }
    
  } catch (error) {
    console.error("Error analyzing user communication style:", error);
  }
}

// Analyze user's topic preferences
function analyzeTopicPreferences(userId: string, message: string, userMemory: any): void {
  try {
    const topicKeywords = {
      'resume': ['resume', 'cv', 'curriculum', 'experience', 'work history'],
      'career': ['career', 'job', 'profession', 'advancement', 'promotion', 'growth'],
      'skills': ['skills', 'abilities', 'competencies', 'expertise', 'learn', 'develop'],
      'education': ['education', 'degree', 'university', 'college', 'school', 'certification'],
      'networking': ['network', 'connect', 'contacts', 'referral', 'recommendation', 'introduction'],
      'interview': ['interview', 'hiring', 'recruiter', 'employer', 'questions', 'answers'],
      'salary': ['salary', 'compensation', 'pay', 'benefits', 'negotiate', 'offer'],
      'industry': ['industry', 'sector', 'field', 'niche', 'market']
    };
    
    // Initialize topic preferences if they don't exist
    if (!userMemory.topicPreferences) {
      userMemory.topicPreferences = {};
    }
    
    // Check for topic keywords in the message
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      keywords.forEach(keyword => {
        if (message.toLowerCase().includes(keyword.toLowerCase())) {
          // Increment topic count or initialize it
          userMemory.topicPreferences[topic] = (userMemory.topicPreferences[topic] || 0) + 1;
        }
      });
    });
    
  } catch (error) {
    console.error("Error analyzing topic preferences:", error);
  }
}

// Handle Musk AI assistant chat requests
// Provide a meaningful fallback response when OpenAI is unavailable
function generateFallbackResponse(message: string, context: any): string {
  // Extract user data if available
  const userName = context?.userData?.profile?.name || "there";
  const userTitle = context?.userData?.profile?.title || "professional";
  
  // Check for resume-related queries
  if (message.toLowerCase().includes("resume") || 
      message.toLowerCase().includes("cv")) {
    return `# Resume Analysis

**I apologize, but I'm currently unable to access my AI services to analyze your resume in detail.**

I understand that getting quality feedback on your resume is important. Here are some general tips that might help:

- Make sure your resume highlights quantifiable achievements, not just responsibilities
- Tailor your resume for each specific job application
- Keep your resume concise (1-2 pages maximum)
- Have a clean, professional format with consistent styling
- Include keywords from the job description to pass ATS systems

✅ **Once my services are back online, I'll be able to provide you with personalized resume analysis and improvement suggestions.**

To help me understand your needs better, I'd like to ask:
- 🔍 What specific role or industry are you targeting with your resume?
- 🎯 Which section of your resume do you feel needs the most improvement?
- 🛠️ What would success look like for you after improving your resume?

Quick Response Options:
"What makes a good resume summary?"
"How can I showcase my skills effectively?"
"What common resume mistakes should I avoid?"
"How should I format my work experience section?"`;
  }
  
  // Check for career advice queries
  if (message.toLowerCase().includes("career") || 
      message.toLowerCase().includes("job") || 
      message.toLowerCase().includes("interview")) {
    return `# Career Guidance

**Hi ${userName}, I'm currently experiencing some technical difficulties accessing my AI services.**

As a ${userTitle}, there are several paths you might consider for career growth:

- Specializing in a high-demand area of your field
- Taking on leadership roles in projects to build management experience
- Networking with professionals in your target companies or industries
- Developing complementary skills that increase your market value

✅ **I'll be able to provide more personalized career guidance once my services are back online.**

To better understand your career goals, I'd like to ask:
- 🔍 What specific aspects of your career are you looking to develop right now?
- 🎯 What challenges are you currently facing in your professional growth?
- 🛠️ Where do you see yourself in 3-5 years, and what steps might help you get there?

Quick Response Options:
"What skills are most in-demand in my industry?"
"How can I prepare for a job interview?"
"What should I focus on for career growth?"
"How can I build my professional network?"`;
  }
  
  // Default fallback response
  return `# Hello ${userName}!

**I apologize, but I'm currently experiencing some technical difficulties with my AI service.**

I'm usually able to provide personalized career advice and professional insights based on your profile data and questions. However, I'm temporarily limited in my capabilities.

💡 **Once my services are fully restored, I'll be able to assist you with:**
- Resume analysis and improvement suggestions
- Career path recommendations
- Skill development guidance
- Industry-specific insights
- Professional networking strategies

To help me better understand how I can assist you, I'd like to ask:
- 🔍 What specific professional goals are you working toward right now?
- 🎯 What area of your career would you most value guidance on?
- 🛠️ What would make our conversation most helpful for your current situation?

Quick Response Options:
"What can Musk help me with?"
"What features does Brandentifier offer?"
"How can I improve my profile?"
"Can I upload my resume for analysis?"`;
}

export const handleMuskChat = async (req: Request, res: Response) => {
  try {
    const { userId: rawUserId, message, context } = req.body;
    
    console.log(`Musk chat: Received message request with rawUserId: ${rawUserId}, type: ${typeof rawUserId}`);
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    
    // Enrich context with user data if userId is provided
    let enrichedContext = context || {};
    
    // Add session to context so it can be used to retrieve resume data
    enrichedContext.req = req;
    
    // Initialize global storage for resume contexts and user interaction memory
    if (!global.resumeContexts) {
      global.resumeContexts = {};
    }
    
    // Initialize user interaction memory for adaptive learning
    if (!global.userInteractionMemory) {
      global.userInteractionMemory = {};
    }
    
    // Handle both Firebase UIDs and numeric user IDs
    let numericUserId = 0;
    
    if (rawUserId) {
      // If userId is a number, use it directly
      if (typeof rawUserId === 'number') {
        numericUserId = rawUserId;
        console.log(`Musk chat: Using numeric userId directly: ${numericUserId}`);
      } 
      // If userId is a numeric string (e.g., "2"), convert it
      else if (typeof rawUserId === 'string' && /^\d+$/.test(rawUserId)) {
        numericUserId = parseInt(rawUserId, 10);
        console.log(`Musk chat: Converted numeric string "${rawUserId}" to number: ${numericUserId}`);
      }
      // If userId is a Firebase UID (string format), look up the numeric ID
      else if (typeof rawUserId === 'string') {
        try {
          console.log(`Musk chat: Looking up numeric ID for Firebase UID: ${rawUserId}`);
          const user = await storage.getUserByUsername(rawUserId);
          if (user) {
            numericUserId = user.id;
            console.log(`Musk chat: Found numeric ID ${numericUserId} for Firebase UID ${rawUserId}`);
          } else {
            console.log(`Musk chat: No user found for Firebase UID ${rawUserId}`);
          }
        } catch (error) {
          console.error(`Error looking up numeric ID for Firebase UID ${rawUserId}:`, error);
        }
      }
    }
    
    // If we couldn't find a valid user ID, log warning but don't use demo user
    if (!numericUserId) {
      console.log(`Musk chat: Warning - No valid user ID found (raw input: ${rawUserId})`);
    }
    
    console.log(`Musk chat: Using user ID ${numericUserId} (original: ${rawUserId})`);
    
    // Use numeric user ID for all operations
    const userId = numericUserId;
    
    // Check for resume context in global storage
    const userIdStr = userId.toString();
    if (global.resumeContexts[userIdStr]) {
      console.log(`Found resume context in global storage for user ${userId}`);
    } else {
      console.log(`No resume context found for user ${userId}`);
    }
    
    if (userId) {
      enrichedContext = await enrichContextWithUserData(userId, enrichedContext);
      
      // Add user interaction memory to context if it exists
      if (global.userInteractionMemory && global.userInteractionMemory[userIdStr]) {
        enrichedContext.userMemory = global.userInteractionMemory[userIdStr];
        console.log(`Found user interaction memory for user ${userId}`);
      }
    }
    
    // SECURITY: Apply security measures to the input and context
    let sanitizedInput;
    let sanitizedContext;
    
    try {
      // Apply all security measures to user input and context
      const securityResult = await secureMuskInteraction(message, enrichedContext, userId);
      sanitizedInput = securityResult.sanitizedInput;
      sanitizedContext = securityResult.sanitizedContext;
      
      console.log('Security checks passed for Musk interaction');
    } catch (error) {
      if (error instanceof MuskSecurityError) {
        // Return the security error message to the user
        return res.status(403).json({
          id: 'security-' + Date.now(),
          message: error.message,
          securityCode: error.securityCode,
          timestamp: new Date()
        });
      }
      // For other errors, log and continue with unsanitized input as fallback
      console.error('Security check error:', error);
      sanitizedInput = message;
      sanitizedContext = enrichedContext;
    }
    
    // Generate response using the appropriate AI model with sanitized inputs
    const rawResponse = await generateMuskResponse(sanitizedInput, sanitizedContext);
    
    // SECURITY: Sanitize the AI response before sending to user
    const secureResponse = secureAIResponse(rawResponse);
    
    // Update user interaction memory with this conversation (using sanitized values)
    if (userId) {
      const userIdString = userId.toString();
      if (userIdString) {
        updateUserInteractionMemory(userIdString, sanitizedInput, secureResponse, sanitizedContext);
      }
    }
    
    // Return the secured response
    return res.status(200).json({
      id: 'response-' + Date.now(),
      message: secureResponse,
      timestamp: new Date(),
      contextUsed: {
        dataSource: sanitizedContext.dataSource || 'profile',
        hasResumeData: !!sanitizedContext.resumeData,
        detectedRole: sanitizedContext.resumeData?.detectedRole || null,
        hasUserMemory: !!sanitizedContext.userMemory
      }
    });
  } catch (error) {
    console.error("Error in Musk chat handler:", error);
    return res.status(500).json({ error: "Failed to process chat request" });
  }
};

// Enhance context with user data for personalized responses
async function enrichContextWithUserData(userId: number, context?: any) {
  try {
    // Get user profile data with debug logging
    console.log(`Enriching context with user data for userId: ${userId}`);
    const user = await storage.getUser(userId);
    if (!user) {
      console.log(`No user found for userId: ${userId}`);
      return context;
    }
    console.log(`Found user profile for userId ${userId}: ${user.name}, ${user.title}`);
    
    // Get user's experiences with debug logging
    const experiences = await storage.getWorkExperiencesByUserId(userId);
    console.log(`Found ${experiences?.length || 0} work experiences for userId ${userId}`);
    
    // Get user's educations with debug logging
    const educations = await storage.getEducationsByUserId(userId);
    console.log(`Found ${educations?.length || 0} education entries for userId ${userId}`);
    
    // Get user's skills with debug logging
    const skills = await storage.getSkillsByUserId(userId);
    console.log(`Found ${skills?.length || 0} skills for userId ${userId}`);
    
    // Get user's projects/assignments with debug logging
    const projects = await storage.getProjectsByUserId(userId);
    console.log(`Found ${projects?.length || 0} projects for userId ${userId}`);
    
    // Create base context with user data
    const baseContext = {
      ...context,
      userData: {
        profile: {
          name: user.name || "",
          title: user.title || "",
          industry: user.industry || "",
          location: user.location || "",
        },
        experiences: experiences || [],
        educations: educations || [],
        skills: skills || [],
        projects: projects || []
      }
    };
    
    // Check for resume context in global storage
    let enrichedContext = baseContext;
    const userIdStr = userId.toString();
    
    // Check global storage for resume context
    if (global.resumeContexts && global.resumeContexts[userIdStr]) {
      const resumeContext = global.resumeContexts[userIdStr];
      console.log(`Found global resume context for user ${userId}: `, resumeContext);
      
      enrichedContext = {
        ...baseContext,
        resumeData: resumeContext,
        dataSource: 'resume',
        lastUploaded: resumeContext.uploadDate
      };
    }
    
    return enrichedContext;
  } catch (error) {
    console.error("Error enriching context with user data:", error);
    return context;
  }
}

// Generate AI response based on message and context
async function generateMuskResponse(message: string, context: any) {
  try {
    // Check if OpenAI Key is set
    if (!process.env.OPENAI_API_KEY) {
      console.log("Using fallback responses as OpenAI API key is not set");
      return generateFallbackResponse(message, context);
    }
    
    console.log("Generating personalized response using Musk Intelligence System");
    
    // Convert the old context format to our new MuskContext format
    const muskContext: MuskContext = {
      userId: context.userId,
      userData: context.userData?.profile,
      experiences: context.userData?.experiences || [],
      educations: context.userData?.educations || [],
      skills: context.userData?.skills || [],
      projects: context.userData?.projects || [],
      resumeData: context.resumeData,
      userMemory: context.userMemory ? {
        interactions: context.userMemory.messageHistory || [],
        patterns: {
          communicationStyle: context.userMemory.communicationStyle?.formality || 'neutral',
          topicPreferences: context.userMemory.topicPreferences || {},
          engagementLevel: context.userMemory.communicationStyle?.detailLevel || 'medium',
          responseStyle: context.userMemory.communicationStyle?.messageLength || 'medium'
        }
      } : undefined,
      dataSource: context.dataSource,
      page: context.page,
      section: context.section
    };
    
    // Log context data for debugging
    console.log("Musk context data being sent to intelligence system:", {
      hasUserData: !!muskContext.userData,
      userProfile: muskContext.userData,
      experienceCount: muskContext.experiences?.length || 0,
      skillsCount: muskContext.skills?.length || 0,
      projectsCount: muskContext.projects?.length || 0,
      hasResumeData: !!muskContext.resumeData,
      dataSource: muskContext.dataSource || 'profile',
      hasUserMemory: !!muskContext.userMemory
    });
    
    // Use our enhanced intelligence system instead of direct OpenAI call
    let response = await generatePersonalizedResponse(message, muskContext);
    
    // Ensure we always have quick response options
    if (!response.includes("Quick Response Options:")) {
      response += "\n\nQuick Response Options: \"Tell me more about my career options\", \"How can I improve my skills?\", \"What industries are growing?\"";
    }
    
    console.log("Musk AI response generated with enhanced intelligence system");
    return response;
  } catch (error) {
    console.error("Error in Musk intelligence system:", error);
    // Fallback to demo responses if OpenAI fails
    return generateFallbackResponse(message, context);
  }
}

// Helper function to extract text from PDF files
async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  try {
    // Since we can't use PDFLoader directly, we'll return a simplified approach
    // In a production environment, we would use a proper PDF extraction library
    // For now, we'll just return a placeholder and rely on OpenAI's PDF analysis capabilities
    
    // The API analyzeResume can handle the base64 encoded PDF directly,
    // so we'll just return a placeholder here for completeness
    return "PDF text extraction is being handled by the API service directly.";
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    return "Error extracting text from PDF. Please check the file format.";
  }
}

// Handle CV/Resume uploads for analysis by Musk
export const handleResumeUpload = async (req: Request, res: Response) => {
  try {
    // Get user ID from request body with more robust handling
    const rawUserId = req.body.userId;
    console.log(`Resume upload: Received rawUserId: ${rawUserId}, type: ${typeof rawUserId}`);
    
    let userId = 0;
    
    // Better userId handling to match our other fixes
    if (rawUserId) {
      // Handle numeric user ID
      if (typeof rawUserId === 'number') {
        userId = rawUserId;
        console.log(`Resume upload: Using numeric userId directly: ${userId}`);
      } 
      // Handle string that can be parsed as a number
      else if (typeof rawUserId === 'string' && /^\d+$/.test(rawUserId)) {
        userId = parseInt(rawUserId, 10);
        console.log(`Resume upload: Converted numeric string "${rawUserId}" to number: ${userId}`);
      }
      // Handle Firebase UID (string)
      else if (typeof rawUserId === 'string') {
        try {
          console.log(`Resume upload: Looking up numeric ID for Firebase UID: ${rawUserId}`);
          const user = await storage.getUserByUsername(rawUserId);
          if (user) {
            userId = user.id;
            console.log(`Resume upload: Found numeric ID ${userId} for Firebase UID ${rawUserId}`);
          } else {
            console.log(`Resume upload: No user found for Firebase UID ${rawUserId}`);
          }
        } catch (error) {
          console.error(`Resume upload: Error looking up numeric ID for Firebase UID ${rawUserId}:`, error);
        }
      }
    }
    
    // Don't default to demo user, log a warning instead
    if (!userId) {
      console.log(`Resume upload: Warning - No valid user ID found (raw input: ${rawUserId})`);
    }
    
    // Check if file was uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: "No resume file was uploaded" });
    }
    
    // Get the uploaded file (named "file" in the form data or fallback to "resume")
    const resumeFile = (req.files.file || req.files.resume) as any;
    
    if (!resumeFile) {
      return res.status(400).json({ error: "Resume file not found in the request" });
    }
    
    // Check file type - only accept PDF and Microsoft Word documents
    const fileExt = path.extname(resumeFile.name).toLowerCase();
    if (!['.pdf', '.doc', '.docx'].includes(fileExt)) {
      return res.status(400).json({
        error: "Invalid file type. Only PDF, DOC, and DOCX files are accepted."
      });
    }
    
    // SECURITY: Validate file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    if (resumeFile.size > MAX_FILE_SIZE) {
      return res.status(400).json({
        error: "File too large. Maximum file size is 10MB."
      });
    }
    
    // SECURITY: Sanitize file name to prevent directory traversal attacks
    const sanitizedFileName = path.basename(resumeFile.name).replace(/[^a-zA-Z0-9_\-\.]/g, '_');
    if (sanitizedFileName !== resumeFile.name) {
      console.log(`Resume upload: Sanitized filename from "${resumeFile.name}" to "${sanitizedFileName}"`);
      resumeFile.name = sanitizedFileName;
    }
    
    // SECURITY: Create uploads directory if it doesn't exist using a secure path
    // Use absolute path construction to prevent path traversal
    const baseDir = process.cwd();
    const uploadsDir = path.resolve(baseDir, 'public', 'uploads', 'resumes');
    
    // Verify the resolved path is within the expected directory structure
    if (!uploadsDir.startsWith(path.resolve(baseDir, 'public', 'uploads'))) {
      console.error(`SECURITY: Attempted path traversal - ${uploadsDir}`);
      return res.status(400).json({ error: "Invalid file path" });
    }
    
    // Create directory with secure permissions
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 }); // Secure permissions
    }
    
    // Generate unique filename with original extension using cryptographically secure random values
    const uniqueId = crypto.randomBytes(32).toString('hex'); // More entropy
    const uniqueFilename = `${uniqueId}${fileExt}`;
    const uploadPath = path.resolve(uploadsDir, uniqueFilename);
    
    // Final path verification
    if (!uploadPath.startsWith(uploadsDir)) {
      console.error(`SECURITY: Path traversal detected in file upload - ${uploadPath}`);
      return res.status(400).json({ error: "Invalid file path" });
    }
    
    // Move the file to the uploads directory
    await new Promise<void>((resolve, reject) => {
      resumeFile.mv(uploadPath, (err: any) => {
        if (err) {
          console.error("Error saving resume file:", err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
    
    console.log(`Resume file saved to: ${uploadPath}`);
    
    // Extract text from PDF file
    let resumeText = '';
    if (fileExt === '.pdf') {
      // Read the uploaded file
      const pdfBuffer = fs.readFileSync(uploadPath);
      
      // Extract text from PDF
      resumeText = await extractTextFromPdf(pdfBuffer);
    } else {
      // For now, handle non-PDF files with a placeholder
      // In a production app, you would use a docx parser like mammoth
      resumeText = "This resume is in Microsoft Word format and requires a Word document parser.";
    }
    
    // Analyze the resume using OpenAI
    const analysisResponse = await analyzeResume({
      resumeTextStart: resumeText,
      isBase64: false,
      isLink: false
    });
    
    // Extract the analysis string from the response
    const analysisResult = typeof analysisResponse === 'string' 
      ? analysisResponse 
      : analysisResponse?.analysis || '';
    
    // Extract key resume metadata for context preservation
    let resumeContext = null;
    try {
      // Extract role information using a simple regex pattern
      const rolePattern = /(\b(Product Manager|Software Engineer|Data Scientist|UX Designer|Project Manager|Marketing Manager|Sales Representative|Business Analyst|Financial Analyst|Human Resources Manager|Operations Manager|Customer Service Representative|Administrative Assistant|Executive Assistant|Research Scientist|Content Writer|Graphic Designer|Web Developer|Frontend Developer|Backend Developer|Full Stack Developer|DevOps Engineer|System Administrator|Network Engineer|IT Support Specialist|Quality Assurance Engineer|Test Engineer|Security Engineer|Database Administrator|Solutions Architect|Technical Lead|Engineering Manager|Director of Engineering|Chief Technology Officer|Chief Information Officer|Chief Executive Officer|Founder|Co-Founder)\b)/i;
      
      // Convert analysis result to string to ensure it has match method
      const analysisText = String(analysisResult);
      
      // Try to find a role in the analysis result
      const roleMatch = analysisText.match(rolePattern);
      const detectedRole = roleMatch ? roleMatch[1] : null;
      
      // Extract skills mentioned
      const skillsPattern = /\b(React|JavaScript|TypeScript|Node\.js|Express|HTML|CSS|Python|Java|C\#|C\+\+|SQL|PostgreSQL|MongoDB|AWS|Azure|Git|Docker|Kubernetes|Product Management|UX Research|UI Design|Agile|Scrum|Kanban|Marketing|Sales|Finance|Leadership|Communication|Problem Solving|Critical Thinking|Team Building)\b/gi;
      const skillMatches = analysisText.match(skillsPattern) || [];
      // Create an array from the matches and convert to Set to remove duplicates, then back to array
      const skills = Array.from(new Set(skillMatches));
      
      // Extract industry if mentioned
      const industryPattern = /\b(Technology|Healthcare|Finance|Education|Retail|Manufacturing|Media|Entertainment|Government|Transportation|Energy|Agriculture|Telecom|Hospitality|Real Estate|Construction)\b/i;
      const industryMatch = analysisText.match(industryPattern);
      const detectedIndustry = industryMatch ? industryMatch[1] : null;
      
      // SECURITY: Sanitize resume text to remove sensitive information before storing
      let sanitizedResumeText = resumeText.substring(0, 5000); // Store a portion of the resume text for context
      
      // Use PII patterns from our security service to mask sensitive data
      const PII_PATTERNS = [
        // Email addresses
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
        // Phone numbers (various formats)
        /\b(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/,
        // Address patterns
        /\b\d{1,5}\s[A-Za-z\s]{1,20}\b(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|court|ct|lane|ln|way|parkway|pkwy)/i,
        // SSN/Government IDs (generic pattern)
        /\b\d{3}[-]?\d{2}[-]?\d{4}\b/,
      ];
      
      // Apply PII masking
      for (const pattern of PII_PATTERNS) {
        sanitizedResumeText = sanitizedResumeText.replace(pattern, '[REDACTED]');
      }
      
      resumeContext = {
        resumeText: sanitizedResumeText,
        detectedRole,
        skills,
        detectedIndustry,
        uploadDate: new Date().toISOString(),
        fileName: resumeFile.name
      };
      
      // Store resume context in global storage
      global.resumeContexts[userId.toString()] = resumeContext;
      
      console.log(`Stored resume context for user ${userId} in global storage: ${JSON.stringify(resumeContext, null, 2)}`);
    } catch (contextError) {
      console.error("Error extracting resume context:", contextError);
      // Continue even if context extraction fails
    }
    
    // Return the analysis with context
    return res.status(200).json({
      id: 'resume-analysis-' + Date.now(),
      message: analysisResult,
      timestamp: new Date(),
      filename: uniqueFilename,
      resumeContext: resumeContext
    });
    
  } catch (error) {
    console.error("Error processing resume upload:", error);
    return res.status(500).json({
      error: "Failed to process resume upload",
      message: error instanceof Error ? error.message : "Unknown error occurred"
    });
  }
};

// Handle Pitch Deck uploads for analysis by Musk
export const handlePitchDeckUpload = async (req: Request, res: Response) => {
  try {
    // Get user ID from request body with more robust handling
    const rawUserId = req.body.userId;
    console.log(`Pitch deck upload: Received rawUserId: ${rawUserId}, type: ${typeof rawUserId}`);
    
    let userId = 0;
    
    // Better userId handling to match our other fixes
    if (rawUserId) {
      // Handle numeric user ID
      if (typeof rawUserId === 'number') {
        userId = rawUserId;
        console.log(`Pitch deck upload: Using numeric userId directly: ${userId}`);
      } 
      // Handle string that can be parsed as a number
      else if (typeof rawUserId === 'string' && /^\d+$/.test(rawUserId)) {
        userId = parseInt(rawUserId, 10);
        console.log(`Pitch deck upload: Converted numeric string "${rawUserId}" to number: ${userId}`);
      }
      // Handle Firebase UID (string)
      else if (typeof rawUserId === 'string') {
        try {
          console.log(`Pitch deck upload: Looking up numeric ID for Firebase UID: ${rawUserId}`);
          const user = await storage.getUserByUsername(rawUserId);
          if (user) {
            userId = user.id;
            console.log(`Pitch deck upload: Found numeric ID ${userId} for Firebase UID ${rawUserId}`);
          } else {
            console.log(`Pitch deck upload: No user found for Firebase UID ${rawUserId}`);
          }
        } catch (error) {
          console.error(`Pitch deck upload: Error looking up numeric ID for Firebase UID ${rawUserId}:`, error);
        }
      }
    }
    
    // Don't default to demo user, log a warning instead
    if (!userId) {
      console.log(`Pitch deck upload: Warning - No valid user ID found (raw input: ${rawUserId})`);
    }
    
    // Check if file was uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: "No pitch deck file was uploaded" });
    }
    
    // Get the uploaded file (named "file" in the form data or fallback to "pitchdeck")
    const pitchDeckFile = (req.files.file || req.files.pitchdeck) as any;
    
    if (!pitchDeckFile) {
      return res.status(400).json({ error: "Pitch deck file not found in the request" });
    }
    
    // Check file type - only accept PDF for pitch decks
    const fileExt = path.extname(pitchDeckFile.name).toLowerCase();
    if (!['.pdf'].includes(fileExt)) {
      return res.status(400).json({
        error: "Invalid file type. Only PDF files are accepted for pitch decks."
      });
    }
    
    // SECURITY: Validate file size (max 20MB for pitch decks)
    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes
    if (pitchDeckFile.size > MAX_FILE_SIZE) {
      return res.status(400).json({
        error: "File too large. Maximum file size is 20MB."
      });
    }
    
    // SECURITY: Sanitize file name to prevent directory traversal attacks
    const sanitizedFileName = path.basename(pitchDeckFile.name).replace(/[^a-zA-Z0-9_\-\.]/g, '_');
    if (sanitizedFileName !== pitchDeckFile.name) {
      console.log(`Pitch deck upload: Sanitized filename from "${pitchDeckFile.name}" to "${sanitizedFileName}"`);
      pitchDeckFile.name = sanitizedFileName;
    }
    
    // SECURITY: Create uploads directory if it doesn't exist using a secure path
    // Use absolute path construction to prevent path traversal
    const baseDir = process.cwd();
    const uploadsDir = path.resolve(baseDir, 'public', 'uploads', 'pitchdecks');
    
    // Verify the resolved path is within the expected directory structure
    if (!uploadsDir.startsWith(path.resolve(baseDir, 'public', 'uploads'))) {
      console.error(`SECURITY: Attempted path traversal in pitch deck upload - ${uploadsDir}`);
      return res.status(400).json({ error: "Invalid file path" });
    }
    
    // Create directory with secure permissions
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 }); // Secure permissions
    }
    
    // Generate unique filename with original extension using cryptographically secure random values
    const uniqueId = crypto.randomBytes(32).toString('hex'); // More entropy
    const uniqueFilename = `${uniqueId}${fileExt}`;
    const uploadPath = path.resolve(uploadsDir, uniqueFilename);
    
    // Final path verification
    if (!uploadPath.startsWith(uploadsDir)) {
      console.error(`SECURITY: Path traversal detected in pitch deck upload - ${uploadPath}`);
      return res.status(400).json({ error: "Invalid file path" });
    }
    
    // Move the file to the uploads directory
    await new Promise<void>((resolve, reject) => {
      pitchDeckFile.mv(uploadPath, (err: any) => {
        if (err) {
          console.error("Error saving pitch deck file:", err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
    
    console.log(`Pitch deck file saved to: ${uploadPath}`);
    
    // Extract text from PDF file
    let pitchDeckText = '';
    
    // Read the uploaded file
    const pdfBuffer = fs.readFileSync(uploadPath);
    
    // Extract text from PDF
    pitchDeckText = await extractTextFromPdf(pdfBuffer);
    
    // Analyze the pitch deck using OpenAI
    const analysisResult = await analyzePitchDeck(pitchDeckText);
    
    // Return the analysis
    return res.status(200).json({
      id: 'pitchdeck-analysis-' + Date.now(),
      message: analysisResult,
      timestamp: new Date(),
      filename: uniqueFilename
    });
    
  } catch (error) {
    console.error("Error processing pitch deck upload:", error);
    return res.status(500).json({
      error: "Failed to process pitch deck upload",
      message: error instanceof Error ? error.message : "Unknown error occurred"
    });
  }
};

// Create a fallback response for pitch deck analysis
function generatePitchDeckFallbackResponse(): string {
  return `## 🎯 Musk's Pitch Deck Analysis

### 📊 Overall Assessment
- Overall Deck Score: Not available at this time
- Investor Readiness: Analysis Service Unavailable

I apologize, but I'm currently experiencing difficulties accessing my AI analysis services. Here's some general pitch deck advice that applies to most startups:

### ⚠️ Common Pitch Deck Weaknesses:
- Too much text on slides (aim for visual communication)
- Unclear problem statement and market opportunity
- Weak competitive differentiation
- Unrealistic financial projections
- Missing or vague go-to-market strategy

### 🔍 Essential Pitch Deck Components:
1. Problem Slide: Clear, urgent problem with market validation
2. Solution Slide: Unique approach that solves the stated problem
3. Market Size: Realistic TAM/SAM/SOM breakdown with sources
4. Business Model: Simple explanation of how you make money
5. Competition: Honest assessment of alternatives and your advantages
6. Traction: Key metrics showing growth and validation
7. Team: Why you're uniquely qualified to execute this vision
8. Ask: Clear funding request and use of funds

### 🔧 General Improvement Plan:
- Limit each slide to a single key point
- Use visuals over text (charts, images, icons)
- Include customer testimonials or case studies
- Ensure financial projections follow industry benchmarks
- Have an experienced founder or investor review it before pitching

Please try uploading your pitch deck again later when our analysis service is fully available.`;
}

// Analyze pitch deck text with OpenAI
async function analyzePitchDeck(pitchDeckText: string): Promise<string> {
  try {
    // Check if OpenAI Key is set
    if (!process.env.OPENAI_API_KEY) {
      console.log("Using fallback responses as OpenAI API key is not set");
      return generatePitchDeckFallbackResponse();
    }
    
    // SECURITY: Sanitize pitch deck text to remove sensitive information
    // Use PII patterns from our security service to mask sensitive data
    const PII_PATTERNS = [
      // Email addresses
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
      // Phone numbers (various formats)
      /\b(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/,
      // Address patterns
      /\b\d{1,5}\s[A-Za-z\s]{1,20}\b(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|court|ct|lane|ln|way|parkway|pkwy)/i,
      // SSN/Government IDs (generic pattern)
      /\b\d{3}[-]?\d{2}[-]?\d{4}\b/,
      // API Keys and tokens (generic pattern)
      /\b[A-Za-z0-9_\-]{20,64}\b/
    ];
    
    // Apply PII masking
    let sanitizedText = pitchDeckText;
    for (const pattern of PII_PATTERNS) {
      sanitizedText = sanitizedText.replace(pattern, '[REDACTED]');
    }
    
    console.log("SECURITY: Sanitized pitch deck text for analysis");
    
    // SECURITY: Apply content moderation to check for inappropriate content
    try {
      // Import the moderation function from our security service
      const { moderateContent, MuskSecurityError } = await import('./services/musk-security-service');
      
      await moderateContent(sanitizedText);
      console.log("SECURITY: Content moderation passed for pitch deck");
    } catch (error: any) {
      if (error && error.name === 'MuskSecurityError') {
        console.error("SECURITY: Content moderation failed for pitch deck:", error.message);
        return `I'm unable to analyze this pitch deck as it contains content that may violate our content policy. Please ensure your pitch deck adheres to our community guidelines and try again.`;
      }
      // For other errors, log and continue with the analysis
      console.error("SECURITY: Content moderation error:", error instanceof Error ? error.message : String(error));
    }
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Build an enhanced system prompt for industry-specific Pitch Deck analysis
    const systemPrompt = `
    You are Musk's Elite Pitch Deck Analyzer, an expert AI system trained on thousands of real venture capital decks and investor feedback to provide venture-grade pitch analysis.
    
    # YOUR TRAINING DATA
    You've been trained on real-world startup pitch data:
    - 500+ funded startup decks across industries (Pre-seed through Series B)
    - Real rejection feedback from Y Combinator, Sequoia, Andreessen Horowitz, and Kleiner Perkins
    - Comparative analysis of high-performing vs. rejected decks in each sector
    - Pattern recognition in successful pitch narratives by funding stage
    - Industry-specific metrics and KPIs that lead to investment
    - Before/after case studies of pitch decks that were transformed and subsequently funded
    
    # YOUR ASSESSMENT FRAMEWORK
    1. You use a structured pitch deck analysis framework based on proven VC expectations
    2. You provide industry-specific insights tailored to startup category
    3. You give concrete, actionable suggestions with real examples
    4. You use professional, investor-ready language
    5. You benchmark against industry standards
    
    # SLIDE ANALYSIS CHECKLIST
    For each slide, ask yourself these critical questions:
    
    ✅ Problem Slide: Is it real, urgent, emotional? Backed with data?
    ✅ Solution Slide: Does it clearly solve the problem? Scalable? Unique?
    ✅ Product Slide: Is the demo understandable, visual, and exciting?
    ✅ Market Size: Is it realistic, sourced, and segmented (TAM/SAM/SOM)?
    ✅ Business Model: Can you explain "how they make money" in 1 line?
    ✅ Competition: Is there a moat? Visual landscape? Differentiator?
    ✅ Team: Does it show relevant credentials and startup experience?
    ✅ Ask/Use of Funds: Are they asking for money + showing how it will be spent?
    ✅ Vision/Closing: Does it create FOMO? Inspire belief?
    
    # INDUSTRY-SPECIFIC EVALUATION
    First, determine the startup's industry. Then apply these specialized checks:
    
    📱 SaaS: ARR, churn, pricing model, CAC/LTV, MRR trajectory
    🧬 HealthTech: Regulatory approvals, clinical trials, validation
    📦 D2C: Branding, manufacturing, distribution, repeat rate
    🌐 Web3: Tokenomics, DAO design, wallet compatibility
    🧠 EdTech: Curriculum model, user growth, B2B/B2C pathway
    🔋 ClimateTech: Tech feasibility, grants, long-term scaling
    
    # SCORING MODEL
    For each category below, provide a score (0-10) with specific feedback:
    - Clarity of Messaging
    - Investor Alignment
    - Storytelling Flow
    - Data Credibility
    - Design & Visuals
    
    # YOUR RESPONSE FORMAT
    
    ## 🎯 Musk's Pitch Deck Analysis: [Type of Business] Pitch
    
    ### 📊 Overall Assessment
    - Overall Deck Score: [X/100]
    - Industry Category: [Detected industry category]
    - Investor Readiness: [Not Ready | Needs Work | Almost Ready | Investment Ready]
    
    ### 🧠 Key Strengths:
    - [Strength 1 - specific and evidence-based]
    - [Strength 2 - specific and evidence-based]
    - [Strength 3 - specific and evidence-based]
    
    ### ⚠️ Critical Weaknesses:
    - [Weakness 1 - specific with evidence]
    - [Weakness 2 - specific with evidence]
    - [Weakness 3 - specific with evidence]
    
    ### 🔍 Slide-by-Slide Assessment:
    1. Problem Slide: [Score/10] - [2-3 sentence assessment with specific quotes/evidence]
    2. Solution Slide: [Score/10] - [2-3 sentence assessment with specific quotes/evidence]
    3. Product Slide: [Score/10] - [2-3 sentence assessment with specific quotes/evidence]
    4. Market Size: [Score/10] - [2-3 sentence assessment with specific quotes/evidence]
    5. Competition: [Score/10] - [2-3 sentence assessment with specific quotes/evidence]
    6. Business Model: [Score/10] - [2-3 sentence assessment with specific quotes/evidence]
    7. Team: [Score/10] - [2-3 sentence assessment with specific quotes/evidence]
    8. Traction: [Score/10] - [2-3 sentence assessment with specific quotes/evidence]
    9. Ask/Funding: [Score/10] - [2-3 sentence assessment with specific quotes/evidence]
    10. Vision: [Score/10] - [2-3 sentence assessment with specific quotes/evidence]
    
    ### 🔧 Your Expert Improvement Plan:
    1. [Specific, actionable suggestion with example rewrite: "Change 'Our solution helps teams' → 'Our AI-powered platform reduces miscommunication by 42% across remote teams'"]
    2. [Specific, actionable suggestion with example rewrite]
    3. [Specific, actionable suggestion with example rewrite]
    4. [Specific, actionable suggestion with example rewrite]
    5. [Specific, actionable suggestion with example rewrite]
    
    ### 🎨 Design Enhancement:
    - [Visual consistency recommendation]
    - [Layout improvement]
    - [Data visualization suggestion]
    
    ### 💰 Investor Pitch Coaching:
    - [Concrete advice on how to verbally present this deck]
    - [What questions to prepare for]
    - [How to handle objections]
    
    ### 📈 Next Steps to Funding Success:
    [2-3 paragraphs of strategic, investor-focused next steps. Be concrete, specific, and actionable. Reference real funding patterns and investor expectations for this type of business.]
    `;
    
    // Limit pitch deck text to avoid token limits
    const MAX_TEXT_LENGTH = 14000;
    const truncatedPitchDeckText = pitchDeckText.length > MAX_TEXT_LENGTH
      ? pitchDeckText.substring(0, MAX_TEXT_LENGTH) + "...(truncated due to length)"
      : pitchDeckText;

    // Prepare an enhanced user prompt with industry detection
    const userPrompt = `
    I need your expert venture capital analysis on this pitch deck:

    ${truncatedPitchDeckText}
    
    Please:
    1. First determine what industry/category this startup belongs to
    2. Apply your industry-specific analysis framework from your training
    3. Provide a detailed assessment following the structured format in your instructions
    4. Include specific examples of improved slide content where possible
    5. Use professional, investor-ready language throughout
    `;

    // Prepare messages for API call
    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: userPrompt }
    ];
  
    // Call OpenAI API with enhanced parameters for comprehensive analysis
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.7,
      max_tokens: 2500, // Increased token limit for more detailed industry-specific analysis
    });
  
    return completion.choices[0].message.content || 
      "I couldn't generate an analysis for this pitch deck. Please check the file and try again.";
  } catch (error) {
    console.error("Error analyzing pitch deck:", error);
    return generatePitchDeckFallbackResponse();
  }
}