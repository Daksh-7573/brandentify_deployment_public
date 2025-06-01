/**
 * Test script for the Auto-Deletion Content Moderation System
 * Tests the democratic auto-deletion algorithm with the specified conditions:
 * 1. 6+ flags from unique users within 1 hour
 * 2. 10+ total flags from unique users
 * 3. 70% flag-to-view ratio triggers auto-deletion
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

// Test user IDs
const testUsers = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

async function createTestPulse() {
  try {
    const response = await fetch(`${BASE_URL}/pulses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 4,
        type: 'text-pulse',
        title: 'Test Content for Auto-Deletion',
        content: 'This is test content that will be flagged for auto-deletion testing.',
        industry: 'Technology',
        domain: 'Software Development'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const pulse = await response.json();
    console.log('✓ Created test pulse:', pulse.id);
    return pulse;
  } catch (error) {
    console.error('✗ Failed to create test pulse:', error.message);
    return null;
  }
}

async function createTestNowboardItem() {
  try {
    const response = await fetch(`${BASE_URL}/nowboard-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 4,
        content: 'Test Nowboard item for auto-deletion testing',
        category: 'growth',
        visibility: 'public'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const item = await response.json();
    console.log('✓ Created test nowboard item:', item.id);
    return item;
  } catch (error) {
    console.error('✗ Failed to create test nowboard item:', error.message);
    return null;
  }
}

async function trackView(itemType, itemId, userId) {
  try {
    const response = await fetch(`${BASE_URL}/view/${itemType}/${itemId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`✗ Failed to track view for ${itemType} ${itemId}:`, error.message);
    return null;
  }
}

async function flagItem(itemType, itemId, userId, reason = 'Inappropriate content') {
  try {
    const response = await fetch(`${BASE_URL}/flag/${itemType}/${itemId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, reason })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`✗ Failed to flag ${itemType} ${itemId}:`, error.message);
    return null;
  }
}

async function getAnalytics(itemType, itemId) {
  try {
    const response = await fetch(`${BASE_URL}/moderation/${itemType}/${itemId}/analytics`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`✗ Failed to get analytics for ${itemType} ${itemId}:`, error.message);
    return null;
  }
}

async function checkItemExists(itemType, itemId) {
  try {
    const endpoint = itemType === 'pulse' ? 'pulses' : 'nowboard-items';
    const response = await fetch(`${BASE_URL}/${endpoint}/${itemId}`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function testFlagToViewRatio() {
  console.log('\n🧪 Testing Flag-to-View Ratio Auto-Deletion (70% threshold)');
  
  const pulse = await createTestPulse();
  if (!pulse) return;
  
  // Create 10 views from different users
  console.log('Creating 10 views...');
  for (let i = 0; i < 10; i++) {
    await trackView('pulse', pulse.id, testUsers[i]);
  }
  
  // Flag by 7 users (70% ratio exactly)
  console.log('Flagging by 7 users (70% ratio)...');
  for (let i = 0; i < 7; i++) {
    await flagItem('pulse', pulse.id, testUsers[i], 'Testing flag-to-view ratio');
  }
  
  // Check analytics
  const analytics = await getAnalytics('pulse', pulse.id);
  console.log('Analytics:', analytics);
  
  // Check if item was auto-deleted
  const exists = await checkItemExists('pulse', pulse.id);
  console.log(exists ? '✗ Item was NOT auto-deleted' : '✓ Item was auto-deleted due to 70% flag-to-view ratio');
}

async function testTotalFlagsThreshold() {
  console.log('\n🧪 Testing Total Flags Threshold (10+ unique flags)');
  
  const item = await createTestNowboardItem();
  if (!item) return;
  
  // Create many views to avoid ratio trigger
  console.log('Creating 20 views to avoid ratio trigger...');
  for (let i = 0; i < testUsers.length; i++) {
    await trackView('nowboard', item.id, testUsers[i]);
  }
  
  // Flag by 10 users
  console.log('Flagging by 10 users...');
  for (let i = 0; i < 10; i++) {
    await flagItem('nowboard', item.id, testUsers[i], 'Testing total flags threshold');
  }
  
  // Check analytics
  const analytics = await getAnalytics('nowboard', item.id);
  console.log('Analytics:', analytics);
  
  // Check if item was auto-deleted
  const exists = await checkItemExists('nowboard', item.id);
  console.log(exists ? '✗ Item was NOT auto-deleted' : '✓ Item was auto-deleted due to 10+ unique flags');
}

async function testTimeBasedFlags() {
  console.log('\n🧪 Testing Time-Based Auto-Deletion (6+ flags within 1 hour)');
  
  const pulse = await createTestPulse();
  if (!pulse) return;
  
  // Create many views to avoid ratio trigger
  console.log('Creating 20 views to avoid ratio trigger...');
  for (let i = 0; i < testUsers.length; i++) {
    await trackView('pulse', pulse.id, testUsers[i]);
  }
  
  // Flag by 6 users rapidly (within 1 hour window)
  console.log('Flagging by 6 users rapidly...');
  for (let i = 0; i < 6; i++) {
    await flagItem('pulse', pulse.id, testUsers[i], 'Testing time-based flags');
  }
  
  // Check analytics
  const analytics = await getAnalytics('pulse', pulse.id);
  console.log('Analytics:', analytics);
  
  // Check if item was auto-deleted
  const exists = await checkItemExists('pulse', pulse.id);
  console.log(exists ? '✗ Item was NOT auto-deleted' : '✓ Item was auto-deleted due to 6+ flags within 1 hour');
}

async function testUserRestrictions() {
  console.log('\n🧪 Testing User Posting Restrictions');
  
  // Check user restrictions for user 4
  try {
    const response = await fetch(`${BASE_URL}/user/4/restrictions`);
    const restrictions = await response.json();
    
    console.log('User 4 restrictions:', restrictions);
    
    if (restrictions.isRestricted) {
      console.log('✓ User has posting restrictions:', restrictions.reason);
    } else {
      console.log('✓ User has no active restrictions');
    }
  } catch (error) {
    console.error('✗ Failed to check user restrictions:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Auto-Deletion System Tests\n');
  console.log('Testing democratic content moderation with these conditions:');
  console.log('1. 6+ flags from unique users within 1 hour');
  console.log('2. 10+ total flags from unique users');
  console.log('3. 70% flag-to-view ratio triggers auto-deletion');
  console.log('4. User restrictions after 3+ deletions in a day');
  
  try {
    await testFlagToViewRatio();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    
    await testTotalFlagsThreshold();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    
    await testTimeBasedFlags();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    
    await testUserRestrictions();
    
    console.log('\n✅ All auto-deletion tests completed!');
    console.log('\nThe system automatically:');
    console.log('- Removes content based on community flagging patterns');
    console.log('- Tracks flag-to-view ratios for democratic moderation');
    console.log('- Applies temporary posting blocks for problematic users');
    console.log('- Provides real-time analytics for moderation decisions');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run the tests
runAllTests().catch(console.error);