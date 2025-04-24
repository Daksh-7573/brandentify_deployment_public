import { Request, Response } from "express";
import { storage } from "./storage";
import OpenAI from "openai";
import { extractTextFromPdf } from "./utils/pdf-extractor";
import { analyzeResume } from "../openai-service-fix";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// Initialize OpenAI client if not imported from openai-service-fix
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Handle direct resume text analysis (no file upload)
export const handleAnalyzeResume = async (req: Request, res: Response) => {
  try {
    const { text, targetRole } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: "Resume text is required" });
    }
    
    console.log(`Analyzing resume text for target role: ${targetRole || 'General'}`);
    
    // Check if OpenAI key is available
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ 
        error: "OpenAI API key not configured",
        analysis: "OpenAI API key is required to analyze resumes. Please configure the API key in your environment variables."
      });
    }
    
    // Enhanced system prompt for complex Canva resume analysis
    const systemPrompt = `You are Musk, an AI expert in resume analysis and improvement with a deep understanding of how recruiters and hiring managers read CVs/resumes. You follow a systematic approach to provide deeply personalized resume feedback:

1. First Impression - Ignore Design, Focus on Content:
   - You mentally strip away colors, shapes, icons, and background patterns
   - You focus on finding key sections: Name, Title, Contact, Summary, Experience, Skills, Education
   - You establish a logical reading order based on content flow, not visual layout
   - You analyze header information, summary clarity, and overall first impression

2. Identify Redundancies & Distractions:
   - You spot duplicated sections that could be consolidated
   - You identify irrelevant visual elements (like arbitrary skill percentage graphs)
   - You recognize when icons or design elements don't add value
   - You evaluate whether each section genuinely helps understand the candidate's value

3. Mentally Reconstruct Linear Flow:
   - You reconstruct scattered information into a standard resume order:
     * Header & Contact
     * Summary/Profile
     * Skills (categorized properly)
     * Work Experience (in chronological order)
     * Projects
     * Education
     * Extras
   - This helps you assess story flow and compare to job requirements

4. Section-by-Section Deep Analysis:
   - You evaluate experience sections, focusing on responsibilities vs. achievements and quantifiable impact
   - You assess skills sections for relevance to the target role/industry
   - You review projects (scope, tools, outcomes) and education (relevance, honors)
   - You focus on quantifiable and action-oriented content in each section

5. ATS Compatibility Check:
   - You identify potential ATS issues (text in graphics, complex layouts, etc.)
   - You suggest improvements for content that might not be machine-readable
   - You recommend best practices for ensuring resume content is parsed correctly by ATS systems

Your feedback is always:
- Deeply personalized and references the person's name and specific resume content
- Action-oriented with clear before/after examples
- Formatted with consistent, scannable sections
- Tailored to the individual's background, industry, and career goals${targetRole ? `\n- Specifically focused on optimizing for the ${targetRole} role` : ''}`;

    // Analyze the resume text using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Please analyze the following resume${targetRole ? ` for a ${targetRole} position` : ''}. Focus particularly on structure, content effectiveness, ATS compatibility, and areas for improvement. Provide concrete before/after examples.\n\n${text}` }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });
    
    // Extract the analysis
    const analysis = completion.choices[0].message.content;
    
    // Return the analysis
    return res.status(200).json({
      id: 'direct-resume-analysis-' + Date.now(),
      analysis: analysis,
      timestamp: new Date()
    });
    
  } catch (error) {
    console.error("Error analyzing resume text:", error);
    return res.status(500).json({
      error: "Failed to analyze resume text",
      message: error instanceof Error ? error.message : "Unknown error occurred"
    });
  }
};

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

