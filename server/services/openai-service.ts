import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { WorkExperience, Education, Skill } from "@shared/schema";
import { extractTextFromPdf } from "../utils/pdf-extractor";
import { promises as fs } from 'fs';
import path from 'path';

// Initialize OpenAI client with extended timeout
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000, // 60 seconds timeout
  maxRetries: 3
});

// Initialize Anthropic client for fallback
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";
// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const CLAUDE_MODEL = "claude-3-7-sonnet-20250219";

/**
 * Generate career advice based on user profile information and specific advice type
 * @param userProfile User profile data including advice type
 * @returns Career advice and next step recommendations
 */
export async function generateCareerAdvice(userProfile: {
  user: any;
  workExperiences: WorkExperience[];
  skills: Skill[];
  educations: Education[];
  adviceType: string;
  customAdviceText?: string;
}) {
  try {
    // Format work experiences for the prompt
    const workExperienceText = userProfile.workExperiences
      .map((exp) => {
        return `- ${exp.title} at ${exp.company}${
          exp.domain ? ` (${exp.domain})` : ""
        }${exp.industry ? ` in ${exp.industry}` : ""}${
          exp.location ? `, ${exp.location}` : ""
        }
        Duration: ${exp.startDate}${exp.endDate ? ` to ${exp.endDate}` : " to Present"}
        ${exp.description ? `Description: ${exp.description}` : ""}`;
      })
      .join("\n\n");

    // Format skills for the prompt
    const skillsText = userProfile.skills
      .map((skill) => {
        return `- ${skill.name}${
          skill.level ? ` (${skill.level})` : ""
        }${skill.proficiency ? ` - Proficiency: ${skill.proficiency}/10` : ""}`;
      })
      .join("\n");

    // Format education for the prompt
    const educationText = userProfile.educations
      .map((edu) => {
        return `- ${edu.degree} at ${edu.institution}${
          edu.location ? `, ${edu.location}` : ""
        }
        Duration: ${edu.startDate}${
          edu.endDate ? ` to ${edu.endDate}` : " to Present"
        }`;
      })
      .join("\n\n");
      
    // Get user basic information
    const userName = userProfile.user?.name || "the user";
    const userTitle = userProfile.user?.title || "a professional";
    const userIndustry = userProfile.user?.industry || "various industries";
    const userLocation = userProfile.user?.location || "unknown location";
    
    // Convert advice type to a human-readable format
    let adviceTypeText = "career advancement";
    let specificPrompt = "";
    
    switch (userProfile.adviceType) {
      case "explore_options":
        adviceTypeText = "exploring career options";
        specificPrompt = `Analyze their profile thoroughly (education, work experience, skills, projects) and identify their core strengths and transferable skills. Then suggest at least 3-5 tailored career paths (including traditional roles, adjacent roles, and emerging opportunities), provide upskilling recommendations, and create a short/medium/long-term career roadmap. Include networking and strategy tips.`;
        break;
      case "switch_industry":
        adviceTypeText = "switching industries";
        specificPrompt = `Conduct a comprehensive industry transition analysis for ${userName} currently in ${userIndustry} as ${userTitle}. Use the following structured approach:

1. DEEP PROFILE ANALYSIS:
   - Analyze hard skills (tools, tech stacks, certifications, platforms)
   - Identify soft skills (leadership, communication, problem-solving)
   - Examine career progression patterns (managerial vs hands-on)
   - Detect domain-specific language and expertise
   - Note quantifiable achievements and results
   - Determine if their roles are primarily operational, strategic, creative, or technical

2. INDUSTRY SKILL MAPPING:
   - Cross-reference identified skills with growing industries
   - Create skill clusters to match transferable expertise to new domains
   - Map current experience to potential industries (e.g., Software Dev → AI/ML, FinTech, HealthTech)

3. FIT SCORING FOR EACH POTENTIAL INDUSTRY:
   - Skill Match Score
   - Interest Alignment Score based on CV keywords
   - Growth Potential
   - Ease of Transition
   - Future-Proofing Rating

4. MARKET TREND ANALYSIS:
   - Current Industry Growth Rates and Market Size
   - Hiring Demand & Compensation Trends
   - Regional/Global Market Variations
   - Future Industry Forecasts (5-10 year outlook)
   - Emerging Roles and Skill Requirements
   - Economic Factors Affecting Industry Stability

5. PROVIDE A VISUALIZATION-READY OUTPUT:
   Present your results in this format:
   
   # Industry Transition Map for ${userName}
   
   ## Your Current Role: ${userTitle}
   
   ## Viable Industry Switch Options
   
   For each recommended industry (4-5 total), include EXACTLY in this format with the emoji:
   
   ### [Industry Name] - 🟢 High Match
   or
   ### [Industry Name] - 🟡 Medium Match
   or 
   ### [Industry Name] - 🟠 Low Match
   
   - Example Entry-Level Role: [Specific job title]
   - Why It Fits You: [2-3 key reasons based on skills]
   - Roles to Explore: [3-4 specific positions]
   - Difficulty Level: [Easy/Medium/Hard] with brief explanation
   - Skill Transferability: [List top transferable skills]
   - Suggested First Steps: [Concrete actions to take]
   
   ## Practical Transition Strategy
   
   - Resume Rewrite Focus: [How to adapt resume for each industry]
   - Learning Priority: [Skills gaps to fill]
   - Networking Strategy: [Using Brandentifier's Smart Connect plus industry-specific networks]
   
   ## Success Stories
   
   Include 1-2 brief examples of professionals who made similar transitions.
   
   ## Why This Path Might Surprise You
   
   Add unexpected benefits or opportunities in these new industries.`;
        break;
      case "build_skills":
        adviceTypeText = "building core skills for future roles";
        specificPrompt = `Follow this exact structure for your response:

1. First, perform a thorough profile analysis, categorizing their:
   - Experience (domains worked in, industries exposed to, scope of roles)
   - Tools & Tech (platforms used, stack familiarity, certifications)
   - Achievements (results delivered, scale of ownership)
   - Role Titles & Transitions (career momentum, managerial vs hands-on growth)

2. Create a current strength mapping, categorizing:
   - Hard Skills (technical tools, platforms, programming languages)
   - Soft Skills (leadership, strategic thinking, etc.)
   - Industry Tags (specific sectors they have experience in)
   - Career Stage (early, mid-level, senior, executive)

3. Predict 3-5 high-fit future roles based on:
   - Resume signals
   - Industry trajectory
   - Cross-role transitions
   - Job market trends

4. For each predicted role, identify:
   - Core skill gaps (what they're missing)
   - Skill priority level (must-have, good-to-have, optional)
   - Skill category (technical, strategic, creative, communication)

5. Create a structured "Future Role Readiness Plan" with these exact sections:
   
   ## 🌟 Potential Future Roles
   
   Create a table with columns for Role, Match Percentage, and Why You're a Fit
   
   ## 🧠 Core Skills to Build Now
   
   List each skill with:
   - Priority (⭐️ Must-have, 🔹 Medium, 🔸 Optional)
   - Use Case (which future roles need this skill)
   
   ## 📚 Suggested Learning Tracks
   
   Include specific courses with:
   - Track name
   - Platform (specific website, not general)
   - Estimated hours
   
   ## 🔁 Ongoing Practice Suggestions
   
   3-5 specific activities they can do regularly to build these skills

Make your response detailed but practical. Focus on actionable advice that the user can implement immediately.`;
        break;
      case "get_certifications":
        adviceTypeText = "acquiring valuable certifications";
        specificPrompt = `Focus on recommending 3-5 specific certifications that would be most valuable for ${userName} as a ${userTitle}. For each certification, explain its value, difficulty, time commitment, and how it would benefit their career.`;
        break;
      case "expand_network":
        adviceTypeText = "expanding professional network";
        specificPrompt = `Focus on networking strategies tailored to ${userName}'s career stage and industry. Include both online and offline networking techniques, specific platforms or groups to join, and tips for making meaningful connections.`;
        break;
      case "find_job":
        adviceTypeText = "finding a new job";
        specificPrompt = `Focus on job search strategies, including optimizing online presence, targeting companies, tailoring applications, and interview preparation. Provide specific advice about job hunting in ${userLocation} or remotely, if appropriate.`;
        break;
      case "prepare_interviews":
        adviceTypeText = "preparing for job interviews";
        specificPrompt = `Focus on comprehensive interview preparation, including common questions for ${userTitle} positions, how to demonstrate value, behavioral question strategies, and how to effectively discuss past experiences from the resume.`;
        break;
      case "launch_startup":
        adviceTypeText = "launching a startup";
        specificPrompt = `Focus on entrepreneurship advice based on ${userName}'s background. Include guidance on validating ideas, finding co-founders, early funding options, and leveraging their existing experience in a startup context.`;
        break;
      case "international":
        adviceTypeText = "working or studying internationally";
        specificPrompt = `Focus on strategies for international career opportunities. Cover visa considerations, international job search tactics, adapting skills for global markets, and specific regions that might be good matches based on ${userName}'s profile.`;
        break;
      case "custom":
        adviceTypeText = "custom career request";
        if (userProfile.customAdviceText) {
          specificPrompt = `The user has a specific request: "${userProfile.customAdviceText}". Focus your advice precisely on addressing this request in detail, while making it relevant to their professional background.`;
        }
        break;
    }

    // Check if any profile sections are missing or minimal
    const hasWorkExperience = userProfile.workExperiences && userProfile.workExperiences.length > 0;
    const hasSkills = userProfile.skills && userProfile.skills.length > 0;
    const hasEducation = userProfile.educations && userProfile.educations.length > 0;
    
    // Create a list of incomplete sections
    const incompleteSections = [];
    if (!hasWorkExperience) incompleteSections.push("work experience");
    if (!hasSkills) incompleteSections.push("skills");
    if (!hasEducation) incompleteSections.push("education");
    
    // Add profile completion guidance if needed
    let profileCompletionGuidance = "";
    if (incompleteSections.length > 0) {
      profileCompletionGuidance = `
      IMPORTANT: This profile is missing or has minimal information in these sections: ${incompleteSections.join(", ")}. 
      
      As part of your career advice, include a section called "## Profile Completion Recommendations" 
      with specific suggestions for how completing these missing sections would enhance their career prospects 
      and allow for more personalized advice in the future. 
      
      IMPORTANT FORMATTING RULES FOR THIS SECTION:
      1. Do NOT use "###" (triple hash) for subsections - use only "##" (double hash) for section headers
      2. Do NOT use bullet points with asterisks (*) - use only dash (-) for bullet points
      3. Do NOT enclose text in asterisks for emphasis - use only formatting in section headers
      4. Format this section just like all other sections in your response, with clean paragraphs and dash-prefixed list items
      
      Explain why each missing section is important for career development and how it impacts the quality of advice possible.
      `;
    }
    
    const prompt = `
    I need personalized career advice about ${adviceTypeText} for ${userName}, who is currently working as ${userTitle} in ${userIndustry}, located in ${userLocation}.
    
    Here is their professional profile:
    
    WORK EXPERIENCE:
    ${workExperienceText || "No work experience provided"}
    
    SKILLS:
    ${skillsText || "No skills provided"}
    
    EDUCATION:
    ${educationText || "No education provided"}
    
    ${specificPrompt}
    
    ${profileCompletionGuidance}
    
    Please provide:
    1. A personalized assessment of their situation related to ${adviceTypeText}
    2. Three to five specific, actionable steps they can take immediately
    3. Longer-term strategies they should consider
    4. Resources they might find helpful (books, courses, websites, tools, communities). IMPORTANT: When suggesting networking platforms or professional development resources, always mention relevant Brandentifier features alongside external resources. For example, suggest using Brandentifier's Portfolio Builder, Smart Connect networking feature, or Services showcase alongside external platforms like LinkedIn or Meetup.
    
    USE PROPER FORMATTING:
    - Use "# " for main section titles
    - Use "## " for subtitles
    - Use bullet points with "- " for lists 
    - Use *italic* for emphasis
    - Use line breaks between sections
    - Format resources as bullet points with names and short descriptions
    
    Make it professional, clean, and easy to read. Be specific and actionable throughout.
    `;

    try {
      // First attempt with OpenAI
      console.log("Attempting to generate career advice with OpenAI...");
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: await (async () => {
              // Import the scenario intelligence system
              const { getScenarioIntelligence, generateSystemPrompt } = await import('./scenario-intelligence');
              
              // Get the appropriate scenario for this advice type
              const scenario = getScenarioIntelligence(userProfile.adviceType);
              
              // Get the user's name or a default
              const userName = userProfile.user?.name || "User";
              
              // Generate a dynamic system prompt based on the scenario
              const scenarioPrompt = generateSystemPrompt(scenario, userName);
              
              // Combine with formatting rules
              return `${scenarioPrompt}
              
Follow these STRICT FORMATTING RULES for all responses:
1) Use '# ' for main section titles (one hash only)
2) Use '## ' for subtitles (two hashes only)
3) Use dash and space '- ' for bullet points (no asterisks)
4) Use line breaks between sections
5) Format resources as dash-prefixed list items
6) For industry switch advice, use the format '### [Industry Name] - 🟢 High Match' OR '### [Industry Name] - 🟡 Medium Match' OR '### [Industry Name] - 🟠 Low Match'

Your advice should look professional, consistent, and easy to read at a glance. Sign your response as 'Musk, Your Career Partner' at the end.`;
            })(),
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,  // Increased for more creative responses
        max_tokens: 4000,
        top_p: 0.95,       // Diverse token selection for more varied responses
        presence_penalty: 0.3,  // Encourage including new topics
      });

      return response.choices[0].message.content || "Unable to generate career advice";
    } catch (openaiError: any) {
      // Log OpenAI error
      console.error("Error with OpenAI API:", openaiError);
      
      // Fallback to Anthropic
      try {
        console.log("Falling back to Anthropic API...");
        
        // Import the scenario intelligence system for Anthropic
        const { getScenarioIntelligence, generateSystemPrompt } = await import('./scenario-intelligence');
              
        // Get the appropriate scenario for this advice type
        const scenario = getScenarioIntelligence(userProfile.adviceType);
              
        // Get the user's name or a default
        const userName = userProfile.user?.name || "User";
              
        // Generate a dynamic system prompt based on the scenario
        const scenarioPrompt = generateSystemPrompt(scenario, userName);
        
        // Format the system prompt for Anthropic with formatting guidelines
        const anthropicSystemPrompt = `${scenarioPrompt}
              
Follow these STRICT FORMATTING RULES for all responses:
1) Use '# ' for main section titles (one hash only)
2) Use '## ' for subtitles (two hashes only)
3) Use dash and space '- ' for bullet points (no asterisks)
4) Use line breaks between sections
5) Format resources as dash-prefixed list items
6) For industry switch advice, use the format '### [Industry Name] - 🟢 High Match' OR '### [Industry Name] - 🟡 Medium Match' OR '### [Industry Name] - 🟠 Low Match'

Your advice should look professional, consistent, and easy to read at a glance. Sign your response as 'Musk, Your Career Partner' at the end.`;
        
        const anthropicResponse = await anthropic.messages.create({
          model: CLAUDE_MODEL,
          max_tokens: 4000,
          system: anthropicSystemPrompt,
          messages: [
            { role: "user", content: prompt }
          ],
          temperature: 0.8
        });
        
        console.log("Successfully generated advice with Anthropic");
        // Process Anthropic response content
        const content = anthropicResponse.content;
        if (content && content.length > 0) {
          // @ts-ignore - We're checking the type property first before accessing text
          const textContent = content[0].type === 'text' ? content[0].text : null;
          return textContent || "Unable to generate career advice";
        } else {
          console.error("Unexpected content format from Anthropic API");
          return "Unable to generate career advice due to unexpected response format";
        }
      } catch (anthropicError: any) {
        console.error("Anthropic API also failed:", anthropicError);
        
        // Final fallback: Use our defined fallback service based on advice type
        console.log("Both APIs failed. Using structured fallback content based on advice type...");
        console.log(`Generating fallback career advice of type: ${userProfile.adviceType}`);
        
        // Import our dedicated fallback service
        const { generateCareerAdviceFallback } = await import('./ai-fallback-service');
        
        // Return the type-specific fallback content
        const userName = userProfile.user?.name || "User";
        const adviceType = userProfile.adviceType || 'general';
        return generateCareerAdviceFallback(adviceType, userName);
        
        // This code should never execute now, keeping for historical reference
        if (false && userProfile.adviceType === 'industry-switch') {
          const userName = userProfile.user?.name || "User";
          const skills = userProfile.skills.map(skill => skill.name).join(', ') || 'product management, strategic planning, and team leadership';
          
          return `# Industry Transition Map for ${userName}

## Your Current Role: Product Manager in Technology

## Viable Industry Switch Options

### FinTech - 🟢 High Match

- Example Entry-Level Role: FinTech Product Manager
- Why It Fits You: Your experience with product development cycles and strategic planning translates directly to financial technology products. Your analytical approach is well-suited for financial services.
- Roles to Explore: FinTech Product Manager, Financial Solutions Strategist, Digital Banking Product Lead
- Current Market Trends: 24% annual growth rate, $190B market size, high demand for product expertise
- Future Outlook: Explosive growth in decentralized finance and embedded financial services
- Difficulty Level: Easy - minimal domain knowledge required beyond financial basics
- Skill Transferability: Product management, user experience design, stakeholder management, analytics, strategic planning
- Suggested First Steps: Complete an online course in financial services fundamentals and connect with 3-5 FinTech professionals through Brandentifier's Smart Connect

### HealthTech - 🟡 Medium Match

- Example Entry-Level Role: Healthcare Solutions Specialist
- Why It Fits You: Your focus on user experience and data systems is valuable in patient-centered healthcare technology. Healthcare is increasingly digital and needs product expertise.
- Roles to Explore: Health IT Product Manager, Patient Experience Designer, Healthcare Analytics Manager
- Current Market Trends: 27% growth in digital health solutions, $350B global market, increasing investment
- Future Outlook: AI-driven diagnostics and remote patient monitoring solutions will dominate by 2030
- Difficulty Level: Medium - requires understanding of healthcare operations and compliance
- Skill Transferability: User experience design, data analysis, product lifecycle management
- Suggested First Steps: Take a healthcare IT certification course and find mentors already working in the field

### EdTech - 🟢 High Match

- Example Entry-Level Role: Learning Experience Product Manager
- Why It Fits You: Education technology needs product managers who understand how to create engaging digital experiences. Your background in user-centered design is valuable here.
- Roles to Explore: EdTech Product Manager, Digital Learning Strategist, Education Content Developer
- Current Market Trends: 16.5% annual growth, $404B global market value, increasing adoption in higher education
- Future Outlook: Mixed reality learning environments and AI-powered personalized education becoming mainstream
- Difficulty Level: Easy - education domain knowledge is relatively accessible
- Skill Transferability: UX/UI design, project management, analytics, stakeholder management
- Suggested First Steps: Volunteer for an education nonprofit to gain domain experience while building your portfolio in Brandentifier

### Green Technology - 🟠 Low Match

- Example Entry-Level Role: Sustainability Solutions Coordinator
- Why It Fits You: Growing field with increasing technical needs. Your product development skills can help bring sustainability solutions to market.
- Roles to Explore: Sustainable Product Manager, Green Technology Analyst, Clean Energy Project Coordinator
- Current Market Trends: 22.4% CAGR, significant government investment ($369B through IRA), high funding activity
- Future Outlook: Mass adoption of circular economy principles and carbon capture technologies by 2030
- Difficulty Level: Hard - requires substantial domain knowledge in sustainability
- Skill Transferability: Project management, data analysis, strategic planning
- Suggested First Steps: Complete a sustainability certification and join environmental technology forums

## Practical Transition Strategy

- Resume Rewrite Focus: Highlight transferable skills like user-centered design, data analysis, and product development while incorporating industry-specific terminology for each target
- Learning Priority: Financial services fundamentals for FinTech, healthcare operations for HealthTech, educational theory for EdTech
- Networking Strategy: Use Brandentifier's Smart Connect to find professionals in target industries; join industry-specific LinkedIn groups and professional associations

## Success Stories

Maria T. transitioned from Product Management at a tech company to leading healthcare products at a major HealthTech startup within 6 months by leveraging her experience with user research and data visualization. She focused on learning healthcare regulations while emphasizing her transferable skills.

David K. moved from software project management to FinTech by taking a financial services course and targeting companies that needed strong product leadership but were willing to train on industry specifics. He highlighted his experience managing complex stakeholder relationships.

## Why This Path Might Surprise You

FinTech and HealthTech offer significantly higher compensation than traditional tech roles due to the specialized domain knowledge. EdTech provides better work-life balance than most tech sectors while still offering innovation opportunities. Green Technology offers ground-floor opportunities in a sector predicted to grow exponentially over the next decade.

Musk, Your Career Partner`;
        } else {
          // Default general career advice
          const userName = userProfile.user?.name || "User";
          const userIndustry = userProfile.user?.industry || "your current industry";
          const skills = userProfile.skills.map(skill => skill.name).join(', ') || "project management and team leadership";
          const education = userProfile.educations.length > 0 ? userProfile.educations[0].degree || "your field" : "your field";
          
          return `# Career Development Insights for ${userName}

Based on your professional profile, here are my recommendations to help advance your career:

## Key Strengths to Leverage

- Your experience in ${userIndustry} provides you with valuable domain expertise
- Your skills in ${skills} are highly marketable
- Your educational background in ${education} gives you a strong foundation

## Growth Opportunities

1. **Skill Enhancement**
   - Consider building expertise in emerging technologies relevant to your field
   - Develop leadership skills through formal training or mentorship opportunities
   - Expand your business acumen through courses in financial management or strategy

2. **Network Development**
   - Use Brandentifier's Smart Connect feature to identify strategic networking opportunities
   - Join professional associations in your industry
   - Attend industry conferences and events to build your presence

3. **Professional Visibility**
   - Create a standout portfolio using Brandentifier's Portfolio Builder
   - Share your expertise through publishing articles or speaking at events
   - Showcase your services using Brandentifier's Services feature

## Next Steps

1. Update your Brandentifier portfolio to highlight your most impressive achievements
2. Set up 3-5 informational interviews with professionals in roles you aspire to
3. Identify one skill gap and enroll in relevant training within the next month
4. Schedule regular time for strategic networking using Brandentifier's Smart Connect

Musk, Your Career Partner`;
        }
      }
    }
  } catch (error: any) {
    console.error("Error generating career advice:", error);
    throw new Error(`Failed to generate career advice: ${error.message}`);
  }
}

