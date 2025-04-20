import { IStorage } from './storage';
import { 
  InsertUser, 
  InsertWorkExperience, 
  InsertEducation, 
  InsertSkill, 
  InsertProject,
  InsertProjectCollaborator
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

// Fix collaborator for the ProfileLink field 
function fixCollaborator(collab: any): InsertProjectCollaborator {
  // Create a fixed object with the fields that are in the schema
  return {
    projectId: collab.projectId,
    userId: collab.userId,
    name: collab.name,
    email: null,
    profileLink: collab.contribution || "", // Use contribution text as profileLink
    role: collab.role,
  };
}

/**
 * Creates three complete demo profiles with all details
 */
export async function createDemoProfiles(storage: IStorage) {
  console.log("Creating demo profiles...");
  
  // Demo Profile 1: Tech Executive
  const techProfile = await createTechExecutiveProfile(storage);
  
  // Demo Profile 2: UX Designer
  const designerProfile = await createUXDesignerProfile(storage);
  
  // Demo Profile 3: Data Scientist
  const dataScientistProfile = await createDataScientistProfile(storage);
  
  console.log(`Successfully created 3 demo profiles with IDs: ${techProfile.id}, ${designerProfile.id}, ${dataScientistProfile.id}`);
  
  // Create demo Musk Matches between these profiles
  await createDemoMuskMatches(storage, techProfile.id, designerProfile.id, dataScientistProfile.id);
  
  // Create demo Nowboard items
  await createDemoNowboardItems(storage, techProfile.id, designerProfile.id, dataScientistProfile.id);
  
  return {
    techProfile,
    designerProfile,
    dataScientistProfile
  };
}

/**
 * Creates demo Musk Match suggestions between the demo user profiles
 */
async function createDemoMuskMatches(storage: IStorage, techId: number, designerId: number, dataScientistId: number) {
  console.log("Creating demo Musk Match suggestions...");
  
  // Create matches for Tech Executive (techId)
  const techMatches = [
    {
      userId: techId,
      suggestedUserId: dataScientistId,
      matchType: "Strategic Partnership",
      matchScore: 89,
      matchReason: "Alex's leadership experience in tech complements David's data science expertise. A potential collaboration could lead to innovative AI-driven solutions.",
      industry: "Technology",
      domain: "Artificial Intelligence",
      skills: ["Leadership", "AI Strategy", "Product Development"],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expires in 30 days
    },
    {
      userId: techId,
      suggestedUserId: designerId,
      matchType: "Mentorship",
      matchScore: 76,
      matchReason: "Alex can provide valuable industry insights to Maya, while benefiting from her creative UX perspective on product development.",
      industry: "Technology",
      domain: "Product Design",
      skills: ["UX Strategy", "Product Management", "Design Thinking"],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expires in 30 days
    }
  ];
  
  // Create matches for UX Designer (designerId)
  const designerMatches = [
    {
      userId: designerId,
      suggestedUserId: techId,
      matchType: "Career Advice",
      matchScore: 82,
      matchReason: "Maya could gain valuable insights from Alex on scaling design systems for enterprise applications and career growth in tech leadership.",
      industry: "Design",
      domain: "Enterprise UX",
      skills: ["Leadership", "Design Systems", "Enterprise Software"],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expires in 30 days
    },
    {
      userId: designerId,
      suggestedUserId: dataScientistId,
      matchType: "Collaboration",
      matchScore: 91,
      matchReason: "Maya's UX expertise combined with David's data visualization skills could create more intuitive interfaces for complex data analytics.",
      industry: "Data Visualization",
      domain: "Interactive Analytics",
      skills: ["Data Visualization", "User Research", "Interface Design"],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expires in 30 days
    }
  ];
  
  // Create matches for Data Scientist (dataScientistId)
  const dataScientistMatches = [
    {
      userId: dataScientistId,
      suggestedUserId: techId,
      matchType: "Industry Connection",
      matchScore: 88,
      matchReason: "David's ML models could find commercial applications through Alex's network and product development expertise.",
      industry: "Artificial Intelligence",
      domain: "Commercial AI Applications",
      skills: ["Product Strategy", "ML Implementation", "Go-to-Market"],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expires in 30 days
    },
    {
      userId: dataScientistId,
      suggestedUserId: designerId,
      matchType: "Project Collaboration",
      matchScore: 85,
      matchReason: "David's healthcare analytics could benefit from Maya's expertise in creating accessible user interfaces for complex medical data.",
      industry: "Healthcare Technology",
      domain: "Medical Interfaces",
      skills: ["Healthcare UX", "Data Visualization", "Accessibility"],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expires in 30 days
    }
  ];
  
  // Insert all matches into database
  const allMatches = [...techMatches, ...designerMatches, ...dataScientistMatches];
  
  for (const match of allMatches) {
    await storage.createMuskMatch(match);
  }
  
  console.log(`Successfully created ${allMatches.length} demo Musk Match suggestions`);
}

async function createTechExecutiveProfile(storage: IStorage) {
  // Create the user
  const techExecUser: InsertUser = {
    username: "alex_johnson",
    email: "alex.johnson@example.com",
    password: null,
    name: "Alex Johnson",
    phoneNumber: "+1 (415) 555-1234",
    photoURL: "/images/demo/alex-profile.png",
    title: "VP of Engineering",
    location: "San Francisco, CA",
    industry: "Technology",
    lookingFor: "Strategic partnerships and mentoring opportunities",
    profileCompleted: 100, // Integer for profile completion percentage
    // Note: emailVerified field is managed by the storage layer
  };
  
  const user = await storage.createUser(techExecUser);
  
  // Add work experiences
  const experiences = [
    {
      userId: user.id,
      company: "TechNova",
      title: "VP of Engineering",
      location: "San Francisco, CA",
      description: "Leading a team of 120+ engineers across 5 departments. Responsible for technical strategy, architecture decisions, and engineering excellence. Implemented agile methodologies that increased deployment frequency by 300% while reducing bugs in production by 60%.",
      startDate: new Date("2020-06-01"),
      endDate: null,
      isCurrent: true,
    },
    {
      userId: user.id,
      company: "CodeSphere",
      title: "Director of Engineering",
      location: "San Francisco, CA",
      description: "Managed 4 engineering teams working on cloud infrastructure products. Led the company's transition to microservices architecture. Developed engineering roadmap and strategic hiring plans, growing the team from 15 to 45 engineers in 18 months.",
      startDate: new Date("2016-03-01"),
      endDate: new Date("2020-05-31"),
      isCurrent: false,
    },
    {
      userId: user.id,
      company: "Infinite Systems",
      title: "Senior Engineering Manager",
      location: "Seattle, WA",
      description: "Led a team of platform engineers building enterprise SaaS solutions. Implemented CI/CD pipelines and automated testing frameworks that reduced release cycles from 6 weeks to 2 weeks. Mentored junior managers and led technical recruitment efforts.",
      startDate: new Date("2013-08-01"),
      endDate: new Date("2016-02-28"),
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
      userId: user.id,
      institution: "Stanford University",
      degree: "Master of Science",
      field: "Computer Science",
      startDate: new Date("2010-09-01"),
      endDate: new Date("2012-06-30"),
      description: "Focus on distributed systems and machine learning. Research assistant for the Stanford AI Lab."
    },
    {
      userId: user.id,
      institution: "University of Washington",
      degree: "Bachelor of Science",
      field: "Computer Engineering",
      startDate: new Date("2006-09-01"),
      endDate: new Date("2010-06-30"),
      description: "Graduated with honors. Senior project: Distributed peer-to-peer file sharing system."
    }
  ];
  
  for (const edu of education) {
    const fixedEdu = fixEducation(edu);
    await storage.createEducation(fixedEdu);
  }
  
  // Add skills
  const skills: InsertSkill[] = [
    { userId: user.id, name: "Engineering Leadership", level: "Expert" },
    { userId: user.id, name: "Technical Strategy", level: "Expert" },
    { userId: user.id, name: "Microservices", level: "Expert" },
    { userId: user.id, name: "Team Building", level: "Expert" },
    { userId: user.id, name: "Cloud Architecture", level: "Advanced" },
    { userId: user.id, name: "Agile Methodologies", level: "Expert" },
    { userId: user.id, name: "Product Development", level: "Advanced" },
    { userId: user.id, name: "DevOps", level: "Advanced" }
  ];
  
  for (const skill of skills) {
    await storage.createSkill(skill);
  }
  
  // Add a project
  const project = {
    userId: user.id,
    title: "Distributed DevOps Platform",
    description: "Led the development of an internal DevOps platform that streamlined deployment processes across the organization. The platform integrates with multiple cloud providers, provides automated testing, and includes comprehensive analytics dashboards for monitoring system performance.",
    thumbnailUrl: "/images/demo/project-devops.png",
    mediaUrls: ["/images/demo/devops-1.png", "/images/demo/devops-2.png"],
    skills: ["Cloud Architecture", "DevOps", "Microservices", "Kubernetes"],
    startDate: new Date("2021-03-01"),
    endDate: null,
    isCurrent: true,
    isPublished: true,
    url: "https://example.com/devops-platform"
  };
  
  const fixedProject = fixProject(project);
  const createdProject = await storage.createProject(fixedProject);
  
  // Add collaborators to the project
  const collaborator = {
    projectId: createdProject.id,
    userId: user.id,  // This would normally be another user, but for demo we'll use the same user
    name: "Sarah Chen",
    role: "Product Manager",
    contribution: "Led product requirements and coordinated with stakeholders",
    isVerified: 1
  };
  
  const fixedCollaborator = fixCollaborator(collaborator);
  await storage.createProjectCollaborator(fixedCollaborator);
  
  return user;
}

async function createUXDesignerProfile(storage: IStorage) {
  // Create the user
  const designerUser: InsertUser = {
    username: "maya_rodriguez",
    email: "maya.rodriguez@example.com",
    password: null,
    name: "Maya Rodriguez",
    phoneNumber: "+1 (628) 555-9876",
    photoURL: "/images/demo/maya-profile.png",
    title: "Senior UX Designer",
    location: "New York, NY",
    industry: "Design",
    lookingFor: "Creative collaboration and new design challenges",
    profileCompleted: 100,
    // Note: emailVerified field is managed by the storage layer
  };
  
  const user = await storage.createUser(designerUser);
  
  // Add work experiences
  const experiences = [
    {
      userId: user.id,
      company: "DesignLab",
      title: "Senior UX Designer",
      location: "New York, NY",
      description: "Leading user research and design for enterprise SaaS products. Conduct user interviews, create wireframes, prototypes, and high-fidelity designs. Collaborate with product and engineering teams to implement design systems that improve user experience metrics by 40%.",
      startDate: new Date("2019-04-01"),
      endDate: null,
      isCurrent: true,
    },
    {
      userId: user.id,
      company: "Creative Solutions",
      title: "UX/UI Designer",
      location: "Boston, MA",
      description: "Designed mobile and web interfaces for fintech applications. Conducted A/B testing that improved user conversion rates by 25%. Created and maintained a component library and design system that reduced design-to-development handoff time by 50%.",
      startDate: new Date("2016-09-01"),
      endDate: new Date("2019-03-31"),
      isCurrent: false,
    },
    {
      userId: user.id,
      company: "Pixel Perfect Agency",
      title: "UI Designer",
      location: "Boston, MA",
      description: "Created visual designs for web and mobile applications across various industries. Specialized in responsive design and interaction animations. Collaborated with developers to ensure pixel-perfect implementation of designs.",
      startDate: new Date("2014-06-01"),
      endDate: new Date("2016-08-31"),
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
      userId: user.id,
      institution: "Rhode Island School of Design",
      degree: "Bachelor of Fine Arts",
      field: "Graphic Design",
      startDate: new Date("2010-09-01"),
      endDate: new Date("2014-05-30"),
      description: "Focus on interactive design and typography. Senior thesis: 'Digital Interfaces for Social Impact'"
    },
    {
      userId: user.id,
      institution: "Cooper Union",
      degree: "Certificate",
      field: "User Experience Design",
      startDate: new Date("2015-01-01"),
      endDate: new Date("2015-06-30"),
      description: "Intensive program focused on user research methods, interaction design, and usability testing."
    }
  ];
  
  for (const edu of education) {
    const fixedEdu = fixEducation(edu);
    await storage.createEducation(fixedEdu);
  }
  
  // Add skills
  const skills: InsertSkill[] = [
    { userId: user.id, name: "User Research", level: "Expert" },
    { userId: user.id, name: "Interaction Design", level: "Expert" },
    { userId: user.id, name: "Wireframing", level: "Expert" },
    { userId: user.id, name: "Prototyping", level: "Expert" },
    { userId: user.id, name: "Figma", level: "Expert" },
    { userId: user.id, name: "Adobe Creative Suite", level: "Advanced" },
    { userId: user.id, name: "Design Systems", level: "Expert" },
    { userId: user.id, name: "Usability Testing", level: "Advanced" }
  ];
  
  for (const skill of skills) {
    await storage.createSkill(skill);
  }
  
  // Add a project
  const project = {
    userId: user.id,
    title: "Financial Wellness App Redesign",
    description: "Led a complete redesign of a financial wellness mobile application focused on making personal finance more accessible and less intimidating for young adults. The project included extensive user research, competitive analysis, and iterative prototyping. The redesign resulted in a 35% increase in daily active users and a 60% increase in session duration.",
    thumbnailUrl: "/images/demo/project-finance-app.png",
    mediaUrls: ["/images/demo/finance-app-1.png", "/images/demo/finance-app-2.png", "/images/demo/finance-app-3.png"],
    skills: ["Mobile Design", "User Research", "Interaction Design", "Figma"],
    startDate: new Date("2020-08-01"),
    endDate: new Date("2021-03-31"),
    isCurrent: false,
    isPublished: true,
    url: "https://example.com/finance-app-redesign"
  };
  
  const fixedProject = fixProject(project);
  const createdProject = await storage.createProject(fixedProject);
  
  // Add collaborators to the project
  const collaborator = {
    projectId: createdProject.id,
    userId: user.id,  // This would normally be another user, but for demo we'll use the same user
    name: "Jason Kim",
    role: "UI Developer",
    contribution: "Implemented the responsive UI components and animations",
    isVerified: 1
  };
  
  const fixedCollaborator = fixCollaborator(collaborator);
  await storage.createProjectCollaborator(fixedCollaborator);
  
  return user;
}

/**
 * Creates demo Nowboard items (what professionals are doing now)
 */
async function createDemoNowboardItems(storage: IStorage, techId: number, designerId: number, dataScientistId: number) {
  console.log("Creating demo Nowboard items...");
  
  // Create some demo nowboard items
  const nowboardItems = [
    {
      userId: techId,
      content: "Learning about the latest AI developments at Google I/O conference",
      category: "learning",
      visibility: "public"
    },
    {
      userId: techId,
      content: "Just launched our new product feature - real-time collaboration tools",
      category: "launch",
      visibility: "public"
    },
    {
      userId: designerId,
      content: "Brushing up on my Figma animation skills with an online workshop",
      category: "growth",
      visibility: "public"
    },
    {
      userId: designerId,
      content: "Planning our next UX research sprint for the mobile app redesign",
      category: "planning",
      visibility: "public"
    },
    {
      userId: dataScientistId,
      content: "Working with the ML team to improve our recommendation algorithms",
      category: "collaboration",
      visibility: "public"
    },
    {
      userId: dataScientistId,
      content: "Speaking at the Data Science Summit next month about ML Ops",
      category: "visibility",
      visibility: "public"
    }
  ];
  
  for (const item of nowboardItems) {
    await storage.createNowboardItem(item as any);
  }
  
  console.log(`Successfully created ${nowboardItems.length} demo Nowboard items`);
}

async function createDataScientistProfile(storage: IStorage) {
  // Create the user
  const dataScientistUser: InsertUser = {
    username: "david_patel",
    email: "david.patel@example.com",
    password: null,
    name: "David Patel",
    phoneNumber: "+1 (312) 555-5678",
    photoURL: "/images/demo/david-profile.png",
    title: "Lead Data Scientist",
    location: "Chicago, IL",
    industry: "Data Science",
    lookingFor: "Research collaborations and speaking opportunities",
    profileCompleted: 100,
    // Note: emailVerified field is managed by the storage layer
  };
  
  const user = await storage.createUser(dataScientistUser);
  
  // Add work experiences
  const experiences = [
    {
      userId: user.id,
      company: "DataInsight",
      title: "Lead Data Scientist",
      location: "Chicago, IL",
      description: "Leading a team of data scientists developing machine learning models for predictive analytics in healthcare. Created algorithms that improved patient outcome predictions by 45%. Designed and implemented an ML pipeline that processes over 10TB of healthcare data daily.",
      startDate: new Date("2018-02-01"),
      endDate: null,
      isCurrent: true,
    },
    {
      userId: user.id,
      company: "QuantumAnalytics",
      title: "Senior Data Scientist",
      location: "Austin, TX",
      description: "Developed natural language processing models for customer sentiment analysis. Built recommender systems that increased user engagement by 28%. Led a team of 3 junior data scientists and mentored 5 data science interns.",
      startDate: new Date("2015-07-01"),
      endDate: new Date("2018-01-31"),
      isCurrent: false,
    },
    {
      userId: user.id,
      company: "Tech Research Group",
      title: "Data Scientist",
      location: "Cambridge, MA",
      description: "Conducted research on machine learning algorithms for computer vision. Published 2 papers in leading AI conferences. Collaborated with cross-functional teams to integrate ML models into production systems.",
      startDate: new Date("2013-09-01"),
      endDate: new Date("2015-06-30"),
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
      userId: user.id,
      institution: "Massachusetts Institute of Technology",
      degree: "Ph.D.",
      field: "Computer Science (Machine Learning)",
      startDate: new Date("2008-09-01"),
      endDate: new Date("2013-05-30"),
      description: "Dissertation: 'Interpretable Deep Learning Models for Healthcare Applications'. Published 5 papers in top AI conferences. Teaching assistant for 'Introduction to Machine Learning'."
    },
    {
      userId: user.id,
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science",
      field: "Mathematics and Computer Science",
      startDate: new Date("2004-09-01"),
      endDate: new Date("2008-05-30"),
      description: "Graduated summa cum laude. Member of the Mathematics Honor Society. Research assistant in the Berkeley AI Research Lab."
    }
  ];
  
  for (const edu of education) {
    const fixedEdu = fixEducation(edu);
    await storage.createEducation(fixedEdu);
  }
  
  // Add skills
  const skills: InsertSkill[] = [
    { userId: user.id, name: "Machine Learning", level: "Expert" },
    { userId: user.id, name: "Python", level: "Expert" },
    { userId: user.id, name: "TensorFlow", level: "Expert" },
    { userId: user.id, name: "PyTorch", level: "Advanced" },
    { userId: user.id, name: "Natural Language Processing", level: "Expert" },
    { userId: user.id, name: "Statistical Analysis", level: "Expert" },
    { userId: user.id, name: "Data Visualization", level: "Advanced" },
    { userId: user.id, name: "Big Data Technologies", level: "Advanced" }
  ];
  
  for (const skill of skills) {
    await storage.createSkill(skill);
  }
  
  // Add a project
  const project = {
    userId: user.id,
    title: "Predictive Healthcare Analytics Platform",
    description: "Developed an advanced machine learning platform that predicts patient readmission risks by analyzing electronic health records. The system incorporates natural language processing to extract insights from clinical notes and uses ensemble learning techniques to achieve 87% prediction accuracy. Deployed in 3 major hospitals, the platform has helped reduce readmission rates by 23%.",
    thumbnailUrl: "/images/demo/project-healthcare.png",
    mediaUrls: ["/images/demo/healthcare-1.png", "/images/demo/healthcare-2.png"],
    skills: ["Machine Learning", "Python", "Natural Language Processing", "Healthcare Analytics"],
    startDate: new Date("2019-04-01"),
    endDate: new Date("2020-11-30"),
    isCurrent: false,
    isPublished: true,
    url: "https://example.com/healthcare-analytics"
  };
  
  const fixedProject = fixProject(project);
  const createdProject = await storage.createProject(fixedProject);
  
  // Add collaborators to the project
  const collaborator = {
    projectId: createdProject.id,
    userId: user.id,  // This would normally be another user, but for demo we'll use the same user
    name: "Dr. Emily Zhang",
    role: "Medical Advisor",
    contribution: "Provided domain expertise and validated clinical models",
    isVerified: 1
  };
  
  const fixedCollaborator = fixCollaborator(collaborator);
  await storage.createProjectCollaborator(fixedCollaborator);
  
  return user;
}