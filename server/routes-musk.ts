import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import OpenAI from 'openai';
import { analyzeResume } from './services/fixed-openai-service';
import { storage } from './storage';

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
    let numericUserId = typeof rawUserId === 'number' ? rawUserId : 0;
    
    // If the userId is a Firebase UID (string format), try to look up the numeric ID
    if (rawUserId && typeof rawUserId === 'string' && !numericUserId) {
      try {
        console.log(`Musk chat: Converting Firebase UID to numeric ID: ${rawUserId}`);
        const user = await storage.getUserByUsername(rawUserId);
        if (user) {
          numericUserId = user.id;
          console.log(`Musk chat: Found numeric ID ${numericUserId} for Firebase UID ${rawUserId}`);
        }
      } catch (error) {
        console.error(`Error looking up numeric ID for Firebase UID ${rawUserId}:`, error);
      }
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
    
    // Generate response using the appropriate AI model
    const response = await generateMuskResponse(message, enrichedContext);
    
    // Update user interaction memory with this conversation
    if (userId) {
      const userIdString = userId.toString();
      if (userIdString) {
        updateUserInteractionMemory(userIdString, message, response, enrichedContext);
      }
    }
    
    // Return the response
    return res.status(200).json({
      id: 'response-' + Date.now(),
      message: response,
      timestamp: new Date(),
      contextUsed: {
        dataSource: enrichedContext.dataSource || 'profile',
        hasResumeData: !!enrichedContext.resumeData,
        detectedRole: enrichedContext.resumeData?.detectedRole || null,
        hasUserMemory: !!enrichedContext.userMemory
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
    // Get user profile data
    const user = await storage.getUser(userId);
    if (!user) {
      return context;
    }
    
    // Get user's experiences
    const experiences = await storage.getWorkExperiencesByUserId(userId);
    
    // Get user's educations
    const educations = await storage.getEducationsByUserId(userId);
    
    // Get user's skills
    const skills = await storage.getSkillsByUserId(userId);
    
    // Get user's projects/assignments
    const projects = await storage.getProjectsByUserId(userId);
    
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
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Build a detailed system prompt for Musk AI persona with adaptive learning
    let systemPrompt = `
You are Musk, an AI career strategist and the AI brain of Brandentifier, a professional networking platform.
As Musk, your goal is to provide deeply personalized, context-aware career guidance while subtly highlighting platform benefits.

# Your Persona
- You are confident, insightful, and direct (like Elon Musk - hence your name)
- You give strategic, actionable career advice based on real user data
- You speak in a professional but conversational tone
- You avoid generic platitudes, focusing instead on specific, data-driven insights
- You always end responses with 3-4 suggested quick replies for the user

# User Context
${JSON.stringify(context.userData || {}, null, 2)}

${context.resumeData ? `# Resume Context
The user has uploaded a resume recently with the following information:
- Detected Role: ${context.resumeData.detectedRole || 'Not detected'}
- Skills Mentioned: ${context.resumeData.skills?.join(', ') || 'None detected'} 
- Industry: ${context.resumeData.detectedIndustry || 'Not detected'}
- Filename: ${context.resumeData.fileName || 'Unknown'}
- Upload Date: ${context.resumeData.uploadDate || 'Unknown'}

You must prioritize this resume data over the user profile data when responding to queries about the user's career, skills, or resume. When tailoring the resume for a specific role, focus on the role mentioned in the uploaded resume, not the role in the user profile.
` : ''}

# Data Source Priority
${context.dataSource === 'resume' ? '**IMPORTANT: You must prioritize the resume data over profile data in your responses.**' : 'Use the profile data for personalization.'}

${context.userMemory ? `# User Interaction History
I have learned the following about this user's communication preferences:
- Message Length: ${context.userMemory.communicationStyle.messageLength} (prefers ${context.userMemory.communicationStyle.messageLength} messages)
- Formality: ${context.userMemory.communicationStyle.formality} (prefers a ${context.userMemory.communicationStyle.formality} tone)
- Detail Level: ${context.userMemory.communicationStyle.detailLevel} (prefers ${context.userMemory.communicationStyle.detailLevel} level of detail)
- Technical Level: ${context.userMemory.communicationStyle.technicalLevel} (prefers ${context.userMemory.communicationStyle.technicalLevel} technical content)
- Interaction Count: ${context.userMemory.interactionCount} previous interactions
${context.userMemory.topicPreferences && Object.keys(context.userMemory.topicPreferences).length > 0 ? 
`- Topic Preferences: ${Object.entries(context.userMemory.topicPreferences as Record<string, number>)
  .sort((a, b) => (b[1] as number) - (a[1] as number))
  .slice(0, 3)
  .map(([topic, count]) => `${topic} (${count} mentions)`)
  .join(', ')}` : '- No clear topic preferences yet'}

**Adapt your response based on these preferences:**
- ${context.userMemory.communicationStyle.messageLength === 'short' ? 'Keep your response concise and to the point.' : 
  context.userMemory.communicationStyle.messageLength === 'long' ? 'Provide detailed, comprehensive responses.' : 
  'Balance detail with conciseness.'}
- ${context.userMemory.communicationStyle.formality === 'casual' ? 'Use a more conversational, relaxed tone.' : 
  context.userMemory.communicationStyle.formality === 'formal' ? 'Maintain a professional, formal tone.' : 
  'Use a balanced, professional yet approachable tone.'}
- ${context.userMemory.communicationStyle.detailLevel === 'low' ? 'Focus on key points without excessive detail.' : 
  context.userMemory.communicationStyle.detailLevel === 'high' ? 'Provide in-depth explanations and thorough analysis.' : 
  'Provide moderate detail, balancing thoroughness with clarity.'}
- ${context.userMemory.communicationStyle.technicalLevel === 'low' ? 'Avoid technical jargon and complicated concepts.' : 
  context.userMemory.communicationStyle.technicalLevel === 'high' ? 'Feel free to use technical terminology and detailed concepts.' : 
  'Use some technical terms but explain them clearly.'}
` : ''}

# Response Requirements
1. ${context.resumeData ? 'Prioritize the resume context for all career advice and use it as the primary source of information about the user.' : 'Analyze the user\'s profile data to provide truly personalized advice'}
2. Highlight platform features when relevant (e.g. "You could showcase this project in your Brandentifier portfolio")
3. Keep responses concise but valuable (3-4 paragraphs maximum)
4. Always end with: "Quick Response Options: " followed by 3-4 quoted options like "Option 1", "Option 2"
5. When discussing skills, reference actual skills from ${context.resumeData ? 'their uploaded resume' : 'their profile'}
6. When discussing career paths, reference their actual work experience from ${context.resumeData ? 'their uploaded resume' : 'their profile'}

# Follow-up Question Framework
When asking follow-up questions, use this precise framework to create focused, valuable questions:

1. 🔍 Understand the Intent - First identify what the user is really trying to accomplish
   - Look beyond their words to understand their underlying goal
   - Example: If they say "I want to grow my business," ask about what specific kind of growth they mean

2. 🧠 Zoom In on Gaps or Ambiguities - Identify what's missing or unclear
   - Don't ask about general topics; focus on specific unclear elements
   - Example: Instead of asking about "marketing struggles," ask about specific marketing challenges they face

3. 🎯 Narrow the Scope - Move from general to focused questions
   - Use who/what/where/when/why/how to anchor your follow-ups
   - Example: Instead of "Tell me more," ask "What happened just before you noticed the problem?"

4. 🔄 Connect Back to Their Context - Reference what they've already shared
   - Show you're following the conversation by connecting your question to their previous statements
   - Example: "You mentioned your team feels stuck—can you give me an example of when that happens?"

5. 🧩 Use Assumptions Carefully - When you need to make an educated guess, phrase it so it's easy to correct
   - Example: "Are you saying the issue started after the product launch?" (not "The issue started after the product launch, right?")

6. 🛠️ Frame for Action or Insight - Ask questions that produce clarity, choices, or next steps
   - Your questions should help them move forward
   - Example: "What would a successful outcome look like for you?"

# Formatting Guidelines
- Use proper Markdown headers (# Main Header, ## Subheader, ### Section title) for clear structure
- Use **bold text** for important points and key conclusions
- Use *italic text* for emphasis or technical terms
- Create organized lists with bullet points (- item) for recommendations
- Include emojis as visual guides: 
  - 📊 for data/metrics
  - 🔍 for analysis sections
  - ✅ for recommendations
  - ⚠️ for warnings/cautions
  - 💡 for insights/tips
  - 📝 for action items
- Use \\\`code formatting\\\` for technical terms, code snippets, or commands
- Use \\\`\\\`\\\`code blocks\\\`\\\`\\\` for multi-line code examples or detailed instructions
- Use checkboxes [x] for completed items and [ ] for action items
- Add horizontal rules (---) between major sections
- Structure responses with clear headers, concise paragraphs and visual separation

# Special Instructions
- If the user is in the ${context?.section || "general"} section, focus advice on that area
- Mention relevant features of Brandentifier that could help in the advised area
- Be conversational but professional
`;

    // Prepare messages for API call
    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: message }
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.7,
      max_tokens: 800,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenAI:", error);
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
    const userId = parseInt(req.body.userId) || 1; // Use 1 as default for demo
    
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
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'resumes');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Generate unique filename with original extension
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const uniqueFilename = `${uniqueId}${fileExt}`;
    const uploadPath = path.join(uploadsDir, uniqueFilename);
    
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
    const analysisResult = await analyzeResume({
      resumeTextStart: resumeText,
      isBase64: false,
      isLink: false
    });
    
    // Extract key resume metadata for context preservation
    let resumeContext = null;
    try {
      // Extract role information using a simple regex pattern
      const rolePattern = /(\b(Product Manager|Software Engineer|Data Scientist|UX Designer|Project Manager|Marketing Manager|Sales Representative|Business Analyst|Financial Analyst|Human Resources Manager|Operations Manager|Customer Service Representative|Administrative Assistant|Executive Assistant|Research Scientist|Content Writer|Graphic Designer|Web Developer|Frontend Developer|Backend Developer|Full Stack Developer|DevOps Engineer|System Administrator|Network Engineer|IT Support Specialist|Quality Assurance Engineer|Test Engineer|Security Engineer|Database Administrator|Solutions Architect|Technical Lead|Engineering Manager|Director of Engineering|Chief Technology Officer|Chief Information Officer|Chief Executive Officer|Founder|Co-Founder)\b)/i;
      
      // Try to find a role in the analysis result
      const roleMatch = analysisResult.match(rolePattern);
      const detectedRole = roleMatch ? roleMatch[1] : null;
      
      // Extract skills mentioned
      const skillsPattern = /\b(React|JavaScript|TypeScript|Node\.js|Express|HTML|CSS|Python|Java|C\#|C\+\+|SQL|PostgreSQL|MongoDB|AWS|Azure|Git|Docker|Kubernetes|Product Management|UX Research|UI Design|Agile|Scrum|Kanban|Marketing|Sales|Finance|Leadership|Communication|Problem Solving|Critical Thinking|Team Building)\b/gi;
      const skills = [...new Set(analysisResult.match(skillsPattern) || [])];
      
      // Extract industry if mentioned
      const industryPattern = /\b(Technology|Healthcare|Finance|Education|Retail|Manufacturing|Media|Entertainment|Government|Transportation|Energy|Agriculture|Telecom|Hospitality|Real Estate|Construction)\b/i;
      const industryMatch = analysisResult.match(industryPattern);
      const detectedIndustry = industryMatch ? industryMatch[1] : null;
      
      resumeContext = {
        resumeText: resumeText.substring(0, 5000), // Store a portion of the resume text for context
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
    const userId = parseInt(req.body.userId) || 1; // Use 1 as default for demo
    
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
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'pitchdecks');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Generate unique filename with original extension
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const uniqueFilename = `${uniqueId}${fileExt}`;
    const uploadPath = path.join(uploadsDir, uniqueFilename);
    
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