/**
 * Analyze resume text to extract professional insights
 * @param resumeText The text content of the resume or link to resume
 * @param isBase64 Whether the resumeText is a base64-encoded file
 * @param isLink Whether the resumeText is a URL to a resume
 * @returns Analysis and suggestions based on the resume
 */
export interface ResumeAnalysisOptions {
  resumeTextStart: string;
  isBase64?: boolean;
  isLink?: boolean;
}

/**
 * Analyze resume text to extract professional insights
 */
export async function analyzeResume(options: ResumeAnalysisOptions | string, isBase64?: boolean, isLink?: boolean) {
  let resumeText: string;
  let isBase64Value: boolean = false;
  let isLinkValue: boolean = false;
  let isDirectTextInput: boolean = false;

  // Handle both old and new parameter formats for backward compatibility
  if (typeof options === 'string') {
    // Old format: (resumeText, isBase64, isLink)
    resumeText = options;
    isBase64Value = isBase64 || false;
    isLinkValue = isLink || false;
    isDirectTextInput = !isBase64Value && !isLinkValue; // If not base64 or link, it's direct text
  } else {
    // New format: ({ resumeTextStart, isBase64, isLink })
    resumeText = options.resumeTextStart;
    isBase64Value = options.isBase64 || false;
    isLinkValue = options.isLink || false;
    isDirectTextInput = !isBase64Value && !isLinkValue; // If not base64 or link, it's direct text
  }
  
  try {
    console.log("analyzeResume called with parameters:", { 
      resumeTextStart: resumeText ? resumeText.substring(0, 50) + "..." : "null", 
      isBase64: isBase64Value, 
      isLink: isLinkValue,
      isDirectTextInput: isDirectTextInput
    });
    
    // Only trigger demo mode when explicitly requested with the exact keyword
    const isDemoMode = resumeText === "DEMO_MODE" || resumeText === "example" || resumeText === "demo";
    
    if (isDemoMode) {
      console.log("Using demo mode with sample resume analysis");
      // Return the sample resume analysis from the attached asset
      try {
        const fs = require('fs');
        const path = require('path');
        const sampleAnalysisPath = path.join(process.cwd(), 'attached_assets', 'Pasted-Resume-Analysis-Improvement-Suggestions-for-Nishant-Chopra-Your-resume-is-strong-in-terms-of-exper-1743723302407.txt');
        
        if (fs.existsSync(sampleAnalysisPath)) {
          const sampleAnalysis = fs.readFileSync(sampleAnalysisPath, 'utf8');
          console.log(`Returning sample analysis (${sampleAnalysis.length} characters)`);
          return sampleAnalysis;
        }
      } catch (error) {
        console.error("Error reading sample analysis:", error);
      }
    }
    
    // If parameters are not explicitly provided, try to detect
    if (!isLinkValue && !isBase64Value) {
      isLinkValue = resumeText.startsWith('http://') || resumeText.startsWith('https://');
      isBase64Value = resumeText.startsWith('This is base64 encoded resume data:');
      console.log("Auto-detected parameters:", { isLinkValue, isBase64Value });
    }
    
    // Import the resume intelligence system
    const { generateResumeAnalysisPrompt } = await import('./resume-intelligence');
    
    // Generate a dynamic system prompt for resume analysis
    let systemPrompt = generateResumeAnalysisPrompt();
    let userPrompt = "";
    
    if (isLinkValue) {
      console.log("Creating prompt for URL analysis with link:", resumeText);
      systemPrompt += " You cannot access the content of external links directly, but you can provide comprehensive, detailed guidance for resume improvement similar to what an expert resume coach would offer.";
      userPrompt = `
      The user has provided a link to their resume (${resumeText}), but I cannot directly access the content of external links. 
      
      Since I can't see the actual resume, please provide a comprehensive set of resume analysis and improvement guidelines that would be valuable for most professionals. Use this EXACT formatting with proper markdown:
      
      # Resume Analysis Guidelines
      
      ## 1. Common Resume Strengths to Verify
      - ✅ [Quantified Achievements]: Include metrics with all accomplishments (e.g., "Increased sales by 27%")
      - ✅ [Technical Proficiency]: Clearly list relevant technologies, tools, and platforms
      - ✅ [Career Progression]: Show growth and increasing responsibility over time
      - ✅ [Industry Keywords]: Include terms specific to your target roles and industry
      - ✅ [Accomplishments vs. Duties]: Focus on results, not just responsibilities
      
      ## 2. Common Areas for Improvement
      - 🔹 [Generic Summary Statements]:
        - Common issue: Generic statements like "Results-driven professional with 10 years of experience"
        - Improvement: Lead with specific expertise and unique value proposition
        - Example:
          ❌ "Dedicated professional with experience in software development"
          ✅ "Full-stack developer with 5+ years building scalable fintech solutions using React, Node.js, and AWS, reducing system latency by 40%"
      
      - 🔹 [Lack of Quantifiable Impact]:
        - Common issue: Listing responsibilities without measurable results
        - Improvement: Add metrics to achievements wherever possible
        - Example:
          ❌ "Managed client projects and improved satisfaction"
          ✅ "Led 12 client projects worth $1.2M, improving satisfaction scores by 28% and securing 5 referral clients"
      
      ## 3. Section-by-Section Optimization
      - 📝 [Professional Summary]:
        - Structure: expertise + experience + key achievement + unique value
        - Example: "DevOps engineer with 7+ years orchestrating CI/CD pipelines for SaaS companies, reducing deployment times by 80% and improving system reliability to 99.99% uptime. Known for translating complex technical challenges into elegant automation solutions."
      
      - 📝 [Experience Section]:
        - Structure: accomplishment + method + result format for each bullet
        - Example: "Redesigned customer onboarding process (accomplishment) using design thinking methodology and A/B testing (method), increasing conversion rates by 34% and reducing support tickets by 27% (result)"
      
      ## 4. Key Skills Development
      - 🌟 [Technical Skills]: List specific technologies, not broad categories
        - Recommendation: Group by category with proficiency levels
        - Resource: Use skills assessments on LinkedIn or GitHub profile to validate
      
      - 🌟 [Soft Skills]: Demonstrate with accomplishments, don't just list
        - Recommendation: Connect soft skills to results in experience section
        - Resource: Take CliftonStrengths assessment to identify unique strengths
      
      ## 5. Using Brandentifier to Showcase Your Expertise
      - 📊 Portfolio Builder: Create interactive showcases of your top projects with visual elements
      - 🤝 Smart Connect: Find mentors and peers in your target industry for resume review
      - 🛠️ Services Showcase: Package your key skills as specific service offerings
      
      ## 6. Quick Wins (30-Day Plan)
      1. [Accomplishment Audit]: Identify top 3-5 achievements and add metrics to each
      2. [Keyword Optimization]: Analyze 5 job descriptions and incorporate matching keywords
      3. [Professional Summary Rewrite]: Create a tailored, impactful 3-4 sentence summary
      
      When you upload your actual resume, I can provide specific, personalized feedback for your unique situation. This guide provides the framework I'll use to analyze your resume.
      
      Make this extremely actionable, detailed, and formatted with consistent emoji bullets. Maintain this exact formatting with proper markdown headings.
      `;
    } else if (isBase64Value) {
      console.log("Processing base64 data");
      try {
        // Extract the resume text from the base64 content
        const base64Data = resumeText.split(',')[1] || resumeText;
        
        // Get the OPENAI_API_KEY
        if (!process.env.OPENAI_API_KEY) {
          console.error("OpenAI API key is missing");
          
          // Fall back to sample analysis if API key is missing
          try {
            const fs = await import('fs/promises');
            const path = await import('path');
            const sampleAnalysisPath = path.join(process.cwd(), 'attached_assets', 'Pasted-Resume-Analysis-Improvement-Suggestions-for-Nishant-Chopra-Your-resume-is-strong-in-terms-of-exper-1743723302407.txt');
            
            if (await fs.stat(sampleAnalysisPath)) {
              const sampleAnalysis = await fs.readFile(sampleAnalysisPath, 'utf8');
              console.log(`Returning sample analysis (${sampleAnalysis.length} characters)`);
              return sampleAnalysis;
            }
          } catch (error) {
            console.error("Error reading sample analysis:", error);
          }
          
          throw new Error("OpenAI API key is missing. Please check your environment variables.");
        }
        
        // The base64 string is typically a PDF file, attempt to extract text from it
        console.log("Attempting to extract text from the CV PDF");
        try {
          // Create a temporary file in the /tmp directory
          const tmpFilePath = path.join('/tmp', `cv-${Date.now()}.pdf`);
          const buffer = Buffer.from(base64Data, 'base64');
          
          // Save the buffer to a temporary file
          await fs.writeFile(tmpFilePath, buffer);
          console.log(`Saved PDF to temporary file: ${tmpFilePath}`);
          
          // Read the file into a buffer for PDF extraction
          const fileBuffer = await fs.readFile(tmpFilePath);
          
          // Extract text from the PDF
          const extractedText = await extractTextFromPdf(fileBuffer);
          
          // Clean up the temporary file
          await fs.unlink(tmpFilePath);
          
          if (extractedText && extractedText.length > 0) {
            console.log(`Successfully extracted text (${extractedText.length} chars)`);
            // Update resumeText with the extracted text and set isDirectTextInput to true
            resumeText = extractedText;
            isDirectTextInput = true;
            isBase64Value = false;
          } else {
            console.log("Text extraction failed or returned empty text");
            
            // If text extraction failed, use Vision API to analyze the PDF
            console.log("Attempting to use Vision API to analyze the CV PDF");
            try {
              const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                  {
                    role: "system",
                    content: "You are an expert system for extracting structured text content from resume images. Extract all important text information from the provided resume image, maintaining the original structure and formatting as much as possible."
                  },
                  {
                    role: "user",
                    content: [
                      {
                        type: "text",
                        text: "Below is a resume image. Please extract ALL text content from it while preserving the structure as best as possible. Include the person's name, contact information, summary, experience details (company names, job titles, dates, responsibilities), education, skills, certifications, and any other information present. Format it as plain text with clear section headers and appropriate spacing."
                      },
                      {
                        type: "image_url",
                        image_url: {
                          url: `data:application/pdf;base64,${base64Data}`
                        }
                      }
                    ]
                  }
                ],
                max_tokens: 4000
              });
              
              const extractedVisionText = response.choices[0].message.content;
              
              if (extractedVisionText && extractedVisionText.length > 0) {
                console.log(`Successfully extracted text with Vision API (${extractedVisionText.length} chars)`);
                // Update resumeText with the extracted text and set isDirectTextInput to true
                resumeText = extractedVisionText;
                isDirectTextInput = true;
                isBase64Value = false;
              } else {
                console.log("Vision API extraction failed or returned empty text");
                throw new Error("Failed to extract text from the PDF using Vision API");
              }
            } catch (visionError: any) {
              console.error("Error using Vision API:", visionError);
              throw new Error(`Failed to process PDF: ${visionError.message}`);
            }
          }
        } catch (err: any) {
          console.error("Error extracting text from PDF:", err);
          throw new Error(`Failed to extract text from PDF: ${err.message}`);
        }
      } catch (error: any) {
        console.error("Error processing base64 data:", error);
        systemPrompt += " I cannot directly process this resume file, but I can provide comprehensive, detailed guidance for resume improvement similar to what an expert resume coach would offer.";
        userPrompt = `
        I couldn't properly process the resume file you uploaded. Please provide a comprehensive, detailed resume analysis and improvement guide using the following structured format with proper markdown:
      
        # Resume Analysis Guidelines
        
        ## 1. Common Resume Strengths to Verify
        - ✅ [Quantified Achievements]: Include metrics with all accomplishments
        - ✅ [Technical Proficiency]: Clearly list relevant technologies, tools, and platforms
        - ✅ [Career Progression]: Show growth and increasing responsibility over time
        
        ## 2. Common Areas for Improvement
        - 🔹 [Generic Summary Statements]:
          - Common issue: Generic statements without specificity
          - Improvement: Lead with specific expertise and unique value proposition
          - Example: Before/after comparison
        
        ## 3. Section-by-Section Optimization
        - 📝 [Professional Summary]: Structure and example
        - 📝 [Experience Section]: Format for bullets and example
        
        ## 4. Key Skills Development
        - 🌟 [Technical Skills]: How to present them effectively
        - 🌟 [Soft Skills]: How to demonstrate with accomplishments
        
        ## 5. Using Brandentifier to Showcase Your Expertise
        - 📊 Portfolio Builder: How to use effectively
        - 🤝 Smart Connect: Networking strategies
        
        ## 6. Quick Wins (30-Day Plan)
        1. [Action 1]: Expected outcome
        2. [Action 2]: Expected outcome
        3. [Action 3]: Expected outcome
        
        Use proper markdown formatting, consistent emoji bullets, and maintain this exact section structure.
        `;
      }
    } 
    
    // Process direct text input or text extracted from base64 file
    if (isDirectTextInput) {
      try {
        // Regular text resume
        console.log("Processing plain text resume");
        
        // Increase text length limit to capture more of the resume
        const MAX_TEXT_LENGTH = 6000;
        const truncatedText = resumeText.length > MAX_TEXT_LENGTH 
          ? resumeText.substring(0, MAX_TEXT_LENGTH) + "...(truncated due to length)"
          : resumeText;
      
        userPrompt = `
      I need an EXTREMELY detailed and personalized professional analysis of this resume. This must be a comprehensive, specific analysis that directly references the actual content in the resume, not generic advice. Make your response feel like it was written specifically for this individual after carefully studying their resume.
        
      RESUME TEXT:
      ${truncatedText}
      
      Follow this EXACT formatting structure with proper markdown and emojis:
      
      # Resume Analysis for [Person's Name]
      
      ## 1. Strengths Overview (Score: X/100)
      - ✅ [Strength 1]: Specific example from their resume
      - ✅ [Strength 2]: Specific example from their resume
      - ✅ [Strength 3]: Specific example from their resume
      (Include 4-6 specific strengths with clear examples)
      
      ## 2. Areas for Improvement (Score: X/100)
      - 🔹 [Improvement Area 1]:
        - Current issue: What's currently in their resume
        - Suggestion: Specific improvement recommendation
        - Example: Before/after example
      
      - 🔹 [Improvement Area 2]:
        - Current issue: What's currently in their resume
        - Suggestion: Specific improvement recommendation
        - Example: Before/after example
      (Include 3-5 improvement areas)
      
      ## 3. Resume Rewrite Suggestions
      - 📝 [Section to Revise 1]:
        ❌ Current version: "..." (actual text from resume)
        ✅ Improved version: "..." (your suggested revision)
      
      - 📝 [Section to Revise 2]:
        ❌ Current version: "..." (actual text from resume)
        ✅ Improved version: "..." (your suggested revision)
      
      ## 4. Upskill Opportunities
      - 🌟 [Priority Skill 1]: Why needed and specific learning resource
      - 🌟 [Priority Skill 2]: Why needed and specific learning resource
      - 🌟 [Priority Skill 3]: Why needed and specific learning resource
      
      ## 5. Brandentifier Features to Leverage
      - 📊 Portfolio Builder: How to showcase specific projects from their resume
      - 🤝 Smart Connect: Specific networking recommendations based on their background
      - 🛠️ Services Showcase: How to position their expertise as services
      
      ## 6. Quick Wins (30-Day Plan)
      1. [Quick Win 1]: Specific action with expected outcome
      2. [Quick Win 2]: Specific action with expected outcome
      3. [Quick Win 3]: Specific action with expected outcome
      
      Evaluate the resume using these criteria:
      - Structure & Layout (organization, formatting, visual appeal)
      - Content Quality (clarity, relevance, professional language)
      - Industry Relevance (alignment with expectations, terminology)
      - Achievements & Impact (quantified results, specific accomplishments)
      - Skills Balance (technical and soft skills representation)
      - ATS Compatibility (keywords, standard sections, parsable format)
      
      Make sure to use:
      1. Proper Markdown formatting with # and ## for headings
      2. Consistent emoji bullet points for visual distinction
      3. Specific examples and direct quotes from their actual resume
      4. Before/after examples for suggested improvements
      5. A professional yet conversational tone
      6. Exactly the section structure outlined above
      
      Your analysis should be extremely personalized, actionable, and visually structured.
      `;
      } catch (error: any) {
        console.error("Error processing text resume:", error);
        systemPrompt += " I cannot directly process this resume text, but I can provide comprehensive, detailed guidance for resume improvement similar to what an expert resume coach would offer.";
        userPrompt = `
        I couldn't properly process the resume text you provided. Please provide a comprehensive, detailed resume analysis and improvement guide using the following structured format with proper markdown:
      
        # Resume Analysis Guidelines
        
        ## 1. Common Resume Strengths to Verify
        - ✅ [Quantified Achievements]: Include metrics with all accomplishments
        - ✅ [Technical Proficiency]: Clearly list relevant technologies, tools, and platforms
        - ✅ [Career Progression]: Show growth and increasing responsibility over time
        
        ## 2. Common Areas for Improvement
        - 🔹 [Generic Summary Statements]:
          - Common issue: Generic statements without specificity
          - Improvement: Lead with specific expertise and unique value proposition
          - Example: Before/after comparison
        
        ## 3. Section-by-Section Optimization
        - 📝 [Professional Summary]: Structure and example
        - 📝 [Experience Section]: Format for bullets and example
        
        ## 4. Key Skills Development
        - 🌟 [Technical Skills]: How to present them effectively
        - 🌟 [Soft Skills]: How to demonstrate with accomplishments
        
        ## 5. Using Brandentifier to Showcase Your Expertise
        - 📊 Portfolio Builder: How to use effectively
        - 🤝 Smart Connect: Networking strategies
        
        ## 6. Quick Wins (30-Day Plan)
        1. [Action 1]: Expected outcome
        2. [Action 2]: Expected outcome
        3. [Action 3]: Expected outcome
        
        Use proper markdown formatting, consistent emoji bullets, and maintain this exact section structure.
        `;
      }
    } else if (!userPrompt) {
      // Fallback for any other case
      systemPrompt += " I cannot directly process this resume, but I can provide comprehensive, detailed guidance for resume improvement similar to what an expert resume coach would offer.";
      userPrompt = `
      I couldn't properly process the resume you provided. Please provide a comprehensive, detailed resume analysis and improvement guide using the following structured format with proper markdown:
      
      # Resume Analysis Guidelines
      
      ## 1. Common Resume Strengths to Verify
      - ✅ [Quantified Achievements]: Include metrics with all accomplishments
      - ✅ [Technical Proficiency]: Clearly list relevant technologies, tools, and platforms
      - ✅ [Career Progression]: Show growth and increasing responsibility over time
      
      ## 2. Common Areas for Improvement
      - 🔹 [Generic Summary Statements]:
        - Common issue: Generic statements without specificity
        - Improvement: Lead with specific expertise and unique value proposition
        - Example: Before/after comparison
      
      ## 3. Section-by-Section Optimization
      - 📝 [Professional Summary]: Structure and example
      - 📝 [Experience Section]: Format for bullets and example
      
      ## 4. Key Skills Development
      - 🌟 [Technical Skills]: How to present them effectively
      - 🌟 [Soft Skills]: How to demonstrate with accomplishments
      
      ## 5. Using Brandentifier to Showcase Your Expertise
      - 📊 Portfolio Builder: How to use effectively
      - 🤝 Smart Connect: Networking strategies
      
      ## 6. Quick Wins (30-Day Plan)
      1. [Action 1]: Expected outcome
      2. [Action 2]: Expected outcome
      3. [Action 3]: Expected outcome
      
      Use proper markdown formatting, consistent emoji bullets, and maintain this exact section structure.
      `;
    }
    
    // Send request to OpenAI API
    let response;
    try {
      console.log("Sending request to OpenAI API...");
      response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,  // Increased for more creative responses
        max_tokens: 4000,
        top_p: 0.95,       // Diverse token selection for more varied responses
        presence_penalty: 0.3,  // Encourage including new topics
      });
      console.log("Received response from OpenAI API");
    } catch (apiError) {
      console.error("OpenAI API error:", apiError);
      throw apiError;
    }
    
    return response.choices[0].message.content || "Unable to analyze resume";
  } catch (error: any) {
    console.error("Error analyzing resume:", error);
    return `Error analyzing your resume: ${error.message}. Please try again later or contact support.`;
  }
}

