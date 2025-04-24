/**
 * Routes for testing the enhanced resume analysis feature
 */
import { Router } from 'express';
import OpenAI from 'openai';

// Create a router
export const resumeTestRoutes = Router();

// Test route for enhanced resume analysis
resumeTestRoutes.post('/test-resume-analysis', async (req, res) => {
  try {
    // Initialize OpenAI client
    const openai = new OpenAI();
    
    // Get resume text from request, or use a sample if not provided
    const resumeText = req.body.resumeText || `
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
`;

    console.log('Testing enhanced resume analysis via API...');
    
    // Use our enhanced system prompt that incorporates the detailed Canva resume reading strategy
    const systemPrompt = `You are Musk, an AI expert in resume analysis and improvement with a deep understanding of how recruiters and hiring managers read CVs/resumes. You follow a systematic approach to provide deeply personalized resume feedback:

## Core CV/Resume Reading Approach

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

## Special Approach for Complex Canva-Style Resumes

When analyzing a design-heavy, complicated resume (e.g., Canva templates):

1. Ignore the Design Initially, Focus on Extracting Content:
   - Mentally strip away all design elements and focus only on the text content
   - Look past the visual layout and identify the standard resume sections regardless of where they appear
   - Create a mental outline of the content in a traditional resume structure

2. Analyze Content First, Then Consider Design Impact:
   - After understanding the content and qualifications, assess how the design helps or hinders communication
   - Evaluate whether design elements enhance understanding or create confusion
   - Identify if any critical information is hidden or de-emphasized by design choices

3. Look for Content Scattered Across Non-Standard Sections:
   - In heavily designed resumes, important content is often fragmented across multiple locations
   - Piece together related information from different parts of the resume
   - Reconstruct a complete picture of the candidate's experience and skills

4. Apply a Top-to-Bottom Scan Regardless of Layout:
   - Start by identifying the candidate's name, current role, and contact details
   - Look for a summary or profile statement that communicates their value proposition
   - Locate and analyze experience sections in chronological order
   - Extract skills, education, certifications, and other qualifications

Your feedback is always:
- Deeply personalized and references the person's name and specific resume content
- Action-oriented with clear before/after examples
- Formatted with consistent, scannable sections
- Tailored to the individual's background, industry, and career goals`;

    const userPrompt = `Please analyze this resume and provide detailed, personalized feedback:

${resumeText}

Focus on specific improvements to highlight achievements, quantify impact, optimize for ATS, and position for senior roles.

FORMAT YOUR RESPONSE USING THESE GUIDELINES:
- Use bold for section headers (e.g., "**First Impression**")
- Use italic for emphasis or important points
- Use bullet points for lists of suggestions
- Include emojis like ✅ 📝 🔍 for visual guidance
- Provide before/after examples in code blocks
- Structure your analysis into clear sections:
  1. First Impression
  2. Content Analysis
  3. Design Evaluation
  4. Specific Improvement Suggestions
  5. ATS Optimization Tips
  6. Next Steps`;

    // Make the direct OpenAI API call with a shorter response (for testing purposes)
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Use a faster model for testing
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000 // Shorter response for testing
    });

    const analysis = completion.choices[0].message.content || '';
    
    // Send back the analysis result as JSON
    res.json({
      success: true,
      analysis: analysis,
      analysisLength: analysis.length,
      excerpt: analysis.substring(0, 300) + '...'
    });
  } catch (error: any) {
    console.error('Error testing resume analysis API:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test route specifically for Canva resume analysis
resumeTestRoutes.post('/test-canva-resume-analysis', async (req, res) => {
  try {
    // Initialize OpenAI client
    const openai = new OpenAI();
    
    // Get resume text from request, or use a sample designed resume if not provided
    const resumeText = req.body.resumeText || `
SOPHIA MARTINEZ
UX/UI DESIGNER & FRONTEND DEVELOPER
sophia@example.com | (555) 123-4567 | linkedin.com/in/sophiam | portfolio: sophia-designs.com

PROFILE                                                   SKILLS
Creative and user-focused designer with                  UX/UI Design ●●●●●
4+ years of experience crafting beautiful,               Wireframing ●●●●○
accessible interfaces. Combines strong                   User Research ●●●●○
design sensibilities with frontend                       HTML/CSS ●●●●●
development skills to create seamless                    JavaScript ●●●○○
user experiences.                                        React ●●●●○
                                                        Figma ●●●●●
                                                        Adobe XD ●●●●○
WORK EXPERIENCE                                          User Testing ●●●○○
                                                        Responsive Design ●●●●●
Senior UX/UI Designer                                    Typography ●●●●○
CREATIVE SOLUTIONS INC.
2021 - PRESENT
• Led redesign of primary banking app used by 50,000+ customers, resulting in 35% improvement in user satisfaction and 28% reduction in support tickets
• Collaborated with product managers and developers to implement design system that reduced design inconsistencies by 75%
• Conducted 30+ user interviews and usability tests to validate design decisions
• Mentored 3 junior designers on best practices and design principles

UX Designer
TECH INNOVATIONS
2019 - 2021
• Created wireframes, prototypes, and high-fidelity designs for e-commerce platform
• Increased conversion rates by 22% through A/B testing and iterative design improvements
• Developed responsive web interfaces using HTML, CSS, and JavaScript
• Implemented accessibility standards to ensure WCAG 2.1 AA compliance

EDUCATION                                               CERTIFICATIONS
Bachelor of Fine Arts                                   • Google UX Design Professional Certificate
Graphic Design                                          • Advanced React Development
DESIGN UNIVERSITY                                       • Accessibility in Web Design
2015 - 2019
Graduated with Honors                                   LANGUAGES
GPA: 3.8/4.0                                           • English (Native)
                                                       • Spanish (Fluent)

PROJECTS
HEALTHCARE APP REDESIGN
• Simplified patient scheduling workflow reducing booking time by 45%
• Improved information architecture to help users find relevant information faster
• Created design system with 200+ reusable components

FINANCIAL DASHBOARD
• Designed intuitive data visualization tools for complex financial information
• Conducted card sorting exercises to optimize dashboard organization
• Increased user engagement by 40% through improved UX
`;

    console.log('Testing Canva resume analysis...');
    
    // Use the same enhanced system prompt with Canva-specific guidance
    const systemPrompt = `You are Musk, an AI expert in resume analysis who excels at evaluating design-heavy resumes with complex layouts like those created in Canva. 

## Core Approach for Design-Heavy Resumes

1. Ignore the Design Initially, Focus on Extracting Content:
   - Mentally strip away all design elements (colors, shapes, icons, percentage ratings, charts)
   - Look past the visual layout and identify the standard resume sections regardless of where they appear
   - Create a mental outline of the content in a traditional resume structure

2. Analyze Content First, Then Consider Design Impact:
   - After understanding the content and qualifications, assess how the design helps or hinders communication
   - Evaluate whether design elements enhance understanding or create confusion
   - Identify if any critical information is hidden or de-emphasized by design choices

3. Look for Content Scattered Across Non-Standard Sections:
   - In heavily designed resumes, important content is often fragmented across multiple locations
   - Piece together related information from different parts of the resume
   - Reconstruct a complete picture of the candidate's experience and skills

4. Apply a Top-to-Bottom Scan Regardless of Layout:
   - Start by identifying the candidate's name, current role, and contact details
   - Look for a summary or profile statement that communicates their value proposition
   - Locate and analyze experience sections in chronological order
   - Extract skills, education, certifications, and other qualifications

5. Critically Evaluate Visual Elements:
   - Identify whether skill graphs/percentages provide meaningful information or are arbitrary
   - Assess whether icons help organize information or create visual clutter
   - Determine if color coding enhances or distracts from key content

6. Focus on Specific Content Issues to Improve:
   - Identify vague statements that need quantifiable achievements
   - Look for responsibilities that should be reframed as accomplishments
   - Check for ATS compatibility issues with the design elements
   - Find opportunities to add keywords relevant to their target role

Your feedback should be deeply personalized, referencing specific elements from their resume, and providing clear before/after examples for improvement.`;

    const userPrompt = `Please analyze this Canva-style design-heavy resume and provide detailed, personalized feedback:

${resumeText}

First, ignore the design elements and extract the core content. Then analyze the content quality, focusing on achievements, specificity, and ATS compatibility. Finally, evaluate how the design helps or hinders communication of the person's value.

FORMAT YOUR RESPONSE USING THESE GUIDELINES:
- Use bold for section headers (e.g., "**First Impression**")
- Use italic for emphasis or important points
- Use bullet points for lists of suggestions
- Include emojis like ✅ 📝 🔍 for visual guidance
- Provide before/after examples in code blocks
- Structure your analysis into clear sections:
  1. Content Extraction
  2. Skills & Qualifications Analysis
  3. Experience & Achievements Review
  4. Design Evaluation
  5. ATS Compatibility Assessment
  6. Improvement Recommendations
  7. Next Steps`;

    // Make the direct OpenAI API call
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Use the latest model for best results with complex layouts
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500 // Longer response for comprehensive analysis
    });

    const analysis = completion.choices[0].message.content || '';
    
    // Send back the analysis result as JSON
    res.json({
      success: true,
      analysis: analysis,
      analysisLength: analysis.length,
      excerpt: analysis.substring(0, 300) + '...',
      model: "gpt-4o"
    });
  } catch (error: any) {
    console.error('Error testing Canva resume analysis API:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});