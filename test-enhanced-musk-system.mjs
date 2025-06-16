/**
 * Test Script for Enhanced Musk Intelligence System
 * 
 * Tests the upgraded system with:
 * - Reference resolution
 * - Model switching (local -> OpenAI/Anthropic)
 * - Response quality assessment
 * - Complex query handling
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

/**
 * Test enhanced Musk system with various complexity levels
 */
async function testEnhancedMuskSystem() {
  console.log('=== Testing Enhanced Musk Intelligence System ===\n');

  // Test 1: Simple query (should use local model)
  console.log('--- Test 1: Simple query (local model) ---');
  await testMuskQuery("What is networking?", "Should use local model for simple question");

  // Test 2: Complex strategic question (should switch to Anthropic)
  console.log('\n--- Test 2: Complex strategic question (Anthropic) ---');
  await testMuskQuery("I'm a senior UX director considering a career transition to product leadership while maintaining my technical expertise. What's the best strategic approach for positioning myself for VP-level product roles in enterprise software companies?", "Should trigger Anthropic for complex strategy");

  // Test 3: Vague follow-up with reference resolution
  console.log('\n--- Test 3: Vague follow-up (reference resolution) ---');
  await testMuskQuery("What about that approach?", "Should resolve reference from previous conversation");

  // Test 4: Emotional context with nuanced advice (should switch models)
  console.log('\n--- Test 4: Emotional context (enhanced model) ---');
  await testMuskQuery("I'm feeling overwhelmed about my career direction and confused about whether to pursue technical leadership or product management. I have imposter syndrome and need comprehensive guidance.", "Should trigger enhanced model for emotional complexity");

  // Test 5: Multi-step career planning (should switch to enhanced model)
  console.log('\n--- Test 5: Multi-step career planning (enhanced model) ---');
  await testMuskQuery("I need to create a 5-year career roadmap that includes skill development, networking strategy, and industry positioning for a transition from healthcare to fintech.", "Should use enhanced model for multi-step planning");

  // Test 6: Simple follow-up after complex query
  console.log('\n--- Test 6: Simple follow-up ---');
  await testMuskQuery("That sounds good", "Should handle simple acknowledgment");

  console.log('\n=== Enhanced Musk System Tests Complete ===');
}

/**
 * Test individual Musk query and analyze response characteristics
 */
