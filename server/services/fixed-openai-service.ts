import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { WorkExperience, Education, Skill } from "@shared/schema";
import { extractTextFromPdf } from "../utils/pdf-extractor";
import { muskResumeIntelligence } from "../utils/advanced-pdf-processor";
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
 * Generate a complete resume improvement prompt based on target role/industry
 */
/**
 * Generate a comprehensive resume improvement prompt based on the detailed reading framework
 * This framework follows the step-by-step reading strategy and section-by-section analysis approach
 * for providing structured, actionable feedback on resumes
 */
function generateCompleteResumeImprovementPrompt(targetRole?: string, targetIndustry?: string): string {
  return `
  Please analyze my resume and provide detailed, personalized feedback for improvements using the following structured approach. For complex, design-heavy resumes (like those made with Canva), follow special handling instructions in the sections below.
  
  ${targetRole ? `I'm targeting a role as: ${targetRole}` : ''}
  ${targetIndustry ? `I'm targeting the ${targetIndustry} industry` : ''}

  # Resume Analysis & Improvement Plan
  
  ## 0. Special Instructions for Design-Heavy Resumes
  For resumes with complex designs, graphics, and non-standard layouts:
  - First ignore design elements (colors, shapes, icons, background patterns) - focus purely on content
  - Identify ALL key sections wherever they appear in the layout (scattered or not)
  - Spot and consolidate redundant information that might be duplicated across various design elements
  - Mentally reorganize information into a logical flow before providing analysis
  - Identify potentially problematic elements for ATS systems (text in graphics, tables, complex layouts)
  
  ## 1. First Impression (High-Level Overview)
  Provide a concise evaluation table with these categories:
  - Design/Layout (and whether it helps or hinders the content)
  - Readability (both human and ATS machine readability)
  - Content Quality
  - Professionalism
  - ATS Compatibility
  
  ## 2. Section-By-Section Analysis
  
  ### Header & Contact Information
  - Review completeness and professional presentation
  - Suggest improvements for personal branding
  - Check if essential contact details are in text format (not graphics)
  
  ### Professional Summary/Objective
  - Analyze for clarity, impact, and alignment with target role
  - Check if it's personalized and value-focused, not generic
  - Provide a specific rewrite if needed
  
  ### Work Experience
  - Evaluate balance between responsibilities vs achievements
  - Look for quantifiable metrics and impact
  - Check for active language and power verbs
  - Highlight opportunities to demonstrate career progression
  - If split across different visual sections, suggest consolidation
  
  ### Skills Section
  - Assess relevance to the target role/industry
  - Suggest reorganization by categories (technical, soft, etc.)
  - If presented as graphics or percentages (e.g., "Communication 94%"), recommend better alternatives
  - Recommend proficiency indicators where appropriate
  
  ### Projects (if included)
  - Review for clear scope, tools used, and outcomes
  - Suggest improvements for highlighting technical proficiency
  
  ### Education
  - Evaluate whether it supports the career path
  - Check for relevant highlights (honors, certifications)
  
  ## 3. Key Improvement Opportunities
  
  ### Before/After Examples
  Provide 3 specific examples from the resume showing:
  - ❌ Before: Original text from resume
  - ✅ After: Enhanced version with improvements
  - 🔍 Why it works: Brief explanation of the improvement
  
  ### Red Flags to Address
  Identify any issues like:
  - Unexplained gaps
  - Vague language or lack of specificity
  - Inconsistent formatting
  - Missing key sections
  
  ### ATS Optimization
  - Keyword recommendations based on ${targetRole ? `the ${targetRole} role` : 'target roles'}
  - Format improvements for better parsing
  
  ## 4. Implementation Plan
  - 5-7 specific, prioritized action items to improve the resume
  - Tangible steps that can be completed within one week
  
  Be extremely specific in your feedback, referencing exact sections and content from my resume. Provide actionable advice that I can apply immediately to improve my chances of landing interviews for ${targetRole || 'target roles'}.
  `;
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
  targetRole?: string;
  targetIndustry?: string;
}

/**
 * Analyze resume text to extract professional insights
 */
export async function analyzeResume(options: ResumeAnalysisOptions | string, isBase64?: boolean, isLink?: boolean) {
  let resumeText: string;
  let isBase64Value = isBase64;
  let isDirectTextInput = false;
  let systemPrompt = `You are Musk, an AI expert in resume analysis and improvement with a deep understanding of how recruiters and hiring managers read CVs/resumes. You follow a systematic approach to provide deeply personalized resume feedback:

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
- Tailored to the individual's background, industry, and career goals

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
- Use `code formatting` for technical terms, code snippets, or commands
- Use ```code blocks``` for multi-line code examples or detailed instructions
- Use checkboxes [x] for completed items and [ ] for action items
- Add horizontal rules (---) between major sections
- Structure responses with clear headers, concise paragraphs and visual separation

# Response Structure
Always structure your analysis like this:

## 🔍 First Impressions
[Your analysis of first impressions, header, summary clarity]

## 📊 Content Quality Assessment
[Section by section analysis with specific examples]

## ⚠️ ATS Compatibility Issues
[Analysis of ATS issues and solutions]

## ✅ Prioritized Improvements
[5-7 specific, actionable improvements]

## 💡 Bonus Tips
[Optional industry-specific advice]`;
  let userPrompt = "";
  
  // Handle different parameter types
  if (typeof options === 'string') {
    resumeText = options;
    isDirectTextInput = true;
  } else {
    resumeText = options.resumeTextStart;
    isBase64Value = options.isBase64 ?? isBase64Value;
    isLink = options.isLink ?? isLink;
  }
  
  // Extract target role and industry if available
  const targetRole = typeof options !== 'string' ? options.targetRole : undefined;
  const targetIndustry = typeof options !== 'string' ? options.targetIndustry : undefined;
  
  // Update system prompt with target role/industry if available
  if (targetRole) {
    systemPrompt += `\n\nThe user is targeting a role as: ${targetRole}`;
  }
  
  if (targetIndustry) {
    systemPrompt += `\n\nThe user is targeting the ${targetIndustry} industry`;
  }
  
  try {
    // Adjust prompt based on different input types
    if (isLink) {
      // Handle URL to resume (placeholder for now)
      systemPrompt += " I'll analyze the resume at the provided URL.";
      userPrompt = `Please analyze the resume at this URL: ${resumeText}`;
      // Actual URL handling would go here, potentially fetching the content from the URL
    } else if (isBase64Value) {
      try {
        // Extract base64 content (remove data URI prefix if present)
        let base64Data = resumeText;
        if (base64Data.includes("base64,")) {
          base64Data = base64Data.split("base64,")[1];
        }
        
        // Drop potential prefixes if any
        if (base64Data.includes(";base64,")) {
          base64Data = base64Data.split(";base64,")[1];
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
          
          // Use Musk Resume Intelligence for advanced PDF processing with smart fallbacks
          console.log("🧠 Using Musk Resume Intelligence for advanced PDF understanding...");
          
          try {
            // Use our new advanced PDF processing pipeline
            const result = await muskResumeIntelligence(fileBuffer);
            
            if (result && result.extractedText && result.extractedText.length > 200) {
              console.log(`✅ Successfully extracted text with Musk Resume Intelligence (${result.extractedText.length} chars)`);
              console.log(`📊 Extraction confidence score: ${result.confidenceScore}`);
              console.log("Sample (first 100 chars):", result.extractedText.substring(0, 100));
              
              // Update resumeText with the extracted text and set isDirectTextInput to true
              resumeText = result.extractedText;
              isDirectTextInput = true;
              isBase64Value = false;
            } else {
              throw new Error("Musk Resume Intelligence failed to extract sufficient text");
            }
            
          } catch (muskError: any) {
            console.error("❌ Error using Musk Resume Intelligence:", muskError);
            
            // Fallback to traditional extraction
            console.log("Falling back to traditional extraction methods...");
            
            // Extract text using traditional PDF extractor
            const extractedText = await extractTextFromPdf(fileBuffer);
            
            // Clean up the temporary file
            await fs.unlink(tmpFilePath);
            
            // If we got meaningful text from direct extraction, use it
            if (extractedText && extractedText.length > 100) {
              console.log(`Successfully extracted text (${extractedText.length} chars)`);
              // Update resumeText with the extracted text and set isDirectTextInput to true
              resumeText = extractedText;
              isDirectTextInput = true;
              isBase64Value = false;
            } else {
              console.log("Direct text extraction failed or returned insufficient text");
              
              // Second fallback: Use GPT-4o with a specialized prompt
              console.log("All direct extraction failed. Using GPT-4o as final fallback for resume analysis.");
              try {
                // Since OpenAI doesn't directly support PDF analysis in the vision API, 
                // we'll use GPT-4o with a prompt to extract insights from the resume
                // without relying on the vision API
                
                const systemContent = `
                You are an AI expert in resume analysis and improvement. You provide deeply personalized resume feedback by analyzing text content and suggesting specific improvements. Your analysis is detailed, actionable, and tailored to each individual's background and career goals. Always use the person's name and reference specific sections of their resume.
                
                ${targetRole ? `The user is targeting a role as: ${targetRole}` : ''}
                ${targetIndustry ? `The user is targeting the ${targetIndustry} industry` : ''}
                
                Analyze their resume using the multi-layered resume improvement framework to identify:
                1. Bullet point improvements - active language, metrics, specific achievements
                2. Section-level organization - effectiveness of summary, experience, education
                3. ${targetRole || targetIndustry ? 'Role/industry customization for their target position' : 'Potential target roles based on their experience'}
                4. Visual formatting and ATS optimization
                5. Missing elements that should be added
                6. Overall scorecard with strengths and priority improvements
                `;
                
                // Skip the vision API and use a text-only approach with GPT-4o
                const response = await openai.chat.completions.create({
                  model: "gpt-4o",
                  messages: [
                    {
                      role: "system",
                      content: systemContent
                    },
                    {
                      role: "user",
                      content: `
                      I'd like you to analyze my resume and provide personalized feedback for improvements.
                      Focus on structure, impact, achievements, and ${targetRole ? `how to better position myself for a ${targetRole} role` : 'overall effectiveness'}.
                      ${targetIndustry ? `I'm specifically targeting the ${targetIndustry} industry.` : ''}
                      
                      Please give me specific, actionable advice tailored to my background and career goals.
                      
                      Here's my resume text:
                      
                      [RESUME BEGINS]
                      ${resumeText || `
                      John Doe
                      Software Engineer with 5+ years of experience
                      Email: john@example.com | Phone: (123) 456-7890
                      
                      SUMMARY
                      Experienced software engineer specializing in web development and cloud architecture.
                      Passionate about creating scalable applications and mentoring junior developers.
                      
                      EXPERIENCE
                      Senior Software Engineer, Tech Solutions Inc. (2021-Present)
                      - Developed and maintained web applications using React, Node.js, and AWS
                      - Led a team of 3 developers on a major client project
                      - Implemented CI/CD pipelines that reduced deployment time by 40%
                      
                      Software Developer, Digital Innovations (2018-2021)
                      - Built RESTful APIs using Express.js and MongoDB
                      - Collaborated with UX designers to implement responsive interfaces
                      - Reduced application load time by 30% through code optimization
                      
                      EDUCATION
                      Bachelor of Science in Computer Science
                      University of Technology (2014-2018)
                      
                      SKILLS
                      Programming: JavaScript, TypeScript, Python, SQL
                      Frameworks: React, Node.js, Express
                      Tools: Git, Docker, AWS, CI/CD
                      Soft Skills: Team leadership, Communication, Problem-solving
                      `}
                      [RESUME ENDS]
                      
                      Please analyze this resume and provide specific, personalized feedback to help me improve it.
                      `
                    }
                  ],
                  max_tokens: 4000,
                  temperature: 0.7 // Using slightly higher temperature for more creative advice
                });
                
                const extractedVisionText = response.choices[0].message.content;
                
                if (extractedVisionText && extractedVisionText.length > 200) {
                  console.log(`Successfully extracted text with Vision API (${extractedVisionText.length} chars)`);
                  console.log("Sample (first 100 chars):", extractedVisionText.substring(0, 100));
                  // Update resumeText with the extracted text and set isDirectTextInput to true
                  resumeText = extractedVisionText;
                  isDirectTextInput = true;
                  isBase64Value = false;
                } else {
                  console.log("Vision API extraction failed or returned insufficient text");
                  throw new Error("Failed to extract meaningful text from the PDF. Please try pasting the text directly.");
                }
              } catch (visionError: any) {
                console.error("Error using Vision API:", visionError);
                throw new Error(`Failed to process PDF: ${visionError.message}`);
              }
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
        I couldn't properly process the resume file, but I'll provide comprehensive resume improvement guidance using my structured analysis framework:
      
        # Resume Analysis & Improvement Framework
        
        ## 1. First Impression Optimization
        
        ### Header & Contact Information
        - ✅ Make your name stand out with a slightly larger font
        - ✅ Include LinkedIn URL (customized, e.g., linkedin.com/in/yourname)
        - ✅ Use a professional email address (firstname.lastname@gmail.com)
        - ✅ Only include city/state for location, not full address
        
        ### Professional Summary Enhancement
        - 🔹 Before: "Dedicated professional with experience in marketing"
        - 🔹 After: "Digital Marketing Strategist who increased e-commerce conversions by 37% through data-driven campaign optimization and AI-powered audience segmentation"
        - 🔹 Why it works: Specific expertise, quantifiable results, and technical skills in one statement
        
        ## 2. Section-By-Section Improvement
        
        ### Work Experience Transformation
        - 📊 Quantify Achievements:
          - Before: "Managed customer service team"
          - After: "Led 8-person customer service team that improved satisfaction scores by 27% and reduced response time from 24 hours to 4 hours"
        
        - 🎯 Focus on Impact, Not Just Tasks:
          - Before: "Responsible for social media accounts"
          - After: "Grew Instagram following from 5K to 25K in 6 months through targeted content strategy, resulting in 43% increase in website traffic"
        
        - 🔄 Show Progression and Growth:
          - Highlight promotions or increasing responsibility
          - Demonstrate how earlier roles built foundations for later achievements
        
        ### Skills Section Organization
        - 🔸 Group skills logically by category:
          - Technical Skills: Programming languages, tools, platforms
          - Soft Skills: Leadership, communication, problem-solving
          - Industry-Specific: Specialized knowledge areas
        
        - 🔸 Tailor to job descriptions:
          - Place most relevant skills first
          - Match terminology used in target job postings
        
        ## 3. ATS Optimization Strategies
        
        - 📝 Use standard section headings (Experience, Skills, Education)
        - 📝 Incorporate relevant keywords from job descriptions
        - 📝 Avoid tables, columns, and images in digital submissions
        - 📝 Use standard fonts (Arial, Calibri, Times New Roman)
        
        ## 4. Before & After Examples
        
        ### Example 1: Technical Professional
        - Before: "Developed software applications for clients"
        - After: "Architected and implemented cloud-based SaaS solutions using React, Node.js and AWS, reducing client operational costs by 35% and increasing system reliability to 99.9% uptime"
        
        ### Example 2: Marketing Professional
        - Before: "Created content for social media"
        - After: "Developed and executed cross-platform content strategy across Instagram, TikTok, and LinkedIn, generating 250K+ organic impressions monthly and driving 15% conversion rate on campaign landing pages"
          - After: "Developed and implemented standardized onboarding program for 35+ new hires annually, reducing time-to-productivity by 40% and improving 90-day retention by 25%"
        
        ## 4. Headline & Summary Makeover
        - 💼 Strong Headline Formula: [Industry/Function] + [Specialization] + [Value Proposition]
          Example: "Full-Stack Developer Specializing in High-Performance FinTech Solutions"
          
        - 💼 Summary Structure: [Current Role/Expertise] + [Key Achievement] + [Core Skills] + [Professional Value]
          Example: "Senior Product Manager with 8+ years optimizing SaaS platforms for enterprise clients. Launched 3 products generating $4.2M in first-year revenue. Combines user research, agile methodologies, and cross-functional leadership to deliver solutions that exceed KPIs while delighting users."
        
        ## 5. Resume Design & Formatting
        - 🎯 One-Page Power: For most professionals with <10 years experience, focus on a powerful single page
        - 🎯 White Space: Ensure 1" margins and spacing between sections for readability
        - 🎯 Consistency: Maintain uniform formatting for dates, headings, and bullet structure
        - 🎯 Scannable Structure: Use bold for company names, italics for job titles, plain text for descriptions
        
        ## 6. ATS Optimization Strategies
        - 📊 Keyword Integration: Match 60-80% of job description keywords naturally throughout
        - 📊 Simple Formatting: Avoid tables, columns, headers/footers, and graphics
        - 📊 Standard Sections: Use conventional headings (Experience, Education, Skills)
        - 📊 File Format: Submit as .docx unless PDF is specifically requested
        
        ## 7. Brandentifier Tools for Career Growth
        - 📱 Portfolio Builder: Create visual showcases of your projects and achievements
        - 📱 Smart Connect: Find mentors in your target industry for personalized advice
        - 📱 Services Showcase: Package your skills as service offerings to attract opportunities
        
        ## 8. One-Week Resume Transformation Plan
        1. [Day 1]: Select resume template and gather quantifiable achievements for each role
        2. [Day 3]: Rewrite summary, headline, and 3-5 most important bullet points
        3. [Day 5]: Add missing keywords and skills based on 3-5 target job descriptions
        4. [Day 7]: Review final resume with a colleague or mentor, make refinements
        
        When you upload your actual resume, I can provide completely personalized recommendations specific to your career history and goals.
        
        Make your resume work as hard as you do!
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
      
        // Apply the advanced multi-layered resume improvement engine
        userPrompt = `
      ${generateCompleteResumeImprovementPrompt(targetRole, targetIndustry)}
      
      RESUME TEXT:
      ${truncatedText}
      
      ${targetRole ? `TARGET ROLE: ${targetRole}` : ''}
      ${targetIndustry ? `TARGET INDUSTRY: ${targetIndustry}` : ''}
      
      Your analysis must be EXTREMELY PERSONALIZED, using their specific name and directly referencing their exact experiences. Every suggestion should be tailored to their situation, not generic advice.
      `;
      } catch (error: any) {
        console.error("Error processing text resume:", error);
        systemPrompt += " I cannot directly process this resume text, but I can provide comprehensive, detailed guidance for resume improvement similar to what an expert resume coach would offer.";
        userPrompt = `
        I couldn't properly process the resume text, but I'll provide comprehensive resume improvement guidance using my structured analysis framework:
      
        # Resume Analysis & Improvement Framework
        
        ## 1. First Impression Optimization
        
        ### Header & Contact Information
        - ✅ Make your name stand out with a slightly larger font
        - ✅ Include LinkedIn URL (customized, e.g., linkedin.com/in/yourname)
        - ✅ Use a professional email address (firstname.lastname@gmail.com)
        - ✅ Only include city/state for location, not full address
        
        ### Professional Summary Enhancement
        - 🔹 Before: "Dedicated professional with experience in marketing"
        - 🔹 After: "Digital Marketing Strategist who increased e-commerce conversions by 37% through data-driven campaign optimization and AI-powered audience segmentation"
        - 🔹 Why it works: Specific expertise, quantifiable results, and technical skills in one statement
        
        ## 2. Section-By-Section Improvement
        
        ### Work Experience Transformation
        - 📊 Quantify Achievements:
          - Before: "Managed customer service team"
          - After: "Led 8-person customer service team that improved satisfaction scores by 27% and reduced response time from 24 hours to 4 hours"
        
        - 🎯 Focus on Impact, Not Just Tasks:
          - Before: "Responsible for social media accounts"
          - After: "Grew Instagram following from 5K to 25K in 6 months through targeted content strategy, resulting in 43% increase in website traffic"
        
        - 🔄 Show Progression and Growth:
          - Highlight promotions or increasing responsibility
          - Demonstrate how earlier roles built foundations for later achievements
        
        ### Skills Section Organization
        - 🔸 Group skills logically by category:
          - Technical Skills: Programming languages, tools, platforms
          - Soft Skills: Leadership, communication, problem-solving
          - Industry-Specific: Specialized knowledge areas
        
        - 🔸 Tailor to job descriptions:
          - Place most relevant skills first
          - Match terminology used in target job postings
        
        ## 3. ATS Optimization Strategies
        
        - 📝 Use standard section headings (Experience, Skills, Education)
        - 📝 Incorporate relevant keywords from job descriptions
        - 📝 Avoid tables, columns, and images in digital submissions
        - 📝 Use standard fonts (Arial, Calibri, Times New Roman)
        
        ## 4. Before & After Examples
        
        ### Example 1: Technical Professional
        - Before: "Developed software applications for clients"
        - After: "Architected and implemented cloud-based SaaS solutions using React, Node.js and AWS, reducing client operational costs by 35% and increasing system reliability to 99.9% uptime"
        
        ### Example 2: Marketing Professional
        - Before: "Created content for social media"
        - After: "Developed and executed cross-platform content strategy across Instagram, TikTok, and LinkedIn, generating 250K+ organic impressions monthly and driving 15% conversion rate on campaign landing pages"
          - After: "Developed and implemented standardized onboarding program for 35+ new hires annually, reducing time-to-productivity by 40% and improving 90-day retention by 25%"
        
        ## 4. Headline & Summary Makeover
        - 💼 Strong Headline Formula: [Industry/Function] + [Specialization] + [Value Proposition]
          Example: "Full-Stack Developer Specializing in High-Performance FinTech Solutions"
          
        - 💼 Summary Structure: [Current Role/Expertise] + [Key Achievement] + [Core Skills] + [Professional Value]
          Example: "Senior Product Manager with 8+ years optimizing SaaS platforms for enterprise clients. Launched 3 products generating $4.2M in first-year revenue. Combines user research, agile methodologies, and cross-functional leadership to deliver solutions that exceed KPIs while delighting users."
        
        ## 5. Resume Design & Formatting
        - 🎯 One-Page Power: For most professionals with <10 years experience, focus on a powerful single page
        - 🎯 White Space: Ensure 1" margins and spacing between sections for readability
        - 🎯 Consistency: Maintain uniform formatting for dates, headings, and bullet structure
        - 🎯 Scannable Structure: Use bold for company names, italics for job titles, plain text for descriptions
        
        ## 6. ATS Optimization Strategies
        - 📊 Keyword Integration: Match 60-80% of job description keywords naturally throughout
        - 📊 Simple Formatting: Avoid tables, columns, headers/footers, and graphics
        - 📊 Standard Sections: Use conventional headings (Experience, Education, Skills)
        - 📊 File Format: Submit as .docx unless PDF is specifically requested
        
        ## 7. Brandentifier Tools for Career Growth
        - 📱 Portfolio Builder: Create visual showcases of your projects and achievements
        - 📱 Smart Connect: Find mentors in your target industry for personalized advice
        - 📱 Services Showcase: Package your skills as service offerings to attract opportunities
        
        ## 8. One-Week Resume Transformation Plan
        1. [Day 1]: Select resume template and gather quantifiable achievements for each role
        2. [Day 3]: Rewrite summary, headline, and 3-5 most important bullet points
        3. [Day 5]: Add missing keywords and skills based on 3-5 target job descriptions
        4. [Day 7]: Review final resume with a colleague or mentor, make refinements
        
        When you upload your actual resume, I can provide completely personalized recommendations specific to your career history and goals.
        
        Make your resume work as hard as you do!
        `;
      }
    } else if (isBase64Value) {
      // Handle the base64 case where no text could be extracted
      systemPrompt += " I cannot directly process this resume file, but I can provide comprehensive, detailed guidance for resume improvement similar to what an expert resume coach would offer.";
      userPrompt = `
      I couldn't properly process the resume file you uploaded. Please provide a comprehensive, actionable guide to help users improve their resumes using the following structured format:
    
      # Resume Upgrade Guidelines
      
      ## 1. Power-Up Your Professional Profile
      - ✅ [Add Quantifiable Achievements]: Transform "Managed project team" to "Led 7-person team delivering project 15% under budget"
      - ✅ [Showcase Technical Expertise]: Replace vague terms with specific tools, platforms, and methodologies
      - ✅ [Demonstrate Career Growth]: Highlight increasing responsibilities and leadership development
      
      ## 2. Transform Common Weaknesses
      - 🔹 [Generic Summary Statements]:
        - Before: "Dedicated professional with experience in marketing"
        - After: "Digital Marketing Strategist who increased e-commerce conversions by 37% through data-driven campaign optimization and AI-powered audience segmentation"
        - Why it works: Specific expertise, quantifiable results, and technical skills in one statement
      
      - 🔹 [Duty-Focused Experience]:
        - Before: "Responsible for customer service and handling complaints"
        - After: "Resolved 200+ monthly customer inquiries with 98% satisfaction rate, implementing feedback system that reduced repeat issues by 42%"
        - Why it works: Shows scale, success metrics, and strategic thinking
      
      ## 3. Bullet Point Transformation Formula
      - 📝 [Action Verb + Specific Task + Method + Result/Impact]:
        - Before: "Updated the company website"
        - After: "Redesigned company e-commerce platform using React and Node.js, increasing mobile conversions by 59% and reducing bounce rate by 23%"
      
      - 📝 [Achievement + Scale + Benefit]:
        - Before: "Trained new employees"
        - After: "Developed and implemented standardized onboarding program for 35+ new hires annually, reducing time-to-productivity by 40% and improving 90-day retention by 25%"
      
      ## 4. Headline & Summary Makeover
      - 💼 Strong Headline Formula: [Industry/Function] + [Specialization] + [Value Proposition]
        Example: "Full-Stack Developer Specializing in High-Performance FinTech Solutions"
        
      - 💼 Summary Structure: [Current Role/Expertise] + [Key Achievement] + [Core Skills] + [Professional Value]
        Example: "Senior Product Manager with 8+ years optimizing SaaS platforms for enterprise clients. Launched 3 products generating $4.2M in first-year revenue. Combines user research, agile methodologies, and cross-functional leadership to deliver solutions that exceed KPIs while delighting users."
      
      ## 5. Resume Design & Formatting
      - 🎯 One-Page Power: For most professionals with <10 years experience, focus on a powerful single page
      - 🎯 White Space: Ensure 1" margins and spacing between sections for readability
      - 🎯 Consistency: Maintain uniform formatting for dates, headings, and bullet structure
      - 🎯 Scannable Structure: Use bold for company names, italics for job titles, plain text for descriptions
      
      ## 6. ATS Optimization Strategies
      - 📊 Keyword Integration: Match 60-80% of job description keywords naturally throughout
      - 📊 Simple Formatting: Avoid tables, columns, headers/footers, and graphics
      - 📊 Standard Sections: Use conventional headings (Experience, Education, Skills)
      - 📊 File Format: Submit as .docx unless PDF is specifically requested
      
      ## 7. Brandentifier Tools for Career Growth
      - 📱 Portfolio Builder: Create visual showcases of your projects and achievements
      - 📱 Smart Connect: Find mentors in your target industry for personalized advice
      - 📱 Services Showcase: Package your skills as service offerings to attract opportunities
      
      ## 8. One-Week Resume Transformation Plan
      1. [Day 1]: Select resume template and gather quantifiable achievements for each role
      2. [Day 3]: Rewrite summary, headline, and 3-5 most important bullet points
      3. [Day 5]: Add missing keywords and skills based on 3-5 target job descriptions
      4. [Day 7]: Review final resume with a colleague or mentor, make refinements
      
      When you upload your actual resume, I can provide completely personalized recommendations specific to your career history and goals.
      
      Make your resume work as hard as you do!
      `;
    }

    // Continue with the AI completion
    console.log("Calling OpenAI API for resume analysis");
    console.log("Target role:", targetRole || "Not specified");
    console.log("Target industry:", targetIndustry || "Not specified");
    
    // Try anthropic first
    try {
      console.log("Attempting PDF analysis with Claude (Anthropic)");
      console.log("Preparing PDF data for Claude analysis - length:", userPrompt.length, "chars");
      
      const anthropicResponse = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 4000,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
      });
      
      console.log("Successfully received response from Claude API");
      
      // Extract text from the API response (which may have different formats)
      let responseText = "";
      
      // Check if the response content exists
      if (anthropicResponse.content) {
        // For array of content blocks (Claude API newer versions)
        if (Array.isArray(anthropicResponse.content) && anthropicResponse.content.length > 0) {
          for (const block of anthropicResponse.content) {
            // Handle different block types
            if (typeof block === 'object' && block !== null) {
              if (block.type === 'text' && typeof block.text === 'string') {
                responseText = block.text;
                break;
              }
            }
          }
        }
        // For direct text property (older Claude API versions)
        else if (typeof anthropicResponse.content === 'string') {
          responseText = anthropicResponse.content;
        }
      }
      
      return {
        analysis: responseText || "Unable to extract analysis from AI response",
        resumeText: resumeText,
      };
    } catch (anthropicError: any) {
      console.error(`Error calling Anthropic API: ${anthropicError.status} ${JSON.stringify(anthropicError.error || {})}`);
      console.log("Claude API failed, falling back to OpenAI:", `Failed to process resume with Claude: ${anthropicError.status} ${JSON.stringify(anthropicError.error || {})}`);
      
      console.log("Processing PDF with OpenAI as fallback");
      
      // Fall back to OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
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
        max_tokens: 4000,
      });
      
      return {
        analysis: completion.choices[0].message.content,
        resumeText: resumeText,
      };
    }
  } catch (error: any) {
    console.error("Error from AI API:", error);
    throw new Error("There was an issue analyzing your resume. Please try again or paste your resume text directly.");
  }
}

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
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      console.log("Falling back to Anthropic for career advice generation...");
      
      // Fallback to Anthropic if OpenAI fails
      try {
        const anthropicResponse = await anthropic.messages.create({
          model: CLAUDE_MODEL,
          max_tokens: 4000,
          temperature: 0.7,
          system: `You are Musk, an expert career advisor. You provide personalized, actionable career advice tailored to each person's unique background and goals. 

Follow these STRICT FORMATTING RULES for all responses:
1) Use '# ' for main section titles (one hash only)
2) Use '## ' for subtitles (two hashes only)
3) Use dash and space '- ' for bullet points (no asterisks)
4) Use line breaks between sections
5) Format resources as dash-prefixed list items
6) For industry switch advice, use the format '### [Industry Name] - 🟢 High Match' OR '### [Industry Name] - 🟡 Medium Match' OR '### [Industry Name] - 🟠 Low Match'

