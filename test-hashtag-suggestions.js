/**
 * Test Script for Hashtag Suggestions API
 * 
 * This script tests the new Musk AI hashtag suggestion feature
 * for both the main API and the demo endpoint.
 */
import fetch from 'node-fetch';

/**
 * Format the response for clean console output
 */
async function logResponse(response) {
  const data = await response.json();
  console.log('\nResponse Status:', response.status);
  console.log('Response Data:');
  console.log(JSON.stringify(data, null, 2));
  return data;
}

/**
 * Test the main hashtag suggestions API endpoint
 */
async function testHashtagSuggestions() {
  console.log('Testing hashtag suggestions API...');
  
  const response = await fetch('http://localhost:5000/api/musk-ai/suggest-hashtags', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      industry: 'Technology',
      domain: 'Software Development',
      followedHashtags: ['#JavaScript', '#WebDev', '#AI'],
      previouslyUsedHashtags: ['#ReactJS', '#NodeJS', '#TechTrends'],
      contentContext: 'Sharing my thoughts on the future of serverless computing and edge functions.',
      count: 8
    }),
  });

  await logResponse(response);
}

/**
 * Test the demo hashtag suggestions endpoint
 */
async function testDemoHashtagSuggestions() {
  console.log('\nTesting demo hashtag suggestions API...');
  
  const industry = 'technology';
  const domain = 'artificial intelligence';
  
  const response = await fetch(`http://localhost:5000/api/musk-ai/demo/suggest-hashtags/${industry}?domain=${domain}`);
  
  await logResponse(response);
}

/**
 * Test error handling with an invalid request
 */
async function testInvalidRequest() {
  console.log('\nTesting error handling with invalid request...');
  
  const response = await fetch('http://localhost:5000/api/musk-ai/suggest-hashtags', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // Missing required fields
    }),
  });

  await logResponse(response);
}

/**
 * Run all tests
 */
async function runAllTests() {
  try {
    await testHashtagSuggestions();
    await testDemoHashtagSuggestions();
    await testInvalidRequest();
    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('\nError running tests:', error);
  }
}

// Execute all tests
runAllTests();