/**
 * Auto-Deletion System Demonstration
 * Shows how the democratic content moderation works
 */

const BASE_URL = 'http://localhost:3000/api';

async function makeRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Request to ${endpoint} returned ${response.status}: ${errorText}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.log(`Network error for ${endpoint}:`, error.message);
    return null;
  }
}

async function demonstrateAutoDeleteion() {
  console.log('Auto-Deletion System Demonstration');
  console.log('==================================');
  
  // Step 1: Test the flagging endpoint
  console.log('\nStep 1: Testing flagging system...');
  const flagResult = await makeRequest('/flag/pulse/1', {
    method: 'POST',
    body: JSON.stringify({
      userId: 4,
      reason: 'Testing auto-deletion system'
    })
  });
  
  if (flagResult) {
    console.log('Flag created successfully:', flagResult);
  }
  
  // Step 2: Test view tracking
  console.log('\nStep 2: Testing view tracking...');
  const viewResult = await makeRequest('/view/pulse/1', {
    method: 'POST',
    body: JSON.stringify({ userId: 4 })
  });
  
  if (viewResult) {
    console.log('View tracked successfully:', viewResult);
  }
  
  // Step 3: Check analytics
  console.log('\nStep 3: Checking moderation analytics...');
  const analytics = await makeRequest('/moderation/pulse/1/analytics');
  
  if (analytics) {
    console.log('Current analytics:', analytics);
  }
  
  // Step 4: Check user restrictions
  console.log('\nStep 4: Checking user restrictions...');
  const restrictions = await makeRequest('/user/4/restrictions');
  
  if (restrictions) {
    console.log('User restrictions:', restrictions);
  }
  
  console.log('\nDemonstration complete!');
  console.log('\nThe auto-deletion system includes:');
  console.log('• Democratic flagging with community thresholds');
  console.log('• Real-time analytics for content moderation');
  console.log('• User behavior tracking and restrictions');
  console.log('• Automatic content removal based on community consensus');
}

demonstrateAutoDeleteion().catch(console.error);