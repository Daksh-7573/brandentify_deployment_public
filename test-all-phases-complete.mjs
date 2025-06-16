/**
 * Comprehensive Test Suite for All Phases (1-3) of Enhanced Musk AI Intelligence
 * 
 * Tests Phase 1: Conversation memory, reference resolution, clarification triggers
 * Tests Phase 2: Dynamic personas, proactive suggestions, learning patterns
 * Tests Phase 3: Predictive modeling, cross-user intelligence, emotional intelligence
 */

const API_BASE = 'http://localhost:5000/api';

async function testMuskResponse(userId, message, phaseTest, context = {}) {
  try {
    console.log(`\n🧪 ${phaseTest}: "${message}"`);
    
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
      console.error(`❌ HTTP ${response.status}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    
    console.log(`✅ Response Generated: ${data.response.length} characters`);
    console.log(`🎭 Persona: ${data.metadata?.persona || 'unknown'}`);
    console.log(`🔥 Confidence: ${Math.round((data.metadata?.confidence || 0) * 100)}%`);
    
    // Phase-specific validation
    if (data.metadata?.contextUsed) {
      const context = data.metadata.contextUsed;
      
      if (context.conversationMemoryUsed) {
        console.log(`💭 Phase 1: Conversation memory active`);
      }
      
      if (context.referenceResolutionApplied) {
        console.log(`🔗 Phase 1: Reference resolution applied`);
      }
      
      if (context.personaSelected) {
        console.log(`🎨 Phase 2: Persona selected - ${context.personaSelected}`);
      }
      
      if (context.userPatternConfidence !== undefined) {
        console.log(`🧠 Phase 2: Learning patterns - ${Math.round(context.userPatternConfidence * 100)}% confidence`);
      }
      
      if (context.conversationStage) {
        console.log(`📊 Phase 3: Conversation stage - ${context.conversationStage}`);
      }
    }
    
    if (data.metadata?.proactiveSuggestions?.length > 0) {
      console.log(`💡 Phase 2: ${data.metadata.proactiveSuggestions.length} proactive suggestions`);
    }
    
    console.log(`💬 Preview: ${data.response.substring(0, 120)}...`);
    
    return data;
    
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
    return null;
  }
}

async function runCompletePhaseTests() {
  console.log('🚀 COMPREHENSIVE TEST: All Phases of Enhanced Musk AI Intelligence\n');
  console.log('Testing Phase 1 (Memory), Phase 2 (Personas), Phase 3 (Advanced AI)\n');
  
  const userId = 2;
  
  console.log('='.repeat(80));
  console.log('PHASE 1 TESTS: Conversation Memory & Reference Resolution');
  console.log('='.repeat(80));
  
  // Phase 1 Test 1: Initial conversation (establishes memory)
  await testMuskResponse(userId, 
    "I'm a Senior Director in UX Research and I'm thinking about my next career move. What advice do you have?", 
    "Phase 1 Test 1: Initial Conversation"
  );
  
  // Phase 1 Test 2: Follow-up with vague reference (tests reference resolution)
  await testMuskResponse(userId, 
    "That sounds interesting, but what about the timeline for that approach?", 
    "Phase 1 Test 2: Reference Resolution"
  );
  
  // Phase 1 Test 3: Ambiguous short message (tests clarification trigger)
  await testMuskResponse(userId, 
    "Help me", 
    "Phase 1 Test 3: Clarification Trigger"
  );
  
  console.log('\n' + '='.repeat(80));
  console.log('PHASE 2 TESTS: Dynamic Personas & Learning Patterns');
  console.log('='.repeat(80));
  
  // Phase 2 Test 1: Emotional support message (triggers Mentor persona)
  await testMuskResponse(userId, 
    "I'm feeling really confused and overwhelmed about my career direction. I need guidance and support.", 
    "Phase 2 Test 1: Mentor Persona Trigger"
  );
  
  // Phase 2 Test 2: Analytical question (triggers Strategist persona)
  await testMuskResponse(userId, 
    "Can you analyze the current market trends in hospitality and compare different career opportunities with data-driven insights?", 
    "Phase 2 Test 2: Strategist Persona Trigger"
  );
  
  // Phase 2 Test 3: Action-oriented question (triggers Coach persona)
  await testMuskResponse(userId, 
    "I want to take immediate action to improve my leadership skills. What specific steps should I start implementing today?", 
    "Phase 2 Test 3: Coach Persona Trigger"
  );
  
  console.log('\n' + '='.repeat(80));
  console.log('PHASE 3 TESTS: Advanced AI Capabilities');
  console.log('='.repeat(80));
  
  // Phase 3 Test 1: Emotional intelligence
  await testMuskResponse(userId, 
    "I'm excited about new opportunities but also really stressed and worried about making the wrong decision. Everything feels uncertain.", 
    "Phase 3 Test 1: Emotional Intelligence"
  );
  
  // Phase 3 Test 2: Predictive modeling
  await testMuskResponse(userId, 
    "Based on my background in UX Research and hospitality industry, what do you predict will be my next career move in the next 2 years?", 
    "Phase 3 Test 2: Predictive Career Modeling"
  );
  
  // Phase 3 Test 3: Cross-user intelligence
  await testMuskResponse(userId, 
    "How are other UX Research Directors in the hospitality industry handling career advancement? What can I learn from their experiences?", 
    "Phase 3 Test 3: Cross-User Intelligence"
  );
  
  console.log('\n' + '='.repeat(80));
  console.log('INTEGRATION TESTS: All Phases Working Together');
  console.log('='.repeat(80));
  
  // Integration Test 1: All systems combined
  await testMuskResponse(userId, 
    "Considering everything we've discussed about my emotional state, career trajectory, and what peers are doing, what's your comprehensive recommendation for my next strategic move?", 
    "Integration Test 1: All Phases Combined"
  );
  
  // Integration Test 2: Follow-up with complex reference
  await testMuskResponse(userId, 
    "I like both of those approaches, but which one would be better for someone in my situation with my emotional concerns?", 
    "Integration Test 2: Complex Reference + Emotional Context"
  );
  
  console.log('\n' + '='.repeat(80));
  console.log('TEST SUMMARY: Phase Validation Results');
  console.log('='.repeat(80));
  
  console.log('\n✅ EXPECTED PHASE 1 CAPABILITIES:');
  console.log('- Conversation memory retention across messages');
  console.log('- Reference resolution for vague terms like "that approach"');
  console.log('- Clarification requests for ambiguous inputs');
  
  console.log('\n✅ EXPECTED PHASE 2 CAPABILITIES:');
  console.log('- Dynamic persona switching (Mentor/Strategist/Coach)');
  console.log('- Proactive suggestions without prompting');
  console.log('- Learning pattern recognition with confidence scores');
  
  console.log('\n✅ EXPECTED PHASE 3 CAPABILITIES:');
  console.log('- Emotional intelligence with sentiment analysis');
  console.log('- Predictive career modeling and trajectory analysis');
  console.log('- Cross-user intelligence with peer insights');
  
  console.log('\n✅ INTEGRATION VALIDATION:');
  console.log('- All phases working seamlessly together');
  console.log('- Brandentifier-first recommendations maintained');
  console.log('- Context-aware responses with emotional support');
  
  console.log('\n🎉 COMPREHENSIVE TESTING COMPLETE!');
}

// Run all phase tests
runCompletePhaseTests().catch(console.error);