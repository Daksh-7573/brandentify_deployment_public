/**
 * Test Script for Project Industry PATCH API
 * 
 * This script tests the PATCH endpoint for updating a project's industry field
 */

import fetch from 'node-fetch';

async function testProjectIndustryPatch() {
  try {
    // Project ID to update
    const projectId = 25;
    const BASE_URL = 'http://localhost:5000'; // Connect to the Express server port
    
    // Get the current project data
    console.log(`Fetching current project data for ID ${projectId}...`);
    const getResponse = await fetch(`${BASE_URL}/api/projects/${projectId}`);
    
    if (!getResponse.ok) {
      throw new Error(`Failed to fetch project: ${getResponse.status} ${getResponse.statusText}`);
    }
    
    const project = await getResponse.json();
    console.log(`Current project data:`, project);
    console.log(`Current industry: ${project.industry || 'null'}`);
    
    // Define new industry value (different from current value)
    const newIndustry = project.industry === 'Technology' ? 'Healthcare' : 'Technology';
    
    // Update only the industry field
    console.log(`Updating industry to: ${newIndustry}`);
    const updateData = { industry: newIndustry };
    
    // Make PATCH request directly
    console.log(`Making PATCH request to ${BASE_URL}/api/projects/${projectId}`);
    const patchResponse = await fetch(`${BASE_URL}/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    
    console.log(`PATCH response status: ${patchResponse.status}`);
    
    if (!patchResponse.ok) {
      throw new Error(`PATCH request failed: ${patchResponse.status} ${patchResponse.statusText}`);
    }
    
    const updatedProject = await patchResponse.json();
    console.log(`PATCH response:`, updatedProject);
    console.log(`Updated industry: ${updatedProject.industry || 'null'}`);
    
    // Verify the change was saved by fetching the project again
    console.log(`Verifying update by fetching project data again...`);
    const verifyResponse = await fetch(`${BASE_URL}/api/projects/${projectId}`);
    
    if (!verifyResponse.ok) {
      throw new Error(`Failed to verify update: ${verifyResponse.status} ${verifyResponse.statusText}`);
    }
    
    const verifiedProject = await verifyResponse.json();
    console.log(`Verified project data:`, verifiedProject);
    console.log(`Verified industry: ${verifiedProject.industry || 'null'}`);
    
    if (verifiedProject.industry === newIndustry) {
      console.log(`Success! Industry field was updated to "${newIndustry}" and correctly saved to the database.`);
    } else {
      console.error(`Verification failed! Industry field has value "${verifiedProject.industry}" instead of "${newIndustry}".`);
    }
  } catch (error) {
    console.error('Error in test:', error);
  }
}

// Run the test
testProjectIndustryPatch();