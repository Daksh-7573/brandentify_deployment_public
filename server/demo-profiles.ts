import { InsertEducation, InsertProject, InsertProjectCollaborator, InsertSkill, InsertUser, InsertWorkExperience, Project, WorkExperience } from '../shared/schema';
import { IStorage } from './storage';

function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function fixWorkExperience(exp: any): InsertWorkExperience {
  return {
    ...exp,
    startDate: exp.startDate ? new Date(exp.startDate) : new Date(),
    endDate: exp.endDate ? new Date(exp.endDate) : null
  };
}

function fixEducation(edu: any): InsertEducation {
  return {
    ...edu,
    startDate: edu.startDate ? new Date(edu.startDate) : new Date(),
    endDate: edu.endDate ? new Date(edu.endDate) : null
  };
}

function fixProject(proj: any): InsertProject {
  return {
    ...proj,
    startDate: proj.startDate ? new Date(proj.startDate) : new Date(),
    endDate: proj.endDate ? new Date(proj.endDate) : null
  };
}

function fixCollaborator(collab: any): InsertProjectCollaborator {
  return {
    ...collab
  };
}

/**
 * Helper function to add services to a user profile
 */
async function addServicesToProfile(storage: IStorage, userId: number, services: any[]) {
  for (const service of services) {
    await storage.createService({
      userId,
      title: service.title,
      description: service.description,
      category: service.category,
      priceUsd: service.priceUsd,
      priceInr: service.priceInr,
      isHourly: service.isHourly,
      features: service.features,
      imageUrl: service.imageUrl || null,
      isActive: true,
      order: service.order
    });
  }
}

/**
 * Creates complete demo profiles with all details including industry leaders
 */
export async function createDemoProfiles(storage: IStorage) {
  console.log("[demo-profiles] Creating comprehensive demo profiles with all details");
  
  // Create demo users
  await createElonMuskProfile(storage);
  await createTechExecutiveProfile(storage);
  await createUXDesignerProfile(storage);
  await createDataScientistProfile(storage);
  
  console.log("[demo-profiles] Successfully created all demo profiles");
}

/**
 * Creates a demo profile for Elon Musk with industry leader status
 */
