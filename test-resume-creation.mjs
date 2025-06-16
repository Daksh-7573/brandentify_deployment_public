/**
 * Test Script for Resume Creation Question
 * 
 * This script tests the resume creation functionality by directly testing
 * the enhanced Musk intelligence system.
 */

import { generateContextualFallback } from './server/services/enhanced-musk-intelligence.js';

async function testResumeCreation() {
  console.log('=== Testing Resume Creation Question ===\n');
  
  // Mock user context similar to what the system uses
  const mockContext = {
    user: {
      name: 'Nishant Chopra',
      title: 'Senior Director - UX Research',
      industry: 'Hospitality',
      experienceLevel: 'senior',
      profileCompleteness: { score: 88 }
    }
  };
  
  const message = 'how can I make resume';
  
  try {
    const response = await generateContextualFallback(message, mockContext);
    
    console.log('Full Resume Response:');
    console.log(response);
    console.log('\n--- Analysis ---');
    
    // Check if it contains resume-specific content
    const containsResumeContent = response.includes('Resume Structure') || 
                                  response.includes('Executive Summary') || 
                                  response.includes('ATS optimization');
    
    // Check if it contains generic profile content (should NOT)
    const containsGenericContent = response.includes('make your profile more compelling') ||
                                   response.includes('Experience Enhancement');
    
    console.log(`Contains resume content: ${containsResumeContent}`);
    console.log(`Contains generic content: ${containsGenericContent}`);
    
    if (containsResumeContent && !containsGenericContent) {
      console.log('✅ Resume question working correctly!');
    } else {
      console.log('❌ Resume question still returning generic advice');
    }
    
  } catch (error) {
    console.error('Error testing resume question:', error);
  }
}

testResumeCreation();