/**
 * Test script for Musk AI feedback API
 * 
 * This script tests the Musk feedback endpoints to ensure
 * they are properly handling user feedback.
 */

import fetch from 'node-fetch';

// Base URL for API endpoints
const API_BASE = 'http://localhost:5000/api';

// Test user ID - replace with a valid user ID from your database
const TEST_USER_ID = 1;

// Test submitting helpful feedback
async function testHelpfulFeedback() {
  console.log('\n--- Testing Helpful Feedback Submission ---');
  
  const feedbackData = {
    userId: TEST_USER_ID,
    conversationId: 'test-conversation-123',
    messageId: 'test-message-456',
    feedbackType: 'helpful',
    helpful: true,
    context: 'career-advice',
    promptCategory: 'career-growth'
  };
  
  try {
    const response = await fetch(`${API_BASE}/musk-feedback/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData),
    });
    
    const result = await response.json();
    console.log('Response:', result);
    return result;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Test submitting rating feedback
async function testRatingFeedback() {
  console.log('\n--- Testing Rating Feedback Submission ---');
  
  const feedbackData = {
    userId: TEST_USER_ID,
    conversationId: 'test-conversation-123',
    messageId: 'test-message-789',
    feedbackType: 'rating',
    rating: 4,
    context: 'resume-review',
    promptCategory: 'skill-improvement',
    promptDetails: {
      careerStage: 'mid-level',
      industry: 'technology'
    }
  };
  
  try {
    const response = await fetch(`${API_BASE}/musk-feedback/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData),
    });
    
    const result = await response.json();
    console.log('Response:', result);
    return result;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Test submitting "save to plan" feedback
async function testSaveToPlanFeedback() {
  console.log('\n--- Testing Save to Plan Feedback Submission ---');
  
  const feedbackData = {
    userId: TEST_USER_ID,
    conversationId: 'test-conversation-123',
    messageId: 'test-message-abc',
    feedbackType: 'save',
    savedToPlan: true,
    context: 'upskilling',
    promptCategory: 'learning-path',
    responseDetails: {
      suggestionType: 'course',
      platform: 'Coursera'
    }
  };
  
  try {
    const response = await fetch(`${API_BASE}/musk-feedback/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData),
    });
    
    const result = await response.json();
    console.log('Response:', result);
    return result;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Test getting feedback history for a user
async function testGetFeedbackHistory() {
  console.log('\n--- Testing Get Feedback History ---');
  
  try {
    const response = await fetch(`${API_BASE}/musk-feedback/history/${TEST_USER_ID}`);
    const result = await response.json();
    console.log('Feedback history entries:', result.data.length);
    console.log('First entry:', result.data[0]);
    return result;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Test getting analytics for a category
async function testGetCategoryAnalytics() {
  console.log('\n--- Testing Get Category Analytics ---');
  
  try {
    const category = 'career-growth';
    const response = await fetch(`${API_BASE}/musk-feedback/analytics/category/${category}`);
    const result = await response.json();
    console.log(`Analytics for ${category}:`, result);
    return result;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Test getting top performing categories
async function testGetTopCategories() {
  console.log('\n--- Testing Get Top Categories ---');
  
  try {
    const response = await fetch(`${API_BASE}/musk-feedback/analytics/top`);
    const result = await response.json();
    console.log('Top categories:', result);
    return result;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the tests
async function runTests() {
  console.log('Starting Musk feedback API tests...');
  
  // Submit different types of feedback
  await testHelpfulFeedback();
  await testRatingFeedback();
  await testSaveToPlanFeedback();
  
  // Get feedback history and analytics
  await testGetFeedbackHistory();
  await testGetCategoryAnalytics();
  await testGetTopCategories();
  
  console.log('\nAll tests completed!');
}

runTests();