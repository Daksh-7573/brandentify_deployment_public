/**
 * Test Question-Specific Responses
 * 
 * Verifies that different question types get different, relevant responses
 */

import fetch from 'node-fetch';

async function testQuestionSpecificResponses() {
  console.log('\n=== Testing Question-Specific Responses ===\n');
  
  const baseUrl = 'http://localhost:5000';
  
  // Different types of questions that should get different responses
  const testQuestions = [
    {
      question: 'Which portfolio layout is best for my experience level?',
      expectedKeywords: ['Corporate Executive', 'Strategic Leadership', 'director-level']
    },
    {
      question: 'How can I improve my skills presentation?',
      expectedKeywords: ['Technical Skills Enhancement', 'Leadership Skills', 'skill progression']
    },
    {
      question: 'How to showcase my experience better?',
      expectedKeywords: ['Structure Each Role', 'Director-Level Focus', 'business challenge']
    },
    {
      question: 'How can I network more effectively?',
      expectedKeywords: ['Strategic Networking', 'C-suite executives', 'Brandentifier profile']
    }
  ];

  for (const test of testQuestions) {
    console.log(`\n--- Testing: "${test.question}" ---`);
    
    try {
      const response = await fetch(`${baseUrl}/api/musk/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: test.question,
          userId: 2,
          conversationHistory: []
        })
      });

      if (!response.ok) {
        console.log(`❌ API Error: ${response.status}`);
        continue;
      }

      const result = await response.json();
      const responseText = result.message || result.response || '';
      
      console.log('✅ Response received');
      
      // Check if response contains expected keywords for this question type
      const keywordsFound = test.expectedKeywords.filter(keyword => 
        responseText.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (keywordsFound.length > 0) {
        console.log(`✅ Contains expected content: ${keywordsFound.join(', ')}`);
      } else {
        console.log('❌ Missing expected keywords');
        console.log('Expected:', test.expectedKeywords.join(', '));
        console.log('Response preview:', responseText.substring(0, 100) + '...');
      }
      
      // Check response length (should be substantial and specific)
      if (responseText.length > 200) {
        console.log('✅ Response is detailed and specific');
      } else {
        console.log('⚠️ Response seems too short for specific advice');
      }
      
    } catch (error) {
      console.error(`❌ Request failed: ${error.message}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n=== Question-Specific Response Test Complete ===');
}

// Run the test
testQuestionSpecificResponses().catch(console.error);