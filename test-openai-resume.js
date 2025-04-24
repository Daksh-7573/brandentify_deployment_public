/**
 * Direct test of OpenAI CV/resume analysis with enhanced prompts
 */

import OpenAI from 'openai';

// Initialize OpenAI API client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Sample resume text for testing
const sampleResumeText = `
John Doe
Senior Software Engineer

CONTACT
123-456-7890
john.doe@example.com
linkedin.com/in/johndoe
github.com/johndoe

PROFILE
Experienced software engineer with 8+ years specializing in full-stack development 
and cloud architecture. Passionate about building scalable applications and 
mentoring junior developers.

TECHNICAL SKILLS
Programming Languages: JavaScript (94%), TypeScript (92%), Python (88%), Java (75%)
Frameworks: React, Node.js, Express, Django
Tools: AWS, Docker, Kubernetes, Git, CI/CD, Jira

WORK EXPERIENCE
Senior Software Engineer | TechCorp Inc. | Jan 2020 - Present
• Responsible for frontend and backend development
• Worked on major client projects
• Implemented CI/CD pipelines
• Collaborated with UX team

Software Developer | Digital Solutions | Mar 2017 - Dec 2019
• Built RESTful APIs
• Created responsive web applications
• Reduced application load time by 30%
• Participated in code reviews

Junior Developer | StartupXYZ | Jun 2015 - Feb 2017
• Developed frontend components
• Fixed bugs in existing codebase
• Assisted with documentation

EDUCATION
Bachelor of Science in Computer Science
University of Technology
Graduated: May 2015
GPA: 3.8/4.0
Relevant Coursework: Data Structures, Algorithms, Database Design, Web Development

PROJECTS
E-commerce Platform | 2021
• Built full-stack e-commerce application with React and Node.js
• Implemented secure payment processing with Stripe
• Achieved 98% test coverage

Task Management App | 2019
• Developed mobile-first task management application
• Integrated with Google Calendar API
• Featured on Product Hunt
`;

// The enhanced system prompt for complex Canva resume analysis
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

// The user prompt asking for analysis
const userPrompt = `Please analyze the following resume for a software engineer. Focus particularly on how to improve the arbitrary percentage indicators for skills and provide a more effective way to present skills. Give concrete before/after examples.

${sampleResumeText}`;

// Test function for direct OpenAI API call
async function testDirectOpenAI() {
  try {
    console.log('Testing enhanced CV analysis using direct OpenAI API call...');
    console.log('This test will evaluate our new framework for reading complex Canva-style resumes');
    console.log('-'.repeat(80));
    
    console.log('Sample resume contains Canva-style elements like:');
    console.log('- Skill percentage indicators (e.g., "JavaScript (94%)")');
    console.log('- Potentially scattered information across different visual sections');
    console.log('- Formatting that might confuse standard ATS systems');
    console.log('-'.repeat(80));
    
    console.log('Starting analysis with OpenAI API...');
    
    // Call the OpenAI API directly
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });
    
    // Extract and display the analysis
    const analysis = completion.choices[0].message.content;
    
    // Log a snippet of the analysis
    console.log('\nAnalysis result:');
    console.log('-'.repeat(80));
    console.log(analysis.substring(0, 1000) + '...');
    console.log('-'.repeat(80));
    console.log('Full analysis length:', analysis.length, 'characters');
    
    console.log('\nTest completed successfully!');
    
  } catch (error) {
    console.error('Error during direct OpenAI test:', error.message);
    if (error.response) {
      console.error('API response status:', error.response.status);
      console.error('API response data:', error.response.data);
    }
  }
}

// Run the test
testDirectOpenAI();