async function createElonMuskProfile(storage: IStorage) {
  console.log("[demo-profiles] Creating Elon Musk profile");
  
  const muskUser: InsertUser = {
    username: "elonmusk",
    email: "elon@spacex.com",
    password: null,
    name: "Elon Musk",
    phoneNumber: null,
    photoURL: "/images/demo/musk-profile.jpg",
    title: "CEO & Chief Engineer",
    aboutMe: "Entrepreneur and business magnate with a focus on space exploration, electric vehicles, and sustainable energy. Working to make humanity multiplanetary.",
    domain: "Aerospace, Automotive, AI",
    company: "SpaceX & Tesla",
    visitingCardType: "holographic",
    location: "Austin, TX, USA",
    industry: "Technology",
    lookingFor: "Revolutionary ideas",
    profileCompleted: 95,
    isIndustryLeader: true,
    geoLastUpdated: new Date()
  };
  
  const user = await storage.createUser(muskUser);
  
  // Add work experience
  const workExperiences = [
    {
      userId: user.id,
      company: "SpaceX",
      title: "CEO & Chief Engineer",
      location: "Hawthorne, CA, USA",
      industry: "Aerospace",
      domain: "Space Exploration",
      startDate: "2002-03-14",
      endDate: null,
      description: "Founded SpaceX with the goal of reducing space transportation costs to enable the colonization of Mars. Led the development of Falcon rockets, Dragon spacecraft, and Starship."
    },
    {
      userId: user.id,
      company: "Tesla",
      title: "CEO & Product Architect",
      location: "Palo Alto, CA, USA",
      industry: "Automotive, Energy",
      domain: "Electric Vehicles, Clean Energy",
      startDate: "2008-10-01",
      endDate: null,
      description: "Leading Tesla's mission to accelerate the world's transition to sustainable energy through electric vehicles, solar power, and energy storage solutions."
    },
    {
      userId: user.id,
      company: "Neuralink",
      title: "Co-founder",
      location: "San Francisco, CA, USA",
      industry: "Neurotechnology",
      domain: "Brain-Computer Interfaces",
      startDate: "2016-07-01",
      endDate: null,
      description: "Developing ultra high bandwidth brain-machine interfaces to connect humans and computers."
    },
    {
      userId: user.id,
      company: "The Boring Company",
      title: "Founder",
      location: "Hawthorne, CA, USA",
      industry: "Infrastructure, Transportation",
      domain: "Tunnel Construction",
      startDate: "2016-12-01",
      endDate: null,
      description: "Building underground transportation networks to solve traffic problems and enable high-speed transit."
    },
    {
      userId: user.id,
      company: "X (formerly Twitter)",
      title: "Owner & CTO",
      location: "San Francisco, CA, USA",
      industry: "Social Media",
      domain: "Communication Platform",
      startDate: "2022-10-27",
      endDate: null,
      description: "Leading the transformation of Twitter into X, an everything app for global communication and financial services."
    },
    {
      userId: user.id,
      company: "PayPal",
      title: "CEO",
      location: "Palo Alto, CA, USA",
      industry: "Financial Technology",
      domain: "Online Payments",
      startDate: "1999-03-01",
      endDate: "2000-10-01",
      description: "Led PayPal through its early growth phase before its acquisition by eBay."
    }
  ];
  
  for (const exp of workExperiences) {
    await storage.createWorkExperience(fixWorkExperience(exp));
  }
  
  // Add education
  const education = [
    {
      userId: user.id,
      institution: "University of Pennsylvania",
      degree: "Bachelor of Science",
      field: "Physics",
      location: "Philadelphia, PA, USA",
      startDate: "1992-09-01",
      endDate: "1995-05-15"
    },
    {
      userId: user.id,
      institution: "University of Pennsylvania",
      degree: "Bachelor of Arts",
      field: "Economics",
      location: "Philadelphia, PA, USA",
      startDate: "1992-09-01",
      endDate: "1995-05-15"
    },
    {
      userId: user.id,
      institution: "Stanford University",
      degree: "PhD Program (dropped out)",
      field: "Applied Physics and Materials Science",
      location: "Stanford, CA, USA",
      startDate: "1995-09-01",
      endDate: "1995-10-01"
    }
  ];
  
  for (const edu of education) {
    await storage.createEducation(fixEducation(edu));
  }
  
  // Add skills
  const skills = [
    {
      userId: user.id,
      name: "Entrepreneurship",
      proficiency: 98
    },
    {
      userId: user.id,
      name: "Rocket Engineering",
      proficiency: 95
    },
    {
      userId: user.id,
      name: "Electric Vehicle Design",
      proficiency: 94
    },
    {
      userId: user.id,
      name: "Sustainable Energy",
      proficiency: 92
    },
    {
      userId: user.id,
      name: "Product Development",
      proficiency: 96
    },
    {
      userId: user.id,
      name: "Strategic Vision",
      proficiency: 99
    },
    {
      userId: user.id,
      name: "Leadership",
      proficiency: 97
    },
    {
      userId: user.id,
      name: "Innovation",
      proficiency: 98
    },
    {
      userId: user.id,
      name: "Physics",
      proficiency: 93
    },
    {
      userId: user.id,
      name: "Materials Science",
      proficiency: 90
    },
    {
      userId: user.id,
      name: "AI & Machine Learning",
      proficiency: 87
    }
  ];
  
  for (const skill of skills) {
    await storage.createSkill(skill as InsertSkill);
  }
  
  // Add projects
  const marsProject = await storage.createProject(fixProject({
    userId: user.id,
    title: "Mars Colonization Project",
    description: "Long-term project to establish a self-sustaining colony on Mars, making humanity a multi-planetary species. Includes development of Starship, life support systems, and Mars habitats.",
    projectUrl: "https://spacex.com/mars",
    repositoryUrl: null,
    imageUrl: "/images/demo/mars-project.jpg",
    startDate: "2016-09-27",
    endDate: null,
    isCompleted: false,
    isPublic: true,
    status: "in-progress",
    tags: ["space", "mars", "colonization", "starship", "habitats"]
  }));
  
  // Add collaborators to the Mars project
  const marsCollaborators = [
    {
      projectId: marsProject.id,
      name: "Gwynne Shotwell",
      role: "Operations Lead",
      contribution: "Oversees all operational aspects of the Mars mission architecture."
    },
    {
      projectId: marsProject.id,
      name: "Tom Mueller",
      role: "Propulsion Engineer",
      contribution: "Designed the Raptor engine family that powers Starship."
    },
    {
      projectId: marsProject.id,
      name: "Lars Blackmore",
      role: "Landing Systems",
      contribution: "Developed precision landing algorithms for Mars descent."
    }
  ];
  
  for (const collab of marsCollaborators) {
    await storage.createProjectCollaborator(fixCollaborator(collab));
  }
  
  // Add Neuralink project
  const neuralinkProject = await storage.createProject(fixProject({
    userId: user.id,
    title: "Brain-Machine Interface",
    description: "Development of ultra-high bandwidth brain-computer interfaces to connect humans and computers, initially focusing on medical applications and eventually enabling cognitive enhancement.",
    projectUrl: "https://neuralink.com",
    repositoryUrl: null,
    imageUrl: "/images/demo/neuralink-project.jpg",
    startDate: "2016-07-01",
    endDate: null,
    isCompleted: false,
    isPublic: true,
    status: "in-progress",
    tags: ["neuroscience", "brain-interface", "medical-device", "implant", "AI"]
  }));
  
  // Add collaborators to the Neuralink project
  const neuralinkCollaborators = [
    {
      projectId: neuralinkProject.id,
      name: "Max Hodak",
      role: "Research Director",
      contribution: "Led early research initiatives and neural interface designs."
    },
    {
      projectId: neuralinkProject.id,
      name: "DJ Seo",
      role: "Neural Engineer",
      contribution: "Developed surgical techniques and electrode arrays."
    },
    {
      projectId: neuralinkProject.id,
      name: "Vanessa Tolosa",
      role: "Materials Scientist",
      contribution: "Created biocompatible materials for long-term implantation."
    }
  ];
  
  for (const collab of neuralinkCollaborators) {
    await storage.createProjectCollaborator(fixCollaborator(collab));
  }
  
  // Add Electric Vehicle project
  const evProject = await storage.createProject(fixProject({
    userId: user.id,
    title: "Sustainable Transport Revolution",
    description: "Comprehensive project to transition the world to electric vehicles, from affordable mass-market cars to heavy-duty trucks and public transport options.",
    projectUrl: "https://tesla.com",
    repositoryUrl: null,
    imageUrl: "/images/demo/tesla-project.jpg",
    startDate: "2008-10-01",
    endDate: null,
    isCompleted: false,
    isPublic: true,
    status: "in-progress",
    tags: ["electric-vehicles", "battery-technology", "sustainable-transport", "autopilot", "manufacturing"]
  }));
  
  // Add collaborators to the EV project
  const evCollaborators = [
    {
      projectId: evProject.id,
      name: "JB Straubel",
      role: "Battery Systems Architect",
      contribution: "Pioneered Tesla's battery technology and energy systems."
    },
    {
      projectId: evProject.id,
      name: "Franz von Holzhausen",
      role: "Chief Designer",
      contribution: "Created Tesla's distinctive vehicle designs from Model S to Cybertruck."
    },
    {
      projectId: evProject.id,
      name: "Andrej Karpathy",
      role: "AI Director",
      contribution: "Led development of Tesla's computer vision and neural network systems for Autopilot."
    }
  ];
  
  for (const collab of evCollaborators) {
    await storage.createProjectCollaborator(fixCollaborator(collab));
  }
  
  // Add services
  const services = [
    {
      title: "Space Launch Services",
      description: "Reliable, cost-effective launch services to low Earth orbit, geostationary orbit, and beyond using the Falcon family of rockets.",
      category: "aerospace",
      priceUsd: "67000000",
      priceInr: "5500000000",
      isHourly: false,
      features: ["Payload capacity up to 64 tons", "Reusable first stage", "NASA human-rated", "99.9% reliability", "Delivery: 6-24 months"],
      imageUrl: "/images/demo/launch-service.jpg",
      order: 1
    },
    {
      title: "Martian Colony Planning",
      description: "Comprehensive planning and development services for organizations interested in establishing operations on Mars.",
      category: "consulting",
      priceUsd: "25000000",
      priceInr: "2000000000",
      isHourly: false,
      features: ["Habitat design", "Resource utilization strategy", "Power systems planning", "Life support engineering", "Delivery: 12-36 months"],
      imageUrl: "/images/demo/mars-colony.jpg",
      order: 2
    },
    {
      title: "Advanced AI Strategy",
      description: "Strategic consulting on artificial general intelligence development, safety protocols, and integration with human systems.",
      category: "technology",
      priceUsd: "5000",
      priceInr: "400000",
      isHourly: true,
      features: ["AGI safety frameworks", "Neural interface planning", "Regulatory navigation", "Ethical implementation", "Delivery: Custom timeline"],
      imageUrl: "/images/demo/ai-strategy.jpg",
      order: 3
    }
  ];
  
  await addServicesToProfile(storage, user.id, services);
  
  console.log(`[demo-profiles] Successfully created Elon Musk profile with ID: ${user.id}`);
  return user;
}

