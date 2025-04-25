import express from 'express';
import { generateCareerAdvice, analyzeResume, generateNetworkingRecommendations } from './services/anthropic-service';

export const registerMuskAnthropicRoutes = (app: express.Express) => {
  // Career advice endpoint
  app.post('/api/musk-anthropic/career-advice', async (req, res) => {
    try {
      const {
        name,
        title,
        lookingFor,
        industry,
        domain,
        location,
        skills,
        experiences,
        educations,
        projects,
        adviceType
      } = req.body;

      // Validate required fields
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const result = await generateCareerAdvice({
        name,
        title,
        lookingFor,
        industry,
        domain,
        location,
        skills,
        experiences,
        educations,
        projects,
        adviceType
      });

      res.json(result);
    } catch (error) {
      console.error('Error in career advice endpoint:', error);
      res.status(500).json({ error: error.message || 'Failed to generate career advice' });
    }
  });

  // Resume analysis endpoint
  app.post('/api/musk-anthropic/resume-analysis', async (req, res) => {
    try {
      const { resumeText } = req.body;

      // Validate required fields
      if (!resumeText) {
        return res.status(400).json({ error: 'Resume text is required' });
      }

      const result = await analyzeResume({ resumeText });
      res.json(result);
    } catch (error) {
      console.error('Error in resume analysis endpoint:', error);
      res.status(500).json({ error: error.message || 'Failed to analyze resume' });
    }
  });

  // Networking recommendations endpoint
  app.post('/api/musk-anthropic/networking-recommendations', async (req, res) => {
    try {
      const {
        name,
        title,
        industry,
        domain,
        location,
        skills,
        lookingFor,
        targetIndustry,
        purpose
      } = req.body;

      // Validate required fields
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const result = await generateNetworkingRecommendations(
        {
          name,
          title,
          industry,
          domain,
          location,
          skills,
          lookingFor
        },
        targetIndustry,
        purpose
      );

      res.json(result);
    } catch (error) {
      console.error('Error in networking recommendations endpoint:', error);
      res.status(500).json({ error: error.message || 'Failed to generate networking recommendations' });
    }
  });

  // Example career advice demo endpoint with pre-filled data
  app.get('/api/musk-anthropic/demo/career-advice/:type', async (req, res) => {
    try {
      const adviceType = req.params.type as 'career_growth' | 'industry_switch' | 'skill_development' | 'interview_prep' | 'networking';
      
      // Demo profile data
      const demoProfile = {
        name: "Alex Johnson",
        title: "Senior Software Developer",
        industry: "Technology",
        domain: "Software Development",
        location: "San Francisco, CA",
        lookingFor: "Career advancement opportunities",
        skills: [
          { name: "JavaScript", proficiency: 90, level: "Expert" },
          { name: "React", proficiency: 85, level: "Advanced" },
          { name: "Node.js", proficiency: 80, level: "Advanced" },
          { name: "TypeScript", proficiency: 75, level: "Intermediate" },
          { name: "Python", proficiency: 60, level: "Intermediate" },
          { name: "Project Management", proficiency: 70, level: "Intermediate" }
        ],
        experiences: [
          {
            title: "Senior Software Developer",
            company: "TechCorp Inc.",
            startDate: "2020-01-01",
            domain: "Enterprise Software",
            keyResponsibilities: [
              "Led development of React-based front-end applications",
              "Mentored junior developers on best practices",
              "Implemented CI/CD pipelines for automated testing and deployment"
            ]
          },
          {
            title: "Software Developer",
            company: "Innovate Solutions",
            startDate: "2017-03-01",
            endDate: "2019-12-31",
            domain: "Financial Technology",
            keyResponsibilities: [
              "Developed and maintained web applications using JavaScript",
              "Integrated third-party payment processing APIs",
              "Implemented responsive design principles for mobile compatibility"
            ]
          }
        ],
        educations: [
          {
            degree: "Bachelor of Science",
            fieldOfStudy: "Computer Science",
            institution: "University of California",
            startDate: "2013-09-01",
            endDate: "2017-05-31"
          }
        ],
        projects: [
          {
            title: "Enterprise Dashboard",
            category: "Web Application",
            startDate: "2021-02-01",
            description: "Designed and implemented a real-time analytics dashboard using React, Node.js, and WebSockets"
          }
        ],
        adviceType: adviceType
      };

      const result = await generateCareerAdvice(demoProfile);
      res.json(result);
    } catch (error) {
      console.error('Error in demo career advice endpoint:', error);
      res.status(500).json({ error: error.message || 'Failed to generate demo career advice' });
    }
  });

  // Example resume analysis demo endpoint
  app.get('/api/musk-anthropic/demo/resume-analysis', async (req, res) => {
    try {
      // Sample resume text for demo
      const sampleResume = `
ALEX JOHNSON
San Francisco, CA | alex.johnson@email.com | (555) 123-4567 | linkedin.com/in/alexjohnson

PROFESSIONAL SUMMARY
Senior Software Developer with 6+ years of experience building scalable web applications. Expertise in JavaScript, React, and Node.js with a strong focus on user experience and performance optimization. Proven track record of leading development teams and delivering high-quality software solutions.

SKILLS
• Programming Languages: JavaScript, TypeScript, Python, HTML, CSS
• Frontend: React, Redux, Angular, Vue.js
• Backend: Node.js, Express, Django
• Databases: MongoDB, PostgreSQL, MySQL
• Tools: Git, Docker, Jenkins, Webpack, Jest
• Methodologies: Agile, Scrum, TDD, CI/CD

PROFESSIONAL EXPERIENCE

TECHCORP INC.
Senior Software Developer | Jan 2020 - Present
• Led development of a React-based enterprise dashboard application that improved client reporting efficiency by 40%
• Mentored 5 junior developers, implementing code review processes that reduced production bugs by 30%
• Implemented CI/CD pipelines using Jenkins, reducing deployment time from days to hours
• Optimized application performance, achieving a 25% reduction in load time
• Collaborated with product managers to define and prioritize features based on user feedback

INNOVATE SOLUTIONS
Software Developer | Mar 2017 - Dec 2019
• Developed responsive web applications using JavaScript, HTML, and CSS
• Integrated multiple third-party payment processing APIs, ensuring PCI compliance
• Implemented responsive design principles, increasing mobile user engagement by 35%
• Collaborated in an Agile environment with 2-week sprint cycles
• Participated in code reviews and maintained 90% test coverage

EDUCATION
University of California, Berkeley
Bachelor of Science in Computer Science | Graduated May 2017
• Coursework: Data Structures, Algorithms, Database Systems, Software Engineering
• Senior Project: Developed a mobile application for campus event discovery

PROJECTS
Enterprise Analytics Dashboard | 2021
• Created a real-time analytics dashboard using React, Node.js, and WebSockets
• Implemented data visualization components that processed over 1M data points
• Deployed on AWS using Docker containers and auto-scaling groups

Open Source Contribution | 2019-Present
• Active contributor to React ecosystem libraries
• Published npm packages with 10k+ monthly downloads
• Presented at local JavaScript meetups on component design patterns
`;

      const result = await analyzeResume(sampleResume);
      res.json(result);
    } catch (error) {
      console.error('Error in demo resume analysis endpoint:', error);
      res.status(500).json({ error: error.message || 'Failed to generate demo resume analysis' });
    }
  });

  console.log('Musk AI Career Assistant routes (Anthropic) loaded');
};