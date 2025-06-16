/**
 * Test Phase 2 Enhanced Musk Intelligence System
 * 
 * Tests dynamic persona switching, proactive suggestions, 
 * learning pattern recognition, and conversation memory integration
 */

const API_BASE = 'http://localhost:5000/api';

async function testMuskResponse(userId, message, context = {}) {
  try {
    console.log(`\n🧪 Testing: "${message}"`);
    
    const response = await fetch(`${API_BASE}/musk/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        message,
        context
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log(`✅ Response length: ${data.response.length} characters`);
    console.log(`🎭 Persona: ${data.metadata?.persona || 'unknown'}`);
    console.log(`🔥 Confidence: ${Math.round((data.metadata?.confidence || 0) * 100)}%`);
    console.log(`💡 Proactive suggestions: ${data.metadata?.proactiveSuggestions?.length || 0}`);
    
    if (data.metadata?.proactiveSuggestions?.length > 0) {
      console.log(`   - ${data.metadata.proactiveSuggestions.join('\n   - ')}`);
    }
    
    if (data.metadata?.contextUsed?.personaSelected) {
      console.log(`🎨 Selected persona: ${data.metadata.contextUsed.personaSelected}`);
    }
    
    if (data.metadata?.contextUsed?.conversationStage) {
      console.log(`📊 Conversation stage: ${data.metadata.contextUsed.conversationStage}`);
    }
    
    console.log(`💬 Response: ${data.response.substring(0, 200)}...`);
    
    return data;
    
  } catch (error) {
    console.error(`❌ Error testing message "${message}":`, error.message);
    return null;
  }
}

async function runPhase2Tests() {
  console.log('🚀 Testing Phase 2 Enhanced Musk Intelligence System\n');
  
  const userId = 2; // Test user ID
  
  // Test 1: Mentor Persona - Emotional/Support Questions
  console.log('\n=== Test 1: Mentor Persona Activation ===');
  await testMuskResponse(userId, "I'm feeling really confused about my career direction. I'm not sure what path to take and feel overwhelmed by all the options. Can you help guide me?");
  
  // Test 2: Strategist Persona - Analytical Questions
  console.log('\n=== Test 2: Strategist Persona Activation ===');
  await testMuskResponse(userId, "Can you analyze the current market trends in the hospitality industry and compare different career opportunities? I need data-driven insights for strategic planning.");
  
  // Test 3: Coach Persona - Action-Oriented Questions
  console.log('\n=== Test 3: Coach Persona Activation ===');
  await testMuskResponse(userId, "I want to improve my leadership skills immediately. What specific actions should I take to start building my executive presence today?");
  
  // Test 4: Follow-up Message with Reference Resolution
  console.log('\n=== Test 4: Reference Resolution ===');
  await testMuskResponse(userId, "How do I implement that approach?");
  
  // Test 5: Networking Question for Proactive Suggestions
  console.log('\n=== Test 5: Proactive Suggestions ===');
  await testMuskResponse(userId, "I need to expand my professional network in the hospitality industry. What's the best way to connect with senior directors?");
  
  // Test 6: Short Message for Clarification
  console.log('\n=== Test 6: Clarification Request ===');
  await testMuskResponse(userId, "Help");
  
  // Test 7: Career Change Discussion
  console.log('\n=== Test 7: Career Transition Context ===');
  await testMuskResponse(userId, "I'm thinking about switching from hospitality to tech. How should I plan this transition while maintaining my director-level position?");
  
  // Test 8: Skill Development Question
  console.log('\n=== Test 8: Skill Development Focus ===');
  await testMuskResponse(userId, "What new skills should I develop to stay competitive as a UX Research Director in 2025?");
  
  console.log('\n✅ Phase 2 Enhanced Musk Intelligence Testing Complete!');
  console.log('\nExpected Results:');
  console.log('- Different personas selected based on question types');
  console.log('- Proactive suggestions generated contextually');
  console.log('- Reference resolution for follow-up messages');
  console.log('- Learning pattern recognition improving over conversation');
  console.log('- Brandentifier-first recommendations in all responses');
}

// Run the tests
runPhase2Tests().catch(console.error);