async function testMuskQuery(question, expectedBehavior) {
  console.log(`Question: "${question}"`);
  console.log(`Expected: ${expectedBehavior}`);
  
  const startTime = Date.now();
  
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
    const responseTime = Date.now() - startTime;

    console.log(`✅ Response received (${message.length} characters, ${responseTime}ms)`);
    
    // Analyze response characteristics to detect model used
    const analysisResults = analyzeResponseCharacteristics(message, question);
    
    console.log(`🔍 Analysis: ${analysisResults.modelLikely} | Quality: ${analysisResults.qualityScore} | Complexity: ${analysisResults.complexityHandled}`);
    
    // Show response preview
    const preview = message.split('\n')[0].substring(0, 120);
    console.log(`Preview: ${preview}${preview.length >= 120 ? '...' : ''}`);

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

/**
 * Analyze response to determine likely model and quality
 */
function analyzeResponseCharacteristics(response, originalQuery) {
  const length = response.length;
  const wordCount = response.split(/\s+/).length;
  const sentenceCount = response.split(/[.!?]+/).filter(s => s.trim().length > 5).length;
  
  // Indicators of enhanced models
  const enhancedIndicators = {
    structuredFormat: /\*\*|\n\n|\d+\./g.test(response),
    strategicLanguage: /\b(strategic|framework|methodology|comprehensive|systematic)\b/gi.test(response),
    nuancedAdvice: /\b(consider|however|on the other hand|that said|ultimately)\b/gi.test(response),
    industrySpecific: /\b(enterprise|fintech|healthcare|SaaS|B2B|executive)\b/gi.test(response),
    actionableSteps: /\b(first|second|next|then|finally|step)\b/gi.test(response)
  };

  const enhancedScore = Object.values(enhancedIndicators).filter(Boolean).length;
  
  // Determine likely model
  let modelLikely = 'Local';
  if (length > 800 && enhancedScore >= 3) {
    modelLikely = 'Enhanced (Anthropic/OpenAI)';
  } else if (length > 400 && enhancedScore >= 2) {
    modelLikely = 'Possibly Enhanced';
  }

  // Quality assessment
  const qualityScore = calculateQualityScore(response, originalQuery);
  
  // Complexity handling assessment
  const complexityHandled = assessComplexityHandling(response, originalQuery);

  return {
    modelLikely,
    qualityScore: qualityScore.toFixed(1),
    complexityHandled,
    indicators: enhancedScore
  };
}

/**
 * Calculate response quality score
 */
function calculateQualityScore(response, query) {
  let score = 0.5; // Base score
  
  // Length appropriateness
  if (response.length > 200 && response.length < 2000) {
    score += 0.1;
  }
  
  // Relevance to query
  const queryWords = query.toLowerCase().split(/\s+/);
  const responseWords = response.toLowerCase().split(/\s+/);
  const relevantMatches = queryWords.filter(word => 
    word.length > 3 && responseWords.some(rw => rw.includes(word))
  ).length;
  
  if (queryWords.length > 0) {
    score += (relevantMatches / queryWords.length) * 0.2;
  }
  
  // Structure and formatting
  if (/\*\*|\n\n|-|\d+\./.test(response)) {
    score += 0.1; // Well-formatted
  }
  
  // Actionable content
  if (/\b(can|should|try|consider|recommend|suggest)\b/gi.test(response)) {
    score += 0.1;
  }
  
  // Professional tone
  if (!/\b(um|uh|like|you know)\b/gi.test(response)) {
    score += 0.1;
  }
  
  return Math.min(1.0, score);
}

/**
 * Assess how well complex aspects of query were handled
 */
function assessComplexityHandling(response, query) {
  const queryComplexity = {
    emotional: /\b(overwhelmed|confused|anxious|frustrated|imposter)\b/gi.test(query),
    strategic: /\b(strategy|approach|transition|roadmap|positioning)\b/gi.test(query),
    multiStep: /\band\b.*\band\b/.test(query) || query.includes(','),
    industrySpecific: /\b(healthcare|fintech|enterprise|product|leadership)\b/gi.test(query),
    timeframe: /\b(\d+\s*year|long.?term|career)\b/gi.test(query)
  };

  const responseHandling = {
    emotional: /\b(understand|support|normal|common|overcome)\b/gi.test(response),
    strategic: /\b(plan|framework|approach|step|phase|stage)\b/gi.test(response),
    multiStep: /\b(first|second|then|next|also|additionally)\b/gi.test(response),
    industrySpecific: response.length > 300 && /\b(industry|sector|domain|market)\b/gi.test(response),
    timeframe: /\b(short.?term|long.?term|timeline|months|years)\b/gi.test(response)
  };

  const complexityPresent = Object.values(queryComplexity).filter(Boolean).length;
  const complexityHandled = Object.values(responseHandling).filter(Boolean).length;

  if (complexityPresent === 0) return 'Low complexity';
  
  const handlingRatio = complexityHandled / complexityPresent;
  
  if (handlingRatio >= 0.8) return 'Excellent handling';
  if (handlingRatio >= 0.6) return 'Good handling';
  if (handlingRatio >= 0.4) return 'Partial handling';
  return 'Limited handling';
}

/**
 * Test specific model switching scenarios
 */
async function testModelSwitchingScenarios() {
  console.log('\n=== Testing Model Switching Scenarios ===\n');

  const scenarios = [
    {
      query: "Help me with career advice",
      expectation: "Local model - simple request"
    },
    {
      query: "Create a comprehensive career transformation strategy for transitioning from technical roles to executive leadership in enterprise software, including stakeholder management, vision development, and organizational change management",
      expectation: "Enhanced model - high complexity"
    },
    {
      query: "both",
      expectation: "Reference resolution + clarification"
    },
    {
      query: "I'm feeling lost and need detailed guidance on multiple career paths with industry analysis",
      expectation: "Enhanced model - emotional + complexity"
    }
  ];

  for (const scenario of scenarios) {
    console.log(`--- Testing: "${scenario.query.substring(0, 50)}..." ---`);
    console.log(`Expected: ${scenario.expectation}`);
    await testMuskQuery(scenario.query, scenario.expectation);
    console.log('');
  }
}

// Run all tests
async function runAllTests() {
  try {
    await testEnhancedMuskSystem();
    await testModelSwitchingScenarios();
  } catch (error) {
    console.error('Test execution failed:', error);
  }
}

runAllTests();