/**
 * Enhanced demo profile data generator
 * This file provides comprehensive dummy data for testing all aspects of a user profile
 * including skills, work experience, education, services, and more
 */

import { IStorage } from './storage';
import { InsertEducation, InsertService, InsertSkill, InsertWorkExperience } from '@shared/schema';

/**
 * Add comprehensive skills to the demo account
 */
async function addSkillsToMainDemo(storage: IStorage): Promise<void> {
  console.log('[enhance-demo] Adding skills to main demo account');
  
  const demoUserId = 1;
  
  const skills: InsertSkill[] = [
    {
      userId: demoUserId,
      name: "JavaScript",
      proficiency: 95
    },
    {
      userId: demoUserId,
      name: "React",
      proficiency: 92
    },
    {
      userId: demoUserId,
      name: "TypeScript",
      proficiency: 88
    },
    {
      userId: demoUserId,
      name: "Node.js",
      proficiency: 90
    },
    {
      userId: demoUserId,
      name: "AWS",
      proficiency: 85
    },
    {
      userId: demoUserId,
      name: "Docker",
      proficiency: 80
    },
    {
      userId: demoUserId,
      name: "CI/CD",
      proficiency: 82
    },
    {
      userId: demoUserId,
      name: "REST API Design",
      proficiency: 94
    },
    {
      userId: demoUserId,
      name: "SQL",
      proficiency: 86
    },
    {
      userId: demoUserId,
      name: "Agile Development",
      proficiency: 88
    },
    {
      userId: demoUserId, 
      name: "UI/UX Design",
      proficiency: 78
    }
  ];
  
  for (const skill of skills) {
    await storage.createSkill(skill);
  }
  
  console.log(`[enhance-demo] Successfully added ${skills.length} skills to demo account`);
}

/**
 * Add comprehensive work experience to the demo account
 */
async function addWorkExperiencesToMainDemo(storage: IStorage): Promise<void> {
  console.log('[enhance-demo] Adding work experiences to main demo account');
  
  const demoUserId = 1;
  
  const fixDates = (exp: any): InsertWorkExperience => {
    return {
      ...exp,
      startDate: exp.startDate ? new Date(exp.startDate) : new Date(),
      endDate: exp.endDate ? new Date(exp.endDate) : null
    };
  };
  
  const experiences = [
    {
      userId: demoUserId,
      company: "Tech Solutions Inc.",
      title: "Senior Software Engineer",
      location: "San Francisco, CA, USA",
      industry: "Technology",
      domain: "Software Development",
      startDate: "2022-03-01",
      endDate: null,
      description: "Leading the development of cloud-native applications using React, Node.js, and AWS. Implemented microservices architecture and automated CI/CD pipelines, reducing deployment time by 70%. Mentor junior developers and work closely with product management to deliver quality software solutions."
    },
    {
      userId: demoUserId,
      company: "InnovateTech Systems",
      title: "Full Stack Developer",
      location: "Seattle, WA, USA",
      industry: "Technology",
      domain: "Software Development",
      startDate: "2019-06-15",
      endDate: "2022-02-28",
      description: "Developed and maintained multiple web applications using React, TypeScript, and Node.js. Implemented RESTful APIs and integrated with third-party services. Participated in Agile development practices including daily stand-ups, sprint planning, and retrospectives."
    },
    {
      userId: demoUserId,
      company: "DataDriven Analytics",
      title: "Frontend Developer",
      location: "Boston, MA, USA",
      industry: "Analytics",
      domain: "Data Visualization",
      startDate: "2017-01-10",
      endDate: "2019-06-01",
      description: "Created interactive data visualization dashboards using D3.js and React. Worked with UX designers to implement responsive, user-friendly interfaces. Optimized application performance by implementing code splitting and lazy loading strategies."
    }
  ];
  
  for (const exp of experiences) {
    await storage.createWorkExperience(fixDates(exp));
  }
  
  console.log(`[enhance-demo] Successfully added ${experiences.length} work experiences to demo account`);
}

/**
 * Add comprehensive education history to the demo account
 */
