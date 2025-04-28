/**
 * Test script for accessing the demo user profile directly
 */
import fetch from 'node-fetch';

async function testDemoProfile() {
  try {
    // Fetch the demo user
    console.log('Fetching demo user...');
    const userResponse = await fetch('http://localhost:3000/api/users/by-username/demo_user');
    const userData = await userResponse.json();
    console.log('Demo user data:', userData);
    
    // Access demo user portfolio
    console.log('\nVisiting demo user profile directly...');
    console.log('Visit: http://localhost:3000/@demo_user to see the profile');
    
    console.log('\nIf you want to test with a specific layout:');
    console.log('1. Set the layout property in public-profile.tsx line ~178');
    console.log('2. Check the actual layout value that\'s being used in the browser console');
  } catch (error) {
    console.error('Error:', error);
  }
}

testDemoProfile();