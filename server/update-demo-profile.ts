import { IStorage } from './storage';
import { 
  InsertWorkExperience, 
  InsertEducation, 
  InsertSkill, 
  InsertProject,
  InsertService
} from '../shared/schema';

// Helper to convert Date objects to string dates for schema compatibility
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
}

// Fix work experience with string dates
function fixWorkExperience(exp: any): InsertWorkExperience {
  return {
    ...exp,
    startDate: formatDate(exp.startDate as Date),
    endDate: exp.endDate ? formatDate(exp.endDate as Date) : null
  };
}

// Fix education with string dates
function fixEducation(edu: any): InsertEducation {
  return {
    ...edu,
    startDate: formatDate(edu.startDate as Date),
    endDate: edu.endDate ? formatDate(edu.endDate as Date) : null
  };
}

// Fix project with string dates
function fixProject(proj: any): InsertProject {
  return {
    ...proj,
    startDate: formatDate(proj.startDate as Date),
    endDate: proj.endDate ? formatDate(proj.endDate as Date) : null
  };
}

/**
 * Updates the demo user account (userId: 1) with comprehensive data for all templates
 */
export async function updateDemoUserProfile(storage: IStorage) {
  const userId = 1; // Main demo user ID
  
  // Add skills
  const skills = [
    {
      userId,
      name: "JavaScript",
      proficiency: 95,
      category: "Programming",
      endorsements: 42,
      isVerified: true,
    },
    {
      userId,
      name: "React",
      proficiency: 90,
      category: "Frontend",
      endorsements: 38,
      isVerified: true,
    },
    {
      userId,
      name: "TypeScript",
      proficiency: 85,
      category: "Programming",
      endorsements: 31,
      isVerified: true,
    },
    {
      userId,
      name: "Node.js",
      proficiency: 88,
      category: "Backend",
      endorsements: 27,
      isVerified: true,
    },
    {
      userId,
      name: "GraphQL",
      proficiency: 80,
      category: "API",
      endorsements: 22,
      isVerified: true,
    },
    {
      userId,
      name: "AWS",
      proficiency: 75,
      category: "Cloud",
      endorsements: 24,
      isVerified: true,
    },
    {
      userId,
      name: "Docker",
      proficiency: 82,
      category: "DevOps",
      endorsements: 19,
      isVerified: true,
    },
    {
      userId,
      name: "Agile Methodologies",
      proficiency: 90,
      category: "Project Management",
      endorsements: 34,
      isVerified: true,
    },
    {
      userId,
      name: "UX/UI Design",
      proficiency: 78,
      category: "Design",
      endorsements: 15,
      isVerified: true,
    },
    {
      userId,
      name: "Data Analytics",
      proficiency: 72,
      category: "Data",
      endorsements: 12,
      isVerified: true,
    }
  ];

  for (const skill of skills) {
    await storage.createSkill(skill);
  }
  
  // Add work experiences
  const experiences = [
    {
      userId,
      company: "Innovative Solutions Inc.",
      title: "Senior Software Engineer",
      location: "San Francisco, CA",
      description: "Led development of enterprise SaaS platform using React, Node.js and GraphQL. Implemented CI/CD pipelines and microservices architecture. Mentored junior developers and conducted code reviews. Improved app performance by 40% through optimization techniques.",
      startDate: new Date("2021-03-01"),
      endDate: null,
      isCurrent: true,
    },
    {
      userId,
      company: "TechGrowth Startups",
      title: "Full Stack Developer",
      location: "San Jose, CA",
      description: "Developed and maintained multiple web applications for fintech clients. Created responsive interfaces with React and Redux. Built RESTful APIs using Node.js and Express. Integrated payment gateways and third-party services. Participated in agile development cycles.",
      startDate: new Date("2018-06-01"),
      endDate: new Date("2021-02-28"),
      isCurrent: false,
    },
    {
      userId,
      company: "Digital Creators Lab",
      title: "Frontend Developer",
      location: "Oakland, CA",
      description: "Designed and implemented user interfaces for e-commerce sites. Focused on responsive design and cross-browser compatibility. Collaborated with UX designers to enhance user experience. Used JavaScript, CSS, and modern frameworks to create interactive elements.",
      startDate: new Date("2016-09-01"),
      endDate: new Date("2018-05-31"),
      isCurrent: false,
    }
  ];

  for (const exp of experiences) {
    const fixedExp = fixWorkExperience(exp);
    await storage.createWorkExperience(fixedExp);
  }
  
  // Add education
  const education = [
    {
      userId,
      institution: "Stanford University",
      degree: "Master of Science",
      field: "Computer Science",
      description: "Specialized in Human-Computer Interaction and Artificial Intelligence. Conducted research on natural language processing applications for improving accessibility. Participated in Stanford's annual CS hackathon, winning first place for an AI-powered educational tool.",
      startDate: new Date("2014-09-01"),
      endDate: new Date("2016-06-30"),
      isCurrent: false,
    },
    {
      userId,
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science",
      field: "Computer Engineering",
      description: "Graduated with honors. Active member of the ACM student chapter and participated in multiple hackathons. Completed senior project on embedded systems for IoT applications. Worked as teaching assistant for Introduction to Programming courses.",
      startDate: new Date("2010-09-01"),
      endDate: new Date("2014-05-31"),
      isCurrent: false,
    }
  ];

  for (const edu of education) {
    const fixedEdu = fixEducation(edu);
    await storage.createEducation(fixedEdu);
  }
  
  // Add projects (beyond the one that exists)
  const projects = [
    {
      userId,
      title: "Smart Health Monitoring Dashboard",
      description: "A real-time health analytics platform that integrates with wearable devices to provide personalized health insights. Features include customizable dashboards, trend analysis, and AI-powered recommendations for improving health metrics.",
      startDate: new Date("2022-02-01"),
      projectUrl: "https://example.com/health-dashboard",
      category: "Healthcare Technology",
      thumbnailUrl: "/images/demo/ui-design-2.svg",
      thumbnailFile: null,
      mediaUrls: ["/images/demo/ui-design-2.svg", "/images/demo/ui-design-3.svg"],
    },
    {
      userId,
      title: "Sustainable Commerce Platform",
      description: "An e-commerce solution focused on eco-friendly products with carbon footprint tracking and sustainable shipping options. Implemented a blockchain-based supply chain verification system to ensure ethical sourcing of all products.",
      startDate: new Date("2021-05-15"),
      projectUrl: "https://example.com/eco-commerce",
      category: "E-commerce",
      thumbnailUrl: "/images/demo/ui-design-3.svg",
      thumbnailFile: null,
      mediaUrls: ["/images/demo/ui-design-3.svg", "/images/demo/ui-design-1.svg"],
    },
    {
      userId,
      title: "Community Learning Network",
      description: "A peer-to-peer knowledge sharing platform that connects experts with learners. Features include interactive workshops, skill verification, and a reputation-based mentorship system. Used WebRTC for real-time communication.",
      startDate: new Date("2020-08-10"),
      projectUrl: "https://example.com/learn-network",
      category: "Education",
      thumbnailUrl: "/images/demo/ui-design-1.svg",
      thumbnailFile: null,
      mediaUrls: ["/images/demo/ui-design-1.svg"],
    }
  ];

  for (const project of projects) {
    const fixedProject = fixProject(project);
    await storage.createProject(fixedProject);
  }
  
  // Add services
  const services = [
    {
      userId,
      title: "Full-Stack Development",
      description: "End-to-end web application development using modern JavaScript frameworks and cloud infrastructure. Services include architecture planning, frontend and backend implementation, database design, and deployment strategies.",
      rate: 120,
      rateUnit: "hourly",
      category: "Development",
      availability: "Part-time",
      thumbnailUrl: "/images/demo/ui-design-1.svg",
    },
    {
      userId,
      title: "Technical Consultation",
      description: "Expert guidance on technology stack selection, system architecture, and scaling strategies. Includes codebase audits, performance optimization recommendations, and migration planning for legacy systems.",
      rate: 150,
      rateUnit: "hourly",
      category: "Consulting",
      availability: "Flexible",
      thumbnailUrl: "/images/demo/ui-design-2.svg",
    },
    {
      userId,
      title: "UX/UI Design & Implementation",
      description: "Creating intuitive and engaging user experiences with a focus on accessibility and conversion optimization. Includes wireframing, interactive prototyping, user testing, and implementation using modern frontend technologies.",
      rate: 1800,
      rateUnit: "project",
      category: "Design",
      availability: "Available",
      thumbnailUrl: "/images/demo/ui-design-3.svg",
    }
  ];

  for (const service of services) {
    await storage.createService(service);
  }
  
  console.log(`Successfully updated demo user (ID: ${userId}) with complete profile data`);
}