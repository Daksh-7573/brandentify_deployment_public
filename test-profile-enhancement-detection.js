/**
 * Test Script for Profile Enhancement Question Detection
 * 
 * This script tests that the enhanced Musk system properly detects
 * profile enhancement questions like "how to make profile more compelling"
 * and provides specific, personalized advice.
 */

import { processEnhancedMuskRequest } from './server/services/enhanced-musk-intelligence.js';

async function testProfileEnhancementDetection() {
  console.log('\n=== Testing Profile Enhancement Question Detection ===\n');
  
  // Mock user data - complete profile to test enhancement advice
  const mockUserProfile = {
    id: 2,
    name: 'Nishant Chopra',
    title: 'Senior Director - UX Research',
    industry: 'Hospitality',
    location: 'Gandhinagar, Gujarat, India',
    lookingFor: 'career_advice'
  };
  
  const mockExperiences = [
    { title: 'Product Manager', company: 'Tech Corp', startDate: '2020-01-01', endDate: '2023-01-01' },
    { title: 'UX Designer', company: 'Design Studio', startDate: '2018-01-01', endDate: '2020-01-01' },
    { title: 'Research Analyst', company: 'Research Firm', startDate: '2016-01-01', endDate: '2018-01-01' }
  ];
  
  const mockSkills = [
    { name: 'User Research', level: 'expert' },
    { name: 'Product Strategy', level: 'advanced' }
  ];
  
  const mockEducations = [
    { degree: 'Bachelor of Technology', institution: 'IIT Delhi', field: 'Computer Science' },
    { degree: 'MBA', institution: 'IIM Bangalore', field: 'Product Management' }
  ];
  
  const mockProjects = [
    { title: 'Mobile App Redesign', description: 'Led complete UX overhaul resulting in 40% increase in user engagement' },
    { title: 'Voice Interface Research', description: 'Conducted extensive user research for new voice features' }
  ];

  // Test cases for profile enhancement questions
  const testMessages = [
    'How can I make my profile more compelling?',
    'What can I do to showcase my experience better?',
    'How to improve my professional profile?',
    'Ways to enhance my career profile?',
    'Make my profile stand out more',
    'How to better highlight my skills?'
  ];

  console.log('Testing profile enhancement question detection...\n');

  for (const message of testMessages) {
    console.log(`\n--- Testing Message: "${message}" ---`);
    
    try {
      const request = {
        message,
        userId: 2,
        userProfile: mockUserProfile,
        userExperiences: mockExperiences,
        userSkills: mockSkills,
        userEducations: mockEducations,
        userProjects: mockProjects,
        conversationHistory: []
      };

      const response = await processEnhancedMuskRequest(request);
      
      console.log('✅ Response generated successfully');
      console.log(`Intent detected: ${response.metadata.intent.type}`);
      console.log(`Confidence: ${response.metadata.confidence}`);
      console.log(`Profile completeness: ${response.metadata.contextUsed.profileCompleteness}%`);
      
      // Check if response contains specific profile enhancement advice
      const hasSpecificAdvice = response.response.includes('specific ways') || 
                               response.response.includes('Experience Enhancement') ||
                               response.response.includes('Skills Positioning') ||
                               response.response.includes('Project Portfolio');
      
      if (hasSpecificAdvice) {
        console.log('✅ Contains specific profile enhancement advice');
      } else {
        console.log('❌ Missing specific profile enhancement advice');
        console.log('Response preview:', response.response.substring(0, 200) + '...');
      }
      
      // Check if Brandentifier suggestions are prioritized
      const suggestions = response.metadata.proactiveSuggestions || [];
      if (suggestions.length > 0) {
        const firstSuggestion = suggestions[0];
        if (firstSuggestion.includes('Brandentifier') || firstSuggestion.includes('profile')) {
          console.log('✅ Brandentifier suggestions prioritized correctly');
        } else {
          console.log('❌ Brandentifier suggestions not prioritized');
          console.log('First suggestion:', firstSuggestion);
        }
      }
      
    } catch (error) {
      console.error('❌ Error processing request:', error.message);
    }
  }
  
  console.log('\n=== Profile Enhancement Detection Test Complete ===');
}

// Run the test
testProfileEnhancementDetection().catch(console.error);