/**
 * Test Script for Brandentifier-First Suggestions
 * 
 * This script tests that Brandentifier suggestions always appear first
 */

async function testBrandentifierSuggestions() {
  console.log('🎯 Testing Brandentifier-First Suggestions System...\n');
  
  const testCases = [
    {
      scenario: 'Skills Question',
      message: "What skills should I develop for my career?",
      expectedFirstSuggestion: "Brandentifier"
    },
    {
      scenario: 'Career Advice',
      message: "I need career guidance",
      expectedFirstSuggestion: "Brandentifier"
    },
    {
      scenario: 'Networking Question',
      message: "How can I expand my professional network?",
      expectedFirstSuggestion: "Brandentifier"
    },
    {
      scenario: 'Portfolio Question',
      message: "How should I showcase my projects?",
      expectedFirstSuggestion: "Brandentifier"
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Testing: ${testCase.scenario}`);
    console.log(`❓ Question: "${testCase.message}"`);
    
    try {
      const response = await fetch('http://localhost:5000/api/musk/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: testCase.message,
          userId: 2
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log('✅ Response received');
      console.log(`🚀 Enhanced System: ${result.enhanced ? 'YES' : 'NO'}`);
      
      if (result.proactiveSuggestions && result.proactiveSuggestions.length > 0) {
        console.log('\n💡 Proactive Suggestions:');
        result.proactiveSuggestions.forEach((suggestion, index) => {
          const prefix = index === 0 ? '🥇 FIRST:' : `${index + 1}.`;
          console.log(`   ${prefix} ${suggestion}`);
        });
        
        const firstSuggestion = result.proactiveSuggestions[0];
        if (firstSuggestion.includes('Brandentifier')) {
          console.log('✅ Brandentifier suggestion is FIRST - CORRECT!');
        } else {
          console.log('❌ Brandentifier suggestion is NOT first - NEEDS FIX!');
        }
      } else {
        console.log('⚠️ No proactive suggestions found');
      }
      
      console.log('\n' + '='.repeat(60));
      
    } catch (error) {
      console.error(`❌ Error testing ${testCase.scenario}:`, error.message);
    }
  }
}

testBrandentifierSuggestions().catch(console.error);