/**
 * Creates a tech executive profile
 */
async function createTechExecutiveProfile(storage: IStorage) {
  console.log("[demo-profiles] Creating Tech Executive profile");
  
  const techExecUser: InsertUser = {
    username: "alexjohnson",
    email: "alex.johnson@techcorp.com",
    password: null,
    name: "Alex Johnson",
    phoneNumber: null,
    photoURL: "/images/demo/exec-profile.jpg",
    title: "VP of Engineering",
    aboutMe: "Experienced technology executive with a passion for building scalable systems and high-performing engineering teams. Specialized in cloud infrastructure, AI, and enterprise software.",
    domain: "Software Engineering, Cloud Architecture",
    company: "TechCorp",
    visitingCardType: "professional",
    location: "San Francisco, CA, USA",
    industry: "Technology",
    lookingFor: "Strategic partnerships",
    profileCompleted: 92,
    isIndustryLeader: false,
    geoLastUpdated: new Date()
  };
  
  const user = await storage.createUser(techExecUser);
  
  // Add work experience
  const workExperiences = [
    {
      userId: user.id,
      company: "TechCorp",
      title: "VP of Engineering",
      location: "San Francisco, CA, USA",
      industry: "Technology",
      domain: "Software Engineering",
      startDate: "2018-06-01",
      endDate: null,
      description: "Leading a global engineering organization of 200+ engineers developing cloud infrastructure and enterprise solutions. Implemented microservices architecture reducing deployment time by 65% and improving system reliability to 99.99% uptime."
    },
    {
      userId: user.id,
      company: "CloudSystems Inc.",
      title: "Director of Cloud Services",
      location: "Seattle, WA, USA",
      industry: "Cloud Computing",
      domain: "Infrastructure",
      startDate: "2015-03-15",
      endDate: "2018-05-30",
      description: "Directed the development and operation of enterprise cloud solutions serving Fortune 500 clients. Led the company's transition to container orchestration with Kubernetes, reducing operational costs by 40%."
    },
    {
      userId: user.id,
      company: "InnovateTech",
      title: "Senior Engineering Manager",
      location: "Boston, MA, USA",
      industry: "Software",
      domain: "Enterprise Applications",
      startDate: "2012-08-01",
      endDate: "2015-03-01",
      description: "Managed development teams building enterprise workflow and collaboration tools. Introduced agile methodologies and DevOps practices, increasing release velocity by 300%."
    },
    {
      userId: user.id,
      company: "TechStartup",
      title: "Lead Software Engineer",
      location: "Austin, TX, USA",
      industry: "Technology",
      domain: "Web Applications",
      startDate: "2009-05-01",
      endDate: "2012-07-15",
      description: "Led backend development for a SaaS platform serving 50,000+ users. Designed and implemented scalable distributed systems handling millions of transactions daily."
    }
  ];
  
  for (const exp of workExperiences) {
    await storage.createWorkExperience(fixWorkExperience(exp));
  }
  
  // Add education
  const education = [
    {
      userId: user.id,
      institution: "Massachusetts Institute of Technology",
      degree: "Master of Science",
      field: "Computer Science",
      location: "Cambridge, MA, USA",
      startDate: "2007-09-01",
      endDate: "2009-05-15"
    },
    {
      userId: user.id,
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science",
      field: "Electrical Engineering and Computer Science",
      location: "Berkeley, CA, USA",
      startDate: "2003-09-01",
      endDate: "2007-05-15"
    }
  ];
  
  for (const edu of education) {
    await storage.createEducation(fixEducation(edu));
  }
  
  // Add skills
  const skills = [
    {
      userId: user.id,
      name: "Cloud Architecture",
      proficiency: 95
    },
    {
      userId: user.id,
      name: "Distributed Systems",
      proficiency: 92
    },
    {
      userId: user.id,
      name: "Engineering Leadership",
      proficiency: 94
    },
    {
      userId: user.id,
      name: "Kubernetes",
      proficiency: 90
    },
    {
      userId: user.id,
      name: "AWS",
      proficiency: 93
    },
    {
      userId: user.id,
      name: "System Design",
      proficiency: 91
    },
    {
      userId: user.id,
      name: "Microservices",
      proficiency: 89
    },
    {
      userId: user.id,
      name: "DevOps",
      proficiency: 88
    },
    {
      userId: user.id,
      name: "Agile Methodologies",
      proficiency: 94
    },
    {
      userId: user.id,
      name: "Technical Strategy",
      proficiency: 96
    }
  ];
  
  for (const skill of skills) {
    await storage.createSkill(skill as InsertSkill);
  }
  
  // Add projects
  const cloudPlatformProject = await storage.createProject(fixProject({
    userId: user.id,
    title: "Enterprise Cloud Platform",
    description: "Designed and built a comprehensive cloud platform enabling organizations to deploy, manage, and scale applications across hybrid environments with unified observability and governance.",
    projectUrl: "https://techcorp.com/cloud-platform",
    repositoryUrl: "https://github.com/alexjohnson-dev/cloud-platform",
    imageUrl: "/images/demo/cloud-platform.jpg",
    startDate: "2019-01-15",
    endDate: null,
    isCompleted: false,
    isPublic: true,
    status: "in-progress",
    tags: ["cloud", "kubernetes", "microservices", "enterprise", "scaling"]
  }));
  
  // Add collaborators
  const cloudPlatformCollaborators = [
    {
      projectId: cloudPlatformProject.id,
      name: "Sarah Chen",
      role: "Cloud Architect",
      contribution: "Designed the multi-region architecture and reliability systems."
    },
    {
      projectId: cloudPlatformProject.id,
      name: "Raj Patel",
      role: "DevOps Lead",
      contribution: "Implemented CI/CD pipelines and infrastructure-as-code systems."
    },
    {
      projectId: cloudPlatformProject.id,
      name: "Maria Rodriguez",
      role: "Security Engineer",
      contribution: "Developed zero-trust security model and compliance frameworks."
    }
  ];
  
  for (const collab of cloudPlatformCollaborators) {
    await storage.createProjectCollaborator(fixCollaborator(collab));
  }
  
  // Add AI Platform project
  const aiPlatformProject = await storage.createProject(fixProject({
    userId: user.id,
    title: "Enterprise AI Platform",
    description: "Built a comprehensive platform for enterprises to develop, train, deploy, and monitor machine learning models at scale with automated MLOps workflows and governance.",
    projectUrl: "https://techcorp.com/ai-platform",
    repositoryUrl: "https://github.com/alexjohnson-dev/ai-platform",
    imageUrl: "/images/demo/ai-platform.jpg",
    startDate: "2020-03-10",
    endDate: null,
    isCompleted: false,
    isPublic: true,
    status: "in-progress",
    tags: ["ai", "machine-learning", "mlops", "enterprise", "data-science"]
  }));
  
  // Add collaborators
  const aiPlatformCollaborators = [
    {
      projectId: aiPlatformProject.id,
      name: "David Kim",
      role: "ML Engineer",
      contribution: "Designed the model training and evaluation infrastructure."
    },
    {
      projectId: aiPlatformProject.id,
      name: "Priya Sharma",
      role: "Data Scientist",
      contribution: "Developed feature engineering pipelines and model validation frameworks."
    },
    {
      projectId: aiPlatformProject.id,
      name: "James Wilson",
      role: "Product Manager",
      contribution: "Led product requirements and stakeholder engagement."
    }
  ];
  
  for (const collab of aiPlatformCollaborators) {
    await storage.createProjectCollaborator(fixCollaborator(collab));
  }
  
  // Add services
  const services = [
    {
      title: "Cloud Transformation Consulting",
      description: "Strategic consulting to help enterprises migrate to cloud-native architectures and adopt modern development practices.",
      category: "consulting",
      priceUsd: "25000",
      priceInr: "2000000",
      isHourly: false,
      features: ["Architecture assessment", "Migration roadmap", "Technology selection", "Team training", "Delivery: 8-12 weeks"],
      imageUrl: "/images/demo/cloud-consulting.jpg",
      order: 1
    },
    {
      title: "System Architecture Review",
      description: "Expert review of existing or proposed system architectures with actionable recommendations for improvement.",
      category: "consulting",
      priceUsd: "350",
      priceInr: "28000",
      isHourly: true,
      features: ["Performance analysis", "Scalability assessment", "Security review", "Cost optimization", "Delivery: 2-4 weeks"],
      imageUrl: "/images/demo/architecture-review.jpg",
      order: 2
    },
    {
      title: "Engineering Team Building",
      description: "Consulting services for building high-performing engineering organizations with effective processes and culture.",
      category: "leadership",
      priceUsd: "20000",
      priceInr: "1600000",
      isHourly: false,
      features: ["Organizational design", "Talent strategy", "Process development", "Culture building", "Delivery: 6-10 weeks"],
      imageUrl: "/images/demo/team-building.jpg",
      order: 3
    }
  ];
  
  await addServicesToProfile(storage, user.id, services);
  
  console.log(`[demo-profiles] Successfully created Tech Executive profile with ID: ${user.id}`);
  return user;
}

