import OpenAI from "openai";
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

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

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
        specificPrompt = `Focus on identifying diverse career paths that would be a good match for ${userName}'s skills and experience. Suggest at least 3-5 potential career options with rationale for each.`;
        break;
      case "switch_industry":
        adviceTypeText = "switching industries";
        specificPrompt = `Focus on strategies for transitioning from ${userIndustry} to other industries. Identify 3-4 potential target industries where ${userName}'s skills would be transferable, and provide specific advice for making the switch.`;
        break;
      case "build_skills":
        adviceTypeText = "building core skills for future roles";
        specificPrompt = `Focus on identifying skill gaps compared to industry standards and future trends. Recommend specific skills to develop, with practical ways to acquire them (courses, certifications, projects, etc).`;
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

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are Musk, a professional career coach within the Brandentifier platform, with expertise in career development, industry trends, and professional growth. Provide personalized, actionable career advice that's warm and encouraging while remaining practical. You should always promote Brandentifier's features when giving advice, including the Portfolio Builder, Smart Connect networking feature, and Services showcase. When suggesting networking platforms or resources, always mention how these Brandentifier tools can help alongside external options like LinkedIn. Use proper markdown formatting for all your responses, with headings (# and ##), bullet points (- ), emphasis (*italic*), and clear section organization. Your advice should look professional and be easy to read at a glance. Sign your response as 'Musk, Your Career Partner' at the end.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,  // Increased for more creative responses
      max_tokens: 4000,
      top_p: 0.95,       // Diverse token selection for more varied responses
      presence_penalty: 0.3,  // Encourage including new topics
    });

    return response.choices[0].message.content || "Unable to generate career advice";
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

