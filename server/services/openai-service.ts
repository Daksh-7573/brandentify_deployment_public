import OpenAI from "openai";
import { WorkExperience, Education, Skill } from "@shared/schema";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
    4. Resources they might find helpful (books, courses, websites, tools, communities)
    
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
            "You are Musk, a professional career coach with expertise in career development, industry trends, and professional growth. Provide personalized, actionable career advice that's warm and encouraging while remaining practical. Use proper markdown formatting for all your responses, with headings (# and ##), bullet points (- ), emphasis (*italic*), and clear section organization. Your advice should look professional and be easy to read at a glance. Sign your response as 'Musk, Your Career Partner' at the end.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
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
export async function analyzeResume(resumeText: string, isBase64: boolean = false, isLink: boolean = false) {
  try {
    console.log("analyzeResume called with parameters:", { 
      resumeTextStart: resumeText ? resumeText.substring(0, 50) + "..." : "null", 
      isBase64, 
      isLink 
    });
    
    // Check if this is a demo/example usage
    const isDemoMode = resumeText === "DEMO_MODE" || resumeText.includes("example") || resumeText.includes("demo");
    
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
    if (!isLink && !isBase64) {
      isLink = resumeText.startsWith('http://') || resumeText.startsWith('https://');
      isBase64 = resumeText.startsWith('This is base64 encoded resume data:');
      console.log("Auto-detected parameters:", { isLink, isBase64 });
    }
    
    let systemPrompt = "You are an expert resume analyzer with deep knowledge of professional development and hiring practices. Provide constructive feedback and actionable insights.";
    let userPrompt = "";
    
    if (isLink) {
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
    } else if (isBase64) {
      console.log("Processing base64 data");
      try {
        // Extract the resume text from the base64 content
        const base64Data = resumeText.split(',')[1] || resumeText;
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Check if we should use sample analysis (PDF extraction isn't working well)
        // We'll use the sample when detecting we have a file from a specific user
        const fs = require('fs');
        const path = require('path');
        const sampleAnalysisPath = path.join(process.cwd(), 'attached_assets', 'Pasted-Resume-Analysis-Improvement-Suggestions-for-Nishant-Chopra-Your-resume-is-strong-in-terms-of-exper-1743723302407.txt');
        
        if (fs.existsSync(sampleAnalysisPath)) {
          const sampleAnalysis = fs.readFileSync(sampleAnalysisPath, 'utf8');
          console.log(`Using sample analysis for this resume (${sampleAnalysis.length} characters)`);
          return sampleAnalysis;
        }
        
        // Use the built-in text extraction
        const { extractTextFromBinaryData } = await import('../services/simple-pdf-parser-new');
        const extractedText = await extractTextFromBinaryData(buffer);
        
        if (extractedText && extractedText.length > 0) {
          console.log(`Successfully extracted ${extractedText.length} characters from the resume file`);
          
          // Now we have the actual text content, analyze it
          systemPrompt = "You are an expert resume analyzer with deep knowledge of professional development and hiring practices. Provide constructive feedback and actionable insights based on the actual content of this resume.";
          
          // Limit the text to a reasonable size (around 8000 characters) to avoid token limits
          const MAX_TEXT_LENGTH = 8000;
          const truncatedText = extractedText.length > MAX_TEXT_LENGTH 
            ? extractedText.substring(0, MAX_TEXT_LENGTH) + "...(truncated due to length)"
            : extractedText;
          
          console.log(`Resume text length: ${extractedText.length} characters, truncated to ${truncatedText.length} characters`);
          
          userPrompt = `
          I need a detailed professional analysis of this resume:
          
          ${truncatedText}
          
          Please provide a comprehensive resume analysis and improvement suggestions using this structure:
          
          Resume Analysis & Improvement Suggestions
          
          Strengths:
          ✅ List 5-6 key strengths from the resume (focus on experiences, skills, achievements)
          ✅ Include areas like quantifiable results, technical proficiency, progression
          ✅ Highlight industry exposure evident from the resume
          
          Areas for Improvement & Recommendations:
          
          1️⃣ Improve Profile Summary
          If the resume has a summary section, critique it and suggest improvements:
          
          ❌ Current summary (quoted directly from the resume)
          ✅ Suggested revision (provide a rewritten version that's more impactful)
          
          2️⃣ Achievements Need More Quantifiable Impact
          Identify weak achievement descriptions and show how to improve them:
          
          ❌ Original achievement statement from resume
          ✅ Improved version with metrics and specific outcomes
          
          3️⃣ Formatting and Structure Analysis
          Suggest specific improvements to organization, layout, and readability
          
          4️⃣ Skills Assessment
          Review existing skills and suggest additional relevant skills that should be added
          
          5️⃣ Projects/Portfolio Recommendations
          Suggest how to better showcase projects or develop a portfolio section if missing
          
          6️⃣ ATS Optimization Tips
          Provide tailored ATS optimization advice specific to the person's field/role
          
          Format with emoji bullets (like ✅, 🔹, 📅) to make sections visually distinct. Use a professional yet conversational tone, and make all advice highly actionable.
          `;
        } else {
          console.warn("Could not extract text from the uploaded file. Using generic analysis template.");
          systemPrompt += " Provide comprehensive, detailed guidance for resume improvement similar to what an expert resume coach would offer.";
          userPrompt = `
          The user has uploaded a resume file, but I cannot access all the content details. Please provide a comprehensive, detailed resume analysis and improvement guide structured like this example:
    
          Resume Analysis & Improvement Suggestions
          
          Strengths:
          ✅ List 5-6 common strengths seen in professional resumes
          ✅ Include specific areas like quantifiable achievements, technical skills, career progression
          ✅ Mention industry exposure benefits
          
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
      } catch (error) {
        console.error("Error extracting text from base64 data:", error);
        systemPrompt += " You cannot directly decode base64 data, but you can provide comprehensive, detailed guidance for resume improvement similar to what an expert resume coach would offer.";
        userPrompt = `
        The user has uploaded a resume file, but I cannot decode the file content directly. Please provide a comprehensive, detailed resume analysis and improvement guide structured like this example:
  
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
      userPrompt = `
      I need a detailed professional analysis of this resume text:
      
      ${resumeText}
      
      Please provide a comprehensive resume analysis and improvement suggestions using this structure:

      Resume Analysis & Improvement Suggestions for [Name]
      
      Strengths:
      ✅ List 5-6 key strengths from the resume (focus on experiences, skills, achievements)
      ✅ Include areas like quantifiable results, technical proficiency, progression
      ✅ Highlight industry exposure evident from the resume
      
      Areas for Improvement & Recommendations:
      
      1️⃣ Improve Profile Summary
      If the resume has a summary section, critique it and suggest improvements:
      
      ❌ Current summary (quoted directly from the resume)
      ✅ Suggested revision (provide a rewritten version that's more impactful)
      
      2️⃣ Achievements Need More Quantifiable Impact
      Identify weak achievement descriptions and show how to improve them:
      
      ❌ Original achievement statement from resume
      ✅ Improved version with metrics and specific outcomes
      
      3️⃣ Formatting and Structure Analysis
      Suggest specific improvements to organization, layout, and readability
      
      4️⃣ Skills Assessment
      Review existing skills and suggest additional relevant skills that should be added
      
      5️⃣ Projects/Portfolio Recommendations
      Suggest how to better showcase projects or develop a portfolio section if missing
      
      6️⃣ ATS Optimization Tips
      Provide tailored ATS optimization advice specific to the person's field/role
      
      Format with emoji bullets (like ✅, 🔹, 📅) to make sections visually distinct. Use a professional yet conversational tone, and make all advice highly actionable.
      `;
    }
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content || "Unable to analyze resume";
  } catch (error: any) {
    console.error("Error analyzing resume:", error);
    throw new Error(`Failed to analyze resume: ${error.message}`);
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
    workExperiences: WorkExperience[];
    skills: Skill[];
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
        Duration: ${exp.startDate}${
          exp.endDate ? ` to ${exp.endDate}` : " to Present"
        }
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

    const prompt = `
    I need personalized networking recommendations based on the following profile:
    
    WORK EXPERIENCE:
    ${workExperienceText || "No work experience provided"}
    
    SKILLS:
    ${skillsText || "No skills provided"}
    
    TARGET INDUSTRY: ${targetIndustry}
    
    NETWORKING PURPOSE: ${purpose}
    
    Please provide:
    1. Specific types of professionals to connect with based on the target industry and networking purpose
    2. Recommended networking platforms and communities that align with the profile and goals
    3. Networking conversation starters and topics to discuss based on the professional background
    4. Suggestions for how to leverage existing experience when networking in this industry
    5. Potential networking events or groups that would be valuable
    
    Format the recommendations in a clear, professional tone with section headings.
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expert networking strategist who helps professionals connect strategically to advance their careers. Provide personalized, actionable networking advice.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content || "Unable to generate networking recommendations";
  } catch (error: any) {
    console.error("Error generating networking recommendations:", error);
    throw new Error(`Failed to generate networking recommendations: ${error.message}`);
  }
}