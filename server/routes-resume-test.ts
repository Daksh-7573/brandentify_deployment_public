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
- Tailored to the individual's background, industry, and career goals`;

    const userPrompt = `Please analyze this resume and provide detailed, personalized feedback:

${resumeText}

Focus on specific improvements to highlight achievements, quantify impact, optimize for ATS, and position for senior roles.`;

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

    const analysis = completion.choices[0].message.content;
    
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

// Add more test routes as needed