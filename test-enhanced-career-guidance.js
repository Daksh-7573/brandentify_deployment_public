/**
 * Test Script for Enhanced Career Guidance API
 * 
 * This script tests the Musk AI Enhanced API that provides data-driven
 * career guidance using trend graph data.
 */

import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000';
const TEST_USER_ID = 1; // Adjust this to a valid user ID in your system

/**
 * Test generating enhanced career guidance
 */
async function testEnhancedCareerGuidance() {
  console.log('\n===== Testing Enhanced Career Guidance API =====');
  
  // Example career questions
  const careerQuestions = [
    "What skills should I learn to advance in my career?",
    "How can I transition to a more senior role?",
    "Am I missing any essential skills for my industry?"
  ];
  
  // Randomly select a question
  const randomQuestion = careerQuestions[Math.floor(Math.random() * careerQuestions.length)];
  console.log(`Using career question: "${randomQuestion}"`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/musk-enhanced/career-guidance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: TEST_USER_ID,
        query: randomQuestion,
        model: 'openai' // Use OpenAI to avoid potential Anthropic API issues
      })
    });
    
    console.log('Status:', response.status);
    
    try {
      const data = await response.json();
      console.log('Response header:', {
        success: data.success,
        message: data.message,
        insightsUsed: data.insightsUsed
      });
      
      // Only show the first 300 chars of the guidance to keep output manageable
      const guidancePreview = data.guidance ? 
        `${data.guidance.substring(0, 300)}... (truncated)` : 
        'No guidance provided';
      
      console.log('\nGuidance preview:', guidancePreview);
      
      if (response.status === 200 && data.success) {
        console.log('✅ Enhanced career guidance test passed');
        return true;
      } else {
        console.log('❌ Enhanced career guidance test failed');
        return false;
      }
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      console.log('❌ Enhanced career guidance test failed - Response parsing error');
      return false;
    }
  } catch (error) {
    console.error('Error testing enhanced career guidance:', error);
    console.log('❌ Enhanced career guidance test failed - Request error');
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('Starting Enhanced Career Guidance API tests...');
  
  await testEnhancedCareerGuidance();
  
  console.log('\nAll Enhanced Career Guidance API tests completed!');
}

// Run the tests
runAllTests();