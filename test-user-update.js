/**
 * Test script to check if user update functionality is working
 */

const userId = 1; // Test with user ID 1
const testData = {
  name: "Updated Test User",
  title: "Senior Software Developer",
  aboutMe: "Updated profile with test script",
  location: "San Francisco, CA",
  industry: "Software",
  whatIOffer: "Test offer content updated via direct API test",
  _timestamp: Date.now() // Add timestamp to bust cache
};

async function testUserUpdate() {
  console.log("Starting user update test...");
  
  try {
    // First get current user data
    console.log(`Fetching current data for user ID: ${userId}`);
    const getUserResponse = await fetch(`/api/users/${userId}`);
    if (!getUserResponse.ok) {
      throw new Error(`Failed to get user: ${getUserResponse.status} ${getUserResponse.statusText}`);
    }
    const currentUser = await getUserResponse.json();
    console.log("Current user data:", currentUser);
    
    // Now update the user
    console.log(`Updating user ID: ${userId} with data:`, testData);
    const updateResponse = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    if (!updateResponse.ok) {
      throw new Error(`Failed to update user: ${updateResponse.status} ${updateResponse.statusText}`);
    }
    
    const updatedUser = await updateResponse.json();
    console.log("Update response:", updatedUser);
    
    // Verify the changes by getting the user again
    console.log("Verifying changes with fresh fetch...");
    const verifyResponse = await fetch(`/api/users/${userId}?_=${Date.now()}`);
    if (!verifyResponse.ok) {
      throw new Error(`Failed to verify user: ${verifyResponse.status} ${verifyResponse.statusText}`);
    }
    
    const verifiedUser = await verifyResponse.json();
    console.log("Verified user data:", verifiedUser);
    
    // Check if the changes took effect
    const successFields = [];
    const failedFields = [];
    
    Object.entries(testData).forEach(([key, value]) => {
      if (key === '_timestamp') return; // Skip the timestamp field
      
      if (verifiedUser[key] === value) {
        successFields.push(key);
      } else {
        failedFields.push(`${key}: expected "${value}", got "${verifiedUser[key]}"`);
      }
    });
    
    if (failedFields.length === 0) {
      console.log("✅ SUCCESS: All fields updated correctly:", successFields.join(", "));
    } else {
      console.log("⚠️ PARTIAL UPDATE: Some fields were not updated correctly");
      console.log("  - Successful fields:", successFields.join(", "));
      console.log("  - Failed fields:", failedFields);
    }
    
  } catch (error) {
    console.error("❌ ERROR:", error);
  }
}

// Run the test
testUserUpdate();