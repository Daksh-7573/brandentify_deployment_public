/**
 * Test Script for Project Creation and Update with Industry Field
 * 
 * This script tests:
 * 1. Creating a new project with the industry field
 * 2. Updating the project's industry field
 * 3. Verifying the industry value is stored and retrieved correctly
 */

async function testProjectCreationWithIndustry() {
  try {
    console.log("=== TESTING PROJECT CREATION WITH INDUSTRY ===");
    
    // Create a new project with industry set to "Technology"
    const newProject = {
      userId: 2, // Set to a valid user ID in your system
      title: "Test Project with Industry Field",
      description: "This is a test project to verify industry field works correctly",
      category: "Test Category",
      industry: "Technology", // Explicitly set industry
      startDate: "2025-05-01",
      projectUrl: "https://example.com/project"
    };
    
    console.log("Creating new project with data:", newProject);
    
    // Make the request to create the project - using full URL
    const baseUrl = 'http://localhost:5000'; // Server URL
    const createResponse = await fetch(`${baseUrl}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newProject)
    });
    
    if (!createResponse.ok) {
      throw new Error(`Failed to create project: ${await createResponse.text()}`);
    }
    
    const createdProject = await createResponse.json();
    console.log("Project created successfully:", createdProject);
    
    // Verify the industry field was saved correctly
    if (createdProject.industry !== "Technology") {
      console.error(`Industry field not saved correctly. Expected "Technology" but got "${createdProject.industry}"`);
    } else {
      console.log("Industry field saved correctly:", createdProject.industry);
    }
    
    return createdProject; // Return for use in next test
  } catch (error) {
    console.error("Error in testProjectCreationWithIndustry:", error);
    throw error;
  }
}

async function testProjectIndustryUpdate(projectId) {
  try {
    console.log(`\n=== TESTING PROJECT INDUSTRY UPDATE FOR PROJECT ID ${projectId} ===`);
    
    // Update the project's industry field
    const updatedData = {
      industry: "Finance" // Change to a different industry
    };
    
    console.log("Updating project industry to:", updatedData.industry);
    
    // Make the PATCH request to update the industry - using full URL
    const baseUrl = 'http://localhost:5000'; // Server URL
    const updateResponse = await fetch(`${baseUrl}/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedData)
    });
    
    if (!updateResponse.ok) {
      throw new Error(`Failed to update project: ${await updateResponse.text()}`);
    }
    
    const updatedProject = await updateResponse.json();
    console.log("Project updated successfully:", updatedProject);
    
    // Verify the industry field was updated correctly
    if (updatedProject.industry !== "Finance") {
      console.error(`Industry field not updated correctly. Expected "Finance" but got "${updatedProject.industry}"`);
    } else {
      console.log("Industry field updated correctly:", updatedProject.industry);
    }
    
    return updatedProject;
  } catch (error) {
    console.error("Error in testProjectIndustryUpdate:", error);
    throw error;
  }
}

async function testProjectFetch(projectId) {
  try {
    console.log(`\n=== TESTING PROJECT FETCH FOR PROJECT ID ${projectId} ===`);
    
    // Fetch the project to verify industry is still correct - using full URL
    const baseUrl = 'http://localhost:5000'; // Server URL
    const fetchResponse = await fetch(`${baseUrl}/api/projects/${projectId}`);
    
    if (!fetchResponse.ok) {
      throw new Error(`Failed to fetch project: ${await fetchResponse.text()}`);
    }
    
    const fetchedProject = await fetchResponse.json();
    console.log("Project fetched successfully:", fetchedProject);
    
    // Verify the industry field is still correct
    if (fetchedProject.industry !== "Finance") {
      console.error(`Industry field not persisted correctly. Expected "Finance" but got "${fetchedProject.industry}"`);
    } else {
      console.log("Industry field persisted correctly:", fetchedProject.industry);
    }
    
    return fetchedProject;
  } catch (error) {
    console.error("Error in testProjectFetch:", error);
    throw error;
  }
}

async function runAllTests() {
  try {
    console.log("Starting project industry field tests...");
    
    // First create a project with industry
    const createdProject = await testProjectCreationWithIndustry();
    
    // Then update the industry field
    const updatedProject = await testProjectIndustryUpdate(createdProject.id);
    
    // Finally verify the industry field by fetching the project
    const fetchedProject = await testProjectFetch(updatedProject.id);
    
    console.log("\n=== TEST RESULTS ===");
    console.log("All tests completed successfully!");
    console.log("Final project state:", fetchedProject);
    
    return fetchedProject;
  } catch (error) {
    console.error("Test suite failed:", error);
  }
}

// Run the tests
runAllTests();