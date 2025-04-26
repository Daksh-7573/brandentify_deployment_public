/**
 * Test Script for Musk Career Insights API
 * 
 * This script tests the functionality of the Musk Career Insights API endpoints
 * which provide data-driven career guidance based on trend graph data.
 */

import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000';
const TEST_USER_ID = 1; // Adjust this to a valid user ID in your system

/**
 * Helper function to log response data in a readable format
 */
async function logResponse(response) {
  console.log('Status:', response.status);
  
  try {
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error parsing response:', error);
    return null;
  }
}

/**
 * Test getting trending skills relevant to a user's profile
 */
async function testGetUserTrendingSkills() {
  console.log('\n===== Testing Get User Relevant Trending Skills =====');
  try {
    const response = await fetch(`${API_BASE_URL}/api/musk-insights/trending-skills/${TEST_USER_ID}`);
    console.log('Response:');
    const data = await logResponse(response);
    
    if (response.status === 200) {
      console.log('✅ Get user trending skills test passed');
      return data;
    } else {
      console.log('❌ Get user trending skills test failed');
      return null;
    }
  } catch (error) {
    console.error('Error testing get user trending skills:', error);
    return null;
  }
}

/**
 * Test getting career path options for a user
 */
async function testGetUserCareerPaths() {
  console.log('\n===== Testing Get User Career Path Options =====');
  try {
    const response = await fetch(`${API_BASE_URL}/api/musk-insights/career-paths/${TEST_USER_ID}`);
    console.log('Response:');
    const data = await logResponse(response);
    
    if (response.status === 200) {
      console.log('✅ Get user career paths test passed');
      return data;
    } else {
      console.log('❌ Get user career paths test failed');
      return null;
    }
  } catch (error) {
    console.error('Error testing get user career paths:', error);
    return null;
  }
}

/**
 * Test getting comprehensive career report for a user
 */
async function testGetUserCareerReport() {
  console.log('\n===== Testing Get User Career Report =====');
  try {
    const response = await fetch(`${API_BASE_URL}/api/musk-insights/career-report/${TEST_USER_ID}`);
    console.log('Response:');
    const data = await logResponse(response);
    
    if (response.status === 200) {
      console.log('✅ Get user career report test passed');
      return data;
    } else {
      console.log('❌ Get user career report test failed');
      return null;
    }
  } catch (error) {
    console.error('Error testing get user career report:', error);
    return null;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('Starting Musk Career Insights API tests...');
  
  // Test getting trending skills relevant to a user
  await testGetUserTrendingSkills();
  
  // Test getting career path options for a user
  await testGetUserCareerPaths();
  
  // Test getting comprehensive career report for a user
  await testGetUserCareerReport();
  
  console.log('\nAll Musk Career Insights API tests completed!');
}

// Run the tests
runAllTests();