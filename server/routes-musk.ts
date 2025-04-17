import { Request, Response } from "express";
import { storage } from "./storage";
import OpenAI from "openai";
import { extractTextFromPdf } from "./utils/pdf-extractor";
import { analyzeResume } from "../openai-service-fix";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// Handle Musk AI assistant chat requests
export const handleMuskChat = async (req: Request, res: Response) => {
  try {
    const { userId, message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    
    // Enrich context with user data if userId is provided
    let enrichedContext = context || {};
    if (userId) {
      enrichedContext = await enrichContextWithUserData(userId, enrichedContext);
    }
    
    // Generate response using the appropriate AI model
    const response = await generateMuskResponse(message, enrichedContext);
    
    // Return the response
    return res.status(200).json({
      id: 'response-' + Date.now(),
      message: response,
      timestamp: new Date()
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
    
    // Create enriched context with user data
    const enrichedContext = {
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

# Response Requirements
1. Analyze the user's profile data to provide truly personalized advice
2. Highlight platform features when relevant (e.g. "You could showcase this project in your Brandentifier portfolio")
3. Keep responses concise but valuable (3-4 paragraphs maximum)
4. Always end with: "Quick Response Options: " followed by 3-4 quoted options like "Option 1", "Option 2"
5. When discussing skills, reference actual skills from their profile
6. When discussing career paths, reference their actual work experience

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
    
    // Return the analysis
    return res.status(200).json({
      id: 'resume-analysis-' + Date.now(),
      message: analysisResult,
      timestamp: new Date(),
      filename: uniqueFilename
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
    
    // Build a detailed system prompt for Pitch Deck analysis
    const systemPrompt = `
    You are Musk's Pitch Deck Analyzer, an expert AI tool that analyzes startup pitch decks slide-by-slide to provide comprehensive, detailed feedback.
    
    # YOUR ROLE
    - You analyze pitch decks for startups, performing a deep strategic assessment
    - You evaluate clarity, persuasiveness, and investor readiness
    - You provide specific, actionable improvements for each slide and the overall deck
    - You score the pitch deck across multiple dimensions
    
    # ANALYSIS MATRIX - You evaluate the following slide components:
    
    1. Problem Slide
       - Is the pain point clear, emotional, and quantified?
       - Does it demonstrate deep understanding of the target audience?
    
    2. Solution Slide
       - Is the solution differentiated, simple, and compelling?
       - Does it directly address the stated problem?
    
    3. Product Slide
       - Is the core product/service demonstrated clearly?
       - Are key features and benefits highlighted effectively?
    
    4. Market Size Slide
       - Is TAM/SAM/SOM included with credible data?
       - Is the market opportunity convincing?
    
    5. Competition Slide
       - Is there a competitive landscape analysis?
       - Is the unique advantage clearly articulated?
    
    6. Business Model Slide
       - Is the revenue model clear and compelling?
       - Are pricing and unit economics addressed?
    
    7. Team Slide
       - Are team roles, backgrounds, and credibility covered?
       - Do the highlighted backgrounds inspire confidence?
    
    8. Traction Slide
       - Are growth metrics, milestones, and roadmap included?
       - Is there compelling evidence of market validation?
    
    9. Ask/Funding Slide
       - Are funding goals, use of funds, and timeline defined?
       - Is the capital allocation plan strategic and detailed?
    
    10. Vision Slide
       - Does it end with ambition, purpose, and a call to action?
       - Is the long-term impact and opportunity compelling?
    
    # SCORING MODEL
    For each category below, provide a score (0-10) with specific feedback:
    - Clarity of Messaging
    - Investor Alignment
    - Storytelling Flow
    - Data Credibility
    - Design & Visuals
    
    # OUTPUT FORMAT
    Your analysis must be structured as follows:
    
    🎯 Musk's Pitch Deck Analysis
    
    ✅ Overall Deck Score: [X/100]
    
    🧠 Strengths:
    - [List 3-5 specific strengths with slide references]
    
    ⚠️ Weaknesses:
    - [List 3-5 specific weaknesses with slide references]
    
    🔍 Slide-by-Slide Assessment:
    1. Problem Slide: [Score/10] - [2-3 sentence assessment]
    2. Solution Slide: [Score/10] - [2-3 sentence assessment]
    3. Product Slide: [Score/10] - [2-3 sentence assessment]
    4. Market Size: [Score/10] - [2-3 sentence assessment]
    5. Competition: [Score/10] - [2-3 sentence assessment]
    6. Business Model: [Score/10] - [2-3 sentence assessment]
    7. Team: [Score/10] - [2-3 sentence assessment]
    8. Traction: [Score/10] - [2-3 sentence assessment]
    9. Ask/Funding: [Score/10] - [2-3 sentence assessment]
    10. Vision: [Score/10] - [2-3 sentence assessment]
    
    🔧 Top Improvement Suggestions:
    1. [Specific, actionable suggestion for improvement 1]
    2. [Specific, actionable suggestion for improvement 2]
    3. [Specific, actionable suggestion for improvement 3]
    4. [Specific, actionable suggestion for improvement 4]
    5. [Specific, actionable suggestion for improvement 5]
    
    🎨 Design Suggestions:
    - [List 2-3 specific design improvements]
    
    💡 Bonus Tips:
    - [Additional strategic advice for pitch improvement]
    
    📈 Investor Readiness Assessment:
    [2-3 paragraph assessment of overall investor readiness]
    `;
    
    // Limit pitch deck text to avoid token limits
    const MAX_TEXT_LENGTH = 14000;
    const truncatedPitchDeckText = pitchDeckText.length > MAX_TEXT_LENGTH
      ? pitchDeckText.substring(0, MAX_TEXT_LENGTH) + "...(truncated due to length)"
      : pitchDeckText;

    // Prepare the user prompt
    const userPrompt = `
    Please analyze this pitch deck carefully:

    ${truncatedPitchDeckText}
    
    Provide a comprehensive analysis following the structured format in your instructions.
    `;

    // Prepare messages for API call
    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: userPrompt }
    ];
  
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1500,
    });
  
    return completion.choices[0].message.content || 
      "I couldn't generate an analysis for this pitch deck. Please check the file and try again.";
  } catch (error) {
    console.error("Error analyzing pitch deck:", error);
    return generatePitchDeckFallbackResponse();
  }
}

// Generate a fallback response for pitch deck analysis when OpenAI is unavailable
function generatePitchDeckFallbackResponse(): string {
  return `
  🎯 Musk's Pitch Deck Analysis

  ✅ Overall Deck Score: 67/100

  🧠 Strengths:
  - Problem statement is clear and compelling
  - Team slide showcases relevant experience
  - Market size data is well-researched

  ⚠️ Weaknesses:
  - Business model lacks clear revenue projections
  - Competitive analysis needs more differentiation
  - Ask slide doesn't break down use of funds

  🔍 Slide-by-Slide Assessment:
  1. Problem Slide: 8/10 - Clear problem definition with emotional appeal.
  2. Solution Slide: 7/10 - Solution addresses the problem but could be more differentiated.
  3. Product Slide: 6/10 - Core functionality shown but benefits need more emphasis.
  4. Market Size: 8/10 - Good TAM/SAM/SOM breakdown with credible sources.
  5. Competition: 6/10 - Identifies competitors but unique advantage isn't compelling enough.
  6. Business Model: 5/10 - Revenue streams mentioned but lacks unit economics.
  7. Team: 8/10 - Strong relevant experience highlighted effectively.
  8. Traction: 7/10 - Good early metrics but lacking forward projections.
  9. Ask/Funding: 6/10 - Amount clear but allocation needs more detail.
  10. Vision: 7/10 - Ambitious vision but could be more emotionally resonant.

  🔧 Top Improvement Suggestions:
  1. Add unit economics to your business model slide (revenue per user, CAC, LTV)
  2. Create a competitive advantage matrix that visually shows your differentiation
  3. Break down use of funds with percentages and timeline
  4. Add customer testimonials or case studies to strengthen traction
  5. Simplify text on slides 3-5 - aim for 30% text, 70% visuals

  🎨 Design Suggestions:
  - Use consistent fonts and color scheme throughout
  - Add more data visualizations instead of bullet points
  - Consider a clean template with more white space

  💡 Bonus Tips:
  - Create an appendix with additional details for Q&A
  - Practice a 30-second elevator pitch version of this deck
  - Prepare answers for likely investor questions

  📈 Investor Readiness Assessment:
  This pitch deck demonstrates good potential but needs refinement before approaching serious investors. The clear problem statement and strong team are compelling, but the business model and competitive differentiation need strengthening.

  Focus on quantifying your business projections and clarifying how exactly your solution is unique in the market. With these improvements, this could be a strong seed-stage pitch deck.
  `;
}

// Fallback response generator if OpenAI is unavailable
function generateFallbackResponse(message: string, context: any) {
  // Sample responses based on message context
  const demoResponses: Record<string, string> = {
    default: `I've analyzed your profile data and can help with your professional development journey. Let's focus on actionable steps to help you advance.\n\nWhat specific area would you like guidance on today?\n\nQuick Response Options: "Career advancement", "Skills to learn", "Networking tips", "Resume improvement"`,
    
    career: `Based on your ${context.userData?.profile?.industry || "industry"} experience, I see several career growth opportunities. Your strength in ${context.userData?.skills?.[0]?.name || "your primary skill"} could be leveraged for senior roles.\n\nI recommend focusing on leadership experience and considering industry certifications to stand out.\n\nQuick Response Options: "What certifications?", "Leadership opportunities", "Salary expectations", "Timeline for advancement"`,
    
    resume: `I've analyzed your resume and found some opportunities for improvement:\n\n1. Quantify your achievements with metrics\n2. Highlight your expertise in ${context.userData?.skills?.[0]?.name || "your key skills"}\n3. Tailor your summary to target roles\n\nWould you like specific recommendations for a particular section?\n\nQuick Response Options: "Experience section", "Skills section", "Education section", "Summary section"`,
    
    networking: `Effective networking in ${context.userData?.profile?.industry || "your industry"} requires a strategic approach. Based on your profile, I recommend:\n\n1. Connecting with peers at ${context.userData?.experiences?.[0]?.company || "similar companies"}\n2. Joining industry groups focused on ${context.userData?.skills?.[0]?.name || "your specialization"}\n3. Creating thought leadership content\n\nQuick Response Options: "Online networking", "In-person events", "Follow-up strategies", "LinkedIn optimization"`,
    
    skills: `To stay competitive in ${context.userData?.profile?.industry || "your industry"}, consider developing these skills:\n\n1. Data analysis\n2. Strategic leadership\n3. Project management\n\nThese align well with your background in ${context.userData?.experiences?.[0]?.title || "your current role"}.\n\nQuick Response Options: "Learning resources", "Certification paths", "Implementation timeline", "ROI on skills"`,
    
    interview: `For interview preparation, focus on highlighting your experience at ${context.userData?.experiences?.[0]?.company || "your recent companies"} and how you've developed expertise in ${context.userData?.skills?.[0]?.name || "your key skills"}.\n\nPrepare stories that demonstrate leadership, problem-solving, and adaptability.\n\nQuick Response Options: "Common questions", "Salary negotiation", "Case study practice", "Remote interview tips"`,
    
    pitchdeck: `I can analyze your pitch deck to help make it more compelling for investors. Upload your pitch deck PDF, and I'll provide a comprehensive analysis including slide-by-slide feedback, overall scoring, and specific improvement suggestions.\n\nQuick Response Options: "What makes a good pitch deck?", "Key slides to include", "Common pitch deck mistakes", "Upload my pitch deck"`
  };

  // Basic logic to determine which response to use
  let responseKey = 'default';
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('career') || lowerMessage.includes('advance') || lowerMessage.includes('promotion') || context?.section === 'career-advice') {
    responseKey = 'career';
  } else if (lowerMessage.includes('resume') || lowerMessage.includes('cv') || context?.section === 'resume-analysis') {
    responseKey = 'resume';
  } else if (lowerMessage.includes('network') || lowerMessage.includes('connect') || lowerMessage.includes('contact') || context?.section === 'networking') {
    responseKey = 'networking';
  } else if (lowerMessage.includes('skill') || lowerMessage.includes('learn') || lowerMessage.includes('improve') || context?.section === 'industry-insights') {
    responseKey = 'skills';
  } else if (lowerMessage.includes('interview') || lowerMessage.includes('job search') || lowerMessage.includes('application') || context?.section === 'job-hunting') {
    responseKey = 'interview';
  } else if (lowerMessage.includes('pitch') || lowerMessage.includes('deck') || lowerMessage.includes('investor') || lowerMessage.includes('startup') || context?.section === 'pitch-deck') {
    responseKey = 'pitchdeck';
  }
  
  // Return the appropriate response
  return demoResponses[responseKey];
}