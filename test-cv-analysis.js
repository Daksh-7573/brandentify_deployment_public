/**
 * Test script for the enhanced CV analysis feature
 * Tests the improved framework for reading complex Canva resumes
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeResume } from './server/services/fixed-openai-service.js';

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

// Test function for enhanced CV analysis
async function testCVAnalysis() {
  try {
    console.log('Testing enhanced CV analysis with sample resume text...');
    console.log('This test will evaluate the new framework for reading complex Canva-style resumes');
    console.log('-'.repeat(80));
    
    console.log('Sample resume contains Canva-style elements like:');
    console.log('- Skill percentage indicators (e.g., "JavaScript (94%)")');
    console.log('- Potentially scattered information across different visual sections');
    console.log('- Formatting that might confuse standard ATS systems');
    console.log('-'.repeat(80));
    
    console.log('Starting analysis with OpenAI API...');
    
    // Call the analyzeResume function with sample text
    const result = await analyzeResume(sampleResumeText);
    
    // If successful, log a snippet of the analysis
    console.log('\nAnalysis result:');
    console.log('-'.repeat(80));
    console.log(result.analysis.substring(0, 1000) + '...');
    console.log('-'.repeat(80));
    console.log('Full analysis length:', result.analysis.length, 'characters');
    
    console.log('\nTest completed successfully!');
    
  } catch (error) {
    console.error('Error during CV analysis test:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testCVAnalysis();