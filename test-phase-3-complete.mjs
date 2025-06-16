/**
 * Test Phase 3 Complete Enhanced Musk Intelligence System
 * 
 * Tests all advanced AI capabilities: predictive modeling, cross-user intelligence,
 * emotional intelligence, dynamic persona switching, and proactive suggestions
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
    
    console.log(`✅ Response: ${data.response.length} chars`);
    console.log(`🎭 Persona: ${data.metadata?.persona || 'unknown'}`);
    console.log(`🔥 Confidence: ${Math.round((data.metadata?.confidence || 0) * 100)}%`);
    
    if (data.metadata?.contextUsed) {
      const context = data.metadata.contextUsed;
      console.log(`📊 Profile: ${context.profileCompleteness}%`);
      
      if (context.personaSelected) {
        console.log(`🎨 Selected: ${context.personaSelected}`);
      }
      
      if (context.conversationStage) {
        console.log(`💬 Stage: ${context.conversationStage}`);
      }
      
      if (context.userPatternConfidence) {
        console.log(`🧠 Learning: ${Math.round(context.userPatternConfidence * 100)}%`);
      }
    }
    
    if (data.metadata?.proactiveSuggestions?.length > 0) {
      console.log(`💡 Suggestions: ${data.metadata.proactiveSuggestions.join(', ')}`);
    }
    
    console.log(`💬 Preview: ${data.response.substring(0, 150)}...`);
    
    return data;
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return null;
  }
}

async function runPhase3CompleteTests() {
  console.log('🚀 Testing Phase 3 Complete Enhanced Musk Intelligence System\n');
  console.log('Testing all capabilities: Predictive Modeling, Cross-User Intelligence, Emotional Intelligence\n');
  
  const userId = 2;
  
  // Test 1: Emotional Intelligence - Stress Detection
  console.log('\n=== Test 1: Emotional Intelligence - Stress Detection ===');
  await testMuskResponse(userId, "I'm feeling really overwhelmed and stressed about my career. I don't know what direction to take and I'm worried about making the wrong choice. Everything feels uncertain.");
  
  // Test 2: Predictive Modeling - Career Transition
  console.log('\n=== Test 2: Predictive Career Modeling ===');
  await testMuskResponse(userId, "I've been in my current role as UX Research Director for 4 years. What do you think my next career move should be?");
  
  // Test 3: Cross-User Intelligence - Peer Insights
  console.log('\n=== Test 3: Cross-User Intelligence ===');
  await testMuskResponse(userId, "How are other professionals in my industry handling the transition to remote work and digital transformation?");
  
  // Test 4: Emotional + Predictive Combined
  console.log('\n=== Test 4: Emotional + Predictive Combined ===');
  await testMuskResponse(userId, "I'm excited about potentially moving into an executive role, but I'm also nervous about whether I'm ready for that level of responsibility.");
  
  // Test 5: All Systems Integration
  console.log('\n=== Test 5: Complete Integration Test ===');
  await testMuskResponse(userId, "Based on everything we've discussed, what would you recommend as my strategic career plan for the next 2 years? I want to make sure I'm positioned for success.");
  
  // Test 6: Follow-up with Reference Resolution
  console.log('\n=== Test 6: Reference Resolution + Emotional Context ===');
  await testMuskResponse(userId, "That sounds good, but I'm still worried about the timeline. Is that realistic?");
  
  // Test 7: Persona Switching Test
  console.log('\n=== Test 7: Dynamic Persona Switching ===');
  await testMuskResponse(userId, "I need specific actionable steps I can start implementing today to advance my career. What should I do right now?");
  
  console.log('\n✅ Phase 3 Complete Testing Finished!');
  console.log('\nExpected Phase 3 Capabilities:');
  console.log('- Emotional state detection and supportive responses');
  console.log('- Predictive career insights based on role and industry');
  console.log('- Cross-user recommendations from similar professionals');
  console.log('- Dynamic persona selection based on message context');
  console.log('- Comprehensive conversation memory and reference resolution');
  console.log('- Integrated proactive suggestions with emotional awareness');
}

// Run the comprehensive tests
runPhase3CompleteTests().catch(console.error);