/**
 * Creates a UX designer profile
 */
async function createUXDesignerProfile(storage: IStorage) {
  console.log("[demo-profiles] Creating UX Designer profile");
  
  const designerUser: InsertUser = {
    username: "mayarodriguez",
    email: "maya@designbymaya.com",
    password: null,
    name: "Maya Rodriguez",
    phoneNumber: null,
    photoURL: "/images/demo/designer-profile.jpg",
    title: "Senior UX/UI Designer",
    aboutMe: "Creative and user-focused designer with expertise in crafting intuitive digital experiences. Combining strategic thinking with visual design excellence to solve complex problems with elegant solutions.",
    domain: "UX/UI Design, Product Design",
    company: "DesignByMaya",
    visitingCardType: "artistic",
    location: "Los Angeles, CA, USA",
    industry: "Design",
    lookingFor: "Creative collaborations",
    profileCompleted: 90,
    isIndustryLeader: false,
    geoLastUpdated: new Date()
  };
  
  const user = await storage.createUser(designerUser);
  
  // Add work experience
  const workExperiences = [
    {
      userId: user.id,
      company: "DesignByMaya (Freelance)",
      title: "UX/UI Designer & Consultant",
      location: "Los Angeles, CA, USA",
      industry: "Design",
      domain: "User Experience",
      startDate: "2020-01-01",
      endDate: null,
      description: "Running an independent design practice providing UX/UI design services for startups and established companies. Specialized in product design for SaaS platforms, e-commerce, and mobile applications."
    },
    {
      userId: user.id,
      company: "TechProduct Inc.",
      title: "Lead Product Designer",
      location: "San Francisco, CA, USA",
      industry: "Technology",
      domain: "Product Design",
      startDate: "2017-05-01",
      endDate: "2019-12-15",
      description: "Led product design for a SaaS platform serving over 2 million users. Redesigned the core user experience increasing engagement by 37% and reducing customer support tickets by 42%."
    },
    {
      userId: user.id,
      company: "Creative Agency",
      title: "Senior UX Designer",
      location: "New York, NY, USA",
      industry: "Design",
      domain: "User Experience",
      startDate: "2014-08-15",
      endDate: "2017-04-30",
      description: "Designed digital experiences for Fortune 500 clients across finance, retail, and healthcare sectors. Developed design systems and created responsive web and mobile applications."
    },
    {
      userId: user.id,
      company: "StartupCo",
      title: "UI Designer",
      location: "Portland, OR, USA",
      industry: "Technology",
      domain: "User Interface",
      startDate: "2012-06-01",
      endDate: "2014-08-01",
      description: "Created visually appealing and functional interfaces for web and mobile applications. Collaborated closely with product and engineering teams to deliver cohesive user experiences."
    }
  ];
  
  for (const exp of workExperiences) {
    await storage.createWorkExperience(fixWorkExperience(exp));
  }
  
  // Add education
  const education = [
    {
      userId: user.id,
      institution: "Rhode Island School of Design",
      degree: "Bachelor of Fine Arts",
      field: "Graphic Design",
      location: "Providence, RI, USA",
      startDate: "2008-09-01",
      endDate: "2012-05-15"
    },
    {
      userId: user.id,
      institution: "School of Visual Arts",
      degree: "Certificate Program",
      field: "User Experience Design",
      location: "New York, NY, USA",
      startDate: "2013-01-15",
      endDate: "2013-06-30"
    }
  ];
  
  for (const edu of education) {
    await storage.createEducation(fixEducation(edu));
  }
  
  // Add skills
  const skills = [
    {
      userId: user.id,
      name: "User Experience Design",
      proficiency: 96
    },
    {
      userId: user.id,
      name: "User Interface Design",
      proficiency: 95
    },
    {
      userId: user.id,
      name: "Visual Design",
      proficiency: 94
    },
    {
      userId: user.id,
      name: "Interaction Design",
      proficiency: 93
    },
    {
      userId: user.id,
      name: "Wireframing",
      proficiency: 97
    },
    {
      userId: user.id,
      name: "Prototyping",
      proficiency: 95
    },
    {
      userId: user.id,
      name: "User Research",
      proficiency: 90
    },
    {
      userId: user.id,
      name: "Design Systems",
      proficiency: 92
    },
    {
      userId: user.id,
      name: "Figma",
      proficiency: 98
    },
    {
      userId: user.id,
      name: "Adobe Creative Suite",
      proficiency: 94
    },
    {
      userId: user.id,
      name: "Design Thinking",
      proficiency: 91
    }
  ];
  
  for (const skill of skills) {
    await storage.createSkill(skill as InsertSkill);
  }
  
  // Add projects
  const healthAppProject = await storage.createProject(fixProject({
    userId: user.id,
    title: "Health & Wellness App Redesign",
    description: "Complete redesign of a health tracking application used by over 500,000 users. Created an intuitive, accessible interface that simplified complex health data visualization and tracking.",
    projectUrl: "https://designbymaya.com/projects/health-app",
    repositoryUrl: null,
    imageUrl: "/images/demo/health-app.jpg",
    startDate: "2021-02-15",
    endDate: "2021-07-30",
    isCompleted: true,
    isPublic: true,
    status: "completed",
    tags: ["healthcare", "mobile-app", "ui-design", "data-visualization", "accessibility"]
  }));
  
  // Add collaborators
  const healthAppCollaborators = [
    {
      projectId: healthAppProject.id,
      name: "Lisa Chen",
      role: "Product Manager",
      contribution: "Defined product strategy and user requirements."
    },
    {
      projectId: healthAppProject.id,
      name: "Carlos Mendez",
      role: "Frontend Developer",
      contribution: "Implemented the redesigned UI with React Native."
    },
    {
      projectId: healthAppProject.id,
      name: "Dr. Sarah Thompson",
      role: "Healthcare Advisor",
      contribution: "Provided expert guidance on health data presentation."
    }
  ];
  
  for (const collab of healthAppCollaborators) {
    await storage.createProjectCollaborator(fixCollaborator(collab));
  }
  
  // Add E-commerce project
  const ecommerceProject = await storage.createProject(fixProject({
    userId: user.id,
    title: "Luxury E-Commerce Experience",
    description: "Designed a premium e-commerce platform for a luxury fashion brand, focusing on brand storytelling and seamless shopping experience across devices.",
    projectUrl: "https://designbymaya.com/projects/luxury-ecommerce",
    repositoryUrl: null,
    imageUrl: "/images/demo/ecommerce-project.jpg",
    startDate: "2022-04-10",
    endDate: "2022-09-15",
    isCompleted: true,
    isPublic: true,
    status: "completed",
    tags: ["e-commerce", "luxury", "responsive", "fashion", "user-experience"]
  }));
  
  // Add collaborators
  const ecommerceCollaborators = [
    {
      projectId: ecommerceProject.id,
      name: "Emma Watson",
      role: "Brand Director",
      contribution: "Provided brand guidelines and storytelling direction."
    },
    {
      projectId: ecommerceProject.id,
      name: "Thomas Hill",
      role: "Frontend Developer",
      contribution: "Implemented the design as a responsive web application."
    },
    {
      projectId: ecommerceProject.id,
      name: "Alice Zhang",
      role: "UX Researcher",
      contribution: "Conducted user testing and provided insights for optimization."
    }
  ];
  
  for (const collab of ecommerceCollaborators) {
    await storage.createProjectCollaborator(fixCollaborator(collab));
  }
  
  // Add services
  const services = [
    {
      title: "UX/UI Design",
      description: "Comprehensive UX/UI design services for web and mobile applications, creating intuitive and visually appealing digital experiences.",
      category: "design",
      priceUsd: "8000",
      priceInr: "640000",
      isHourly: false,
      features: ["User research", "Information architecture", "Wireframing", "Visual design", "Delivery: 4-8 weeks"],
      imageUrl: "/images/demo/ux-design-service.jpg",
      order: 1
    },
    {
      title: "Design System Creation",
      description: "Building comprehensive design systems to ensure consistency and scalability across digital products.",
      category: "design",
      priceUsd: "12000",
      priceInr: "960000",
      isHourly: false,
      features: ["Component library", "Style guidelines", "Documentation", "Implementation support", "Delivery: 6-10 weeks"],
      imageUrl: "/images/demo/design-system-service.jpg",
      order: 2
    },
    {
      title: "UX Consulting",
      description: "Expert UX consulting to evaluate and improve existing digital products through research and data-driven recommendations.",
      category: "consulting",
      priceUsd: "200",
      priceInr: "16000",
      isHourly: true,
      features: ["Heuristic evaluation", "User testing", "Analytics review", "Improvement roadmap", "Delivery: Custom timeline"],
      imageUrl: "/images/demo/ux-consulting.jpg",
      order: 3
    }
  ];
  
  await addServicesToProfile(storage, user.id, services);
  
  console.log(`[demo-profiles] Successfully created UX Designer profile with ID: ${user.id}`);
  return user;
}

