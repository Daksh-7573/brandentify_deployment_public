/**
 * Test Script for Resume Creation Question
 * 
 * This script tests that "how can I make resume" gets specific resume advice
 * instead of generic profile enhancement advice.
 */

async function testResumeQuestion() {
  try {
    console.log('=== Testing Resume Creation Question ===\n');
    
    const response = await fetch('http://localhost:3000/api/musk/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'how can I make resume',
        userId: 2 // Using the test user
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Full Resume Response:');
    console.log(data.message);
    console.log('\n--- Analysis ---');
    
    // Check if it contains resume-specific content
    const containsResumeContent = data.message.includes('Resume Structure') || 
                                  data.message.includes('Executive Summary') || 
                                  data.message.includes('ATS optimization');
    
    // Check if it contains generic profile content (should NOT)
    const containsGenericContent = data.message.includes('make your profile more compelling') ||
                                   data.message.includes('Experience Enhancement');
    
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

testResumeQuestion();
