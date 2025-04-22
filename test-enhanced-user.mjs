import fetch from 'node-fetch';

async function testEnhancedUserEndpoint() {
  try {
    const response = await fetch('http://localhost:5000/api/brands-of-the-day/enhanced-user/1');
    const data = await response.json();
    console.log('Response from enhanced-user endpoint:', data);
    
    // Verify if this is returning user data or a brand object
    if (data.username) {
      console.log('SUCCESS: Endpoint is returning user data');
    } else if (data.userId) {
      console.log('ERROR: Endpoint is returning a brand object instead of user data');
    } else {
      console.log('UNKNOWN: Unexpected response format');
    }
  } catch (error) {
    console.error('Error testing endpoint:', error);
  }
}

testEnhancedUserEndpoint();
