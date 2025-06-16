/**
 * Test Portfolio Question Specifically
 */

import fetch from 'node-fetch';

async function testPortfolioQuestion() {
  console.log('\n=== Testing Portfolio Question Specifically ===\n');
  
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
    console.log('Full Portfolio Response:');
    console.log(result.message);
    
    // Check if it contains portfolio-specific content
    const hasPortfolioContent = result.message.includes('Corporate Executive') || 
                               result.message.includes('Strategic Leadership') ||
                               result.message.includes('portfolio layout');
    
    const hasGenericContent = result.message.includes('specific ways to make') ||
                             result.message.includes('here are specific ways');
    
    console.log('\n--- Analysis ---');
    console.log('Contains portfolio content:', hasPortfolioContent);
    console.log('Contains generic content:', hasGenericContent);
    
    if (hasPortfolioContent) {
      console.log('✅ Portfolio question working correctly!');
    } else if (hasGenericContent) {
      console.log('❌ Portfolio question returning generic advice');
    } else {
      console.log('⚠️ Portfolio question returning unexpected response');
    }
    
  } catch (error) {
    console.error(`❌ Request failed: ${error.message}`);
  }
}

testPortfolioQuestion().catch(console.error);