async function addEducationToMainDemo(storage: IStorage): Promise<void> {
  console.log('[enhance-demo] Adding education to main demo account');
  
  const demoUserId = 1;
  
  const fixDates = (edu: any): InsertEducation => {
    return {
      ...edu,
      startDate: edu.startDate ? new Date(edu.startDate) : new Date(),
      endDate: edu.endDate ? new Date(edu.endDate) : null
    };
  };
  
  const education = [
    {
      userId: demoUserId,
      institution: "Stanford University",
      degree: "Master of Science",
      field: "Computer Science",
      location: "Stanford, CA, USA",
      startDate: "2015-09-01",
      endDate: "2017-05-15",
      description: "Specialized in Software Engineering and Artificial Intelligence. Participated in the university's tech incubator program and published a paper on efficient machine learning algorithms."
    },
    {
      userId: demoUserId,
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science",
      field: "Computer Science",
      location: "Berkeley, CA, USA",
      startDate: "2011-09-01",
      endDate: "2015-05-30",
      description: "Graduated with honors (3.8 GPA). Active member of the Computer Science Club and participated in multiple hackathons. Completed internships at tech startups during summer breaks."
    }
  ];
  
  for (const edu of education) {
    await storage.createEducation(fixDates(edu));
  }
  
  console.log(`[enhance-demo] Successfully added ${education.length} education entries to demo account`);
}

/**
 * Add comprehensive professional services to the demo account
 */
async function addServicesToMainDemo(storage: IStorage): Promise<void> {
  console.log('[enhance-demo] Adding professional services to main demo account');
  
  const demoUserId = 1;
  
  const services: InsertService[] = [
    {
      userId: demoUserId,
      title: "Web Application Development",
      description: "End-to-end development of custom web applications using React, Node.js, and TypeScript. Includes requirements gathering, architecture design, development, testing, and deployment.",
      category: "development",
      priceUsd: "5000",
      priceInr: "375000",
      isHourly: false,
      features: ["Custom UI/UX Design", "Responsive Mobile Interface", "API Integration", "User Authentication", "Deployment Setup"],
      imageUrl: "/images/demo/web-dev-service.svg",
      isActive: true,
      order: 1
    },
    {
      userId: demoUserId,
      title: "Technical Consulting",
      description: "Expert advice on software architecture, technology selection, and implementation strategies for startups and enterprises. Help teams make informed technical decisions and avoid costly mistakes.",
      category: "consulting",
      priceUsd: "150",
      priceInr: "11250",
      isHourly: true,
      features: ["Technology Stack Assessment", "Architecture Review", "Performance Optimization", "Scalability Planning", "Security Best Practices"],
      imageUrl: "/images/demo/tech-consulting.svg",
      isActive: true,
      order: 2
    },
    {
      userId: demoUserId,
      title: "Code Review & Refactoring",
      description: "Comprehensive code review to identify bugs, security vulnerabilities, and performance issues. Includes refactoring recommendations and implementation assistance.",
      category: "development",
      priceUsd: "1200",
      priceInr: "90000",
      isHourly: false,
      features: ["Performance Analysis", "Security Audit", "Code Quality Assessment", "Clean Code Recommendations", "Implementation Support"],
      imageUrl: "/images/demo/code-review.svg",
      isActive: true,
      order: 3
    }
  ];
  
  for (const service of services) {
    await storage.createService(service);
  }
  
  console.log(`[enhance-demo] Successfully added ${services.length} services to demo account`);
}

/**
 * Main function to enhance the demo profile with comprehensive data
 */
export async function enhanceMainDemoProfile(storage: IStorage): Promise<boolean> {
  console.log('[enhance-demo] Starting comprehensive enhancement of main demo profile');
  
  try {
    // Add or update skills
    await addSkillsToMainDemo(storage);
    
    // Add or update work experiences
    await addWorkExperiencesToMainDemo(storage);
    
    // Add or update education
    await addEducationToMainDemo(storage);
    
    // Add or update services
    await addServicesToMainDemo(storage);
    
    console.log('[enhance-demo] Successfully enhanced main demo profile with comprehensive data');
    return true;
  } catch (error) {
    console.error('[enhance-demo] Error enhancing main demo profile:', error);
    return false;
  }
}