/**
 * Generate personalized networking recommendations
 * @param userProfile User profile information
 * @param targetIndustry Target industry for networking
 * @param purpose Purpose of networking (e.g., job search, mentorship)
 * @returns Personalized networking recommendations
 */
export async function generateNetworkingRecommendations(
  userProfile: {
    user: any;
    workExperiences: WorkExperience[];
    skills: Skill[];
    educations: Education[];
  },
  targetIndustry: string,
  purpose: string
) {
  try {
    // Format work experiences for the prompt
    const workExperienceText = userProfile.workExperiences
      .map((exp) => {
        return `- ${exp.title} at ${exp.company}${
          exp.domain ? ` (${exp.domain})` : ""
        }${exp.industry ? ` in ${exp.industry}` : ""}${
          exp.location ? `, ${exp.location}` : ""
        }
        Duration: ${exp.startDate}${exp.endDate ? ` to ${exp.endDate}` : " to Present"}
        ${exp.description ? `Description: ${exp.description}` : ""}`;
      })
      .join("\n\n");

    // Format skills for the prompt
    const skillsText = userProfile.skills
      .map((skill) => {
        return `- ${skill.name}${
          skill.level ? ` (${skill.level})` : ""
        }${skill.proficiency ? ` - Proficiency: ${skill.proficiency}/10` : ""}`;
      })
      .join("\n");

    // Format education for the prompt
    const educationText = userProfile.educations
      .map((edu) => {
        return `- ${edu.degree} at ${edu.institution}${
          edu.location ? `, ${edu.location}` : ""
        }
        Duration: ${edu.startDate}${
          edu.endDate ? ` to ${edu.endDate}` : " to Present"
        }`;
      })
      .join("\n\n");
      
    // Get user basic information
    const userName = userProfile.user?.name || "the user";
    const userTitle = userProfile.user?.title || "a professional";
    const userIndustry = userProfile.user?.industry || "various industries";
    const userLocation = userProfile.user?.location || "unknown location";

    const prompt = `
    I need personalized networking recommendations for ${userName}, who is currently working as ${userTitle} in ${userIndustry}, located in ${userLocation}.
    
    The user is specifically interested in networking in the ${targetIndustry} industry for the purpose of ${purpose}.
    
    Here is their professional profile:
    
    WORK EXPERIENCE:
    ${workExperienceText || "No work experience provided"}
    
    SKILLS:
    ${skillsText || "No skills provided"}
    
    EDUCATION:
    ${educationText || "No education provided"}
    
    Please provide:
    1. A personalized assessment of their networking potential for ${targetIndustry} based on their background
    2. Specific suggestions for where and how to find relevant networking opportunities (both online and offline)
    3. Tips for creating an effective elevator pitch based on their background
    4. Suggestions for initiating conversations and building meaningful connections
    5. Advice on following up and maintaining professional relationships
    6. Common mistakes to avoid when networking in ${targetIndustry}
    7. How Brandentifier's Smart Connect feature can specifically help them network effectively
    
    USE PROPER FORMATTING:
    - Use "# " for main section titles
    - Use "## " for subtitles
    - Use bullet points with "- " for lists 
    - Use *italic* for emphasis
    - Use line breaks between sections
    
    Make it professional, clean, and easy to read. Be specific and actionable throughout.
    `;

    try {
      // First attempt with OpenAI
      console.log("Attempting to generate networking recommendations with OpenAI...");
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are Musk, a professional networking coach within the Brandentifier platform, with expertise in professional networking, relationship building, and career development. Provide personalized, actionable networking advice that's strategic and targeted. You should always promote Brandentifier's features when giving advice, especially the Smart Connect networking feature. When suggesting networking platforms or groups, always mention how Brandentifier's Smart Connect can help alongside external options like LinkedIn. Use proper markdown formatting for all your responses, with headings (# and ##), bullet points (- ), emphasis (*italic*), and clear section organization. Your advice should look professional and be easy to read at a glance. Sign your response as 'Musk, Your Networking Partner' at the end.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,  // Increased for more creative responses
        max_tokens: 4000,
        top_p: 0.95,       // Diverse token selection for more varied responses
        presence_penalty: 0.3,  // Encourage including new topics
      });

      return response.choices[0].message.content || "Unable to generate networking recommendations";
    } catch (openaiError: any) {
      // Log OpenAI error
      console.error("Error with OpenAI API for networking recommendations:", openaiError);
      
      // Fallback to Anthropic
      try {
        console.log("Falling back to Anthropic API for networking recommendations...");
        const anthropicResponse = await anthropic.messages.create({
          model: CLAUDE_MODEL,
          max_tokens: 4000,
          system: "You are Musk, a professional networking coach within the Brandentifier platform, with expertise in professional networking, relationship building, and career development. Provide personalized, actionable networking advice that's strategic and targeted. You should always promote Brandentifier's features when giving advice, especially the Smart Connect networking feature. When suggesting networking platforms or groups, always mention how Brandentifier's Smart Connect can help alongside external options like LinkedIn. Use proper markdown formatting for all your responses, with headings (# and ##), bullet points (- ), emphasis (*italic*), and clear section organization. Your advice should look professional and be easy to read at a glance. Sign your response as 'Musk, Your Networking Partner' at the end.",
          messages: [
            { role: "user", content: prompt }
          ],
          temperature: 0.8
        });
        
        console.log("Successfully generated networking recommendations with Anthropic");
        // Process Anthropic response content
        const content = anthropicResponse.content;
        if (content && content.length > 0) {
          // @ts-ignore - We're checking the type property first before accessing text
          const textContent = content[0].type === 'text' ? content[0].text : null;
          return textContent || "Unable to generate networking recommendations";
        } else {
          console.error("Unexpected content format from Anthropic API");
          return "Unable to generate networking recommendations due to unexpected response format";
        }
      } catch (anthropicError: any) {
        console.error("Anthropic API also failed for networking recommendations:", anthropicError);
        throw new Error(`Failed to generate networking recommendations with both OpenAI and Anthropic: ${openaiError.message}. Anthropic error: ${anthropicError.message}`);
      }
    }
  } catch (error: any) {
    console.error("Error generating networking recommendations:", error);
    throw new Error(`Failed to generate networking recommendations: ${error.message}`);
  }
}