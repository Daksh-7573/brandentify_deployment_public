import { 
  users, User, InsertUser, 
  resumes, Resume, InsertResume,
  workExperiences, WorkExperience, InsertWorkExperience,
  educations, Education, InsertEducation,
  skills, Skill, InsertSkill,
  chatMessages, ChatMessage, InsertChatMessage,
  otpVerifications, OtpVerification, InsertOtpVerification,
  emailVerifications, EmailVerification, InsertEmailVerification,
  projects, Project, InsertProject,
  projectCollaborators, ProjectCollaborator, InsertProjectCollaborator,
  projectEndorsements, ProjectEndorsement, InsertProjectEndorsement,
  portfolios, Portfolio, InsertPortfolio,
  services, Service, InsertService,
  pulses, Pulse, InsertPulse,
  pulseComments, PulseComment, InsertPulseComment,
  pollVotes, PollVote, InsertPollVote
} from "@shared/schema";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Poll Vote operations
  getPollVotesByPulseId(pulseId: number): Promise<PollVote[]>;
  getPollVoteByUserAndPulse(userId: number, pulseId: number): Promise<PollVote | undefined>;
  createPollVote(vote: InsertPollVote): Promise<PollVote>;
  updatePollVote(id: number, vote: Partial<PollVote>): Promise<PollVote | undefined>;
  deletePollVote(id: number): Promise<boolean>;
  
  // Resume operations
  getResumeByUserId(userId: number): Promise<Resume | undefined>;
  createResume(resume: InsertResume): Promise<Resume>;
  updateResume(id: number, resume: Partial<Resume>): Promise<Resume | undefined>;
  
  // Work Experience operations
  getWorkExperiencesByUserId(userId: number): Promise<WorkExperience[]>;
  createWorkExperience(experience: InsertWorkExperience): Promise<WorkExperience>;
  updateWorkExperience(id: number, experience: Partial<WorkExperience>): Promise<WorkExperience | undefined>;
  deleteWorkExperience(id: number): Promise<boolean>;
  clearUserWorkExperiences(userId: number): Promise<number>;
  
  // Education operations
  getEducationsByUserId(userId: number): Promise<Education[]>;
  createEducation(education: InsertEducation): Promise<Education>;
  updateEducation(id: number, education: Partial<Education>): Promise<Education | undefined>;
  deleteEducation(id: number): Promise<boolean>;
  
  // Skill operations
  getSkillsByUserId(userId: number): Promise<Skill[]>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: number, skill: Partial<Skill>): Promise<Skill | undefined>;
  deleteSkill(id: number): Promise<boolean>;
  
  // Project operations
  getProjectsByUserId(userId: number): Promise<Project[]>;
  getProjectById(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Project Collaborator operations
  getProjectCollaboratorsByProjectId(projectId: number): Promise<ProjectCollaborator[]>;
  getProjectCollaboratorById(id: number): Promise<ProjectCollaborator | undefined>;
  createProjectCollaborator(collaborator: InsertProjectCollaborator): Promise<ProjectCollaborator>;
  updateProjectCollaborator(id: number, collaborator: Partial<ProjectCollaborator>): Promise<ProjectCollaborator | undefined>;
  deleteProjectCollaborator(id: number): Promise<boolean>;
  
  // Project Endorsement operations
  getProjectEndorsementsByProjectId(projectId: number): Promise<ProjectEndorsement[]>;
  getProjectEndorsementById(id: number): Promise<ProjectEndorsement | undefined>;
  createProjectEndorsement(endorsement: InsertProjectEndorsement): Promise<ProjectEndorsement>;
  updateProjectEndorsement(id: number, endorsement: Partial<ProjectEndorsement>): Promise<ProjectEndorsement | undefined>;
  deleteProjectEndorsement(id: number): Promise<boolean>;
  
  // Chat Message operations
  getChatMessagesByUserId(userId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  deleteChatMessagesByType(userId: number, messageType: string): Promise<number>;
  
  // OTP verification operations for phone login
  createOtpVerification(verification: InsertOtpVerification): Promise<OtpVerification>;
  getOtpVerificationByPhoneNumber(phoneNumber: string): Promise<OtpVerification | undefined>;
  verifyOtp(phoneNumber: string, otp: string): Promise<boolean>;
  
  // Email verification operations
  createEmailVerification(verification: InsertEmailVerification): Promise<EmailVerification>;
  getEmailVerificationByEmail(email: string): Promise<EmailVerification | undefined>;
  getEmailVerificationByToken(token: string): Promise<EmailVerification | undefined>;
  updateEmailVerification(id: number, verification: Partial<EmailVerification>): Promise<EmailVerification | undefined>;
  verifyEmail(email: string, token: string): Promise<boolean>;
  
  // Portfolio operations
  getPortfolioByUserId(userId: number): Promise<Portfolio | undefined>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  updatePortfolio(id: number, portfolio: Partial<Portfolio>): Promise<Portfolio | undefined>;
  deletePortfolio(id: number): Promise<boolean>;
  
  // Service operations
  getServicesByUserId(userId: number): Promise<Service[]>;
  getServiceById(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<Service>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;
  
  // Pulse operations
  getPulses(): Promise<Pulse[]>;
  getPulsesByUserId(userId: number): Promise<Pulse[]>;
  getPulseById(id: number): Promise<Pulse | undefined>;
  createPulse(pulse: InsertPulse): Promise<Pulse>;
  updatePulse(id: number, pulse: Partial<Pulse>): Promise<Pulse | undefined>;
  deletePulse(id: number): Promise<boolean>;
  
  // Pulse Comment operations
  getPulseCommentsByPulseId(pulseId: number): Promise<PulseComment[]>;
  createPulseComment(comment: InsertPulseComment): Promise<PulseComment>;
  deletePulseComment(id: number): Promise<boolean>;
  
  // Debug and maintenance operations
  reinitializeDemoData(): Promise<void>;
  clearAllUsers(): Promise<void>;
}

// In-memory implementation of the storage
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private resumes: Map<number, Resume>;
  private workExperiences: Map<number, WorkExperience>;
  private educations: Map<number, Education>;
  private skills: Map<number, Skill>;
  private chatMessages: Map<number, ChatMessage>;
  private otpVerifications: Map<number, OtpVerification>;
  private emailVerifications: Map<number, EmailVerification>;
  private projects: Map<number, Project>;
  private projectCollaborators: Map<number, ProjectCollaborator>;
  private projectEndorsements: Map<number, ProjectEndorsement>;
  private portfolios: Map<number, Portfolio>;
  private services: Map<number, Service>;
  private pulses: Map<number, Pulse>;
  private pulseComments: Map<number, PulseComment>;
  private pollVotes: Map<number, PollVote>;
  
  private currentUserId: number;
  private currentResumeId: number;
  private currentWorkExperienceId: number;
  private currentEducationId: number;
  private currentSkillId: number;
  private currentChatMessageId: number;
  private currentOtpVerificationId: number;
  private currentEmailVerificationId: number;
  private currentProjectId: number;
  private currentProjectCollaboratorId: number;
  private currentProjectEndorsementId: number;
  private currentPortfolioId: number;
  private currentServiceId: number;
  private currentPulseId: number;
  private currentPulseCommentId: number;
  private currentPollVoteId: number;

  constructor() {
    this.users = new Map();
    this.resumes = new Map();
    this.workExperiences = new Map();
    this.educations = new Map();
    this.skills = new Map();
    this.chatMessages = new Map();
    this.otpVerifications = new Map();
    this.emailVerifications = new Map();
    this.projects = new Map();
    this.projectCollaborators = new Map();
    this.projectEndorsements = new Map();
    this.portfolios = new Map();
    this.services = new Map();
    this.pulses = new Map();
    this.pulseComments = new Map();
    this.pollVotes = new Map();
    
    this.currentUserId = 1;
    this.currentResumeId = 1;
    this.currentWorkExperienceId = 1;
    this.currentEducationId = 1;
    this.currentSkillId = 1;
    this.currentChatMessageId = 1;
    this.currentOtpVerificationId = 1;
    this.currentEmailVerificationId = 1;
    this.currentProjectId = 1;
    this.currentProjectCollaboratorId = 1;
    this.currentProjectEndorsementId = 1;
    this.currentPortfolioId = 1;
    this.currentServiceId = 1;
    this.currentPulseId = 1;
    this.currentPulseCommentId = 1;
    this.currentPollVoteId = 1;
    
    // Initialize with a default user for development/demo
    this.initializeDemoData();
  }
  
  /**
   * Initialize demo data for development and testing
   */
  private initializeDemoData() {
    // Create demo user with proper photoURL and other required fields
    const demoUser: User = {
      id: 1,
      username: "user1",
      email: "user1@example.com",
      password: null,
      phoneNumber: null,
      name: "Senior Professional",
      photoURL: null,
      title: "Senior Software Engineer",
      location: "San Francisco, CA, USA",
      industry: "Technology",
      lookingFor: "A Career Mentor",
      profileCompleted: 65,
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
      createdAt: new Date()
    };
    this.users.set(demoUser.id, demoUser);
    this.currentUserId++;
    
    // Clear any existing work experiences, education, and skills for the demo user
    this.clearDemoDataMaps();
    
    // No pre-created skills either
    // Skills will be added by the user as needed
    this.currentSkillId = 1;
    
    // Create default portfolio for the demo user
    const demoPortfolio: Portfolio = {
      id: 1,
      userId: 1,
      layout: "professional", // Default layout
      customTitle: null,
      customBio: null,
      customizationOptions: {},
      isPublished: false,
      publicUrl: null,
      featuredProjects: [],
      featuredSkills: [], // No featured skills yet
      featuredExperiences: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.portfolios.set(demoPortfolio.id, demoPortfolio);
    this.currentPortfolioId++;
    
    // No pre-created services for new accounts
    // Starting service ID at 1 for the first service a user creates
    this.currentServiceId = 1;
    
    // Add demo pulses for testing image carousel
    this.createDemoPulses(demoUser.id);
    
    console.log(`[storage.initializeDemoData] No pre-created services - users will add their own`);
    
  }
  
  /**
   * Completely reset all demo data and reinitialize with minimal values
   * Used by the debug endpoint to wipe all existing data
   */
  async reinitializeDemoData(): Promise<void> {
    // First clear all data maps
    this.clearDemoDataMaps();
    
    // Force IDs back to start
    this.currentWorkExperienceId = 1;
    this.currentEducationId = 1;
    this.currentSkillId = 1;
    this.currentPortfolioId = 1;
    this.currentPulseId = 1;
    this.currentPulseCommentId = 1;
    this.currentPollVoteId = 1;
    
    // No pre-created skills
    
    // Create a default portfolio for the demo user
    const portfolio: Portfolio = {
      id: 1,
      userId: 1,
      layout: "professional", // Default layout
      customTitle: null,
      customBio: null,
      customizationOptions: {},
      isPublished: false,
      publicUrl: null,
      featuredProjects: [],
      featuredSkills: [], // No featured skills
      featuredExperiences: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.portfolios.set(portfolio.id, portfolio);
    this.currentPortfolioId++;
    
    // Create sample services for the demo user
    const service1: Service = {
      id: 1,
      userId: 1,
      title: 'Web Application Development',
      description: 'Full-stack web application development using React, Node.js, and PostgreSQL.',
      category: 'development',
      priceUsd: "100",  // Using string format for decimal values
      priceInr: "8000", // Using string format for decimal values
      isHourly: true,
      features: ['Custom UI/UX design', 'Database integration', 'API development', 'Delivery: 2-4 weeks'],
      imageUrl: "https://placehold.co/400x300/4f46e5/ffffff?text=Web+Development",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 1
    };
    this.services.set(service1.id, service1);
    
    const service2: Service = {
      id: 2,
      userId: 1,
      title: 'Brand Identity Design',
      description: 'Professional brand identity design including logo, color palette, and brand guidelines.',
      category: 'design',
      priceUsd: "500",  // Using string format for decimal values
      priceInr: "40000", // Using string format for decimal values
      isHourly: false,
      features: ['Logo design', 'Brand guidelines', 'Social media assets', 'Delivery: 1-2 weeks'],
      imageUrl: "https://placehold.co/400x300/e95800/ffffff?text=Brand+Design",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 2
    };
    this.services.set(service2.id, service2);
    
    const service3: Service = {
      id: 3,
      userId: 1,
      title: 'SEO Optimization',
      description: 'Improve your website visibility with professional SEO services.',
      category: 'marketing',
      priceUsd: "300",  // Using string format for decimal values
      priceInr: "24000", // Using string format for decimal values
      isHourly: false,
      features: ['Keyword research', 'On-page optimization', 'Performance tracking', 'Delivery: 2-3 weeks'],
      imageUrl: "https://placehold.co/400x300/22c55e/ffffff?text=SEO+Services",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 3
    };
    this.services.set(service3.id, service3);
    this.currentServiceId = 4;
    
    console.log("Demo data reinitialized with minimal values, skill, portfolio, and services");
  }
  
  /**
   * Clear all work experience, education, skills, project, portfolio, and service data
   */
  private clearDemoDataMaps(): void {
    // Clear all existing work experiences
    this.workExperiences.clear();
    
    // Clear all existing education
    this.educations.clear();
    
    // Clear all existing skills
    this.skills.clear();
    
    // Clear all existing projects
    this.projects.clear();
    
    // Clear all existing project collaborators
    this.projectCollaborators.clear();
    
    // Clear all existing project endorsements
    this.projectEndorsements.clear();
    
    // Clear all existing portfolios
    this.portfolios.clear();
    
    // Clear all existing services
    this.services.clear();
    
    // Clear all existing pulses
    this.pulses.clear();
    
    // Clear all existing pulse comments
    this.pulseComments.clear();
    
    // Clear all existing poll votes
    this.pollVotes.clear();
  }
  
  /**
   * Clears all work experience data for a user
   * Used for debugging and resetting demo data
   */
  async clearUserWorkExperiences(userId: number): Promise<number> {
    let deleted = 0;
    const entries = Array.from(this.workExperiences.entries());
    
    for (const [id, exp] of entries) {
      if (exp.userId === userId) {
        this.workExperiences.delete(id);
        deleted++;
      }
    }
    return deleted;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    console.log(`Looking up user by username: ${username}`);
    
    // For Firebase UID strings like "0yvB0mlyKfQXGo3j4ueLtAeBREE3"
    // We can do a more accurate search by storing the UID in the username field
    // but we also want to warn about any issues in the console for debugging
    
    const user = Array.from(this.users.values()).find(user => user.username === username);
    
    if (!user) {
      // Check if this is a Firebase UID and warn about it
      if (username && username.length > 20) {
        console.warn(`Firebase UID not found: ${username}. This is likely a Firebase UID that hasn't been properly registered.`);
      }
    } else {
      console.log(`Found user with username "${username}":`, user);
    }
    
    return user;
  }
  
  async getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.phoneNumber === phoneNumber);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    
    // Ensure all nullable fields have explicit null values instead of undefined
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt, 
      password: insertUser.password ?? null,
      phoneNumber: insertUser.phoneNumber ?? null,
      name: insertUser.name ?? null,
      photoURL: insertUser.photoURL ?? null,
      title: insertUser.title ?? null,
      location: insertUser.location ?? null,
      industry: insertUser.industry ?? null,
      lookingFor: insertUser.lookingFor ?? null,
      profileCompleted: insertUser.profileCompleted ?? null,
      emailVerified: false,
      emailVerificationToken: null,
      emailVerificationExpires: null
    };
    
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Resume operations
  async getResumeByUserId(userId: number): Promise<Resume | undefined> {
    return Array.from(this.resumes.values()).find(resume => resume.userId === userId);
  }

  async createResume(insertResume: InsertResume): Promise<Resume> {
    const id = this.currentResumeId++;
    const uploadedAt = new Date();
    const resume: Resume = { 
      ...insertResume, 
      id, 
      uploadedAt,
      score: insertResume.score ?? null 
    };
    this.resumes.set(id, resume);
    return resume;
  }

  async updateResume(id: number, resumeData: Partial<Resume>): Promise<Resume | undefined> {
    const resume = this.resumes.get(id);
    if (!resume) return undefined;
    
    const updatedResume = { ...resume, ...resumeData };
    this.resumes.set(id, updatedResume);
    return updatedResume;
  }

  // Work Experience operations
  async getWorkExperiencesByUserId(userId: number): Promise<WorkExperience[]> {
    return Array.from(this.workExperiences.values())
      .filter(experience => experience.userId === userId);
  }

  async createWorkExperience(insertExperience: InsertWorkExperience): Promise<WorkExperience> {
    const id = this.currentWorkExperienceId++;
    const experience: WorkExperience = { 
      ...insertExperience, 
      id,
      location: insertExperience.location ?? null,
      industry: insertExperience.industry ?? null,
      domain: insertExperience.domain ?? null,
      endDate: insertExperience.endDate ?? null,
      description: insertExperience.description ?? null
    };
    this.workExperiences.set(id, experience);
    return experience;
  }

  async updateWorkExperience(id: number, experienceData: Partial<WorkExperience>): Promise<WorkExperience | undefined> {
    const experience = this.workExperiences.get(id);
    if (!experience) return undefined;
    
    const updatedExperience = { ...experience, ...experienceData };
    this.workExperiences.set(id, updatedExperience);
    return updatedExperience;
  }

  async deleteWorkExperience(id: number): Promise<boolean> {
    return this.workExperiences.delete(id);
  }

  // Education operations
  async getEducationsByUserId(userId: number): Promise<Education[]> {
    return Array.from(this.educations.values())
      .filter(education => education.userId === userId);
  }

  async createEducation(insertEducation: InsertEducation): Promise<Education> {
    const id = this.currentEducationId++;
    const education: Education = { 
      ...insertEducation, 
      id,
      location: insertEducation.location ?? null,
      endDate: insertEducation.endDate ?? null
    };
    this.educations.set(id, education);
    return education;
  }

  async updateEducation(id: number, educationData: Partial<Education>): Promise<Education | undefined> {
    const education = this.educations.get(id);
    if (!education) return undefined;
    
    const updatedEducation = { ...education, ...educationData };
    this.educations.set(id, updatedEducation);
    return updatedEducation;
  }

  async deleteEducation(id: number): Promise<boolean> {
    return this.educations.delete(id);
  }

  // Skill operations
  async getSkillsByUserId(userId: number): Promise<Skill[]> {
    return Array.from(this.skills.values())
      .filter(skill => skill.userId === userId);
  }

  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const id = this.currentSkillId++;
    const skill: Skill = { 
      ...insertSkill, 
      id,
      proficiency: insertSkill.proficiency ?? null
    };
    this.skills.set(id, skill);
    return skill;
  }

  async updateSkill(id: number, skillData: Partial<Skill>): Promise<Skill | undefined> {
    const skill = this.skills.get(id);
    if (!skill) return undefined;
    
    const updatedSkill = { ...skill, ...skillData };
    this.skills.set(id, updatedSkill);
    return updatedSkill;
  }

  async deleteSkill(id: number): Promise<boolean> {
    return this.skills.delete(id);
  }

  // Chat Message operations
  async getChatMessagesByUserId(userId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.userId === userId)
      .sort((a, b) => {
        // Handle null timestamps safely (shouldn't happen, but TypeScript is strict)
        const timeA = a.timestamp ? a.timestamp.getTime() : 0;
        const timeB = b.timestamp ? b.timestamp.getTime() : 0;
        return timeA - timeB;
      });
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatMessageId++;
    const timestamp = new Date();
    const message: ChatMessage = { 
      ...insertMessage, 
      id, 
      timestamp,
      messageType: insertMessage.messageType ?? null
    };
    this.chatMessages.set(id, message);
    return message;
  }
  
  async deleteChatMessagesByType(userId: number, messageType: string): Promise<number> {
    let deletedCount = 0;
    
    // Get all messages
    const allMessages = Array.from(this.chatMessages.entries());
    
    // Filter messages by userId and messageType
    for (const [id, message] of allMessages) {
      if (message.userId === userId && message.messageType === messageType) {
        // Delete the message
        this.chatMessages.delete(id);
        deletedCount++;
      }
    }
    
    console.log(`[deleteChatMessagesByType] Deleted ${deletedCount} messages of type '${messageType}' for user ${userId}`);
    return deletedCount;
  }
  
  // OTP Verification operations
  async createOtpVerification(insertVerification: InsertOtpVerification): Promise<OtpVerification> {
    // First, check if there's an existing verification for this phone number
    const existingVerification = await this.getOtpVerificationByPhoneNumber(insertVerification.phoneNumber);
    
    // If there is, update it instead of creating a new one
    if (existingVerification) {
      const updatedVerification: OtpVerification = {
        ...existingVerification,
        otp: insertVerification.otp,
        expiresAt: insertVerification.expiresAt,
        verified: false,
        createdAt: new Date()
      };
      this.otpVerifications.set(existingVerification.id, updatedVerification);
      return updatedVerification;
    }
    
    // Otherwise, create a new verification
    const id = this.currentOtpVerificationId++;
    const createdAt = new Date();
    const verification: OtpVerification = {
      ...insertVerification,
      id,
      verified: false,
      createdAt
    };
    
    this.otpVerifications.set(id, verification);
    return verification;
  }
  
  async getOtpVerificationByPhoneNumber(phoneNumber: string): Promise<OtpVerification | undefined> {
    return Array.from(this.otpVerifications.values())
      .find(verification => verification.phoneNumber === phoneNumber);
  }
  
  async verifyOtp(phoneNumber: string, otp: string): Promise<boolean> {
    console.log(`[storage] verifyOtp: Verifying ${phoneNumber} with OTP ${otp}`);
    
    const verification = await this.getOtpVerificationByPhoneNumber(phoneNumber);
    if (!verification) {
      console.log(`[storage] verifyOtp: No verification found for ${phoneNumber}`);
      return false;
    }
    
    console.log(`[storage] verifyOtp: Found verification:`, verification);
    
    // Check if the OTP has expired using the expiresAt field
    const now = new Date();
    if (now > verification.expiresAt) {
      console.log(`[storage] verifyOtp: OTP expired. Current time: ${now}, Expires at: ${verification.expiresAt}`);
      return false;
    }
    
    // Check if the OTP matches
    if (verification.otp !== otp) {
      console.log(`[storage] verifyOtp: OTP mismatch. Expected: ${verification.otp}, Received: ${otp}`);
      return false;
    }
    
    console.log(`[storage] verifyOtp: OTP validated successfully`);
    
    // Mark the verification as verified
    const updatedVerification: OtpVerification = {
      ...verification,
      verified: true
    };
    this.otpVerifications.set(verification.id, updatedVerification);
    
    return true;
  }
  
  // Email Verification operations
  async createEmailVerification(insertVerification: InsertEmailVerification): Promise<EmailVerification> {
    // First, check if there's an existing verification for this email
    const existingVerification = await this.getEmailVerificationByEmail(insertVerification.email);
    
    // If there is, update it instead of creating a new one
    if (existingVerification) {
      const updatedVerification: EmailVerification = {
        ...existingVerification,
        token: insertVerification.token,
        expiresAt: insertVerification.expiresAt,
        verified: false,
        createdAt: new Date()
      };
      this.emailVerifications.set(existingVerification.id, updatedVerification);
      return updatedVerification;
    }
    
    // Otherwise, create a new verification
    const id = this.currentEmailVerificationId++;
    const createdAt = new Date();
    const verification: EmailVerification = {
      ...insertVerification,
      id,
      verified: false,
      createdAt
    };
    
    this.emailVerifications.set(id, verification);
    return verification;
  }
  
  async getEmailVerificationByEmail(email: string): Promise<EmailVerification | undefined> {
    return Array.from(this.emailVerifications.values())
      .find(verification => verification.email === email);
  }
  
  async getEmailVerificationByToken(token: string): Promise<EmailVerification | undefined> {
    return Array.from(this.emailVerifications.values())
      .find(verification => verification.token === token);
  }
  
  async updateEmailVerification(id: number, verificationData: Partial<EmailVerification>): Promise<EmailVerification | undefined> {
    const verification = this.emailVerifications.get(id);
    if (!verification) return undefined;
    
    const updatedVerification = { ...verification, ...verificationData };
    this.emailVerifications.set(id, updatedVerification);
    return updatedVerification;
  }
  
  async verifyEmail(email: string, token: string): Promise<boolean> {
    console.log(`[storage] verifyEmail: Verifying ${email} with token ${token}`);
    
    const verification = await this.getEmailVerificationByEmail(email);
    if (!verification) {
      console.log(`[storage] verifyEmail: No verification found for ${email}`);
      return false;
    }
    
    console.log(`[storage] verifyEmail: Found verification:`, verification);
    
    // Check if the token has expired using the expiresAt field
    const now = new Date();
    if (now > verification.expiresAt) {
      console.log(`[storage] verifyEmail: Token expired. Current time: ${now}, Expires at: ${verification.expiresAt}`);
      return false;
    }
    
    // Check if the token matches
    if (verification.token !== token) {
      console.log(`[storage] verifyEmail: Token mismatch. Expected: ${verification.token}, Received: ${token}`);
      return false;
    }
    
    console.log(`[storage] verifyEmail: Token validated successfully`);
    
    // Mark the verification as verified
    const updatedVerification: EmailVerification = {
      ...verification,
      verified: true
    };
    this.emailVerifications.set(verification.id, updatedVerification);
    
    // Also update the user's emailVerified status
    const user = await this.getUserByEmail(email);
    if (user) {
      await this.updateUser(user.id, { 
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      });
    }
    
    return true;
  }
  
  // Project operations
  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values())
      .filter(project => project.userId === userId);
  }
  
  async getProjectById(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const project: Project = {
      ...insertProject,
      id,
      createdAt,
      updatedAt,
      mediaUrls: insertProject.mediaUrls ?? [],
      description: insertProject.description ?? null,
      startDate: insertProject.startDate ?? null,
      projectUrl: insertProject.projectUrl ?? null,
      thumbnailUrl: insertProject.thumbnailUrl ?? null,
      thumbnailFile: insertProject.thumbnailFile ?? null,
      category: insertProject.category ?? null
    };
    
    this.projects.set(id, project);
    return project;
  }
  
  async updateProject(id: number, projectData: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedAt = new Date();
    const updatedProject = { ...project, ...projectData, updatedAt };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  
  async deleteProject(id: number): Promise<boolean> {
    // When deleting a project, we should also delete all related collaborators and endorsements
    
    // First, delete all collaborators
    const collaborators = await this.getProjectCollaboratorsByProjectId(id);
    for (const collaborator of collaborators) {
      await this.deleteProjectCollaborator(collaborator.id);
    }
    
    // Then, delete all endorsements
    const endorsements = await this.getProjectEndorsementsByProjectId(id);
    for (const endorsement of endorsements) {
      await this.deleteProjectEndorsement(endorsement.id);
    }
    
    // Finally, delete the project itself
    return this.projects.delete(id);
  }
  
  // Project Collaborator operations
  async getProjectCollaboratorsByProjectId(projectId: number): Promise<ProjectCollaborator[]> {
    return Array.from(this.projectCollaborators.values())
      .filter(collaborator => collaborator.projectId === projectId);
  }
  
  async getProjectCollaboratorById(id: number): Promise<ProjectCollaborator | undefined> {
    return this.projectCollaborators.get(id);
  }
  
  async createProjectCollaborator(insertCollaborator: InsertProjectCollaborator): Promise<ProjectCollaborator> {
    const id = this.currentProjectCollaboratorId++;
    const createdAt = new Date();
    
    const collaborator: ProjectCollaborator = {
      ...insertCollaborator,
      id,
      createdAt,
      inviteStatus: 'Pending',
      inviteToken: null,
      inviteExpires: null,
      email: insertCollaborator.email ?? null,
      userId: insertCollaborator.userId ?? null,
      name: insertCollaborator.name || 'Team Member', // Use default if not provided
      role: insertCollaborator.role ?? 'Contributor'
    };
    
    this.projectCollaborators.set(id, collaborator);
    return collaborator;
  }
  
  async updateProjectCollaborator(id: number, collaboratorData: Partial<ProjectCollaborator>): Promise<ProjectCollaborator | undefined> {
    const collaborator = this.projectCollaborators.get(id);
    if (!collaborator) return undefined;
    
    const updatedCollaborator = { ...collaborator, ...collaboratorData };
    this.projectCollaborators.set(id, updatedCollaborator);
    return updatedCollaborator;
  }
  
  async deleteProjectCollaborator(id: number): Promise<boolean> {
    return this.projectCollaborators.delete(id);
  }
  
  // Project Endorsement operations
  async getProjectEndorsementsByProjectId(projectId: number): Promise<ProjectEndorsement[]> {
    return Array.from(this.projectEndorsements.values())
      .filter(endorsement => endorsement.projectId === projectId);
  }
  
  async getProjectEndorsementById(id: number): Promise<ProjectEndorsement | undefined> {
    return this.projectEndorsements.get(id);
  }
  
  async createProjectEndorsement(insertEndorsement: InsertProjectEndorsement): Promise<ProjectEndorsement> {
    const id = this.currentProjectEndorsementId++;
    const createdAt = new Date();
    
    const endorsement: ProjectEndorsement = {
      ...insertEndorsement,
      id,
      createdAt,
      message: insertEndorsement.message ?? null,
      clientEmail: insertEndorsement.clientEmail ?? null,
      clientTitle: insertEndorsement.clientTitle ?? null,
      clientCompany: insertEndorsement.clientCompany ?? null,
      rating: insertEndorsement.rating ?? null,
      isVerified: false,
      verificationToken: null,
      verificationExpires: null
    };
    
    this.projectEndorsements.set(id, endorsement);
    return endorsement;
  }
  
  async updateProjectEndorsement(id: number, endorsementData: Partial<ProjectEndorsement>): Promise<ProjectEndorsement | undefined> {
    const endorsement = this.projectEndorsements.get(id);
    if (!endorsement) return undefined;
    
    const updatedEndorsement = { ...endorsement, ...endorsementData };
    this.projectEndorsements.set(id, updatedEndorsement);
    return updatedEndorsement;
  }
  
  async deleteProjectEndorsement(id: number): Promise<boolean> {
    return this.projectEndorsements.delete(id);
  }

  // Portfolio operations
  async getPortfolioByUserId(userId: number): Promise<Portfolio | undefined> {
    return Array.from(this.portfolios.values())
      .find(portfolio => portfolio.userId === userId);
  }

  async createPortfolio(insertPortfolio: InsertPortfolio): Promise<Portfolio> {
    const id = this.currentPortfolioId++;
    const createdAt = new Date();
    const portfolio: Portfolio = {
      id,
      userId: insertPortfolio.userId,
      layout: insertPortfolio.layout || "professional", // Default to professional if not specified
      createdAt,
      updatedAt: createdAt,
      isPublished: insertPortfolio.isPublished ?? false,
      customTitle: insertPortfolio.customTitle ?? null,
      customBio: insertPortfolio.customBio ?? null,
      publicUrl: insertPortfolio.publicUrl ?? null,
      customizationOptions: insertPortfolio.customizationOptions ?? {},
      featuredProjects: insertPortfolio.featuredProjects ?? [],
      featuredSkills: insertPortfolio.featuredSkills ?? [],
      featuredExperiences: insertPortfolio.featuredExperiences ?? []
    };
    this.portfolios.set(id, portfolio);
    return portfolio;
  }

  async updatePortfolio(id: number, portfolioData: Partial<Portfolio>): Promise<Portfolio | undefined> {
    const portfolio = this.portfolios.get(id);
    if (!portfolio) return undefined;
    
    const updatedPortfolio = { 
      ...portfolio, 
      ...portfolioData,
      updatedAt: new Date() 
    };
    this.portfolios.set(id, updatedPortfolio);
    return updatedPortfolio;
  }

  async deletePortfolio(id: number): Promise<boolean> {
    return this.portfolios.delete(id);
  }
  
  // Service operations
  async getServicesByUserId(userId: number): Promise<Service[]> {
    console.log(`[storage.getServicesByUserId] Looking for services with userId: ${userId}`);
    console.log(`[storage.getServicesByUserId] Total services in database: ${this.services.size}`);
    
    // Convert to array and filter
    const userServices = Array.from(this.services.values())
      .filter(service => service.userId === userId);
    
    console.log(`[storage.getServicesByUserId] Found ${userServices.length} services for userId: ${userId}`);
    if (userServices.length > 0) {
      console.log(`[storage.getServicesByUserId] First service: ${JSON.stringify(userServices[0])}`);
    }
    
    return userServices;
  }

  async getServiceById(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = this.currentServiceId++;
    const createdAt = new Date();
    const service: Service = {
      id,
      userId: insertService.userId,
      title: insertService.title,
      description: insertService.description ?? null,
      category: insertService.category ?? "other",
      priceInr: insertService.priceInr ?? null,
      priceUsd: insertService.priceUsd ?? null,
      isHourly: insertService.isHourly ?? false,
      features: insertService.features ?? [],
      imageUrl: insertService.imageUrl ?? null,
      order: insertService.order ?? 0,
      isActive: insertService.isActive ?? true,
      createdAt,
      updatedAt: createdAt
    };
    this.services.set(id, service);
    return service;
  }

  async updateService(id: number, serviceData: Partial<Service>): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (!service) return undefined;
    
    const updatedService = { ...service, ...serviceData };
    this.services.set(id, updatedService);
    return updatedService;
  }

  async deleteService(id: number): Promise<boolean> {
    return this.services.delete(id);
  }
  
  /**
   * Create demo pulses for testing carousel/image gallery functionality
   */
  private createDemoPulses(userId: number): void {
    // Create a demo media pulse with multiple images for carousel testing
    const imagePulse: Pulse = {
      id: 1,
      userId: userId,
      type: "media-pulse",
      title: "My Latest UI Design Work",
      content: "Showcasing some of my recent UI design work on product dashboards and analytics interfaces. I focused on creating clean, intuitive layouts with strong visual hierarchy.",
      mediaType: "image",
      mediaUrls: [
        "/images/demo/ui-design-1.svg",
        "/images/demo/ui-design-2.svg", 
        "/images/demo/ui-design-3.svg",
        "/images/demo/ui-design-4.svg",
        "/images/demo/ui-design-5.svg"
      ],
      mediaLocalStorageKeys: [],
      pollOptions: [],
      projectId: null,
      likes: 24,
      comments: 7,
      isPublished: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    };
    
    // Create a poll pulse
    const pollPulse: Pulse = {
      id: 2,
      userId: userId,
      type: "poll",
      title: "What's your preferred development stack?",
      content: "I'm curious about what technologies other professionals are using for their projects.",
      mediaType: null,
      mediaUrls: [],
      mediaLocalStorageKeys: [],
      pollOptions: ["MERN (MongoDB, Express, React, Node)", "LAMP (Linux, Apache, MySQL, PHP)", "JAMstack", "Python + Django/Flask", ".NET Core + Angular/React"],
      projectId: null,
      likes: 42,
      comments: 18,
      isPublished: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    };
    
    // Create a video pulse
    const videoPulse: Pulse = {
      id: 3,
      userId: userId,
      type: "media-pulse",
      title: "Quick Demo of My New App",
      content: "A brief walkthrough of the application I've been developing for the past few months. Would love your feedback!",
      mediaType: "video",
      mediaUrls: ["https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"],
      mediaLocalStorageKeys: [],
      pollOptions: [],
      projectId: null,
      likes: 17,
      comments: 5,
      isPublished: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    };
    
    // Add pulses to storage
    this.pulses.set(imagePulse.id, imagePulse);
    this.pulses.set(pollPulse.id, pollPulse);
    this.pulses.set(videoPulse.id, videoPulse);
    this.currentPulseId = 4; // Set next pulse ID
    
    console.log("[storage.createDemoPulses] Created demo pulses for image carousel testing");
  }

  // Pulse operations
  async getPulses(): Promise<Pulse[]> {
    return Array.from(this.pulses.values())
      .sort((a, b) => {
        const timeA = a.createdAt ? a.createdAt.getTime() : 0;
        const timeB = b.createdAt ? b.createdAt.getTime() : 0;
        return timeB - timeA; // Sort newest first
      });
  }
  
  async getPulsesByUserId(userId: number): Promise<Pulse[]> {
    return Array.from(this.pulses.values())
      .filter(pulse => pulse.userId === userId)
      .sort((a, b) => {
        const timeA = a.createdAt ? a.createdAt.getTime() : 0;
        const timeB = b.createdAt ? b.createdAt.getTime() : 0;
        return timeB - timeA; // Sort newest first
      });
  }
  
  async getPulseById(id: number): Promise<Pulse | undefined> {
    return this.pulses.get(id);
  }
  
  async createPulse(insertPulse: InsertPulse): Promise<Pulse> {
    const id = this.currentPulseId++;
    const createdAt = new Date();
    
    const pulse: Pulse = {
      id,
      userId: insertPulse.userId,
      type: insertPulse.type,
      title: insertPulse.title,
      content: insertPulse.content ?? null,
      mediaType: insertPulse.mediaType ?? null,
      mediaUrls: insertPulse.mediaUrls ?? [],
      mediaLocalStorageKeys: insertPulse.mediaLocalStorageKeys ?? [],
      pollOptions: insertPulse.pollOptions ?? [],
      projectId: insertPulse.projectId ?? null,
      likes: 0,
      comments: 0,
      isPublished: insertPulse.isPublished ?? true,
      createdAt,
      updatedAt: createdAt
    };
    
    this.pulses.set(id, pulse);
    return pulse;
  }
  
  async updatePulse(id: number, pulseData: Partial<Pulse>): Promise<Pulse | undefined> {
    const pulse = this.pulses.get(id);
    if (!pulse) return undefined;
    
    const updatedAt = new Date();
    const updatedPulse = { 
      ...pulse, 
      ...pulseData,
      updatedAt 
    };
    
    this.pulses.set(id, updatedPulse);
    return updatedPulse;
  }
  
  async deletePulse(id: number): Promise<boolean> {
    // First, delete all comments for this pulse
    const commentsToDelete = Array.from(this.pulseComments.entries())
      .filter(([_, comment]) => comment.pulseId === id)
      .map(([commentId, _]) => commentId);
    
    commentsToDelete.forEach(commentId => {
      this.pulseComments.delete(commentId);
    });
    
    // Then delete the pulse itself
    return this.pulses.delete(id);
  }
  
  // Pulse Comment operations
  async getPulseCommentsByPulseId(pulseId: number): Promise<PulseComment[]> {
    return Array.from(this.pulseComments.values())
      .filter(comment => comment.pulseId === pulseId)
      .sort((a, b) => {
        const timeA = a.createdAt ? a.createdAt.getTime() : 0;
        const timeB = b.createdAt ? b.createdAt.getTime() : 0;
        return timeA - timeB; // Sort oldest first
      });
  }
  
  async createPulseComment(insertComment: InsertPulseComment): Promise<PulseComment> {
    const id = this.currentPulseCommentId++;
    const createdAt = new Date();
    
    const comment: PulseComment = {
      ...insertComment,
      id,
      createdAt,
      likes: 0
    };
    
    this.pulseComments.set(id, comment);
    
    // Update the comment count on the pulse
    const pulse = this.pulses.get(insertComment.pulseId);
    if (pulse) {
      this.pulses.set(pulse.id, {
        ...pulse,
        comments: (pulse.comments || 0) + 1
      });
    }
    
    return comment;
  }
  
  async deletePulseComment(id: number): Promise<boolean> {
    const comment = this.pulseComments.get(id);
    if (!comment) return false;
    
    // Decrease the comment count on the pulse
    const pulse = this.pulses.get(comment.pulseId);
    if (pulse && pulse.comments && pulse.comments > 0) {
      this.pulses.set(pulse.id, {
        ...pulse,
        comments: pulse.comments - 1
      });
    }
    
    return this.pulseComments.delete(id);
  }
  
  // Poll Vote operations
  async getPollVotesByPulseId(pulseId: number): Promise<PollVote[]> {
    return Array.from(this.pollVotes.values())
      .filter(vote => vote.pulseId === pulseId);
  }
  
  async getPollVoteByUserAndPulse(userId: number, pulseId: number): Promise<PollVote | undefined> {
    return Array.from(this.pollVotes.values())
      .find(vote => vote.userId === userId && vote.pulseId === pulseId);
  }
  
  async createPollVote(insertVote: InsertPollVote): Promise<PollVote> {
    const id = this.currentPollVoteId++;
    const createdAt = new Date();
    
    const vote: PollVote = {
      ...insertVote,
      id,
      createdAt
    };
    
    this.pollVotes.set(id, vote);
    return vote;
  }
  
  async updatePollVote(id: number, voteData: Partial<PollVote>): Promise<PollVote | undefined> {
    const vote = this.pollVotes.get(id);
    if (!vote) return undefined;
    
    const updatedVote = { ...vote, ...voteData };
    this.pollVotes.set(id, updatedVote);
    return updatedVote;
  }
  
  async deletePollVote(id: number): Promise<boolean> {
    return this.pollVotes.delete(id);
  }

  /**
   * Clears all users except the demo user (id: 1)
   * This is primarily for development and testing purposes
   */
  async clearAllUsers(): Promise<void> {
    console.log("[storage] clearAllUsers: Clearing all registered users except the demo user");
    
    // Create a list of IDs to remove
    const idsToRemove: number[] = [];
    
    // Find all users except the demo user (ID 1)
    for (const [id, user] of this.users.entries()) {
      if (id !== 1) {
        idsToRemove.push(id);
      }
    }
    
    // Remove users
    for (const id of idsToRemove) {
      this.users.delete(id);
      console.log(`[storage] clearAllUsers: Removed user with ID ${id}`);
    }
    
    // Also clear related verifications
    this.emailVerifications.clear();
    this.otpVerifications.clear();
    
    console.log(`[storage] clearAllUsers: Removed ${idsToRemove.length} users and cleared all verifications`);
  }

  /**
   * Search for pulses by title, description, or tags
   * @param query Search query string
   * @returns Array of matching Pulse objects
   */
  async searchPulses(query: string): Promise<Pulse[]> {
    console.log(`[storage] searchPulses: Searching pulses with query: "${query}"`);
    const normalizedQuery = query.toLowerCase().trim();
    
    if (!normalizedQuery) {
      return [];
    }
    
    const results = Array.from(this.pulses.values()).filter(pulse => {
      // Check various fields for matches
      const titleMatch = pulse.title?.toLowerCase().includes(normalizedQuery);
      const descriptionMatch = pulse.description?.toLowerCase().includes(normalizedQuery);
      
      // Check tags if they exist
      const tagMatches = Array.isArray(pulse.tags) && 
        pulse.tags.some(tag => tag.toLowerCase().includes(normalizedQuery));
      
      return titleMatch || descriptionMatch || tagMatches;
    });
    
    // Sort by recency
    results.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // Get user info for each pulse
    const resultsWithUsers = await Promise.all(results.map(async pulse => {
      const user = await this.getUser(pulse.userId);
      return { ...pulse, user };
    }));
    
    console.log(`[storage] searchPulses: Found ${results.length} matching pulses`);
    return resultsWithUsers;
  }
  
  /**
   * Search for user profiles by name, title, location, or industry
   * @param query Search query string
   * @returns Array of matching User objects
   */
  async searchProfiles(query: string): Promise<User[]> {
    console.log(`[storage] searchProfiles: Searching profiles with query: "${query}"`);
    const normalizedQuery = query.toLowerCase().trim();
    
    if (!normalizedQuery) {
      return [];
    }
    
    const results = Array.from(this.users.values()).filter(user => {
      // Check various fields for matches
      const nameMatch = user.name?.toLowerCase().includes(normalizedQuery);
      const titleMatch = user.title?.toLowerCase().includes(normalizedQuery);
      const locationMatch = user.location?.toLowerCase().includes(normalizedQuery);
      const industryMatch = user.industry?.toLowerCase().includes(normalizedQuery);
      
      return nameMatch || titleMatch || locationMatch || industryMatch;
    });
    
    console.log(`[storage] searchProfiles: Found ${results.length} matching profiles`);
    return results;
  }
  
  /**
   * Search for hashtags
   * @param query Search query string
   * @returns Array of matching hashtags with usage counts
   */
  async searchHashtags(query: string): Promise<{id: number, name: string, count: number}[]> {
    console.log(`[storage] searchHashtags: Searching hashtags with query: "${query}"`);
    const normalizedQuery = query.toLowerCase().trim();
    
    if (!normalizedQuery) {
      return [];
    }
    
    // Extract all tags from pulses
    const allTags: string[] = [];
    for (const pulse of this.pulses.values()) {
      if (Array.isArray(pulse.tags)) {
        allTags.push(...pulse.tags);
      }
    }
    
    // Count occurrences of each tag
    const tagCounts: Record<string, number> = {};
    allTags.forEach(tag => {
      const normalizedTag = tag.toLowerCase();
      tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1;
    });
    
    // Convert to array and filter by query
    const results = Object.entries(tagCounts)
      .filter(([tag]) => tag.includes(normalizedQuery))
      .map(([name, count], index) => ({
        id: index + 1, // Generate synthetic ID
        name,
        count
      }))
      .sort((a, b) => b.count - a.count); // Sort by popularity
    
    console.log(`[storage] searchHashtags: Found ${results.length} matching hashtags`);
    return results;
  }
}

export const storage = new MemStorage();
