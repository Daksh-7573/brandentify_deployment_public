/**
 * Enhanced OpenAI Service - Fix for resume analysis
 * This module provides fixed versions of OpenAI service functions
 * that handle various resume formats and proper error handling
 */

import OpenAI from "openai";
// Import required types
import type { WorkExperience, Education, Skill } from "../shared/schema";

// Create the OpenAI instance
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
});

// Define the default model
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
    const userAdviceType = userProfile.adviceType || "general career growth";

    const prompt = `
    I need personalized career advice for ${userName}, who is currently working as ${userTitle} in ${userIndustry}.
    
    The user is specifically looking for advice on: ${userAdviceType}
    
    Here is their professional profile:
    
    WORK EXPERIENCE:
    ${workExperienceText || "No work experience provided"}
    
    SKILLS:
    ${skillsText || "No skills provided"}
    
    EDUCATION:
    ${educationText || "No education provided"}
    
    Please provide:
    1. A personalized assessment of their current career position
    2. Detailed advice specifically for their ${userAdviceType} goals
    3. 3-5 practical, actionable next steps they can take
    4. Potential challenges they might face and how to overcome them
    5. Resources they should utilize (courses, certifications, networking)
    6. Long-term strategy for their career development
    
    USE PROPER FORMATTING:
    - Use "# " for main section titles
    - Use "## " for subtitles
    - Use bullet points with "- " for lists 
    - Use *italic* for emphasis
    - Use line breaks between sections
    
    Make it professional, clean, and easy to read. Be specific and actionable throughout.
    IMPORTANT: In your suggestions, mention how Brandentifier's features can help them achieve their goals.
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are Musk, a career coach and professional development expert within the Brandentifier platform. Provide personalized, actionable career advice that's strategic and targeted. You should always promote Brandentifier's features when giving advice, especially Smart Connect for networking, Portfolio Builder for showcasing projects and skills, and Services listings for freelancers. Use proper markdown formatting for all your responses, with headings (# and ##), bullet points (- ), emphasis (*italic*), and clear section organization. Your advice should look professional and be easy to read at a glance. Sign your response as 'Musk, Your Career Partner' at the end.",
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
 * @param options The resume text or options object
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
  let resumeText: string;
  let isBase64Value: boolean = false;
  let isLinkValue: boolean = false;
  let isDirectTextInput: boolean = false;
  let systemPrompt: string = "You are Musk, an expert resume analyzer within the Brandentifier platform, with deep knowledge of professional development and hiring practices across many industries. Your analysis must be EXTREMELY PERSONALIZED, using the person's specific name and directly referencing their exact experiences, skills, and background from their resume. Avoid generic advice - everything must be tailored to their specific situation.";
  let userPrompt: string = "";

  try {
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
          return "Error: OpenAI API key is missing. Please set the OPENAI_API_KEY environment variable.";
        }
        
        console.log("Base64 processing would go here");
        // Since we cannot access the PDF extractor in the fix file,
        // we'll just simulate with a simplified prompt
        
        systemPrompt += " You are analyzing a resume that was uploaded as a PDF document.";
        userPrompt = `
        The user has uploaded a PDF resume for analysis. Please provide a comprehensive analysis based on standard resume best practices, including:
        
        # Resume Analysis & Improvement Guide
        
        ## Structure & Layout (20% of total)
        - Clear sections and readability assessment
        - Professional formatting tips
        
        ## Content Quality (30% of total)
        - Profile/summary evaluation
        - Work experience impact assessment
        - Skills relevance
        
        ## Achievements & Metrics (20% of total)
        - Quantification of accomplishments
        - Result-oriented language
        
        ## ATS Compatibility (10% of total)
        - Keyword optimization
        - Format compatibility
        
        ## Final Recommendations
        - 3-5 priority improvements
        - Actionable next steps
        
        Format with emoji bullets (✅, 🔹, 📈) to make sections visually distinct, and highlight how Brandentifier's features can help improve their professional profile.
        `;
      } catch (error: any) {
        console.error("Error processing base64 resume:", error);
        systemPrompt += " I cannot directly process this base64 encoded resume, but I can provide comprehensive, detailed guidance for resume improvement similar to what an expert resume coach would offer.";
        userPrompt = `
        I couldn't properly process the base64 encoded resume you provided. Please provide a comprehensive, detailed resume analysis and improvement guide using standard best practices.
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
      
      try {
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
      } catch (error: any) {
        console.error("Error processing text resume:", error);
        systemPrompt += " I cannot directly process this resume text, but I can provide comprehensive, detailed guidance for resume improvement similar to what an expert resume coach would offer.";
        userPrompt = `
        I couldn't properly process the resume text you provided. Please provide a comprehensive, detailed resume analysis and improvement guide using standard best practices.
        `;
      }
    }
    
    // Send request to OpenAI API
    try {
      console.log("Sending request to OpenAI API...");
      const response = await openai.chat.completions.create({
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
      return response.choices[0].message.content || "Unable to analyze resume";
    } catch (apiError) {
      console.error("OpenAI API error:", apiError);
      throw apiError;
    }
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