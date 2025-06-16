/**
 * Test Script for Enhanced Musk Persona System
 * 
 * This script tests the new persona-based intelligence system with different
 * types of career questions to verify intent classification and persona selection.
 */

async function testEnhancedMuskPersonas() {
  console.log('🧠 Testing Enhanced Musk Persona System...\n');
  
  const testCases = [
    {
      scenario: 'Career Strategy Question',
      message: "I'm a UX researcher looking to transition into product management. What's the best strategic approach?",
      expectedPersona: 'strategist',
      expectedIntent: 'career_transition'
    },
    {
      scenario: 'Confidence Building Question',
      message: "I feel stuck in my current role and don't know if I'm good enough for senior positions",
      expectedPersona: 'coach',
      expectedIntent: 'confidence_building'
    },
    {
      scenario: 'Technical Skills Question',
      message: "What specific skills should I develop to become a better data scientist?",
      expectedPersona: 'expert',
      expectedIntent: 'skill_development'
    },
    {
      scenario: 'Goal Setting Question',
      message: "Help me set realistic career goals for the next 2 years",
      expectedPersona: 'strategist',
      expectedIntent: 'goal_setting'
    },
    {
      scenario: 'Industry Insights Question',
      message: "What are the emerging trends in the hospitality industry I should know about?",
      expectedPersona: 'expert',
      expectedIntent: 'industry_insights'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Testing: ${testCase.scenario}`);
    console.log(`❓ Question: "${testCase.message}"`);
    console.log(`🎯 Expected Persona: ${testCase.expectedPersona}`);
    console.log(`🎯 Expected Intent: ${testCase.expectedIntent}`);
    
    try {
      const response = await fetch('http://localhost:5000/api/musk/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: testCase.message,
          userId: 2, // Test user ID
          context: 'test'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log('\n✅ Response Analysis:');
      console.log(`📝 Message Length: ${result.message.length} characters`);
      console.log(`🚀 Enhanced System: ${result.enhanced ? 'YES' : 'NO'}`);
      
      if (result.enhanced) {
        console.log(`👤 Detected Persona: ${result.persona || 'Not specified'}`);
        console.log(`🧠 Detected Intent: ${result.intent || 'Not specified'}`);
        console.log(`📊 Confidence: ${result.confidence || 'Not specified'}`);
        
        if (result.proactiveSuggestions) {
          console.log(`💡 Proactive Suggestions: ${result.proactiveSuggestions.length} provided`);
        }
        
        // Verify persona selection
        if (result.persona === testCase.expectedPersona) {
          console.log('✅ Persona selection: CORRECT');
        } else {
          console.log('❌ Persona selection: INCORRECT');
        }
        
        // Verify intent classification
        if (result.intent === testCase.expectedIntent) {
          console.log('✅ Intent classification: CORRECT');
        } else {
          console.log('❌ Intent classification: INCORRECT');
        }
      } else {
        console.log('⚠️ Fallback to basic system used');
      }
      
      console.log('\n📄 Response Preview:');
      console.log(result.message.substring(0, 200) + '...');
      
      console.log('\n' + '='.repeat(80));
      
    } catch (error) {
      console.error(`❌ Error testing ${testCase.scenario}:`, error.message);
    }
  }
}

// Test context enrichment functionality
async function testContextEnrichment() {
  console.log('\n🔍 Testing Context Enrichment...\n');
  
  try {
    const response = await fetch('http://localhost:5000/api/musk/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: "Based on my profile, what career advice would you give me?",
        userId: 2,
        context: 'profile_based'
      })
    });

    const result = await response.json();
    
    console.log('📊 Context Analysis:');
    console.log(`📈 Profile Data: ${result.contextUsed.hasResumeData ? 'Resume Available' : 'Profile Only'}`);
    console.log(`🧠 User Memory: ${result.contextUsed.hasUserMemory ? 'Available' : 'None'}`);
    console.log(`📋 Data Source: ${result.contextUsed.dataSource}`);
    
    if (result.contextUsed.profileCompleteness) {
      console.log(`✅ Profile Completeness: ${result.contextUsed.profileCompleteness}%`);
    }
    
    if (result.contextUsed.keyInsights) {
      console.log(`💡 Key Insights: ${result.contextUsed.keyInsights.length} identified`);
    }
    
    console.log('\n📄 Personalized Response:');
    console.log(result.message);
    
  } catch (error) {
    console.error('❌ Error testing context enrichment:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Enhanced Musk Persona System Tests\n');
  console.log('=' * 80);
  
  await testEnhancedMuskPersonas();
  await testContextEnrichment();
  
  console.log('\n🎉 Testing Complete!');
  console.log('Check the console logs above to verify the persona system is working correctly.');
}

runAllTests().catch(console.error);