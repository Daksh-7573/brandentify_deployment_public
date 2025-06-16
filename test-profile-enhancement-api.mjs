/**
 * Test Profile Enhancement Detection via API
 * 
 * Tests the enhanced Musk system's ability to detect profile enhancement
 * questions and provide specific, personalized advice.
 */

import fetch from 'node-fetch';

async function testProfileEnhancementAPI() {
  console.log('\n=== Testing Profile Enhancement Detection via API ===\n');
  
  const baseUrl = 'http://localhost:5000';
  
  // Test messages for profile enhancement detection
  const testMessages = [
    'How can I make my profile more compelling?',
    'What can I do to showcase my experience better?',
    'How to improve my professional profile?',
    'Ways to enhance my career profile?',
    'Make my profile stand out more'
  ];

  for (const message of testMessages) {
    console.log(`\n--- Testing: "${message}" ---`);
    
    try {
      const response = await fetch(`${baseUrl}/api/musk/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          userId: 2, // Using existing user ID
          conversationHistory: []
        })
      });

      if (!response.ok) {
        console.log(`❌ API Error: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.log('Error details:', errorText.substring(0, 200));
        continue;
      }

      const result = await response.json();
      
      console.log('✅ Response received');
      console.log(`Enhanced: ${result.enhanced ? 'Yes' : 'No'}`);
      console.log(`Intent: ${result.intent?.type || 'unknown'}`);
      console.log(`Confidence: ${result.confidence || 'unknown'}`);
      
      // Check for specific profile enhancement advice
      const responseText = result.message || result.response || '';
      const hasSpecificAdvice = responseText.includes('specific ways') || 
                               responseText.includes('Experience Enhancement') ||
                               responseText.includes('Skills Positioning') ||
                               responseText.includes('compelling') ||
                               responseText.includes('enhance') ||
                               responseText.includes('showcase');
      
      if (hasSpecificAdvice) {
        console.log('✅ Contains specific profile enhancement advice');
      } else {
        console.log('❌ Missing specific profile enhancement advice');
        console.log('Response preview:', responseText.substring(0, 150) + '...');
      }
      
      // Check Brandentifier prioritization
      const suggestions = result.proactiveSuggestions || [];
      if (suggestions.length > 0) {
        const firstSuggestion = suggestions[0] || '';
        const hasFirstSuggestion = firstSuggestion.toLowerCase().includes('brandentifier') || 
                                   firstSuggestion.toLowerCase().includes('profile');
        if (hasFirstSuggestion) {
          console.log('✅ Brandentifier suggestions prioritized');
        } else {
          console.log('⚠️ First suggestion:', firstSuggestion.substring(0, 50) + '...');
        }
      } else {
        console.log('ℹ️ No proactive suggestions in response');
      }
      
    } catch (error) {
      console.error(`❌ Request failed: ${error.message}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n=== API Test Complete ===');
}

// Run the test
testProfileEnhancementAPI().catch(console.error);