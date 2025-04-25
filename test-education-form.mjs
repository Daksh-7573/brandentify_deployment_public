/**
 * Test Script for Education Form with Field of Study
 * 
 * This script tests the education form with added field_of_study field
 */

import fetch from 'node-fetch';

async function testEducationForm() {
  try {
    console.log('Testing Education Form with field_of_study field...');
    
    // Create education data with field_of_study explicitly set
    const educationData = {
      userId: 2, // Use numeric user ID
      institution: "Test University",
      degree: "Bachelor of Science (BS/BSc)",
      industry: "Technology",
      field_of_study: "Computer Science",
      location: "New York, USA",
      startDate: "2020-01-01",
      endDate: "2024-01-01",
      // PostgreSQL JSONB format needs a string
      skillsAcquired: JSON.stringify(["Programming", "Data Structures", "Algorithms"]),
      domain: "Software Engineering"
    };
    
    // Add education
    console.log('Creating education record with field_of_study...');
    const createRes = await fetch('http://localhost:5000/api/educations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(educationData),
    });
    
    if (!createRes.ok) {
      const errorText = await createRes.text();
      console.error('Failed to create education:', errorText);
      return;
    }
    
    const newEducation = await createRes.json();
    console.log('Created education successfully:', newEducation);
    console.log('field_of_study value:', newEducation.fieldOfStudy);
    
    // Get user educations to verify the new record exists
    console.log('Fetching all educations for user...');
    const eduRes = await fetch(`http://localhost:5000/api/users/2/educations`);
    
    if (!eduRes.ok) {
      const errorText = await eduRes.text();
      console.error('Failed to fetch educations:', errorText);
      return;
    }
    
    const educations = await eduRes.json();
    console.log('Found educations:', educations.length);
    
    // Find our test education
    const testEdu = educations.find(e => e.institution === "Test University");
    if (testEdu) {
      console.log('Test education found:', testEdu);
      console.log('field_of_study/fieldOfStudy value:', testEdu.fieldOfStudy);
      console.log('domain value:', testEdu.domain);
      
      // Clean up by deleting the test education
      console.log('Deleting test education...');
      const deleteRes = await fetch(`http://localhost:5000/api/educations/${testEdu.id}`, {
        method: 'DELETE'
      });
      
      if (!deleteRes.ok) {
        const errorText = await deleteRes.text();
        console.error('Failed to delete education:', errorText);
        return;
      }
      
      console.log('Test education deleted successfully');
    } else {
      console.error('Test education not found in user educations!');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testEducationForm();
