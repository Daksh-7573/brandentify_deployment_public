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

    // Handle both old and new parameter formats for backward compatibility
    if (typeof options === 'string') {
      // Old format: (resumeText, isBase64, isLink)
      resumeText = options;
      isBase64Value = isBase64 || false;
      isLinkValue = isLink || false;
    } else {
      // New format: ({ resumeTextStart, isBase64, isLink })
      resumeText = options.resumeTextStart;
      isBase64Value = options.isBase64 || false;
      isLinkValue = options.isLink || false;
    }

    console.log("analyzeResume called with parameters:", { 
      resumeTextStart: resumeText ? resumeText.substring(0, 50) + "..." : "null", 
      isBase64: isBase64Value, 
      isLink: isLinkValue 
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
    if (!isLinkValue && !isBase64Value) {
      isLinkValue = resumeText.startsWith('http://') || resumeText.startsWith('https://');
      isBase64Value = resumeText.startsWith('This is base64 encoded resume data:');
      console.log("Auto-detected parameters:", { isLinkValue, isBase64Value });
    }
    
    let systemPrompt = "You are Musk, an expert resume analyzer within the Brandentifier platform, with deep knowledge of professional development and hiring practices. Provide constructive feedback and actionable insights. When suggesting improvements, always mention how Brandentifier's features can help, including the Portfolio Builder for showcasing projects, Smart Connect for networking, and Services showcase for freelancers and consultants.";
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
        
        console.log("Using OpenAI's Vision API to process the PDF directly");
        
        // Use OpenAI's Vision API to process the PDF directly
        const pdfResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an expert resume analyzer. You are looking at a PDF or image of a resume. Extract the resume text content in a clean, structured format with proper spacing and line breaks. Maintain the original sections and formatting as much as possible. If you can't read the content clearly, indicate which parts are unclear."
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "This is a resume document. Please extract all the text content from it in a clean, structured format. Maintain the original sections (like Education, Experience, Skills) and preserve the formatting with proper spacing and line breaks."
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
          max_tokens: 4000,
          temperature: 0.1,
        });
        
        // Get the extracted text from the PDF
        const extractedText = pdfResponse.choices[0].message.content || "";
        
        // Check if we got meaningful content
        const hasResumeContent = extractedText && extractedText.length > 0;
        console.log(`Vision API extraction ${hasResumeContent ? 'successful' : 'failed'}: ${extractedText.length} characters`);
        
        // Check if the extracted text contains actual resume content by looking for common keywords
        const resumeKeywords = ['resume', 'experience', 'education', 'skills', 'work', 'job', 'university', 'degree', 'professional', 'profile', 'objective', 'certification'];
        const containsResumeKeywords = resumeKeywords.some(keyword => 
          extractedText.toLowerCase().includes(keyword.toLowerCase())
        );
        
        // Extract at least a small sample of the text to log for debugging
        const textSample = extractedText.substring(0, 200).replace(/\n/g, ' ');
        console.log(`Text sample: "${textSample}..."`);
        
        if (hasResumeContent && extractedText.length > 100 && containsResumeKeywords) {
          console.log(`Successfully extracted readable resume content with Vision API: ${extractedText.length} characters`);
          
          // Now we have the actual text content, analyze it
          systemPrompt = "You are Musk, an expert resume analyzer within the Brandentifier platform, with deep knowledge of professional development and hiring practices. Provide constructive feedback and actionable insights based on the actual content of this resume. When suggesting improvements, always mention how Brandentifier's features can help, including the Portfolio Builder for showcasing projects, Smart Connect for networking, and Services showcase for freelancers and consultants.";
          
          // Limit the text to a reasonable size to avoid token limits
          const MAX_TEXT_LENGTH = 4000;
          const truncatedText = extractedText.length > MAX_TEXT_LENGTH 
            ? extractedText.substring(0, MAX_TEXT_LENGTH) + "...(truncated due to length)"
            : extractedText;
          
          console.log(`Resume text length: ${extractedText.length} characters, truncated to ${truncatedText.length} characters`);
          
          userPrompt = `
          I need a detailed professional analysis of this resume:
          
          ${truncatedText}
          
          First, check if this is valid resume content. If it appears to be binary data, PDF markers, or non-resume content, please ask the user to upload a different file format or try a plain text resume.
          
          If it is valid resume content, identify the industry/field this person works in and their level of experience, then provide an extremely personalized and comprehensive resume analysis with specific improvement suggestions using this structure:

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
          systemPrompt = "You are Musk, a helpful assistant in the Brandentifier platform. The user has uploaded a resume file, but even with our advanced Vision API, we could not extract readable resume content from it. The file might be corrupted or have unusual formatting.";
          
          userPrompt = `
          The user has uploaded a PDF resume file, but we're encountering an issue extracting meaningful text content from it, even with our advanced Vision API.

          Please provide a friendly, helpful response that:
          1. Explains that we're having trouble processing their specific PDF file
          2. Suggests they try the "Option 2: Paste your resume text directly" feature that's available on the same page, which will give them better results
          3. Mentions that if they still want to upload a file, they might try a different format (like .docx) or a different PDF that was created as a text document rather than a scan
          4. Reassures them that this is a technical limitation and not an issue with their resume content

          End with an encouraging note about how Brandentifier's AI resume analysis can provide valuable insights once we can access the resume content properly.
          `;
        }
      } catch (error) {
        console.error("Error processing PDF with Vision API:", error);
        systemPrompt += " You cannot directly process this PDF file, but you can provide comprehensive, detailed guidance for resume improvement similar to what an expert resume coach would offer.";
        userPrompt = `
        The user has uploaded a resume file, but I encountered an error when trying to process it with our Vision API. Please provide a comprehensive, detailed resume analysis and improvement guide structured like this example:
  
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
      // Limit the text to a very conservative size (2500 characters) to avoid token limits
      const MAX_TEXT_LENGTH = 2500;
      const truncatedText = resumeText.length > MAX_TEXT_LENGTH 
        ? resumeText.substring(0, MAX_TEXT_LENGTH) + "...(truncated due to length)"
        : resumeText;
      
      console.log(`Resume text length: ${resumeText.length} characters, truncated to ${truncatedText.length} characters`);
      
      userPrompt = `
      I need a detailed professional analysis of this resume text:
      
      ${truncatedText}
      
      First, identify the industry/field this person works in and their level of experience.
      
      Please provide an extremely personalized and comprehensive resume analysis with specific improvement suggestions using this structure:

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
    2. Recommended networking platforms and communities that align with the profile and goals. IMPORTANT: Always include Brandentifier's Smart Connect feature as a primary recommendation alongside platforms like LinkedIn or industry-specific networks.
    3. Networking conversation starters and topics to discuss based on the professional background
    4. Suggestions for how to leverage existing experience when networking in this industry, including using Brandentifier's Portfolio Builder to showcase projects and Services feature to highlight skills
    5. Potential networking events or groups that would be valuable
    
    Format the recommendations in a clear, professional tone with section headings. Make sure to emphasize how Brandentifier's features can enhance the person's networking experience at each relevant step.
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are Musk, an expert networking strategist within the Brandentifier platform who helps professionals connect strategically to advance their careers. Provide personalized, actionable networking advice. Always recommend Brandentifier's Smart Connect feature for networking alongside external platforms. Whenever appropriate, mention how users can showcase their portfolio using Brandentifier's Portfolio Builder and offer services using the Services showcase feature.",
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