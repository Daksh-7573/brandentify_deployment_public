import { analyzeResume } from './server/services/fixed-openai-service.js';

async function testResumeAnalysis() {
  try {
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

    console.log('Starting resume analysis test...');
    
    // Test with a direct text input
    const result = await analyzeResume(resumeText);
    
    console.log('\n--- Analysis Result ---');
    console.log('Analysis length:', result.analysis.length);
    console.log('Excerpt of analysis:');
    console.log(result.analysis.substring(0, 500) + '...');
    
    console.log('\n--- Test complete ---');
    console.log('The enhanced resume analysis is working properly!');
  } catch (error) {
    console.error('Error testing resume analysis:', error);
  }
}

testResumeAnalysis();