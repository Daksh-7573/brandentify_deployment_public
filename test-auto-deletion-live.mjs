/**
 * Live Test for Auto-Deletion Content Moderation System
 * Tests the democratic auto-deletion algorithm with actual API calls
 */

const BASE_URL = 'http://localhost:3000/api';

// Test user IDs (using existing users from the database)
const testUsers = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

async function makeRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`❌ Request failed for ${endpoint}:`, error.message);
    return null;
  }
}

async function createTestPulse() {
  console.log('📝 Creating test pulse...');
  const pulse = await makeRequest('/pulses', {
    method: 'POST',
    body: JSON.stringify({
      userId: 4,
      type: 'text-pulse',
      title: 'Test Content for Auto-Deletion Demo',
      content: 'This content will be used to test the community moderation system.',
      industry: 'Technology',
      domain: 'Software Development'
    })
  });
  
  if (pulse) {
    console.log(`✅ Created pulse with ID: ${pulse.id}`);
  }
  return pulse;
}

async function createTestNowboardItem() {
  console.log('📝 Creating test nowboard item...');
  const item = await makeRequest('/nowboard-items', {
    method: 'POST',
    body: JSON.stringify({
      userId: 4,
      content: 'Test nowboard content for auto-deletion demo',
      category: 'growth',
      visibility: 'public'
    })
  });
  
  if (item) {
    console.log(`✅ Created nowboard item with ID: ${item.id}`);
  }
  return item;
}

async function trackView(itemType, itemId, userId) {
  const result = await makeRequest(`/view/${itemType}/${itemId}`, {
    method: 'POST',
    body: JSON.stringify({ userId })
  });
  return result;
}

async function flagItem(itemType, itemId, userId, reason = 'Inappropriate content') {
  console.log(`🚩 User ${userId} flagging ${itemType} ${itemId}...`);
  const result = await makeRequest(`/flag/${itemType}/${itemId}`, {
    method: 'POST',
    body: JSON.stringify({ userId, reason })
  });
  return result;
}

async function getAnalytics(itemType, itemId) {
  const analytics = await makeRequest(`/moderation/${itemType}/${itemId}/analytics`);
  if (analytics) {
    console.log(`📊 Analytics: ${analytics.flags} flags, ${analytics.views} views, ${analytics.flagToViewRatio}% ratio`);
  }
  return analytics;
}

async function checkItemExists(itemType, itemId) {
  const endpoint = itemType === 'pulse' ? '/pulses' : '/nowboard-items';
  const response = await fetch(`${BASE_URL}${endpoint}/${itemId}`);
  return response.ok;
}

async function checkUserRestrictions(userId) {
  const restrictions = await makeRequest(`/user/${userId}/restrictions`);
  if (restrictions && restrictions.isRestricted) {
    console.log(`🚫 User ${userId} is restricted: ${restrictions.reason}`);
  } else {
    console.log(`✅ User ${userId} has no restrictions`);
  }
  return restrictions;
}

async function testFlagToViewRatioTrigger() {
  console.log('\n🧪 Test 1: Flag-to-View Ratio Auto-Deletion (70% threshold)');
  console.log('============================================================');
  
  const pulse = await createTestPulse();
  if (!pulse) return;
  
  // Create 10 views from different users
  console.log('👀 Creating 10 unique views...');
  for (let i = 0; i < 10; i++) {
    await trackView('pulse', pulse.id, testUsers[i] || (i + 1));
  }
  
  // Flag by 7 users (70% ratio exactly)
  console.log('🚩 Flagging by 7 users to trigger 70% ratio...');
  for (let i = 0; i < 7; i++) {
    await flagItem('pulse', pulse.id, testUsers[i] || (i + 1), 'Testing 70% ratio trigger');
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
  }
  
  // Check analytics and final state
  await getAnalytics('pulse', pulse.id);
  const exists = await checkItemExists('pulse', pulse.id);
  
  if (exists) {
    console.log('❌ Content was NOT auto-deleted (threshold not met)');
  } else {
    console.log('✅ Content was AUTO-DELETED due to 70% flag-to-view ratio!');
  }
  
  return !exists;
}

