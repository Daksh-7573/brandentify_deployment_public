/**
 * Working Auto-Deletion System Test
 * Demonstrates the community moderation system with real data
 */

const BASE_URL = 'https://25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev/api';

async function makeRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { message: responseText };
    }
    
    console.log(`${response.status} ${endpoint}: ${JSON.stringify(responseData, null, 2)}`);
    return responseData;
  } catch (error) {
    console.log(`Network error for ${endpoint}:`, error.message);
    return null;
  }
}

async function demonstrateAutoDeleteionWorkflow() {
  console.log('Auto-Deletion Content Moderation System');
  console.log('========================================');
  console.log('Testing democratic community flagging with real pulse data\n');
  
  // Test with existing pulse ID 2
  const pulseId = 2;
  console.log(`Using pulse ID ${pulseId}: "Test Pulse with Industry and Domain"`);
  
  console.log('\n--- Step 1: Track multiple views ---');
  // Simulate views from multiple users
  for (let userId = 4; userId <= 8; userId++) {
    await makeRequest(`/view/pulse/${pulseId}`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  }
  
  console.log('\n--- Step 2: Submit community flags ---');
  // Simulate flags from multiple users
  const flagReasons = [
    'Inappropriate content',
    'Spam or misleading',
    'Violates community guidelines',
    'Offensive material'
  ];
  
  for (let i = 0; i < 4; i++) {
    const userId = 4 + i;
    await makeRequest(`/flag/pulse/${pulseId}`, {
      method: 'POST',
      body: JSON.stringify({ 
        userId, 
        reason: flagReasons[i] 
      })
    });
  }
  
  console.log('\n--- Step 3: Check moderation analytics ---');
  await makeRequest(`/moderation/pulse/${pulseId}/analytics`);
  
  console.log('\n--- Step 4: Check user restrictions ---');
  await makeRequest(`/user/4/restrictions`);
  
  console.log('\n--- System Overview ---');
  console.log('The auto-deletion system monitors community behavior and automatically');
  console.log('removes content when democratic thresholds are met:');
  console.log('• 6+ flags from unique users within 1 hour = immediate deletion');
  console.log('• 10+ total flags from unique users = deletion');
  console.log('• 70% flag-to-view ratio = deletion');
  console.log('• Users with 3+ deletions per day get temporary posting restrictions');
  console.log('\nThis creates a self-moderating community without manual oversight.');
}

demonstrateAutoDeleteionWorkflow().catch(console.error);