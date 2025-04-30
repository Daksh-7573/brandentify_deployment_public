/**
 * Test Script for Project Industry Update
 * 
 * This script tests the PATCH endpoint for updating a project's industry field
 * specifically using the new dedicated endpoint.
 */
import fetch from 'node-fetch';

// Test project data with industry field
const newIndustryValue = "Healthcare";

async function testProjectIndustryUpdate(projectId) {
  try {
    console.log("Testing project industry field update with PATCH endpoint...");
    console.log(`Project ID: ${projectId}`);
    console.log(`New industry value: ${newIndustryValue}`);
    
    const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        industry: newIndustryValue
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error updating project industry:", errorText);
      return false;
    }
    
    const updatedProject = await response.json();
    console.log("Project updated successfully:", JSON.stringify(updatedProject, null, 2));
    console.log("Updated industry value:", updatedProject.industry);
    console.log("Industry field matches expected value:", updatedProject.industry === newIndustryValue);
    
    return updatedProject.industry === newIndustryValue;
  } catch (error) {
    console.error("Error in testProjectIndustryUpdate:", error);
    return false;
  }
}

// Get a project ID from command line argument or use default
const projectId = process.argv[2] || 23; // Default to project ID 23 if none provided

// Run the test
testProjectIndustryUpdate(projectId)
  .then(success => {
    console.log(`Test ${success ? 'PASSED' : 'FAILED'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });