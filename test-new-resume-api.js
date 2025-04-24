/**
 * Test Script for Enhanced Resume Analysis Features
 * 
 * This script tests the newly created endpoints for resume analysis
 * with enhanced instructions for handling design-heavy Canva resumes.
 */

import fetch from 'node-fetch';

async function testEnhancedResumeAnalysis() {
  console.log('=== Testing Enhanced Resume Analysis API ===');
  
  try {
    // Test the standard resume analysis endpoint
    console.log('\n1. Testing standard resume analysis...');
    // Get the host URL from the environment
    const host = process.env.REPL_SLUG ? 
      `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 
      'http://localhost:5000';
      
    console.log(`Using host: ${host}`);
    
    const standardResponse = await fetch(`${host}/api/test-resume-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText: `John Doe
Software Engineer with 5+ years of experience
Email: john@example.com | Phone: (123) 456-7890

SUMMARY
Experienced software engineer specializing in web development and cloud architecture.
Passionate about creating scalable applications and mentoring junior developers.

EXPERIENCE
Senior Software Engineer, Tech Solutions Inc. (2021-Present)
- Developed and maintained web applications using React, Node.js, and AWS
- Led a team of 3 developers on a major client project
- Implemented CI/CD pipelines that reduced deployment time by 40%`
      }),
    });
    
    const standardData = await standardResponse.json();
    
    if (standardData.success) {
      console.log('✓ Standard analysis successful!');
      console.log(`✓ Analysis length: ${standardData.analysisLength} characters`);
      console.log(`✓ Excerpt: ${standardData.excerpt}`);
    } else {
      console.error('✗ Standard analysis failed:', standardData.error);
    }
    
    // Test the Canva-specific resume analysis endpoint
    console.log('\n2. Testing Canva resume analysis...');
    console.log('This may take a minute as it uses gpt-4o...');
    
    const canvaResponse = await fetch('http://localhost:5000/api/test-canva-resume-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText: `SOPHIA MARTINEZ
UX/UI DESIGNER & FRONTEND DEVELOPER
sophia@example.com | (555) 123-4567 | linkedin.com/in/sophiam | portfolio: sophia-designs.com

PROFILE                                                   SKILLS
Creative and user-focused designer with                  UX/UI Design ●●●●●
4+ years of experience crafting beautiful,               Wireframing ●●●●○
accessible interfaces. Combines strong                   User Research ●●●●○`
      }),
    });
    
    const canvaData = await canvaResponse.json();
    
    if (canvaData.success) {
      console.log('✓ Canva analysis successful!');
      console.log(`✓ Analysis length: ${canvaData.analysisLength} characters`);
      console.log(`✓ Model used: ${canvaData.model}`);
      console.log(`✓ Excerpt: ${canvaData.excerpt}`);
    } else {
      console.error('✗ Canva analysis failed:', canvaData.error);
    }
    
    console.log('\n=== Test Complete ===');
    
  } catch (error) {
    console.error('Error running tests:', error.message);
  }
}

// Run the tests
testEnhancedResumeAnalysis();