/**
 * Creates a data scientist profile
 */
async function createDataScientistProfile(storage: IStorage) {
  console.log("[demo-profiles] Creating Data Scientist profile");
  
  const dataScientistUser: InsertUser = {
    username: "davidpatel",
    email: "david.patel@datainsights.ai",
    password: null,
    name: "David Patel",
    phoneNumber: null,
    photoURL: "/images/demo/data-scientist-profile.jpg",
    title: "Senior Data Scientist",
    aboutMe: "Experienced data scientist with expertise in machine learning, predictive analytics, and natural language processing. Passionate about transforming complex data into actionable insights that drive business value.",
    domain: "Data Science, Machine Learning",
    company: "DataInsights AI",
    visitingCardType: "minimalist",
    location: "Seattle, WA, USA",
    industry: "Technology",
    lookingFor: "Data collaboration",
    profileCompleted: 88,
    isIndustryLeader: false,
    geoLastUpdated: new Date()
  };
  
  const user = await storage.createUser(dataScientistUser);
  
  // Add work experience
  const workExperiences = [
    {
      userId: user.id,
      company: "DataInsights AI",
      title: "Senior Data Scientist",
      location: "Seattle, WA, USA",
      industry: "Technology",
      domain: "Data Science",
      startDate: "2019-04-01",
      endDate: null,
      description: "Leading data science initiatives focused on developing machine learning models for customer segmentation, churn prediction, and recommendation systems. Implemented NLP solutions increasing customer engagement by 42%."
    },
    {
      userId: user.id,
      company: "TechGiant Corp",
      title: "Data Scientist",
      location: "Mountain View, CA, USA",
      industry: "Technology",
      domain: "Machine Learning",
      startDate: "2016-07-15",
      endDate: "2019-03-25",
      description: "Developed predictive models analyzing terabytes of user data to optimize product features and marketing strategies. Built machine learning pipelines using TensorFlow and PyTorch."
    },
    {
      userId: user.id,
      company: "FinanceAnalytics",
      title: "Data Analyst",
      location: "New York, NY, USA",
      industry: "Finance",
      domain: "Data Analysis",
      startDate: "2014-02-01",
      endDate: "2016-07-01",
      description: "Conducted statistical analysis on financial markets data to identify investment opportunities and risks. Created automated reporting tools reducing analysis time by 65%."
    }
  ];
  
  for (const exp of workExperiences) {
    await storage.createWorkExperience(fixWorkExperience(exp));
  }
  
  // Add education
  const education = [
    {
      userId: user.id,
      institution: "Stanford University",
      degree: "Master of Science",
      field: "Computer Science (Machine Learning)",
      location: "Stanford, CA, USA",
      startDate: "2012-09-01",
      endDate: "2014-06-15"
    },
    {
      userId: user.id,
      institution: "University of California, San Diego",
      degree: "Bachelor of Science",
      field: "Mathematics and Statistics",
      location: "San Diego, CA, USA",
      startDate: "2008-09-01",
      endDate: "2012-06-01"
    }
  ];
  
  for (const edu of education) {
    await storage.createEducation(fixEducation(edu));
  }
  
  // Add skills
  const skills = [
    {
      userId: user.id,
      name: "Machine Learning",
      proficiency: 95
    },
    {
      userId: user.id,
      name: "Python",
      proficiency: 96
    },
    {
      userId: user.id,
      name: "Data Analysis",
      proficiency: 94
    },
    {
      userId: user.id,
      name: "Natural Language Processing",
      proficiency: 92
    },
    {
      userId: user.id,
      name: "TensorFlow",
      proficiency: 90
    },
    {
      userId: user.id,
      name: "PyTorch",
      proficiency: 88
    },
    {
      userId: user.id,
      name: "SQL",
      proficiency: 93
    },
    {
      userId: user.id,
      name: "Big Data Technologies",
      proficiency: 89
    },
    {
      userId: user.id,
      name: "Statistical Analysis",
      proficiency: 95
    },
    {
      userId: user.id,
      name: "Data Visualization",
      proficiency: 91
    },
    {
      userId: user.id,
      name: "Deep Learning",
      proficiency: 87
    }
  ];
  
  for (const skill of skills) {
    await storage.createSkill(skill as InsertSkill);
  }
  
  // Add projects
  const customerAnalyticsProject = await storage.createProject(fixProject({
    userId: user.id,
    title: "Advanced Customer Analytics Platform",
    description: "Developed a comprehensive analytics platform that uses machine learning to predict customer behavior, segment audiences, and personalize recommendations at scale.",
    projectUrl: "https://datainsights.ai/projects/customer-analytics",
    repositoryUrl: "https://github.com/davidpatel/customer-analytics",
    imageUrl: "/images/demo/analytics-platform.jpg",
    startDate: "2020-02-10",
    endDate: "2021-04-15",
    isCompleted: true,
    isPublic: true,
    status: "completed",
    tags: ["machine-learning", "customer-analytics", "python", "tensorflow", "big-data"]
  }));
  
  // Add collaborators
  const analyticsCollaborators = [
    {
      projectId: customerAnalyticsProject.id,
      name: "Emily Chen",
      role: "Data Engineer",
      contribution: "Built scalable data pipelines and real-time processing systems."
    },
    {
      projectId: customerAnalyticsProject.id,
      name: "Michael Robinson",
      role: "ML Engineer",
      contribution: "Developed and optimized core machine learning algorithms."
    },
    {
      projectId: customerAnalyticsProject.id,
      name: "Sophia Garcia",
      role: "Product Manager",
      contribution: "Defined product requirements and coordinated with stakeholders."
    }
  ];
  
  for (const collab of analyticsCollaborators) {
    await storage.createProjectCollaborator(fixCollaborator(collab));
  }
  
  // Add NLP project
  const nlpProject = await storage.createProject(fixProject({
    userId: user.id,
    title: "NLP-Based Customer Support Automation",
    description: "Created an advanced natural language processing system to automate customer support interactions, classify support tickets, and generate appropriate responses.",
    projectUrl: "https://datainsights.ai/projects/nlp-support",
    repositoryUrl: "https://github.com/davidpatel/nlp-support",
    imageUrl: "/images/demo/nlp-project.jpg",
    startDate: "2021-06-15",
    endDate: "2022-01-30",
    isCompleted: true,
    isPublic: true,
    status: "completed",
    tags: ["nlp", "automation", "bert", "customer-support", "python"]
  }));
  
  // Add collaborators
  const nlpCollaborators = [
    {
      projectId: nlpProject.id,
      name: "Jennifer Wu",
      role: "NLP Specialist",
      contribution: "Developed custom language models and fine-tuning processes."
    },
    {
      projectId: nlpProject.id,
      name: "Mark Taylor",
      role: "Backend Developer",
      contribution: "Built the API layer and integration services."
    },
    {
      projectId: nlpProject.id,
      name: "Rachel Kim",
      role: "UX Researcher",
      contribution: "Conducted user testing and experience optimization."
    }
  ];
  
  for (const collab of nlpCollaborators) {
    await storage.createProjectCollaborator(fixCollaborator(collab));
  }
  
  // Add services
  const services = [
    {
      title: "Predictive Analytics Implementation",
      description: "End-to-end implementation of predictive analytics solutions for businesses looking to leverage their data for strategic decision-making.",
      category: "data-science",
      priceUsd: "15000",
      priceInr: "1200000",
      isHourly: false,
      features: ["Data assessment", "Model development", "Integration", "Training", "Delivery: 8-12 weeks"],
      imageUrl: "/images/demo/predictive-analytics.jpg",
      order: 1
    },
    {
      title: "Machine Learning Consulting",
      description: "Expert consulting on machine learning strategies, model selection, and implementation approaches for specific business challenges.",
      category: "consulting",
      priceUsd: "250",
      priceInr: "20000",
      isHourly: true,
      features: ["Technology assessment", "Algorithm selection", "Implementation roadmap", "Technical guidance", "Delivery: Custom timeline"],
      imageUrl: "/images/demo/ml-consulting.jpg",
      order: 2
    },
    {
      title: "Data Strategy Development",
      description: "Strategic planning to help organizations leverage their data assets effectively and build data-driven capabilities.",
      category: "strategy",
      priceUsd: "10000",
      priceInr: "800000",
      isHourly: false,
      features: ["Data audit", "Capability assessment", "Technology roadmap", "Team structure", "Delivery: 4-6 weeks"],
      imageUrl: "/images/demo/data-strategy.jpg",
      order: 3
    }
  ];
  
  await addServicesToProfile(storage, user.id, services);
  
  console.log(`[demo-profiles] Successfully created Data Scientist profile with ID: ${user.id}`);
  return user;
}