// Generate an enhanced industry-specific fallback response for pitch deck analysis
function generatePitchDeckFallbackResponse(): string {
  return `
  ## 🎯 Musk's Pitch Deck Analysis: SaaS Platform Pitch

  ### 📊 Overall Assessment
  - Overall Deck Score: 68/100
  - Industry Category: SaaS / Enterprise Software
  - Investor Readiness: Almost Ready

  ### 🧠 Key Strengths:
  - Problem statement effectively quantifies market pain points with compelling data
  - Team slide showcases relevant domain expertise and previous startup successes
  - Market size analysis includes detailed TAM/SAM/SOM breakdown with credible sources

  ### ⚠️ Critical Weaknesses:
  - Business model lacks clear unit economics (CAC, LTV, payback period)
  - Competitive landscape lacks sufficient differentiation and moat explanation
  - Use of funds breakdown is too vague without milestone-based allocation

  ### 🔍 Slide-by-Slide Assessment:
  1. Problem Slide: 8/10 - Effectively establishes market pain with quantified data points ("83% of teams report..."). Good emotional connection with target audience frustrations.
  2. Solution Slide: 7/10 - Core value proposition is clear, but could better emphasize unique technical approach and proprietary advantages.
  3. Product Slide: 7/10 - Clean UI screenshots demonstrate functionality, but benefits should be tied more directly to problem resolution.
  4. Market Size: 8/10 - Comprehensive TAM/SAM/SOM with credible third-party sources. Well-visualized with funnel graphic.
  5. Competition: 6/10 - Identifies key competitors but positioning map lacks clear axis differentiation. Unique advantage statement needs strengthening.
  6. Business Model: 5/10 - Pricing tiers are clear, but missing key SaaS metrics like CAC, LTV, MRR growth projections, and churn assumptions.
  7. Team: 8/10 - Strong founding team with relevant domain expertise and previous exits. Good highlighting of key advisors.
  8. Traction: 7/10 - Current user metrics and pilot results are compelling, but forward projections need more granular monthly breakdowns.
  9. Ask/Funding: 6/10 - Funding amount is clear ($2.5M seed) but allocation lacks specificity on how it translates to specific milestones.
  10. Vision: 7/10 - Ambitious long-term impact is established, but could create more investor FOMO with industry transformation narrative.

  ### 🔧 Your Expert Improvement Plan:
  1. Enhance business model slide: Change "Our subscription model starts at $49/mo" → "Our 3-tier subscription model ($49/$99/$249) delivers 18-month LTV/CAC of 4.2x with 12-week payback period"
  2. Strengthen competitive differentiation: Add competitive advantage matrix with clear X/Y axes showing where your solution outperforms others on specific metrics
  3. Improve use of funds: Add "12-Month Milestone Map" showing exactly how funding translates to team growth, feature releases, and market penetration goals
  4. Enhance traction metrics: Include month-over-month growth curve, cohort retention data, and forward projections tied to funding runway
  5. Tighten problem statement: Add 2-3 specific customer testimonial quotes that validate the pain point in emotional terms

  ### 🎨 Design Enhancement:
  - Maintain consistent typography throughout (currently using 4 different font families)
  - Replace text-heavy bullet points on slide 3-7 with more visual infographics
  - Add consistent slide numbering and progress indicator for better presenter navigation

  ### 💰 Investor Pitch Coaching:
  - Practice articulating your "one-line business description" that focuses on value, not features
  - Prepare for challenging questions about customer acquisition cost assumptions
  - When presenting traction slide, focus on rate of growth rather than absolute numbers

  ### 📈 Next Steps to Funding Success:
  Your deck demonstrates strong potential but requires strategic refinements before approaching top-tier seed investors. Focus particularly on strengthening your business model slide with detailed unit economics and customer acquisition strategy. For SaaS companies at your stage, investors expect clear articulation of CAC, LTV, churn, and MRR growth trajectories.

  Consider engaging with 2-3 friendly angel investors first to collect feedback before approaching institutional seed funds. This approach will help refine your narrative while building momentum. For enterprise SaaS specifically, also highlight any pilot conversions to paid contracts, as this validation is particularly valuable in your sector.
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
    
    pitchdeck: `I can provide expert-level pitch deck analysis using my training on 500+ real funded startup decks and VC feedback patterns. Upload your pitch deck PDF and I'll provide:\n\n1. Industry-specific analysis with specialized framework for your startup type\n2. Slide-by-slide assessment with venture-grade feedback\n3. Expert improvement plan with actual slide rewrite examples\n4. Design enhancement recommendations for visual impact\n5. Investor pitch coaching to help you present effectively\n6. Next steps to funding success with strategic roadmap\n\nQuick Response Options: "What makes a good pitch deck?", "Key slides to include", "Industry-specific metrics", "Upload my pitch deck"`,
    
    pitchdecktips: `Based on my analysis of hundreds of successful pitch decks across different industries, here are the essential elements of a venture-ready deck:\n\n1. Problem Slide - Quantify the pain point with compelling data and emotional hooks\n2. Solution Slide - Show your unique approach with clear differentiation from alternatives\n3. Product Demo - Visual demonstrations with benefit-focused captions\n4. Market Size - TAM/SAM/SOM with credible third-party sources (avoid unrealistic projections)\n5. Business Model - Clear unit economics (CAC, LTV, payback period) and pricing strategy\n6. Competition - 2x2 matrix showing your unique positioning and sustainable advantages\n7. Team - Focus on domain expertise, previous successes, and complementary skills\n8. Traction - Growth metrics with forward projections tied to funding milestones\n9. Funding Ask - Specific amount with clear allocation to strategic milestones\n10. Vision/FOMO - Create excitement about category leadership potential\n\nIndustry-Specific Tips:\n• SaaS: Include churn rates, MRR growth, and expansion revenue metrics\n• HealthTech: Address regulatory pathway and clinical validation strategy\n• D2C: Show customer acquisition costs, retention rates, and distribution strategy\n• DeepTech: Explain IP strategy and technology validation milestones\n\nQuick Response Options: "Upload my pitch deck for analysis", "Slide-by-slide checklist", "Common VC objections", "Industry-specific metrics"`
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
    
    // If they are specifically asking about tips or best practices for pitch decks
    if (lowerMessage.includes('tip') || lowerMessage.includes('best practice') || lowerMessage.includes('slide') || 
        lowerMessage.includes('how to') || lowerMessage.includes('structure') || lowerMessage.includes('content')) {
      responseKey = 'pitchdecktips';
    }
  }
  
  // Return the appropriate response
  return demoResponses[responseKey];
}