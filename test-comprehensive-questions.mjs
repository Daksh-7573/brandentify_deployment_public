/**
 * Comprehensive Test for All Question-Specific Responses
 * 
 * Tests all implemented question types including the new job application guidance
 */

async function testComprehensiveQuestions() {
  console.log('=== Testing All Question-Specific Responses ===\n');
  
  const testQuestions = [
    {
      question: "Which portfolio layout is best for my experience level?",
      expectedKeywords: ["Corporate Executive", "Strategic Leadership", "director-level"],
      category: "Portfolio"
    },
    {
      question: "How can I improve my skills presentation?",
      expectedKeywords: ["Technical Skills Enhancement", "Leadership Skills", "skill progression"],
      category: "Skills"
    },
    {
      question: "How to showcase my experience better?",
      expectedKeywords: ["Structure Each Role", "Director-Level Focus", "business challenge"],
      category: "Experience"
    },
    {
      question: "How can I network more effectively?",
      expectedKeywords: ["Strategic Networking", "C-suite executives", "Brandentifier profile"],
      category: "Networking"
    },
    {
      question: "how can I make resume",
      expectedKeywords: ["Resume Structure", "Executive Summary", "ATS optimization"],
      category: "Resume"
    },
    {
      question: "how to apply the job?",
      expectedKeywords: ["Application Strategy", "Director-Level Roles", "business outcomes"],
      category: "Job Application"
    },
    {
      question: "career change advice",
      expectedKeywords: ["Executive Job Search Strategy", "strategic roadmap", "high-level position"],
      category: "Career Change"
    },
    {
      question: "goal to get new job in high position",
      expectedKeywords: ["Executive Job Search Strategy", "Target Identification", "hospitality executives"],
      category: "Job Search Goals"
    }
  ];

  for (const test of testQuestions) {
    console.log(`--- Testing: "${test.question}" ---`);
    
    try {
      const response = await fetch('http://localhost:5000/api/musk/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: test.question,
          userId: 2
        })
      });

      if (!response.ok) {
        console.log(`❌ HTTP error! status: ${response.status}`);
        continue;
      }

      const data = await response.json();
      console.log('✅ Response received');
      
      // Check if response contains expected content
      const containsExpected = test.expectedKeywords.some(keyword => 
        data.message.includes(keyword)
      );
      
      if (containsExpected) {
        console.log(`✅ Contains expected content: ${test.expectedKeywords.join(', ')}`);
      } else {
        console.log(`❌ Missing expected content. Got: ${data.message.substring(0, 100)}...`);
      }
      
      // Check if response is detailed (not generic)
      if (data.message.length > 200) {
        console.log('✅ Response is detailed and specific');
      } else {
        console.log('❌ Response seems too short/generic');
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('=== Comprehensive Question Test Complete ===');
}

testComprehensiveQuestions();