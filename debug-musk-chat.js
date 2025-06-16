/**
 * Debug Script for Musk Chat Endpoint
 * 
 * This script sends a simple test request to debug the 500 error
 */

async function debugMuskChat() {
  console.log('🔍 Debugging Musk Chat Endpoint...\n');
  
  try {
    console.log('Sending test request to /api/musk/chat');
    
    const response = await fetch('http://localhost:5000/api/musk/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: "Hello, can you help me?",
        userId: 2
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (response.ok) {
      try {
        const jsonData = JSON.parse(responseText);
        console.log('Parsed JSON:', JSON.stringify(jsonData, null, 2));
      } catch (parseError) {
        console.log('Failed to parse as JSON:', parseError.message);
      }
    } else {
      console.log('Request failed with status:', response.status);
    }
    
  } catch (error) {
    console.error('Error making request:', error.message);
  }
}

debugMuskChat().catch(console.error);