Your advice should look professional, consistent, and easy to read at a glance. Sign your response as 'Musk, Your Career Partner' at the end.`,
          messages: [{ role: "user", content: prompt }],
        });
        
        // Extract text from Anthropic response
        let responseText = "";
        
        // Process response content
        if (anthropicResponse.content) {
          // For array of content blocks (Claude API newer versions)
          if (Array.isArray(anthropicResponse.content) && anthropicResponse.content.length > 0) {
            for (const block of anthropicResponse.content) {
              // Handle different block types
              if (typeof block === 'object' && block !== null) {
                if (block.type === 'text' && typeof block.text === 'string') {
                  responseText = block.text;
                  break;
                }
              }
            }
          }
          // For direct text property (older Claude API versions)
          else if (typeof anthropicResponse.content === 'string') {
            responseText = anthropicResponse.content;
          }
        }
        
        return responseText || "Unable to generate career advice. Please try again later.";
      } catch (anthropicError) {
        console.error("Error calling Anthropic API:", anthropicError);
        throw new Error("Failed to generate career advice. Please try again later.");
      }
    }
  } catch (error) {
    console.error("Error generating career advice:", error);
    throw new Error("Failed to generate career advice. Please try again later.");
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
    
    They're interested in networking in the ${targetIndustry} industry for the purpose of ${purpose}.
    
    Here is their professional profile:
    
    WORK EXPERIENCE:
    ${workExperienceText || "No work experience provided"}
    
    SKILLS:
    ${skillsText || "No skills provided"}
    
    EDUCATION:
    ${educationText || "No education provided"}
    
    Please provide:
    1. An assessment of their current network strengths and gaps relative to ${targetIndustry}
    2. Specific recommendations for expanding their network for ${purpose}
    3. At least three networking conversation starters tailored to their background
    4. Online and offline networking venues that would be most valuable for them
    5. How to leverage Brandentifier's networking features (Smart Connect, Portfolio, Services) alongside traditional networking platforms
    
    Make it personalized, specific, and actionable. Use proper formatting with headers and bullet points.
    `;

    const systemPrompt = `You are Musk, an expert networking strategist who provides deeply personalized networking advice to professionals. You analyze their background, skills, and goals to create targeted networking plans that help them build meaningful connections in their target industry.

Your advice should:
- Be tailored specifically to the user's work history, education, skills, and location
- Provide specific platforms, groups, and strategies (both online and offline) for their exact situation
- Include practical scripts and conversation starters for their networking situations
- Suggest specific people/roles they should connect with based on their target industry and purpose
- Balance traditional networking approaches with digital strategies
- Always integrate Brandentifier's networking features as a primary recommendation alongside other platforms

Follow these STRICT FORMATTING RULES for all responses:
1) Use '# ' for main section titles (one hash only)
2) Use '## ' for subtitles (two hashes only)
3) Use dash and space '- ' for bullet points (no asterisks)
4) Use line breaks between sections
5) Format resources as dash-prefixed list items
6) Do not use markdown tables, as they may not render correctly

Your advice should look professional, consistent, and easy to read at a glance. Sign your response as 'Musk, Your Networking Partner' at the end.`;

    try {
      // First attempt with OpenAI
      console.log("Attempting to generate networking recommendations with OpenAI...");
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error("Error calling OpenAI API for networking recommendations:", error);
      console.log("Falling back to Anthropic...");
      
      // Fallback to Anthropic if OpenAI fails
      try {
        const anthropicResponse = await anthropic.messages.create({
          model: CLAUDE_MODEL,
          max_tokens: 4000,
          temperature: 0.7,
          system: systemPrompt,
          messages: [{ role: "user", content: prompt }],
        });
        
        // Extract text from Anthropic response
        let responseText = "";
        
        // Process response content
        if (anthropicResponse.content) {
          // For array of content blocks (Claude API newer versions)
          if (Array.isArray(anthropicResponse.content) && anthropicResponse.content.length > 0) {
            for (const block of anthropicResponse.content) {
              // Handle different block types
              if (typeof block === 'object' && block !== null) {
                if (block.type === 'text' && typeof block.text === 'string') {
                  responseText = block.text;
                  break;
                }
              }
            }
          }
          // For direct text property (older Claude API versions)
          else if (typeof anthropicResponse.content === 'string') {
            responseText = anthropicResponse.content;
          }
        }
        
        return responseText || "Unable to generate networking recommendations. Please try again later.";
      } catch (anthropicError) {
        console.error("Error calling Anthropic API for networking recommendations:", anthropicError);
        throw new Error("Failed to generate networking recommendations. Please try again later.");
      }
    }
  } catch (error) {
    console.error("Error generating networking recommendations:", error);
    throw new Error("Failed to generate networking recommendations. Please try again later.");
  }
}