export async function analyzeResume(options: ResumeAnalysisOptions | string, isBase64?: boolean, isLink?: boolean) {
  try {
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
    
    let systemPrompt = "You are Musk, an expert resume analyzer within the Brandentifier platform, with deep knowledge of professional development and hiring practices across many industries. Your analysis must be EXTREMELY PERSONALIZED, using the person's specific name and directly referencing their exact experiences, skills, and background from their resume. Avoid generic advice - everything must be tailored to their specific situation. Provide detailed, constructive feedback with highly actionable insights. When suggesting improvements, always mention how Brandentifier's features can help, including the Portfolio Builder for showcasing projects, Smart Connect for networking, and Services showcase for freelancers and consultants. Above all, your analysis must be deeply personalized, conversational, and feel like it was written specifically for the individual based on their unique resume.";
    let userPrompt = "";
    
    if (isLinkValue) {
      console.log("Creating prompt for URL analysis with link:", resumeText);
      systemPrompt += " You cannot access the content of external links directly, but you can provide comprehensive, detailed guidance for resume improvement similar to what an expert resume coach would offer.";
      userPrompt = `
      The user has provided a link to their resume (${resumeText}), but I cannot directly access the content of external links. 
      
      Please provide a comprehensive, detailed resume analysis and improvement guide structured like this example:

      Resume Analysis & Improvement Suggestions
      
      Strengths (common in professional resumes):
      ✅ List 5-6 common strengths seen in professional resumes (focus on Product Management, AI, SaaS, tech roles)
      ✅ Include specific areas like quantifiable achievements, technical skills, career progression
      ✅ Mention industry exposure (tech, fintech, e-commerce, etc.)
      
      Areas for Improvement & Recommendations:
      
      1️⃣ Improve Profile Summary
      Show examples of weak vs. strong profile summaries:
      
      ❌ Current (example of a generic summary)
      ✅ Suggested Revision (example of a strong summary with specifics about AI, product management, achievements)
      
      2️⃣ Achievements Need More Quantifiable Impact
      Provide specific examples:
      
      ❌ Generic achievement example
      ✅ Achievement with metrics (e.g., "Led full-cycle product development for 5+ AI-powered products, achieving a 30% reduction in time-to-market")
      
      3️⃣ Better Formatting for Readability
      Specific formatting tips for modern resumes
      
      4️⃣ Improve "Skills" Section
      Suggested structure with modern skills relevant to tech and product roles
      
      5️⃣ "Projects" Section Recommendations
      Show how to structure a projects section with examples
      
      6️⃣ ATS Optimization Tips
      Explain how to make resumes ATS-friendly with examples
      
      Make this extremely actionable, detailed, and formatted with emoji bullets (like ✅, 🔹, 📅) to make sections visually distinct. Use a professional yet conversational tone.
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
            
            const sampleAnalysis = await fs.readFile(sampleAnalysisPath, 'utf8');
            console.log(`Using sample analysis because OpenAI API key is missing (${sampleAnalysis.length} characters)`);
            return sampleAnalysis;
          } catch (err: any) {
            console.error(`Error reading sample analysis: ${err.message}`);
            return "Error: Could not analyze the resume. Please check that the OpenAI API key is properly configured.";
          }
        }
        
        console.log("Using improved PDF extractor to process the PDF directly");
        
        // Print the first 100 characters of the base64 data for debugging
        console.log(`Base64 data preview: ${base64Data.substring(0, 100)}...`);
        
        try {
          // Convert base64 to buffer
          const pdfBuffer = Buffer.from(base64Data, 'base64');
          
          // Use our improved PDF extractor utility
          console.log("Extracting text from PDF using our robust extractor utility");
          let extractedText = await extractTextFromPdf(pdfBuffer);
          
          // Check if extraction succeeded
          let hasResumeContent = extractedText && 
                               extractedText.length > 100 && 
                               !extractedText.includes("Could not extract text");
                               
          // For debugging
          console.log(`Initial extraction ${hasResumeContent ? 'successful' : 'failed'}: ${extractedText ? extractedText.length : 0} characters`);
          
          // If extraction failed, fall back to AI analysis
          if (!hasResumeContent) {
            console.log("PDF extraction failed. We can't analyze this PDF properly.");
            
            // Set a helpful message for users that clearly explains the issue and provides alternatives
            extractedText = `
# Resume Upload Issue

I noticed you're trying to upload a PDF resume, but I'm having trouble accessing its content for analysis. This is a common issue with certain types of PDFs.

## For Best Results:

1. **Copy & Paste Your Resume Text Directly**
   • Open your resume document
   • Select all text (Ctrl+A or Cmd+A)
   • Copy it (Ctrl+C or Cmd+C)
   • Paste it directly in the text area below

2. **Try Another Format**
   If you have your resume in DOCX format, that often works better than PDF.

## Why This Happens
Some PDFs contain images of text rather than actual text characters, particularly if they were scanned. Others may have security settings that prevent text extraction.

I'm ready to provide you with detailed, personalized analysis of your resume as soon as I can access its content!
            `;
            
            // Mark that we do have content (our error message) to show the user
            hasResumeContent = true;
          }
          
          // Check if the extracted text contains actual resume content by looking for common keywords
          const resumeKeywords = ['resume', 'experience', 'education', 'skills', 'work', 'job', 'university', 'degree', 'professional', 'profile', 'objective', 'certification'];
          // Check if extraction worked and if it contains resume-like content
          const hasResumeKeywords = 
              extractedText.includes("experience") || 
              extractedText.includes("education") || 
              extractedText.includes("skills") || 
              extractedText.includes("professional") ||
              extractedText.includes("resume") ||
              extractedText.includes("summary") ||
              extractedText.includes("employment");
          
          // Extract at least a small sample of the text to log for debugging
          const textSample = extractedText.substring(0, 200).replace(/\n/g, ' ');
          console.log(`Text sample: "${textSample}..."`);
          console.log(`Contains resume keywords: ${hasResumeKeywords}`);
          
          // Check if we have valid resume content
          if (extractedText && extractedText.length > 100 && hasResumeKeywords) {
            console.log(`Successfully extracted readable resume content: ${extractedText.length} characters`);
            
            // Now we have the actual text content, analyze it
            systemPrompt = "You are Musk, an expert resume analyzer within the Brandentifier platform, with deep knowledge of professional development and hiring practices across many industries. Your analysis must be EXTREMELY PERSONALIZED based on the resume text provided, directly referencing the specific experiences, skills, education, and background from the resume. Avoid generic advice at all costs - everything must be tailored to this specific individual's situation as detailed in their resume. Provide detailed, constructive feedback with highly actionable insights. When suggesting improvements, always mention how Brandentifier's features can help, including the Portfolio Builder for showcasing projects, Smart Connect for networking, and Services showcase for freelancers and consultants. Your analysis should be as detailed and helpful as what someone would receive directly from ChatGPT, with the same level of personalization and specificity.";
            
            // Limit the text to a reasonable size to avoid token limits
            const MAX_TEXT_LENGTH = 4000;
            const truncatedText = extractedText.length > MAX_TEXT_LENGTH 
              ? extractedText.substring(0, MAX_TEXT_LENGTH) + "...(truncated due to length)"
              : extractedText;
            
            console.log(`Resume text length: ${extractedText.length} characters, truncated to ${truncatedText.length} characters`);
            
            userPrompt = `
            I need an EXTREMELY detailed and personalized professional analysis of the resume text below. This must be a comprehensive, specific analysis that directly references the actual content in the resume, not generic advice. Make your response feel like it was written specifically for this individual after carefully studying their resume.
            
            Analyze the resume using these critical evaluation criteria, providing a score (out of 100%) for each category and an overall score.
            
            EXTREMELY IMPORTANT: You MUST include the exact category name followed by the score percentage in this exact format for each category:
            
            "Structure & Layout: XX%"
            "Content Quality: XX%"
            "Relevance to Role/Industry: XX%"
            "Achievements & Metrics: XX%"
            "Soft Skills & Personality: XX%"
            "ATS Compatibility: XX%"
            
            These exact formats must appear in your response as they will be automatically parsed to generate a visual score chart.
            
            1. STRUCTURE & LAYOUT (20% of total score)
               - Clear sections: Are key sections (Summary, Experience, Skills, Education, etc.) easy to find?
               - Readable format: Is the layout clean, professional, and not cluttered?
               - Consistency: Are fonts, bullet styles, and date formats consistent throughout?
            
            2. CONTENT QUALITY (30% of total score)
               - Profile/Objective: Is it concise, relevant, and does it highlight strengths or achievements?
               - Work Experience: Does it show career progression? Use strong action verbs? Focus on quantifiable achievements?
               - Skills: Are they relevant to the role/industry?
               - Education & Certifications: Are they properly listed in reverse chronological order?
            
            3. RELEVANCE TO ROLE/INDUSTRY (15% of total score)
               - Are roles and responsibilities tailored toward the desired industry?
               - Does it use appropriate industry-specific keywords (helpful for ATS parsing)?
            
            4. ACHIEVEMENTS & METRICS (20% of total score)
               - Does the resume mention measurable outcomes and quantifiable results?
               - Are achievements backed by specific metrics (percentages, numbers, etc.)?
            
            5. SOFT SKILLS & PERSONALITY (10% of total score)
               - Does the CV reflect the candidate's attitude, values, or team collaboration abilities?
               - Are soft skills like communication, leadership, and adaptability clear from the language?
            
            6. ATS COMPATIBILITY (5% of total score)
               - Is it text-based (not image-heavy)?
               - Does it use standard headings?
               - Does it avoid graphics or tables that might confuse ATS bots?
            
            ALSO IDENTIFY CRITICAL RED FLAGS:
            - Typos, grammar issues
            - Overuse of buzzwords without substance
            - No accomplishments, only duties
            - Poor alignment or inconsistent formatting
            - Outdated information or irrelevant jobs
            
            FOR YOUR RESPONSE:
            1. Begin with an overall score out of 100% and a brief summary of key strengths and areas for improvement
            2. For each of the 6 categories above, provide:
               - The category score (e.g., "Structure & Layout: 18/20 (90%)")
               - Specific, detailed feedback directly referencing elements from their resume
               - Clear, actionable recommendations for improvement
            3. End with a prioritized list of 3-5 most important improvements they should make first
            
            The resume text:
            
            ${truncatedText}
            
            First, analyze the resume to identify the person's name, experience details, education background, skills, and other key information. Then, provide a comprehensive, personalized analysis that mentions the person by their EXACT name and references their SPECIFIC experiences, skills, and background throughout your entire response.
            
            Provide a HIGHLY personalized and comprehensive resume analysis with specific improvement suggestions using this structure:

            # Resume Analysis & Improvement Suggestions for [Name]
            
            ## Career Overview & Industry Context
            🔍 Identify the person's industry and career stage
            📈 Briefly describe how their experience aligns with current trends in their industry
            🎯 Note any career trajectory patterns visible in their work history
            
            ## Key Strengths:
            ✅ List 6-7 key strengths from the resume (be specific to their actual achievements)
            ✅ Include exact metrics/quantifiable results they've mentioned (and suggest where more could be added)
            ✅ Highlight their specific technical proficiency and skill level
            ✅ Note their industry exposure with company names and actual positions held
            
            ## Areas for Improvement & Detailed Recommendations:
            
            ### 1️⃣ Profile Summary Enhancement
            Analyze their existing summary section (or note its absence):
            
            ❌ Current summary (quoted EXACTLY from the resume) with specific weaknesses identified
            ✅ Suggested revision (completely rewritten to be more impactful) that:
               - Highlights their SPECIFIC years of experience in their ACTUAL field
               - Incorporates their MOST impressive achievements with real metrics
               - Positions them for their apparent career goals based on resume content
               - Mentions how they could showcase this summary in their Brandentifier Portfolio
            
            ### 2️⃣ Achievement Optimization
            Identify 3-4 weak achievement descriptions from their ACTUAL resume:
            
            ❌ Original statement: "[exact quote from resume]"
            ✅ Improved version: "[rewritten with specific metrics and outcomes]"
            
            ❌ Original statement: "[exact quote from resume]"
            ✅ Improved version: "[rewritten with specific metrics and outcomes]"
            
            [Include 1-2 more examples as needed]
            
            ### 3️⃣ Detailed Resume Structure Analysis
            Analyze the actual organization of their resume:
            - Comment on the specific section order they've used
            - Note any missing critical sections they should add
            - Suggest formatting improvements tailored to their industry/role
            - Recommend how they could present this improved structure using Brandentifier's Portfolio Builder
            
            ### 4️⃣ Comprehensive Skills Assessment
            Based on their stated role and industry:
            - List the skills they ACTUALLY mention that are valuable
            - Identify 5-7 SPECIFIC missing skills that employers in their field currently value
            - Suggest how to present skills by category/proficiency level
            - Recommend using Brandentifier's Skills showcase to better visualize their expertise
            
            ### 5️⃣ Expanded Projects/Portfolio Strategy
            Based on their actual work history:
            - Analyze any projects they've mentioned
            - Suggest 3-4 SPECIFIC additional projects they should highlight based on their experience
            - Provide a detailed format for presenting each project
            - Explain how Brandentifier's Portfolio Builder can help them create an impressive project showcase
            
            ### 6️⃣ Personalized ATS Optimization Recommendations
            Provide detailed, specific ATS optimization advice:
            - List 5-7 actual keywords from their industry that should be included
            - Identify any ATS-problematic formatting in their current resume
            - Suggest specific filename conventions for their field
            - Explain how to handle any unusual elements in their resume (gaps, career changes)
            
            ### 7️⃣ Networking Strategy Based on Resume Content
            Using the resume details:
            - Suggest 4-5 specific types of professionals they should connect with
            - Recommend how to leverage their unique experience when networking
            - Explain how Brandentifier's Smart Connect feature can help them build their professional network
            
            ### 8️⃣ Service Offering Opportunities
            Based on their expertise:
            - Suggest 3-4 specific services they could offer as a consultant/freelancer
            - Outline how to package and present each service
            - Explain how Brandentifier's Services showcase can help them market these offerings
            
            Format with emoji bullets (like ✅, 🔹, 📅) to make sections visually distinct. Use a professional yet conversational tone, and make all advice extremely detailed, practical, and tailored specifically to their experience and industry.
            `;
          } else {
            console.warn("Could not extract valid resume content from the uploaded file. Responding with error and suggestions.");
            
            // Special case for PDFs with extraction issues - provide helpful guidance
            systemPrompt = "You are Musk, a helpful assistant in the Brandentifier platform. The user has uploaded a resume file, but we could not extract readable resume content from it. The file might be corrupted or have unusual formatting.";
            
            userPrompt = `
            The user has uploaded a PDF resume file, but we're encountering an issue extracting meaningful text content from it.

            Please provide a friendly, helpful response that:
            1. Explains that we're having trouble processing their specific PDF file
            2. Suggests they try the "Option 2: Paste your resume text directly" feature that's available on the same page, which will give them better results
            3. Mentions that if they still want to upload a file, they might try a different format (like .docx) or a different PDF that was created as a text document rather than a scan
            4. Reassures them that this is a technical limitation and not an issue with their resume content

            End with an encouraging note about how Brandentifier's AI resume analysis can provide valuable insights once we can access the resume content properly.
            `;
          }
        } catch (error: any) {
          console.error("Error calling OpenAI API:", error);
          
          // Check if the error is related to OpenAI API key
          if (error.message && (error.message.includes('API key') || error.message.includes('authentication'))) {
            console.error("OpenAI API key error:", error.message);
            systemPrompt = "You are a helpful AI assistant on the Brandentifier platform. There is an issue with the OpenAI API configuration.";
            userPrompt = "The system encountered an authentication error when trying to process the resume. Please let the user know that there's an issue with the API configuration and that they should try again later or contact support.";
          } else {
            console.error("General error processing PDF:", error);
            systemPrompt += " You cannot directly process this PDF file, but you can provide comprehensive, detailed guidance for resume improvement similar to what an expert resume coach would offer.";
            userPrompt = `
            The user has uploaded a resume file, but I encountered an error when trying to process it: ${error.message}. Please provide a comprehensive, detailed resume analysis and improvement guide structured like this example:
          
            Resume Analysis & Improvement Suggestions
            
            Strengths:
            ✅ List 5-6 common strengths seen in professional resumes
            ✅ Include specific areas like quantifiable achievements, technical skills, career progression
            ✅ Mention industry exposure (tech, fintech, e-commerce, etc.)
            
            Areas for Improvement & Recommendations:
            
            1️⃣ Improve Profile Summary
            Show examples of weak vs. strong profile summaries:
            
            ❌ Current (example of a generic summary)
            ✅ Suggested Revision (example of a strong summary with specifics)
            
            2️⃣ Achievements Need More Quantifiable Impact
            Provide specific examples:
            
            ❌ Generic achievement example
            ✅ Achievement with metrics (e.g., "Led full-cycle product development for 5+ AI-powered products, achieving a 30% reduction in time-to-market")
            
            3️⃣ Better Formatting for Readability
            Specific formatting tips for modern resumes
            
            4️⃣ Improve "Skills" Section
            Suggested structure with modern skills relevant to various roles
            
            5️⃣ "Projects" Section Recommendations
            Show how to structure a projects section with examples
            
            6️⃣ ATS Optimization Tips
            Explain how to make resumes ATS-friendly with examples
            
            Make this extremely actionable, detailed, and formatted with emoji bullets (like ✅, 🔹, 📅) to make sections visually distinct. Use a professional yet conversational tone.
            `;
          }
        }
      } catch (error: any) {
        console.error("Error processing PDF:", error);
        systemPrompt += " You cannot directly process this PDF file, but you can provide comprehensive, detailed guidance for resume improvement similar to what an expert resume coach would offer.";
        userPrompt = `
        The user has uploaded a resume file, but I encountered an error when trying to process it. Please provide a comprehensive, detailed resume analysis and improvement guide structured like this example:
  
        Resume Analysis & Improvement Suggestions
        
        Strengths:
        ✅ List 5-6 common strengths seen in professional resumes
        ✅ Include specific areas like quantifiable achievements, technical skills, career progression
        ✅ Mention industry exposure (tech, fintech, e-commerce, etc.)
        
        Areas for Improvement & Recommendations:
        
        1️⃣ Improve Profile Summary
        Show examples of weak vs. strong profile summaries:
        
        ❌ Current (example of a generic summary)
        ✅ Suggested Revision (example of a strong summary with specifics)
        
        2️⃣ Achievements Need More Quantifiable Impact
        Provide specific examples:
        
        ❌ Generic achievement example
        ✅ Achievement with metrics (e.g., "Led full-cycle product development for 5+ AI-powered products, achieving a 30% reduction in time-to-market")
        
        3️⃣ Better Formatting for Readability
        Specific formatting tips for modern resumes
        
        4️⃣ Improve "Skills" Section
        Suggested structure with modern skills relevant to various roles
        
        5️⃣ "Projects" Section Recommendations
        Show how to structure a projects section with examples
        
        6️⃣ ATS Optimization Tips
        Explain how to make resumes ATS-friendly with examples
        
        Make this extremely actionable, detailed, and formatted with emoji bullets (like ✅, 🔹, 📅) to make sections visually distinct. Use a professional yet conversational tone.
        `;
      }
    } else {
      // Regular text resume
      console.log("Processing plain text resume");
      
      // Increase text length limit to capture more of the resume
      const MAX_TEXT_LENGTH = 6000;
      const truncatedText = resumeText.length > MAX_TEXT_LENGTH 
        ? resumeText.substring(0, MAX_TEXT_LENGTH) + "...(truncated due to length)"
        : resumeText;
      
      userPrompt = `
      I need an EXTREMELY detailed and personalized professional analysis of this resume. This must be a comprehensive, specific analysis that directly references the actual content in the resume, not generic advice. Make your response feel like it was written specifically for this individual after carefully studying their resume.
            
      Analyze the resume using these critical evaluation criteria, providing a score (out of 100%) for each category and an overall score:
      
      1. STRUCTURE & LAYOUT (20% of total score)
         - Clear sections: Are key sections (Summary, Experience, Skills, Education, etc.) easy to find?
         - Readable format: Is the layout clean, professional, and not cluttered?
         - Consistency: Are fonts, bullet styles, and date formats consistent throughout?
      
      2. CONTENT QUALITY (30% of total score)
         - Profile/Objective: Is it concise, relevant, and does it highlight strengths or achievements?
         - Work Experience: Does it show career progression? Use strong action verbs? Focus on quantifiable achievements?
         - Skills: Are they relevant to the role/industry?
         - Education & Certifications: Are they properly listed in reverse chronological order?
      
      3. RELEVANCE TO ROLE/INDUSTRY (15% of total score)
         - Are roles and responsibilities tailored toward the desired industry?
         - Does it use appropriate industry-specific keywords (helpful for ATS parsing)?
      
      4. ACHIEVEMENTS & METRICS (20% of total score)
         - Does the resume mention measurable outcomes and quantifiable results?
         - Are achievements backed by specific metrics (percentages, numbers, etc.)?
      
      5. SOFT SKILLS & PERSONALITY (10% of total score)
         - Does the CV reflect the candidate's attitude, values, or team collaboration abilities?
         - Are soft skills like communication, leadership, and adaptability clear from the language?
      
      6. ATS COMPATIBILITY (5% of total score)
         - Is it text-based (not image-heavy)?
         - Does it use standard headings?
         - Does it avoid graphics or tables that might confuse ATS bots?
      
      ALSO IDENTIFY CRITICAL RED FLAGS:
      - Typos, grammar issues
      - Overuse of buzzwords without substance
      - No accomplishments, only duties
      - Poor alignment or inconsistent formatting
      - Outdated information or irrelevant jobs
      
      FOR YOUR RESPONSE:
      1. Begin with an overall score out of 100% and a brief summary of key strengths and areas for improvement
      2. For each of the 6 categories above, provide:
         - The category score (e.g., "Structure & Layout: 18/20 (90%)")
         - Specific, detailed feedback directly referencing elements from their resume
         - Clear, actionable recommendations for improvement
      3. End with a prioritized list of 3-5 most important improvements they should make first
      
      ${truncatedText}
      
      First, analyze the resume to identify the person's name, experience details, education background, skills, and other key information. Then, provide a comprehensive, personalized analysis that mentions the person by their EXACT name and references their SPECIFIC experiences, skills, and background throughout your entire response.

      Provide a HIGHLY personalized and comprehensive resume analysis with specific improvement suggestions using this structure:

      # Resume Analysis & Improvement Suggestions for [EXACT NAME FROM RESUME]
      
      ## Career Overview & Industry Context
      🔍 Identify the person's specific industry, role, and career stage based on the actual resume content
      📈 Analyze how their specific experience aligns with current trends in their industry
      🎯 Note any career trajectory patterns visible in their work history with specific examples from their resume
      
      ## Key Strengths:
      ✅ List 6-7 key strengths from the resume (be specific to their actual achievements)
      ✅ Include exact metrics/quantifiable results they've mentioned (and suggest where more could be added)
      ✅ Highlight their specific technical proficiency and skill level
      ✅ Note their industry exposure with company names and actual positions held
      
      ## Areas for Improvement & Detailed Recommendations:
      
      ### 1️⃣ Profile Summary Enhancement
      Analyze their existing summary section (or note its absence):
      
      ❌ Current summary (quoted EXACTLY from the resume) with specific weaknesses identified
      ✅ Suggested revision (completely rewritten to be more impactful) that:
         - Highlights their SPECIFIC years of experience in their ACTUAL field
         - Incorporates their MOST impressive achievements with real metrics
         - Positions them for their apparent career goals based on resume content
         - Mentions how they could showcase this summary in their Brandentifier Portfolio
      
      ### 2️⃣ Achievement Optimization
      Identify 3-4 weak achievement descriptions from their ACTUAL resume:
      
      ❌ Original statement: "[exact quote from resume]"
      ✅ Improved version: "[rewritten with specific metrics and outcomes]"
      
      ❌ Original statement: "[exact quote from resume]"
      ✅ Improved version: "[rewritten with specific metrics and outcomes]"
      
      [Include 1-2 more examples as needed]
      
      ### 3️⃣ Detailed Resume Structure Analysis
      Analyze the actual organization of their resume:
      - Comment on the specific section order they've used
      - Note any missing critical sections they should add
      - Suggest formatting improvements tailored to their industry/role
      - Recommend how they could present this improved structure using Brandentifier's Portfolio Builder
      
      ### 4️⃣ Comprehensive Skills Assessment
      Based on their stated role and industry:
      - List the skills they ACTUALLY mention that are valuable
      - Identify 5-7 SPECIFIC missing skills that employers in their field currently value
      - Suggest how to present skills by category/proficiency level
      - Recommend using Brandentifier's Skills showcase to better visualize their expertise
      
      ### 5️⃣ Expanded Projects/Portfolio Strategy
      Based on their actual work history:
      - Analyze any projects they've mentioned
      - Suggest 3-4 SPECIFIC additional projects they should highlight based on their experience
      - Provide a detailed format for presenting each project
      - Explain how Brandentifier's Portfolio Builder can help them create an impressive project showcase
      
      ### 6️⃣ Personalized ATS Optimization Recommendations
      Provide detailed, specific ATS optimization advice:
      - List 5-7 actual keywords from their industry that should be included
      - Identify any ATS-problematic formatting in their current resume
      - Suggest specific filename conventions for their field
      - Explain how to handle any unusual elements in their resume (gaps, career changes)
      
      ### 7️⃣ Networking Strategy Based on Resume Content
      Using the resume details:
      - Suggest 4-5 specific types of professionals they should connect with
      - Recommend how to leverage their unique experience when networking
      - Explain how Brandentifier's Smart Connect feature can help them build their professional network
      
      ### 8️⃣ Service Offering Opportunities
      Based on their expertise:
      - Suggest 3-4 specific services they could offer as a consultant/freelancer
      - Outline how to package and present each service
      - Explain how Brandentifier's Services showcase can help them market these offerings
      
      Format with emoji bullets (like ✅, 🔹, 📅) to make sections visually distinct. Use a professional yet conversational tone, and make all advice extremely detailed, practical, and tailored specifically to their experience and industry.
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
    2. Specific types of professionals they should connect with (5-7 roles/positions)
    3. Places/platforms where they can find these connections (both online and offline)
    4. Conversation starters and value propositions for each type of connection
    5. Tips for maintaining relationships after initial contact
    6. Common mistakes to avoid when networking in ${targetIndustry}
    7. Long-term networking strategy aligned with their career goals
    
    USE PROPER FORMATTING:
    - Use "# " for main section titles
    - Use "## " for subtitles
    - Use bullet points with "- " for lists 
    - Use *italic* for emphasis
    - Use line breaks between sections
    
    Make it professional, clean, and easy to read. Be specific and actionable throughout.
    IMPORTANT: When suggesting networking platforms or groups, always mention Brandentifier's Smart Connect feature as a primary option alongside other platforms like LinkedIn.
    `;

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
  } catch (error: any) {
    console.error("Error generating networking recommendations:", error);
    throw new Error(`Failed to generate networking recommendations: ${error.message}`);
  }
}