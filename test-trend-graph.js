/**
 * Test Script for Trend Graph API
 * 
 * This script tests the functionality of the Trend Graph API endpoints
 * which support Musk's ability to provide data-driven career guidance.
 */

import fetch from 'node-fetch';

// Test data for skill trends
const testSkillTrend = {
  skillName: "React",
  industry: "Software Development",
  category: "Frontend",
  growthRate: "18.5", // Changed to string to match schema
  demandScore: 92,
  timeFrame: "1_year",
  dataSource: "LinkedIn Jobs Analysis",
  jobCount: 23450,
  avgSalaryImpact: 12000,
  relatedSkills: ["Vue.js", "Angular", "TypeScript", "Redux"]
};

// Test data for career path nodes
const testJobNode = {
  jobTitle: "Frontend Developer",
  industry: "Software Development",
  level: "Mid-Level",
  avgSalary: 95000,
  requiredSkills: ["HTML", "CSS", "JavaScript", "React"],
  recommendedSkills: ["TypeScript", "Redux", "GraphQL"],
  jobDescription: "Design and build user interfaces for web applications using modern JavaScript frameworks",
  growthOutlook: "Strong growth expected over the next 5 years",
  entryBarrier: "Medium",
  commonPathways: {
    previous: ["Junior Developer", "UI Designer"],
    next: ["Senior Frontend Developer", "Full Stack Developer", "Frontend Team Lead"]
  }
};

// Helper function to log a response
async function logResponse(response) {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const data = await response.json();
    console.log('Response: ', JSON.stringify(data, null, 2));
    return data;
  } else {
    const text = await response.text();
    console.log('Response: ', text);
    return text;
  }
}

// Test adding a skill trend
async function testAddSkillTrend() {
  console.log('\n===== Testing Add Skill Trend =====');
  try {
    const response = await fetch('http://localhost:5000/api/trend-graph/admin/skills', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testSkillTrend)
    });
    
    console.log('Status:', response.status);
    const data = await logResponse(response);
    
    if (data.status === 'success') {
      console.log('✅ Add skill trend test passed');
      return data.data.id;
    } else {
      console.log('❌ Add skill trend test failed');
      return null;
    }
  } catch (error) {
    console.error('Error testing add skill trend:', error);
    return null;
  }
}

// Test adding a job node
async function testAddJobNode() {
  console.log('\n===== Testing Add Career Path Node =====');
  try {
    const response = await fetch('http://localhost:5000/api/trend-graph/admin/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testJobNode)
    });
    
    console.log('Status:', response.status);
    const data = await logResponse(response);
    
    if (data.status === 'success') {
      console.log('✅ Add job node test passed');
      return data.data.id;
    } else {
      console.log('❌ Add job node test failed');
      return null;
    }
  } catch (error) {
    console.error('Error testing add job node:', error);
    return null;
  }
}

// Test getting trending skills
async function testGetTrendingSkills() {
  console.log('\n===== Testing Get Trending Skills =====');
  try {
    const response = await fetch('http://localhost:5000/api/trend-graph/skills/trending?industry=Software%20Development&timeFrame=1_year');
    
    console.log('Status:', response.status);
    const data = await logResponse(response);
    
    if (data.status === 'success') {
      console.log('✅ Get trending skills test passed');
      return true;
    } else {
      console.log('❌ Get trending skills test failed');
      return false;
    }
  } catch (error) {
    console.error('Error testing get trending skills:', error);
    return false;
  }
}

// Test searching skills
async function testSearchSkills() {
  console.log('\n===== Testing Search Skills =====');
  try {
    const response = await fetch('http://localhost:5000/api/trend-graph/skills/search?query=React');
    
    console.log('Status:', response.status);
    const data = await logResponse(response);
    
    if (data.status === 'success') {
      console.log('✅ Search skills test passed');
      return true;
    } else {
      console.log('❌ Search skills test failed');
      return false;
    }
  } catch (error) {
    console.error('Error testing search skills:', error);
    return false;
  }
}

// Test adding a career transition
async function testAddCareerTransition(fromNodeId, toNodeId) {
  if (!fromNodeId || !toNodeId) {
    console.log('\n===== Skipping Add Career Transition (missing node IDs) =====');
    return null;
  }
  
  console.log('\n===== Testing Add Career Transition =====');
  
  const testTransition = {
    fromNodeId,
    toNodeId,
    transitionDifficulty: "Medium",
    skillGaps: ["Redux", "GraphQL", "Testing"],
    avgTransitionTime: 6,
    recommendedSteps: [
      "Complete advanced React course",
      "Build portfolio with Redux projects",
      "Learn GraphQL basics"
    ],
    successRate: 75
  };
  
  try {
    const response = await fetch('http://localhost:5000/api/trend-graph/admin/transitions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testTransition)
    });
    
    console.log('Status:', response.status);
    const data = await logResponse(response);
    
    if (data.status === 'success') {
      console.log('✅ Add career transition test passed');
      return data.data.id;
    } else {
      console.log('❌ Add career transition test failed');
      return null;
    }
  } catch (error) {
    console.error('Error testing add career transition:', error);
    return null;
  }
}

// Test career path generation
async function testGenerateCareerPath() {
  console.log('\n===== Testing Generate Career Path =====');
  
  const pathRequest = {
    currentJobTitle: "Frontend Developer",
    targetJobTitle: "Senior Frontend Developer",
    industry: "Software Development"
  };
  
  try {
    const response = await fetch('http://localhost:5000/api/trend-graph/career/path', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pathRequest)
    });
    
    console.log('Status:', response.status);
    const data = await logResponse(response);
    
    if (data.status === 'success') {
      console.log('✅ Generate career path test passed');
      return true;
    } else {
      console.log('Path generation message:', data.message);
      console.log('❓ Generate career path test completed with expected response');
      return false;
    }
  } catch (error) {
    console.error('Error testing generate career path:', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('Starting Trend Graph API tests...');
  
  // Add test data first
  const skillTrendId = await testAddSkillTrend();
  const jobNodeId1 = await testAddJobNode();
  
  // Modify test job for a second role
  const seniorJobNode = {
    ...testJobNode,
    jobTitle: "Senior Frontend Developer",
    level: "Senior",
    avgSalary: 130000,
    requiredSkills: ["HTML", "CSS", "JavaScript", "React", "Redux", "TypeScript"],
    recommendedSkills: ["Architecture", "Team Leadership", "Performance Optimization"]
  };
  
  const jobNodeId2 = await fetch('http://localhost:5000/api/trend-graph/admin/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(seniorJobNode)
  }).then(r => r.json()).then(d => d.data?.id).catch(() => null);
  
  console.log(`Created job nodes with IDs: ${jobNodeId1}, ${jobNodeId2}`);
  
  if (jobNodeId1 && jobNodeId2) {
    await testAddCareerTransition(jobNodeId1, jobNodeId2);
  }
  
  // Test retrieval APIs
  await testGetTrendingSkills();
  await testSearchSkills();
  await testGenerateCareerPath();
  
  console.log('\nAll Trend Graph API tests completed!');
}

// Run the tests
runAllTests();