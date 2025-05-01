/**
 * Test Script for Comprehensive User Profile API
 * 
 * This script tests the new comprehensive user profile API endpoint
 * that returns all user data in a single request.
 */

const fetch = require('node-fetch');

async function testUserProfile() {
  try {
    console.log('Testing comprehensive user profile API...');
    
    // Use a known test user ID
    const userId = 1;
    
    console.log(`Fetching profile data for user ${userId}...`);
    const response = await fetch(`http://localhost:5000/api/users/${userId}/profile`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user profile data: ${response.statusText}`);
    }
    
    const profileData = await response.json();
    console.log('Received user profile data:');
    console.log(JSON.stringify(profileData, null, 2));
    
    // Verify the structure of the response
    console.log('\nVerifying response structure...');
    
    const hasUser = profileData.id && profileData.username && profileData.email;
    console.log(`- Has basic user data: ${hasUser ? 'YES' : 'NO'}`);
    
    const hasWorkExperiences = Array.isArray(profileData.workExperiences);
    console.log(`- Has work experiences array: ${hasWorkExperiences ? 'YES' : 'NO'}`);
    
    const hasEducation = Array.isArray(profileData.education);
    console.log(`- Has education array: ${hasEducation ? 'YES' : 'NO'}`);
    
    const hasSkills = Array.isArray(profileData.skills);
    console.log(`- Has skills array: ${hasSkills ? 'YES' : 'NO'}`);
    
    const hasProjects = Array.isArray(profileData.projects);
    console.log(`- Has projects array: ${hasProjects ? 'YES' : 'NO'}`);
    
    const hasServices = Array.isArray(profileData.services);
    console.log(`- Has services array: ${hasServices ? 'YES' : 'NO'}`);
    
    console.log('\nTest completed successfully.');
  } catch (error) {
    console.error('Error testing user profile API:', error);
  }
}

// Run the test
testUserProfile();