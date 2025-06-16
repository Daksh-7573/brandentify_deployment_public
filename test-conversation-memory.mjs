/**
 * Test Script for Conversation Memory and Follow-Up Handling
 * 
 * This script tests the enhanced conversation context system including:
 * - Follow-up question detection
 * - Clarification prompts for vague messages
 * - Active guidance for complex tasks
 * - Context-aware response generation
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

/**
 * Test a conversation sequence with follow-up questions
 */
async function testConversationSequence() {
  console.log('=== Testing Conversation Memory System ===\n');

  // Test 1: Initial question about networking
  console.log('--- Test 1: Initial networking question ---');
  await testQuestion("How can I improve my networking?", "Initial networking advice");

  // Test 2: Vague follow-up question
  console.log('\n--- Test 2: Vague follow-up question ---');
  await testQuestion("What about LinkedIn?", "Follow-up about LinkedIn networking");

  // Test 3: Very vague question that needs clarification
  console.log('\n--- Test 3: Question needing clarification ---');
  await testQuestion("both", "Should trigger clarification prompt");

  // Test 4: Complex task requiring active guidance
  console.log('\n--- Test 4: Complex task requiring guidance ---');
  await testQuestion("Create a resume for data science role", "Should trigger active guidance");

  // Test 5: Follow-up with pronoun reference
  console.log('\n--- Test 5: Pronoun reference follow-up ---');
  await testQuestion("That sounds good, but how do I do it?", "Should expand pronoun reference");

  console.log('\n=== Conversation Memory Tests Complete ===');
}

/**
 * Test individual question and analyze response
 */
async function testQuestion(question, expectedBehavior) {
  console.log(`Question: "${question}"`);
  console.log(`Expected: ${expectedBehavior}`);
  
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
    
    // Analyze response characteristics
    if (message.includes('could you') || message.includes('clarify') || message.includes('more specific')) {
      console.log('🔍 Clarification prompt detected');
    } else if (message.includes('First, let me understand') || message.includes('could you share:')) {
      console.log('📋 Active guidance detected');
    } else if (message.includes('Building on') || message.includes('follow-up')) {
      console.log('🔗 Context-aware follow-up detected');
    } else {
      console.log('💬 Standard response');
    }

    // Show response preview
    console.log(`Preview: ${message.split('\n')[0].substring(0, 100)}...`);

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

/**
 * Test specific conversation patterns
 */
async function testSpecificPatterns() {
  console.log('\n=== Testing Specific Follow-Up Patterns ===\n');

  const patterns = [
    {
      question: "Can I do both?",
      expectedType: "clarification",
      description: "Should ask what 'both' refers to"
    },
    {
      question: "What about that?",
      expectedType: "clarification", 
      description: "Should ask what 'that' refers to"
    },
    {
      question: "Write my resume",
      expectedType: "guidance",
      description: "Should request structured information"
    },
    {
      question: "Yes",
      expectedType: "clarification",
      description: "Should ask for more details"
    },
    {
      question: "How about design roles?",
      expectedType: "follow-up",
      description: "Should provide context-aware response"
    }
  ];

  for (const pattern of patterns) {
    console.log(`--- Testing: "${pattern.question}" ---`);
    console.log(`Expected type: ${pattern.expectedType}`);
    console.log(`Description: ${pattern.description}`);
    
    await testQuestion(pattern.question, pattern.description);
    console.log('');
  }
}

// Run the tests
async function runAllTests() {
  try {
    await testConversationSequence();
    await testSpecificPatterns();
  } catch (error) {
    console.error('Test execution failed:', error);
  }
}

runAllTests();