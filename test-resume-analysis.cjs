/**
 * Test script for the enhanced resume analysis feature
 * This script directly tests the new CV/resume analysis framework
 */

const { analyzeResume } = require('./server/services/fixed-openai-service');

async function testResumeAnalysis() {
  try {
    // Sample resume for testing
    const sampleResume = `John Doe
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
Soft Skills: Team leadership, Communication, Problem-solving`;

    // Test with standard input
    console.log('Testing resume analysis with standard input...');
    const result = await analyzeResume(sampleResume);
    
    console.log('✅ Analysis successful!');
    console.log(`📝 Response length: ${result.length} characters`);
    console.log('\n📋 Sample of response:');
    console.log('-'.repeat(80));
    console.log(result.substring(0, 500) + '...');
    console.log('-'.repeat(80));

    // Test with target role/industry
    console.log('\nTesting resume analysis with target role and industry...');
    const targetRoleResult = await analyzeResume({
      resumeTextStart: sampleResume,
      targetRole: 'Senior Frontend Developer',
      targetIndustry: 'FinTech'
    });
    
    console.log('✅ Targeted analysis successful!');
    console.log(`📝 Response length: ${targetRoleResult.length} characters`);
    console.log('\n📋 Sample of targeted response:');
    console.log('-'.repeat(80));
    console.log(targetRoleResult.substring(0, 500) + '...');
    console.log('-'.repeat(80));

  } catch (error) {
    console.error('❌ Error testing resume analysis:', error);
  }
}

// Run the test
testResumeAnalysis();