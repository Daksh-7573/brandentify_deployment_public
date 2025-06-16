/**
 * Test Script for Enhanced Profile Enhancement Responses
 * 
 * This script tests that Musk AI provides specific, personalized advice
 * for profile improvement questions instead of generic responses.
 */

async function testProfileEnhancementResponse() {
  console.log('🎯 Testing Enhanced Profile Enhancement Responses...\n');
  
  const testQuestion = "How can I make my professional profile more compelling?";
  
  console.log(`❓ Question: "${testQuestion}"`);
  console.log('👤 User: Nishant Chopra (Senior Director - UX Research, Hospitality Industry)');
  console.log('📊 Profile: Complete with work experience, education, skills, and projects\n');
  
  try {
    const response = await fetch('http://localhost:5000/api/musk/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: testQuestion,
        userId: 2
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    console.log('✅ Response received');
    console.log(`🚀 Enhanced System: ${result.enhanced ? 'YES' : 'NO'}`);
    console.log(`🤖 Persona Used: ${result.persona || 'None'}`);
    console.log(`📈 Profile Completeness Detected: ${result.profileCompleteness || 'Not reported'}%\n`);
    
    console.log('💬 Musk AI Response:');
    console.log('=' + '='.repeat(60));
    console.log(result.message);
    console.log('=' + '='.repeat(60));
    
    if (result.proactiveSuggestions && result.proactiveSuggestions.length > 0) {
      console.log('\n💡 Proactive Suggestions:');
      result.proactiveSuggestions.forEach((suggestion, index) => {
        const prefix = index === 0 ? '🥇 FIRST (Brandentifier):' : `${index + 1}.`;
        console.log(`   ${prefix} ${suggestion}`);
      });
    }
    
    console.log('\n🔍 Analysis:');
    
    // Check if response is personalized
    const isPersonalized = result.message.includes('Nishant') || 
                          result.message.includes('UX Research') || 
                          result.message.includes('Hospitality') ||
                          result.message.includes('Senior Director');
    
    console.log(`   ✅ Personalized (mentions specific details): ${isPersonalized ? 'YES' : 'NO'}`);
    
    // Check if response avoids generic profile completion advice
    const avoidsGeneric = !result.message.includes('profile could be more complete') &&
                         !result.message.includes('missing sections') &&
                         !result.message.includes('adding missing');
    
    console.log(`   ✅ Avoids generic "complete profile" advice: ${avoidsGeneric ? 'YES' : 'NO'}`);
    
    // Check if response provides specific actionable advice
    const hasSpecificAdvice = result.message.length > 200 && 
                             (result.message.includes('quantif') || 
                              result.message.includes('metric') ||
                              result.message.includes('achievement') ||
                              result.message.includes('impact'));
    
    console.log(`   ✅ Provides specific actionable advice: ${hasSpecificAdvice ? 'YES' : 'NO'}`);
    
    // Check Brandentifier prioritization
    const brandentifierFirst = result.proactiveSuggestions && 
                              result.proactiveSuggestions.length > 0 &&
                              result.proactiveSuggestions[0].toLowerCase().includes('brandentifier');
    
    console.log(`   ✅ Brandentifier suggestion is first: ${brandentifierFirst ? 'YES' : 'NO'}`);
    
    console.log('\n📋 Summary:');
    if (isPersonalized && avoidsGeneric && hasSpecificAdvice && brandentifierFirst) {
      console.log('🎉 SUCCESS: Enhanced Musk AI is working correctly!');
      console.log('   - Provides personalized, specific advice');
      console.log('   - Avoids generic profile completion messages');
      console.log('   - Prioritizes Brandentifier suggestions first');
    } else {
      console.log('⚠️  NEEDS IMPROVEMENT: Some aspects need attention');
      if (!isPersonalized) console.log('   - Response needs more personalization');
      if (!avoidsGeneric) console.log('   - Should avoid generic profile completion advice');
      if (!hasSpecificAdvice) console.log('   - Needs more specific, actionable recommendations');
      if (!brandentifierFirst) console.log('   - Brandentifier suggestion should be first');
    }
    
  } catch (error) {
    console.error(`❌ Error testing profile enhancement response:`, error.message);
  }
}

testProfileEnhancementResponse().catch(console.error);