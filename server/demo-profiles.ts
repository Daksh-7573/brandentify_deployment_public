import { IStorage } from './storage';
import { 
  InsertUser, 
  InsertWorkExperience, 
  InsertEducation, 
  InsertSkill, 
  InsertProject,
  InsertProjectCollaborator,
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
 * Helper function to add services to a user profile
 */
async function addServicesToProfile(storage: IStorage, userId: number, services: InsertService[]) {
  for (const service of services) {
    await storage.createService(service);
  }
}

/**
 * Creates complete demo profiles with all details including industry leaders
 */
export async function createDemoProfiles(storage: IStorage) {
  console.log("Creating demo profiles...");
  
  // Demo Profile 1: Tech Executive
  const techProfile = await createTechExecutiveProfile(storage);
  
  // Demo Profile 2: UX Designer
  const designerProfile = await createUXDesignerProfile(storage);
  
  // Demo Profile 3: Data Scientist
  const dataScientistProfile = await createDataScientistProfile(storage);
  
  // Demo Profile 4: Elon Musk (Industry Leader)
  const elonMuskProfile = await createElonMuskProfile(storage);
  
  console.log(`Successfully created 4 demo profiles with IDs: ${techProfile.id}, ${designerProfile.id}, ${dataScientistProfile.id}, ${elonMuskProfile.id}`);
  
  return {
    techProfile,
    designerProfile,
    dataScientistProfile,
    elonMuskProfile
  };
}

/**
 * Creates a demo profile for Elon Musk with industry leader status
 */
async function createElonMuskProfile(storage: IStorage) {
  // Create the user
  const muskUser: InsertUser = {
    username: "elon_musk",
    email: "elon.musk@example.com",
    password: null,
    name: "Elon Musk",
    phoneNumber: null,
    photoURL: "/assets/Musk.png", // Using the Musk image from assets
    title: "CEO & Chief Engineer",
    aboutMe: "Entrepreneur and business magnate focused on space exploration, electric vehicles, AI, and sustainable energy. Founder of SpaceX, Tesla, and several other companies.",
    location: "Austin, TX",
    industry: "Technology",
    domain: "Aerospace, Automotive, AI",
    company: "X Corp, SpaceX, Tesla, Neuralink",
    lookingFor: "Innovative engineering talent and visionary collaborators",
    visitingCardType: "minimal",
    profileCompleted: 100,
    geoLatitude: "30.2672",
    geoLongitude: "-97.7431",
    geoVisibleNearby: true
  };

  const user = await storage.createUser(muskUser);

  // Work experiences
  const experiences = [
    {
      userId: user.id,
      title: "CEO & Chief Engineer",
      company: "SpaceX",
      location: "Hawthorne, CA",
      description: "Leading advanced rockets and spacecraft manufacturing company with the mission of enabling the colonization of Mars. Overseeing development of Starship, the world's first fully reusable spacecraft designed for missions to the Moon, Mars, and beyond.",
      startDate: new Date("2002-03-01"),
      endDate: null,
      isCurrent: true,
      industry: "Aerospace"
    },
    {
      userId: user.id,
      title: "CEO",
      company: "Tesla",
      location: "Austin, TX",
      description: "Leading the company's mission to accelerate the world's transition to sustainable energy through electric vehicles, solar energy, and integrated renewable energy solutions for homes and businesses.",
      startDate: new Date("2008-10-01"),
      endDate: null,
      isCurrent: true,
      industry: "Automotive, Energy"
    },
    {
      userId: user.id,
      title: "Founder & CEO",
      company: "Neuralink",
      location: "Fremont, CA",
      description: "Developing ultra high bandwidth brain-machine interfaces to connect humans and computers. The company is focused on creating devices that can be implanted in the human brain with the goal of helping humans merge with AI.",
      startDate: new Date("2016-07-01"),
      endDate: null,
      isCurrent: true,
      industry: "Neurotechnology"
    }
  ];

  for (const experience of experiences) {
    await storage.createWorkExperience(fixWorkExperience(experience));
  }

  // Education
  const educations = [
    {
      userId: user.id,
      institution: "University of Pennsylvania",
      degree: "Bachelor of Science",
      field: "Physics",
      location: "Philadelphia, PA",
      startDate: new Date("1992-09-01"),
      endDate: new Date("1995-05-30"),
      description: "Double major in Physics and Economics"
    },
    {
      userId: user.id,
      institution: "Stanford University",
      degree: "PhD Program",
      field: "Applied Physics & Materials Science",
      location: "Stanford, CA",
      startDate: new Date("1995-09-01"),
      endDate: new Date("1995-10-01"),
      description: "Left after two days to start Zip2"
    }
  ];

  for (const education of educations) {
    await storage.createEducation(fixEducation(education));
  }

  // Skills
  const skills = [
    {
      userId: user.id,
      name: "Rocket Engineering",
      level: "Expert"
    },
    {
      userId: user.id,
      name: "Electric Vehicle Technology",
      level: "Expert"
    },
    {
      userId: user.id,
      name: "Sustainable Energy",
      level: "Expert"
    },
    {
      userId: user.id,
      name: "Strategic Leadership",
      level: "Expert"
    },
    {
      userId: user.id,
      name: "AI & Neural Interfaces",
      level: "Expert"
    },
    {
      userId: user.id,
      name: "Space Exploration",
      level: "Expert"
    }
  ];

  for (const skill of skills) {
    await storage.createSkill(skill);
  }

  // Project for Mars colonization
  const project = {
    userId: user.id,
    title: "Mars Colonization Project",
    description: "Developing the technology and infrastructure required to establish a self-sustaining city on Mars. This multi-decade project involves the creation of Starship - a fully reusable spacecraft, life support systems, and permanent habitation solutions for the Red Planet.",
    thumbnailUrl: "/images/demo/mars-project.png",
    mediaUrls: ["/images/demo/mars-1.png", "/images/demo/mars-2.png"],
    skills: ["Aerospace Engineering", "Life Support Systems", "Propulsion Technology", "Materials Science"],
    startDate: new Date("2016-09-01"),
    endDate: null,
    isCurrent: true,
    isPublished: true,
    url: "https://www.spacex.com/mission/"
  };
  
  const fixedProject = fixProject(project);
  const createdProject = await storage.createProject(fixedProject);
  
  // Add collaborators to the project
  const collaborator = {
    projectId: createdProject.id,
    userId: user.id,
    name: "SpaceX Engineering Team",
    role: "Spacecraft Development",
    contribution: "Leading the design and manufacturing of the Starship rocket and Mars habitation systems",
    isVerified: 1
  };
  
  const fixedCollaborator = fixCollaborator(collaborator);
  await storage.createProjectCollaborator(fixedCollaborator);
  
  // Add services
  const services: InsertService[] = [
    {
      userId: user.id,
      title: "Executive Mentorship for Tech Leaders",
      description: "One-on-one mentorship sessions for C-suite executives and high-potential leaders in tech companies. Sharing insights on disruptive innovation, scaling operations, and creating a culture of engineering excellence.",
      category: "coaching",
      priceUsd: "5000",
      isHourly: false,
      features: JSON.stringify(["Strategic vision development", "Leadership during hypergrowth", "First principles thinking approach", "Disruption strategy"]),
      imageUrl: "/images/demo/mentorship-service.png",
      order: 1,
      isActive: true
    },
    {
      userId: user.id,
      title: "Strategic Advisory for Space Ventures",
      description: "Advisory services for companies developing space technologies or planning commercial space operations. Includes technical review, business model evaluation, and strategic roadmap development.",
      category: "consulting",
      priceUsd: "25000",
      isHourly: false,
      features: JSON.stringify(["Technical feasibility assessment", "Cost optimization strategies", "Regulatory navigation", "Long-term vision alignment"]),
      imageUrl: "/images/demo/space-consulting.png",
      order: 2,
      isActive: true
    }
  ];
  
  await addServicesToProfile(storage, user.id, services);

  return user;
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
    aboutMe: "Tech executive with over 15 years of experience building and scaling engineering teams. Passionate about cloud architecture, distributed systems, and fostering engineering excellence.",
    location: "San Francisco, CA",
    industry: "Technology",
    domain: "Software Engineering, Cloud Infrastructure",
    company: "TechNova",
    lookingFor: "Strategic partnerships and mentoring opportunities",
    profileCompleted: 100, // Integer for profile completion percentage
    visitingCardType: "professional",
    geoLatitude: "37.7749",
    geoLongitude: "-122.4194",
    geoVisibleNearby: true
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
    aboutMe: "Passionate UX designer with a background in visual design. I create intuitive, accessible, and delightful digital experiences that solve real user problems. My approach combines user research, iterative design, and a deep understanding of human behavior.",
    location: "New York, NY",
    industry: "Design",
    domain: "User Experience, Digital Product Design",
    company: "DesignLab",
    lookingFor: "Creative collaboration and new design challenges",
    profileCompleted: 100,
    visitingCardType: "artistic",
    geoLatitude: "40.7128",
    geoLongitude: "-74.0060",
    geoVisibleNearby: true
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
    aboutMe: "Data scientist with PhD in machine learning from MIT. Focused on developing interpretable ML models for healthcare applications. Published researcher with experience leading cross-functional teams at the intersection of ML and domain-specific challenges.",
    location: "Chicago, IL",
    industry: "Data Science",
    domain: "Machine Learning, Healthcare Analytics",
    company: "DataInsight",
    lookingFor: "Research collaborations and speaking opportunities",
    profileCompleted: 100,
    visitingCardType: "holographic",
    geoLatitude: "41.8781",
    geoLongitude: "-87.6298",
    geoVisibleNearby: true
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