// Create a direct test function to avoid module issues
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Simplified version of the parseResumeText function for testing
async function parseResumeText(resumeText) {
  try {
    console.log("Starting resume parsing with test function");
    
    // Simple parsing logic to extract key sections
    const experienceSection = resumeText.match(/EXPERIENCE([\s\S]*?)(?:EDUCATION|SKILLS|$)/i)?.[1] || '';
    const educationSection = resumeText.match(/EDUCATION([\s\S]*?)(?:EXPERIENCE|SKILLS|$)/i)?.[1] || '';
    const skillsSection = resumeText.match(/SKILLS([\s\S]*?)(?:EXPERIENCE|EDUCATION|$)/i)?.[1] || '';
    
    // Extract basic info
    const firstLines = resumeText.split('\n').slice(0, 5);
    const title = firstLines.find(line => /engineer|developer|manager/i.test(line)) || undefined;
    const location = firstLines.find(line => /[A-Z][a-z]+,\s*[A-Z]{2}/i.test(line)) || undefined;
    
    // Extract skills
    const skills = skillsSection
      .split(/[,\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 2 && s.length < 30)
      .map(name => ({
        userId: 0,
        name,
        level: "Intermediate",
        proficiency: 60
      }));
    
    // Extract experience entries (simplified)
    const experiences = [];
    const expMatches = experienceSection.match(/(.+?)\s+at\s+(.+?),\s+([^,]+)(?:,\s+([^,]+))?\s+([^•]+)/gi);
    if (expMatches) {
      for (const match of expMatches) {
        const parts = match.split(/\s+at\s+|\s*,\s*/);
        if (parts.length >= 3) {
          experiences.push({
            userId: 0,
            title: parts[0].trim(),
            company: parts[1].trim(),
            location: parts[2].trim() || null,
            startDate: match.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b/)?.[0] || "2020",
            endDate: match.includes("Present") ? "Present" : null,
            description: null
          });
        }
      }
    }
    
    // Extract education entries (simplified)
    const educations = [];
    const eduLines = educationSection.split('\n').filter(line => line.trim());
    
    // Process education entries in pairs of lines
    for (let i = 0; i < eduLines.length - 1; i += 2) {
      const degreeLine = eduLines[i].trim();
      const institutionLine = eduLines[i+1]?.trim() || '';
      
      if (degreeLine && institutionLine) {
        // Extract degree
        const degree = degreeLine;
        
        // Extract institution and location
        const institutionParts = institutionLine.split(',').map(p => p.trim());
        const institution = institutionParts[0] || 'Unknown Institution';
        const location = institutionParts[1] || null;
        
        // Extract years
        const years = institutionLine.match(/\b\d{4}\b/g) || [];
        const startDate = years[0] || "2020";
        const endDate = years[1] || "Present";
        
        educations.push({
          userId: 0,
          degree,
          institution,
          location,
          startDate,
          endDate
        });
      }
    }
    
    console.log("Test parsing complete");
    return {
      experiences,
      educations,
      skills,
      title,
      location
    };
  } catch (error) {
    console.error("Error in test parser:", error);
    return {
      experiences: [],
      educations: [],
      skills: [],
      error: error.message || "Unknown error parsing resume"
    };
  }
}

const sampleResume = `
JOHN DOE
Senior Software Engineer
San Francisco, CA
johndoe@example.com | (555) 123-4567

SUMMARY
Experienced software engineer with 8+ years of experience in full-stack development.
Proficient in JavaScript, TypeScript, React, and Node.js.

EXPERIENCE
Senior Software Engineer at Tech Company, San Francisco, CA
January 2020 - Present
• Led a team of 5 developers on a customer-facing web application
• Implemented CI/CD pipeline reducing deployment time by 40%
• Architected and developed RESTful API services using Node.js and Express

Software Engineer at Previous Company, Seattle, WA
May 2017 - December 2019
• Developed responsive web applications using React and Redux
• Collaborated with UX designers to implement user-friendly interfaces
• Wrote unit and integration tests achieving 85% code coverage

EDUCATION
Master of Computer Science
Top University, Boston, MA
2015 - 2017

Bachelor of Science in Computer Engineering
Another University, Chicago, IL
2011 - 2015

SKILLS
JavaScript, TypeScript, React, Redux, Node.js, Express, MongoDB, AWS, Git, Docker,
RESTful APIs, GraphQL, Agile/Scrum, CI/CD, Jest, Webpack
`;

(async () => {
  try {
    console.log("Starting parser test...");
    
    // Test the parser with sample resume
    const parsedData = await parseResumeText(sampleResume);
    
    console.log("Parser test completed successfully!");
    console.log("Parsed data:", JSON.stringify(parsedData, null, 2));
    
    // Log counts
    console.log(`Found ${parsedData.experiences.length} experience items`);
    console.log(`Found ${parsedData.educations.length} education items`);
    console.log(`Found ${parsedData.skills.length} skill items`);
    console.log(`Found title: ${parsedData.title || 'none'}`);
    console.log(`Found location: ${parsedData.location || 'none'}`);
    
  } catch (error) {
    console.error("Parser test failed with error:", error);
  }
})();