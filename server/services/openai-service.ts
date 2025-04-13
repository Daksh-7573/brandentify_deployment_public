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
        specificPrompt = `Perform a detailed analysis of ${userName}'s profile for industry transition, considering these 10 key factors:

1. Transferable Skills Mapping: Analyze both hard and soft skills from ${userIndustry} and identify industries where these skills are in high demand.

2. Industry Overlaps: Identify 3-4 industries with operational, functional, or technological overlap with ${userIndustry} (e.g., IT services → Fintech, EdTech, HealthTech).

3. Growth & Opportunity Analysis: Suggest rapidly growing industries or those with hiring gaps, focusing on future-proof sectors like AI, Green Tech, Cybersecurity, and Creator Economy.

4. Job Role Flexibility: Recommend industries where ${userName}'s current role exists or can evolve (e.g., "${userTitle} in ${userIndustry}" → similar role in new industry).

5. Learning Curve & Effort: Evaluate how much upskilling would be required for different industries, suggesting those with smoother transitions.

6. Network Access: Assess if ${userName} likely has connections or previous exposure in potential new industries based on their background.

7. Career Goal Alignment: Compare their current profile with potential industries that align with typical career progression.

8. Previous Cross-Industry Experience: Check if there's evidence of past work or certifications that indicate partial experience in other industries.

9. Behavioral Traits & Passion Areas: Infer from their profile possible passion areas and matching industries.

10. Feasibility & Practical Fit: Consider practical factors like location (${userLocation}), typical salary expectations, job availability, and any potential cultural fit.

After this analysis, provide specific advice for making the transition to 3-4 recommended industries.`;
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
      
      As part of your career advice, include a section called "PROFILE COMPLETION RECOMMENDATIONS" 
      with specific suggestions for how completing these missing sections would enhance their career prospects 
      and allow for more personalized advice in the future. Explain why each missing section is important 
      for career development and how it impacts the quality of advice possible.
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
    } catch (openaiError: any) {
      // Log OpenAI error
      console.error("Error with OpenAI API:", openaiError);
      
      // Fallback to Anthropic
      try {
        console.log("Falling back to Anthropic API...");
        const anthropicResponse = await anthropic.messages.create({
          model: CLAUDE_MODEL,
          max_tokens: 4000,
          system: "You are Musk, a professional career coach within the Brandentifier platform, with expertise in career development, industry trends, and professional growth. Provide personalized, actionable career advice that's warm and encouraging while remaining practical. You should always promote Brandentifier's features when giving advice, including the Portfolio Builder, Smart Connect networking feature, and Services showcase. When suggesting networking platforms or resources, always mention how these Brandentifier tools can help alongside external options like LinkedIn. Use proper markdown formatting for all your responses, with headings (# and ##), bullet points (- ), emphasis (*italic*), and clear section organization. Your advice should look professional and be easy to read at a glance. Sign your response as 'Musk, Your Career Partner' at the end.",
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
        
        // Final fallback: Generate demo content based on advice type
        console.log("Both APIs failed. Using demo content as final fallback...");
        
        if (userProfile.adviceType === 'industry-switch') {
          const userName = userProfile.user?.name || "User";
          const skills = userProfile.skills.map(skill => skill.name).join(', ') || 'product management, strategic planning, and team leadership';
          
          return `# Industry Transition Analysis for ${userName}

After conducting a comprehensive analysis of your professional profile, I've evaluated your potential for industry transition across 10 key factors. Here's my assessment:

## Situation Assessment

Your background provides you with a strong foundation for exploring new industries. The skills you've developed are highly transferable, and several adjacent industries could benefit from your expertise.

### Transferable Skills Mapping
Your hard skills in ${skills} are in high demand across multiple industries. Your soft skills in communication, stakeholder management, and problem-solving are universal assets that translate well to any new sector.

### Industry Overlaps
Based on your profile, these industries have significant operational or functional overlap with your current experience:
- FinTech: Similar technology stack and product development approach
- HealthTech: Growing demand for professionals who understand user experience and data systems
- EdTech: Increasing need for product expertise as the sector undergoes digital transformation
- Green Technology: Emerging field where product development skills are highly valuable

### Growth & Opportunity Analysis
Among fast-growing sectors where your skills would be valuable:
- AI & Machine Learning: Projected 38% annual growth through 2027
- Cybersecurity: 33% projected job growth over the next decade
- Green Tech: Expected to grow 25% annually with significant government investment
- Digital Health: 27% compound annual growth rate expected through 2028

### Job Role Flexibility
Your current position could evolve into these roles in new industries:
- Product Manager in HealthTech (focusing on patient experience platforms)
- Director of Product Strategy in EdTech (developing learning management systems)
- Head of Digital Transformation in Financial Services
- Product Innovation Lead in Sustainability Tech

### Learning Curve & Effort Assessment
Industry transition difficulty ranking (1-10, where 10 is most difficult):
- FinTech: 3/10 (Minimal upskilling required)
- HealthTech: 5/10 (Some domain-specific knowledge needed)
- EdTech: 4/10 (Moderate learning curve with familiar technology components)
- Green Tech: 6/10 (Domain expertise needed but high demand for your underlying skills)

### Network Access
Your professional background likely provides you with some connections to FinTech and EdTech through overlapping technology communities. Brandentifier's Smart Connect feature can help you identify existing connections in your target industries and suggest strategic networking opportunities to build presence in sectors where your network is currently limited.

### Career Goal Alignment
The industries I've highlighted align well with typical career progression paths for someone with your background. FinTech and HealthTech particularly offer clear advancement opportunities for product leaders.

### Previous Cross-Industry Experience
Your portfolio suggests you've already worked on projects that crossed industry boundaries, which demonstrates adaptability and will make your transition more credible to potential employers.

### Behavioral Traits & Passion Areas
Your profile indicates strength in innovation and problem-solving, which matches well with emerging technologies in healthcare and education. Your analytical approach would be particularly valuable in data-heavy sectors like FinTech.

### Feasibility & Practical Fit
Considering practical factors:
- Geographic accessibility: All recommended industries have strong presence in major tech hubs
- Salary expectations: Comparable or higher compensation in all suggested industries
- Work-life balance: Varies by company, with EdTech typically offering better balance than FinTech
- Cultural fit: Your adaptability suggests you could thrive in any of these environments

## Immediate Action Steps

1. **Develop industry-specific expertise** in your target sectors through online courses and certifications.

2. **Rebrand your resume and portfolio** to highlight transferable skills and relevant projects. Use Brandentifier's Portfolio Builder to create industry-specific versions of your professional profile.

3. **Connect with professionals** in your target industries through Brandentifier's Smart Connect feature, LinkedIn groups, and industry conferences.

4. **Contribute to industry conversations** by publishing articles or participating in webinars on topics that bridge your current expertise with your target industry.

5. **Look for hybrid opportunities** that combine your current skills with exposure to new industries, such as consulting roles or projects at the intersection of technology and your target sector.

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
        I couldn't properly process the resume file you provided. Please provide a comprehensive, detailed resume analysis and improvement guide using standard best practices.
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
            
      Analyze the resume using these critical evaluation criteria, providing a score (out of 100%) for each category and an overall score:
      
      1. STRUCTURE & LAYOUT (20% of total score)
      • Overall organization and visual appeal
      • Section order and prominence
      • Appropriate length (1-2 pages)
      • Consistent formatting and readability
      
      2. CONTENT QUALITY (20% of total score)
      • Clarity and conciseness
      • Relevance of information included
      • Professional language and tone
      • Proper grammar and spelling
      
      3. RELEVANCE TO ROLE/INDUSTRY (15% of total score)
      • Alignment with industry expectations
      • Focus on relevant skills/experiences
      • Use of appropriate industry terminology
      • Clear career progression/trajectory
      
      4. ACHIEVEMENTS & METRICS (20% of total score)
      • Quantified results and impact
      • Specific accomplishments vs. job duties
      • Evidence of leadership and initiative
      • Demonstration of value added
      
      5. SOFT SKILLS & PERSONALITY (10% of total score)
      • Balance of technical and interpersonal skills
      • Evidence of teamwork and collaboration
      • Communication and leadership qualities
      • Unique attributes that distinguish the candidate
      
      6. ATS COMPATIBILITY (15% of total score)
      • Keyword optimization for target roles
      • Clean, parsable formatting
      • Proper use of standard section headings
      • Absence of graphics/tables that confuse ATS
      
      RESUME TEXT:
      ${truncatedText}
      
      Provide the analysis in this format:
      1. Summary of resume strengths and weaknesses
      2. Detailed scores for each category with specific examples from the resume
      3. Overall score with explanation
      4. Prioritized recommendations for improvement (most impactful first)
      5. Specific suggestions on how to use Brandentifier's Portfolio Builder to showcase projects and skills
      
      Make this extremely actionable, detailed, and formatted with emoji bullets (like ✅, 🔹, 📅) to make sections visually distinct. Use a professional yet conversational tone.
      `;
      } catch (error: any) {
        console.error("Error processing text resume:", error);
        systemPrompt += " I cannot directly process this resume text, but I can provide comprehensive, detailed guidance for resume improvement similar to what an expert resume coach would offer.";
        userPrompt = `
        I couldn't properly process the resume text you provided. Please provide a comprehensive, detailed resume analysis and improvement guide using standard best practices.
        `;
      }
    } else if (!userPrompt) {
      // Fallback for any other case
      systemPrompt += " I cannot directly process this resume, but I can provide comprehensive, detailed guidance for resume improvement similar to what an expert resume coach would offer.";
      userPrompt = `
      I couldn't properly process the resume you provided. Please provide a comprehensive, detailed resume analysis and improvement guide using standard best practices.
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