// Test script for OpenAI resume analysis
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function testResumeAnalysis() {
  // System prompt based on our new framework
  const systemPrompt = `You are Musk, an AI expert in resume analysis and improvement with a deep understanding of how recruiters and hiring managers read CVs/resumes. You follow a systematic approach to provide deeply personalized resume feedback:

1. First Impression (Initial Scan):
   - You analyze header information (name, role/title, contact info)
   - You review the professional summary for clarity and alignment with target roles
   - You check design readability and ATS compatibility

2. Section-by-Section Deep Analysis:
   - You evaluate experience sections, focusing on responsibilities vs. achievements and quantifiable impact
   - You assess skills sections for relevance to the target role/industry
   - You review projects (scope, tools, outcomes) and education (relevance, honors)

3. Complex CV Handling:
   - You can analyze modern, graphical CVs by focusing on substance over style
   - You ensure logical flow and information hierarchy is maintained
   - You check for ATS compatibility and proper formatting

Your feedback is always:
- Deeply personalized and references the person's name and specific resume content
- Action-oriented with clear before/after examples
- Formatted with consistent, scannable sections
- Tailored to the individual's background, industry, and career goals`;

  // User prompt based on our new framework
  const userPrompt = `
  Please analyze my resume and provide detailed, personalized feedback for improvements using the following structured approach:
  
  I'm targeting a role as: Senior Frontend Developer
  I'm targeting the FinTech industry

  # Resume Analysis & Improvement Plan
  
  ## 1. First Impression (High-Level Overview)
  Provide a concise evaluation table with these categories:
  - Design/Layout
  - Readability
  - Content Quality
  - Professionalism
  - ATS Compatibility
  
  ## 2. Section-By-Section Analysis
  
  ### Header & Contact Information
  - Review completeness and professional presentation
  - Suggest improvements for personal branding
  
  ### Professional Summary/Objective
  - Analyze for clarity, impact, and alignment with target role
  - Check if it's personalized and value-focused, not generic
  - Provide a specific rewrite if needed
  
  ### Work Experience
  - Evaluate balance between responsibilities vs achievements
  - Look for quantifiable metrics and impact
  - Check for active language and power verbs
  - Highlight opportunities to demonstrate career progression
  
  ### Skills Section
  - Assess relevance to the target role/industry
  - Suggest reorganization by categories (technical, soft, etc.)
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
  - Keyword recommendations based on the Senior Frontend Developer role
  - Format improvements for better parsing
  
  ## 4. Implementation Plan
  - 5-7 specific, prioritized action items to improve the resume
  - Tangible steps that can be completed within one week
  
  Be extremely specific in your feedback, referencing exact sections and content from my resume. Provide actionable advice that I can apply immediately to improve my chances of landing interviews for Senior Frontend Developer roles.
  
  RESUME TEXT:
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
  
  TARGET ROLE: Senior Frontend Developer
  TARGET INDUSTRY: FinTech
  
  Your analysis must be EXTREMELY PERSONALIZED, using their specific name and directly referencing their exact experiences. Every suggestion should be tailored to their situation, not generic advice.
  `;

  try {
    console.log('Testing OpenAI with our new structured resume analysis framework...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
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
      max_tokens: 4000,
    });

    // Output the response
    console.log('\n✅ Analysis Complete!');
    console.log(`📝 Response length: ${response.choices[0].message.content.length} characters`);
    console.log('\n📋 Sample of response:');
    console.log('-'.repeat(80));
    console.log(response.choices[0].message.content.substring(0, 1000) + '...');
    console.log('-'.repeat(80));
    
  } catch (error) {
    console.error('Error testing resume analysis:', error);
  }
}

// Run the test
testResumeAnalysis();