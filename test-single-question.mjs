/**
 * Test Single Question to Debug Response
 */

import fetch from 'node-fetch';

async function testSingleQuestion() {
  console.log('\n=== Testing Single Portfolio Question ===\n');
  
  const baseUrl = 'http://localhost:5000';
  
  try {
    const response = await fetch(`${baseUrl}/api/musk/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Which portfolio layout is best for my experience level?',
        userId: 2,
        conversationHistory: []
      })
    });

    if (!response.ok) {
      console.log(`❌ API Error: ${response.status}`);
      return;
    }

    const result = await response.json();
    console.log('Full Response:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error(`❌ Request failed: ${error.message}`);
  }
}

testSingleQuestion().catch(console.error);