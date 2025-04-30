/**
 * Test Script for Project Industry Field
 * 
 * This script tests the industry field in project creation and updates
 * to verify that it's being properly saved and retrieved.
 */
import fetch from 'node-fetch';

// Test project data with industry field
const testProject = {
  userId: 1, // Demo user
  title: "Test Project with Industry Field",
  description: "Testing if industry field is properly saved and retrieved",
  category: "Testing",
  industry: "Technology", // Explicitly set industry
  startDate: new Date().toISOString().split('T')[0],
  projectUrl: "https://example.com/test-project"
};

async function createTestProject() {
  try {
    console.log("Creating test project with industry field...");
    console.log("Project data:", JSON.stringify(testProject, null, 2));
    
    const response = await fetch('http://localhost:5000/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testProject)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error creating project:", errorText);
      return null;
    }
    
    const project = await response.json();
    console.log("Created project:", JSON.stringify(project, null, 2));
    console.log("Industry field present:", project.industry !== undefined);
    console.log("Industry value:", project.industry);
    
    return project;
  } catch (error) {
    console.error("Error in createTestProject:", error);
    return null;
  }
}

async function getAndVerifyProject(id) {
  try {
    console.log(`Getting project ${id} to verify industry field...`);
    
    const response = await fetch(`http://localhost:5000/api/projects/${id}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error getting project:", errorText);
      return null;
    }
    
    const project = await response.json();
    console.log("Retrieved project:", JSON.stringify(project, null, 2));
    console.log("Industry field present:", project.industry !== undefined);
    console.log("Industry value:", project.industry);
    
    return project;
  } catch (error) {
    console.error("Error in getAndVerifyProject:", error);
    return null;
  }
}

async function updateProjectIndustry(id) {
  try {
    console.log(`Updating project ${id} industry field...`);
    
    const updatedData = {
      industry: "Healthcare" // Change industry
    };
    
    const response = await fetch(`http://localhost:5000/api/projects/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error updating project:", errorText);
      return null;
    }
    
    const project = await response.json();
    console.log("Updated project:", JSON.stringify(project, null, 2));
    console.log("Industry field present:", project.industry !== undefined);
    console.log("Industry value:", project.industry);
    
    return project;
  } catch (error) {
    console.error("Error in updateProjectIndustry:", error);
    return null;
  }
}

async function getAllUserProjects(userId) {
  try {
    console.log(`Getting all projects for user ${userId}...`);
    
    const response = await fetch(`http://localhost:5000/api/users/${userId}/projects`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error getting user projects:", errorText);
      return null;
    }
    
    const projects = await response.json();
    console.log(`Found ${projects.length} projects`);
    
    // Check if any projects have industry field
    const projectsWithIndustry = projects.filter(p => p.industry !== null && p.industry !== undefined);
    console.log(`Projects with industry field: ${projectsWithIndustry.length}/${projects.length}`);
    
    return projects;
  } catch (error) {
    console.error("Error in getAllUserProjects:", error);
    return null;
  }
}

async function cleanupTestProject(id) {
  try {
    console.log(`Cleaning up test project ${id}...`);
    
    const response = await fetch(`http://localhost:5000/api/projects/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error deleting project:", errorText);
      return false;
    }
    
    console.log(`Successfully deleted test project ${id}`);
    return true;
  } catch (error) {
    console.error("Error in cleanupTestProject:", error);
    return false;
  }
}

async function runTests() {
  console.log("===== Testing Project Industry Field =====");
  
  // First, check existing projects
  await getAllUserProjects(1);
  
  // Create a test project with industry field
  const createdProject = await createTestProject();
  if (!createdProject) {
    console.error("Failed to create test project. Aborting tests.");
    return;
  }
  
  // Verify project after creation
  await getAndVerifyProject(createdProject.id);
  
  // Update project industry
  await updateProjectIndustry(createdProject.id);
  
  // Verify project after update
  await getAndVerifyProject(createdProject.id);
  
  // Cleanup
  await cleanupTestProject(createdProject.id);
  
  console.log("===== Test Complete =====");
}

// Run the tests
runTests().catch(error => {
  console.error("Unhandled error in test script:", error);
});

// Export functions for use as module
export {
  createTestProject,
  getAndVerifyProject,
  updateProjectIndustry,
  getAllUserProjects,
  cleanupTestProject
};