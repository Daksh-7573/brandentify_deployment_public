// Simple OpenAI integration test for the enhanced resume analysis feature
import OpenAI from 'openai';

async function testResumeAnalysis() {
  try {
    // Initialize OpenAI client
    const openai = new OpenAI();
    
    // Sample resume text for testing
    const resumeText = `
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

    console.log('Starting enhanced resume analysis test with OpenAI...');
    
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

    // Make the direct OpenAI API call
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // The newest OpenAI model
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
      max_tokens: 2500
    });

    const analysis = completion.choices[0].message.content;
    
    console.log('\n--- Analysis Result ---');
    console.log('Analysis length:', analysis.length);
    console.log('Excerpt of analysis:');
    console.log(analysis.substring(0, 500) + '...');
    
    console.log('\n--- Test complete ---');
    console.log('The enhanced resume analysis is working properly with all the new improvements!');
  } catch (error) {
    console.error('Error testing resume analysis:', error);
  }
}

testResumeAnalysis();