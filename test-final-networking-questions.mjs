/**
 * Final Test Script for Networking Question Detection
 * 
 * Tests both LinkedIn-specific networking and platform comparison questions
 * to ensure they provide appropriate, tailored responses.
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

/**
 * Test a specific question and analyze the response
 */
async function testQuestion(question, expectedKeywords, description) {
  console.log(`\n--- Testing: "${question}" ---`);
  console.log(`Expected: ${description}`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/musk/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: question,
        userId: 2
      })
    });

    if (!response.ok) {
      console.log(`❌ HTTP Error: ${response.status}`);
      return;
    }

    const data = await response.json();
    const message = data.message;

    console.log(`✅ Response received (${message.length} characters)`);
    
    // Check for expected keywords
    const foundKeywords = expectedKeywords.filter(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (foundKeywords.length > 0) {
      console.log(`✅ Contains expected content: ${foundKeywords.join(', ')}`);
    } else {
      console.log(`⚠️  Missing expected keywords: ${expectedKeywords.join(', ')}`);
    }

    // Check response length to ensure it's detailed
    if (message.length > 500) {
      console.log(`✅ Response is detailed and specific`);
    } else {
      console.log(`⚠️  Response seems too brief (${message.length} chars)`);
    }

    // Show first few lines of response
    console.log(`Response preview:\n${message.split('\n').slice(0, 3).join('\n')}...`);

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

/**
 * Run all networking question tests
 */
async function runNetworkingTests() {
  console.log('=== Final Networking Question Tests ===');
  
  // Test 1: LinkedIn-specific networking with typo
  await testQuestion(
    "how can I netowrk on LinkedIn?",
    ["LinkedIn Networking Strategy", "Directors", "Professional Summary", "Content Strategy"],
    "LinkedIn-specific networking guidance for directors"
  );

  // Test 2: Platform comparison question
  await testQuestion(
    "what is the best platform from all these?",
    ["Brandentifier is your best", "Platform Ranking", "Why Brandentifier First", "Strategic Approach"],
    "Brandentifier-first platform comparison with ranking"
  );

  // Test 3: Alternative platform comparison phrasing
  await testQuestion(
    "which platform should I use for networking?",
    ["Brandentifier", "platform", "networking", "best"],
    "Platform recommendation prioritizing Brandentifier"
  );

  // Test 4: General networking question
  await testQuestion(
    "how to network more effectively?",
    ["Strategic Networking", "Brandentifier", "professional networking", "industry connections"],
    "General networking advice with Brandentifier integration"
  );

  // Test 5: Networking platform recommendation
  await testQuestion(
    "recommend the best networking platform",
    ["Brandentifier", "platform", "networking", "recommendation"],
    "Direct platform recommendation"
  );

  console.log('\n=== Final Networking Tests Complete ===');
}

// Run the tests
runNetworkingTests().catch(console.error);