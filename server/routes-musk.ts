import { Request, Response } from "express";
import { storage } from "./storage";
import OpenAI from "openai";
import { extractTextFromPdf } from "./utils/pdf-extractor";
import { analyzeResume } from "../openai-service-fix";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// Define types for resume context storage
interface ResumeContext {
  resumeText: string;
  detectedRole: string | null;
  skills: string[];
  detectedIndustry: string | null;
  uploadDate: string;
  fileName: string;
}

// Global storage for resume contexts - persists between requests
declare global {
  var resumeContexts: {
    [userId: string]: ResumeContext;
  };
}

// Initialize the global resume contexts storage
if (!global.resumeContexts) {
  global.resumeContexts = {};
}

// Create a fallback response for when OpenAI is unavailable
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

Feel free to check back soon!

Quick Response Options:
"What can Musk help me with?"
"What features does Brandentifier offer?"
"How can I improve my profile?"
"Can I upload my resume for analysis?"`;
}

// Fallback response for pitch deck analysis
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

Please try uploading your pitch deck again later when our analysis service is fully available.`;
}

export const handleMuskChat = async (req: Request, res: Response) => {
  try {
    const { userId, message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    
    // Enrich context with user data if userId is provided
    let enrichedContext = context || {};
    
    // Add session to context so it can be used to retrieve resume data
    enrichedContext.req = req;
    
    // Check global storage for resume context (alternative to session)
    if (!global.resumeContexts) {
      global.resumeContexts = {};
    }
    
    // Check for resume context in global storage first since it's most reliable
    const userIdStr = userId.toString();
    if (global.resumeContexts[userIdStr]) {
      console.log(`Found resume context in global storage for user ${userId}`);
    } else {
      // Only try session if the above fails
      try {
        if (req.session?.resumeContexts?.[userIdStr]) {
          console.log(`Found resume context in session for user ${userId}`);
          // Copy from session to global for future consistency
          global.resumeContexts[userIdStr] = req.session.resumeContexts[userIdStr];
        } else {
          console.log(`No resume context found for user ${userId}`);
        }
      } catch (e) {
        console.log(`Session not available, no resume context found for user ${userId}`);
      }
    }
    
    if (userId) {
      enrichedContext = await enrichContextWithUserData(userId, enrichedContext);
    }
    
    // Generate response using the appropriate AI model
    const response = await generateMuskResponse(message, enrichedContext);
    
    // Return the response
    return res.status(200).json({
      id: 'response-' + Date.now(),
      message: response,
      timestamp: new Date(),
      contextUsed: {
        dataSource: enrichedContext.dataSource || 'profile',
        hasResumeData: !!enrichedContext.resumeData,
        detectedRole: enrichedContext.resumeData?.detectedRole || null
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
    
    // Check for resume context in global storage (our primary storage method)
    let enrichedContext = baseContext;
    const userIdStr = userId.toString();
    
    // Prioritize global storage
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
    // Fall back to session storage if needed
    else if (context?.req?.session?.resumeContexts?.[userIdStr]) {
      const resumeContext = context.req.session.resumeContexts[userIdStr];
      console.log(`Found session resume context for user ${userId}: `, resumeContext);
      
      // Mirror to global storage for future consistency
      global.resumeContexts[userIdStr] = resumeContext;
      
      // Add resume context information
      enrichedContext = {
        ...baseContext,
        resumeData: resumeContext,
        // Signal to Musk that it should use resume data with higher priority
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
    
    // Build a detailed system prompt for Musk AI persona
    const systemPrompt = `
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

# Response Requirements
1. ${context.resumeData ? 'Prioritize the resume context for all career advice and use it as the primary source of information about the user.' : 'Analyze the user\'s profile data to provide truly personalized advice'}
2. Highlight platform features when relevant (e.g. "You could showcase this project in your Brandentifier portfolio")
3. Keep responses concise but valuable (3-4 paragraphs maximum)
4. Always end with: "Quick Response Options: " followed by 3-4 quoted options like "Option 1", "Option 2"
5. When discussing skills, reference actual skills from ${context.resumeData ? 'their uploaded resume' : 'their profile'}
6. When discussing career paths, reference their actual work experience from ${context.resumeData ? 'their uploaded resume' : 'their profile'}

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
      
      // Use a regular array for skills instead of a Set to avoid TS errors
      const skillMatches = analysisResult.match(skillsPattern) || [];
      const skills = Array.from(new Set(skillMatches));
      
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
      
      // Try to store in session if available (as a backup)
      try {
        if (req.session && typeof req.session === 'object') {
          if (!req.session.resumeContexts) {
            req.session.resumeContexts = {};
          }
          req.session.resumeContexts[userId] = resumeContext;
          console.log(`Also stored resume context in session for user ${userId}`);
        }
      } catch (sessionError) {
        console.log("Session storage not available, using only global storage");
      }
    } catch (contextError) {
      console.error("Error extracting resume context:", contextError);
      // Continue even if context extraction fails
    }
    
    // Return the analysis with context
    return res.status(200).json({
      id: 'resume-analysis-' + Date.now(),
      message: analysisResult,
      timestamp: new Date(),
      fileName: resumeFile.name,
      context: {
        detectedRole: resumeContext?.detectedRole || null,
        detectedIndustry: resumeContext?.detectedIndustry || null,
        skills: resumeContext?.skills || []
      }
    });
  } catch (error) {
    console.error("Error in resume analysis:", error);
    return res.status(500).json({ error: "Failed to analyze resume" });
  }
};

// Handle pitch deck uploads for analysis by Musk
export const handlePitchDeckUpload = async (req: Request, res: Response) => {
  try {
    // Check if file was uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: "No pitch deck file was uploaded" });
    }
    
    // Get the uploaded file (named "file" in the form data or fallback to "pitchdeck")
    const pitchDeckFile = (req.files.file || req.files.pitchdeck) as any;
    
    if (!pitchDeckFile) {
      return res.status(400).json({ error: "Pitch deck file not found in the request" });
    }
    
    // Check file type - only accept PDF documents
    const fileExt = path.extname(pitchDeckFile.name).toLowerCase();
    if (fileExt !== '.pdf') {
      return res.status(400).json({
        error: "Invalid file type. Only PDF files are accepted for pitch deck analysis."
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
    const pdfBuffer = fs.readFileSync(uploadPath);
    const pitchDeckText = await extractTextFromPdf(pdfBuffer);
    
    // Analyze the pitch deck using OpenAI through the analyzePitchDeck function
    const analysisResult = await analyzePitchDeck(pitchDeckText);
    
    // Return the analysis
    return res.status(200).json({
      id: 'pitchdeck-analysis-' + Date.now(),
      message: analysisResult,
      timestamp: new Date(),
      fileName: pitchDeckFile.name
    });
  } catch (error) {
    console.error("Error in pitch deck analysis:", error);
    return res.status(500).json({ error: "Failed to analyze pitch deck" });
  }
};

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
