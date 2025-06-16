/**
 * Test Skills Question Specifically
 */

import fetch from 'node-fetch';

async function testSkillsQuestion() {
  console.log('\n=== Testing Skills Question Specifically ===\n');
  
  const baseUrl = 'http://localhost:5000';
  
  try {
    const response = await fetch(`${baseUrl}/api/musk/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'How can I improve my skills presentation?',
        userId: 2,
        conversationHistory: []
      })
    });

    if (!response.ok) {
      console.log(`❌ API Error: ${response.status}`);
      return;
    }

    const result = await response.json();
    console.log('Full Skills Response:');
    console.log(result.message);
    
    // Check if it contains skills-specific content
    const hasSkillsContent = result.message.includes('Technical Skills Enhancement') || 
                            result.message.includes('Leadership Skills') ||
                            result.message.includes('skill progression');
    
    const hasPortfolioContent = result.message.includes('Corporate Executive') ||
                               result.message.includes('portfolio layout');
    
    console.log('\n--- Analysis ---');
    console.log('Contains skills content:', hasSkillsContent);
    console.log('Contains portfolio content:', hasPortfolioContent);
    
    if (hasSkillsContent) {
      console.log('✅ Skills question working correctly!');
    } else if (hasPortfolioContent) {
      console.log('❌ Skills question returning portfolio advice');
    } else {
      console.log('⚠️ Skills question returning generic advice');
    }
    
  } catch (error) {
    console.error(`❌ Request failed: ${error.message}`);
  }
}

testSkillsQuestion().catch(console.error);