async function testTotalFlagsThreshold() {
  console.log('\n🧪 Test 2: Total Flags Threshold (10+ unique flags)');
  console.log('===================================================');
  
  const item = await createTestNowboardItem();
  if (!item) return;
  
  // Create many views to prevent ratio trigger
  console.log('👀 Creating 20 views to avoid ratio trigger...');
  for (let i = 0; i < 20; i++) {
    await trackView('nowboard', item.id, (i % 12) + 1); // Cycle through user IDs
  }
  
  // Flag by 10 users
  console.log('🚩 Flagging by 10 unique users...');
  for (let i = 0; i < 10; i++) {
    await flagItem('nowboard', item.id, testUsers[i] || (i + 1), 'Testing 10+ flags trigger');
    await new Promise(resolve => setTimeout(resolve, 300)); // Small delay
  }
  
  // Check analytics and final state
  await getAnalytics('nowboard', item.id);
  const exists = await checkItemExists('nowboard', item.id);
  
  if (exists) {
    console.log('❌ Content was NOT auto-deleted (threshold not met)');
  } else {
    console.log('✅ Content was AUTO-DELETED due to 10+ unique flags!');
  }
  
  return !exists;
}

async function testTimeBasedFlagging() {
  console.log('\n🧪 Test 3: Time-Based Auto-Deletion (6+ flags within 1 hour)');
  console.log('=============================================================');
  
  const pulse = await createTestPulse();
  if (!pulse) return;
  
  // Create many views to prevent ratio trigger
  console.log('👀 Creating 20 views to avoid ratio trigger...');
  for (let i = 0; i < 20; i++) {
    await trackView('pulse', pulse.id, (i % 12) + 1);
  }
  
  // Flag by 6 users rapidly
  console.log('🚩 Rapidly flagging by 6 users within time window...');
  for (let i = 0; i < 6; i++) {
    await flagItem('pulse', pulse.id, testUsers[i] || (i + 1), 'Testing rapid flagging');
    await new Promise(resolve => setTimeout(resolve, 200)); // Very small delay
  }
  
  // Check analytics and final state
  await getAnalytics('pulse', pulse.id);
  const exists = await checkItemExists('pulse', pulse.id);
  
  if (exists) {
    console.log('❌ Content was NOT auto-deleted (threshold not met)');
  } else {
    console.log('✅ Content was AUTO-DELETED due to 6+ flags within 1 hour!');
  }
  
  return !exists;
}

async function testUserRestrictions() {
  console.log('\n🧪 Test 4: User Posting Restrictions');
  console.log('====================================');
  
  // Check restrictions for the test user
  await checkUserRestrictions(4);
  
  console.log('ℹ️  Note: User restrictions are applied when a user gets 3+ items auto-deleted in one day');
}

async function runComprehensiveTest() {
  console.log('🚀 Starting Auto-Deletion System Live Test');
  console.log('==========================================');
  console.log('Testing democratic content moderation with these triggers:');
  console.log('• 6+ flags from unique users within 1 hour');
  console.log('• 10+ total flags from unique users');
  console.log('• 70% flag-to-view ratio');
  console.log('• User restrictions after 3+ deletions per day\n');
  
  const results = [];
  
  try {
    // Test 1: Flag-to-View Ratio
    const test1Result = await testFlagToViewRatioTrigger();
    results.push(test1Result);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 2: Total Flags Threshold  
    const test2Result = await testTotalFlagsThreshold();
    results.push(test2Result);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 3: Time-Based Flagging
    const test3Result = await testTimeBasedFlagging();
    results.push(test3Result);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 4: User Restrictions
    await testUserRestrictions();
    
    // Summary
    console.log('\n📈 Test Results Summary');
    console.log('======================');
    console.log(`Flag-to-View Ratio Test: ${test1Result ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Total Flags Test: ${test2Result ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Time-Based Test: ${test3Result ? '✅ PASSED' : '❌ FAILED'}`);
    
    const passedTests = results.filter(Boolean).length;
    console.log(`\n🎯 Overall: ${passedTests}/${results.length} tests passed`);
    
    if (passedTests === results.length) {
      console.log('\n🎉 Auto-deletion system is working perfectly!');
      console.log('The community moderation system automatically removes content');
      console.log('based on democratic flagging patterns as designed.');
    } else {
      console.log('\n⚠️  Some tests did not pass. This could be due to:');
      console.log('• Database schema not fully set up');
      console.log('• Missing storage methods');
      console.log('• API endpoints not properly configured');
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run the comprehensive test
runComprehensiveTest().catch(console.error);