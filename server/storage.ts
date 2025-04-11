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
  pollVotes, PollVote, InsertPollVote,
  hashtags, Hashtag, InsertHashtag,
  pulseHashtags, PulseHashtag, InsertPulseHashtag,
  userHashtagFollows, UserHashtagFollow, InsertUserHashtagFollow,
  // Pulse Interaction System models
  pulseReactions, PulseReaction, InsertPulseReaction,
  userReactionQuotas, UserReactionQuota, InsertUserReactionQuota,
  pulseShares, PulseShare, InsertPulseShare,
  // New models for News Pulse feature
  newsSources, NewsSource, InsertNewsSource,
  newsArticles, NewsArticle, InsertNewsArticle,
  newsUserPreferences, NewsUserPreference, InsertNewsUserPreference,
  // User Personal Info
  userPersonalInfo, UserPersonalInfo, InsertUserPersonalInfo
} from "@shared/schema";

// Interface for all storage operations
export interface IStorage {
  // User Hashtag Follow operations
  followHashtag(userId: number, hashtagId: number): Promise<UserHashtagFollow>;
  unfollowHashtag(userId: number, hashtagId: number): Promise<boolean>;
  getFollowedHashtagsByUserId(userId: number): Promise<Hashtag[]>;
  isHashtagFollowedByUser(userId: number, hashtagId: number): Promise<boolean>;
  getPulsesByFollowedHashtags(userId: number): Promise<Pulse[]>;
  
  // User Personal Info operations
  getUserPersonalInfoByUserId(userId: number): Promise<UserPersonalInfo | undefined>;
  createUserPersonalInfo(personalInfo: InsertUserPersonalInfo): Promise<UserPersonalInfo>;
  updateUserPersonalInfo(id: number, personalInfoData: Partial<UserPersonalInfo>): Promise<UserPersonalInfo | undefined>;
  deleteUserPersonalInfo(id: number): Promise<boolean>;
  
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
  
  // Pulse Reaction operations
  getPulseReactionsByPulseId(pulseId: number): Promise<PulseReaction[]>;
  getPulseReactionById(id: number): Promise<PulseReaction | undefined>;
  getPulseReactionByUserAndPulse(userId: number, pulseId: number, reactionType: "insightful" | "misinformed"): Promise<PulseReaction | undefined>;
  createPulseReaction(reaction: InsertPulseReaction): Promise<PulseReaction>;
  deletePulseReaction(id: number): Promise<boolean>;
  
  // User Reaction Quota operations
  getUserReactionQuota(userId: number): Promise<UserReactionQuota | undefined>;
  getOrCreateUserReactionQuota(userId: number): Promise<UserReactionQuota>;
  incrementReactionQuota(userId: number, reactionType: "insightful" | "misinformed"): Promise<UserReactionQuota>;
  decrementReactionQuota(userId: number, reactionType: "insightful" | "misinformed"): Promise<UserReactionQuota>;
  checkReactionQuota(userId: number, reactionType: "insightful" | "misinformed"): Promise<{ 
    hasQuotaRemaining: boolean; 
    remaining: number; 
    used: number;
    max: number;
  }>;
  
  // Pulse Share operations
  getPulseSharesByRecipientId(recipientId: number): Promise<PulseShare[]>;
  createPulseShare(share: InsertPulseShare): Promise<PulseShare>;
  markPulseShareRead(id: number): Promise<PulseShare | undefined>;
  deletePulseShare(id: number): Promise<boolean>;
  
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
  
  // User Personal Info operations
  getUserPersonalInfoByUserId(userId: number): Promise<UserPersonalInfo | undefined>;
  createUserPersonalInfo(personalInfo: InsertUserPersonalInfo): Promise<UserPersonalInfo>;
  updateUserPersonalInfo(userId: number, personalInfo: Partial<UserPersonalInfo>): Promise<UserPersonalInfo | undefined>;
  deleteUserPersonalInfo(userId: number): Promise<boolean>;
  
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
  
  // Hashtag operations
  getHashtags(): Promise<Hashtag[]>;
  getHashtagById(id: number): Promise<Hashtag | undefined>;
  getHashtagByTag(tag: string): Promise<Hashtag | undefined>;
  createHashtag(hashtag: InsertHashtag): Promise<Hashtag>;
  updateHashtag(id: number, hashtag: Partial<Hashtag>): Promise<Hashtag | undefined>;
  incrementHashtagCount(id: number): Promise<Hashtag | undefined>;
  
  // Pulse Hashtag operations
  createPulseHashtag(pulseHashtag: InsertPulseHashtag): Promise<PulseHashtag>;
  getPulseHashtagsByPulseId(pulseId: number): Promise<PulseHashtag[]>;
  getHashtagsByPulseId(pulseId: number): Promise<Hashtag[]>;
  extractAndSaveHashtags(text: string, pulseId: number): Promise<Hashtag[]>;
  searchHashtagsByPrefix(prefix: string): Promise<Hashtag[]>;
  
  // User Hashtag Following operations
  followHashtag(userId: number, hashtagId: number): Promise<UserHashtagFollow>;
  unfollowHashtag(userId: number, hashtagId: number): Promise<boolean>;
  getFollowedHashtagsByUserId(userId: number): Promise<Hashtag[]>;
  isHashtagFollowedByUser(userId: number, hashtagId: number): Promise<boolean>;
  getPulsesByFollowedHashtags(userId: number): Promise<Pulse[]>;
  
  // Debug and maintenance operations
  reinitializeDemoData(): Promise<void>;
  clearAllUsers(): Promise<void>;
  
  // News Source operations
  getNewsSources(): Promise<NewsSource[]>;
  getNewsSourceById(id: number): Promise<NewsSource | undefined>;
  getNewsSourcesByCategory(category: string): Promise<NewsSource[]>;
  createNewsSource(source: InsertNewsSource): Promise<NewsSource>;
  updateNewsSource(id: number, source: Partial<NewsSource>): Promise<NewsSource | undefined>;
  deleteNewsSource(id: number): Promise<boolean>;
  
  // News Article operations
  getNewsArticles(): Promise<NewsArticle[]>;
  getNewsArticleById(id: number): Promise<NewsArticle | undefined>;
  getNewsArticlesBySourceId(sourceId: number): Promise<NewsArticle[]>;
  getNewsArticlesByCategory(category: string): Promise<NewsArticle[]>;
  getUnprocessedNewsArticles(): Promise<NewsArticle[]>;
  getNewsArticlesByIndustry(industry: string): Promise<NewsArticle[]>;
  createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle>;
  updateNewsArticle(id: number, article: Partial<NewsArticle>): Promise<NewsArticle | undefined>;
  deleteNewsArticle(id: number): Promise<boolean>;
  
  // News User Preference operations
  getNewsUserPreferenceByUserId(userId: number): Promise<NewsUserPreference | undefined>;
  createNewsUserPreference(preference: InsertNewsUserPreference): Promise<NewsUserPreference>;
  updateNewsUserPreference(id: number, preference: Partial<NewsUserPreference>): Promise<NewsUserPreference | undefined>;
  deleteNewsUserPreference(id: number): Promise<boolean>;
  
  // News Pulse operations
  createNewsPulse(article: NewsArticle, userId: number): Promise<Pulse>;
  getLatestNewsPulses(userId: number, limit?: number): Promise<Pulse[]>;
  generateNewsContent(article: NewsArticle): Promise<{ title: string, content: string, hashtags: string[] }>;
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
  private userPersonalInfo: Map<number, UserPersonalInfo>;
  private hashtags: Map<number, Hashtag>;
  private pulseHashtags: Map<number, PulseHashtag>;
  private services: Map<number, Service>;
  private pulses: Map<number, Pulse>;
  private pulseComments: Map<number, PulseComment>;
  private pollVotes: Map<number, PollVote>;
  private userHashtagFollows: Map<number, UserHashtagFollow>;
  // New models for Industry Pulse Interaction System
  private pulseReactions: Map<number, PulseReaction>;
  private userReactionQuotas: Map<number, UserReactionQuota>;
  private pulseShares: Map<number, PulseShare>;
  // New models for News Pulse feature
  private newsSources: Map<number, NewsSource>;
  private newsArticles: Map<number, NewsArticle>;
  private newsUserPreferences: Map<number, NewsUserPreference>;
  
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
  private currentHashtagId: number;
  private currentPulseHashtagId: number;
  private currentUserHashtagFollowId: number;
  // Pulse interaction system IDs
  private currentPulseReactionId: number;
  private currentUserReactionQuotaId: number;
  private currentPulseShareId: number;
  // New IDs for News Pulse feature
  private currentNewsSourceId: number;
  private currentNewsArticleId: number;
  private currentNewsUserPreferenceId: number;
  private currentUserPersonalInfoId: number;

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
    this.userPersonalInfo = new Map();
    this.services = new Map();
    this.pulses = new Map();
    this.pulseComments = new Map();
    this.pollVotes = new Map();
    this.hashtags = new Map();
    this.pulseHashtags = new Map();
    this.userHashtagFollows = new Map();
    // Initialize pulse interaction system maps
    this.pulseReactions = new Map();
    this.userReactionQuotas = new Map();
    this.pulseShares = new Map();
    // Initialize news maps
    this.newsSources = new Map();
    this.newsArticles = new Map();
    this.newsUserPreferences = new Map();
    
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
    this.currentHashtagId = 1;
    this.currentPulseHashtagId = 1;
    this.currentUserHashtagFollowId = 1;
    // Initialize pulse interaction system IDs
    this.currentPulseReactionId = 1;
    this.currentUserReactionQuotaId = 1; 
    this.currentPulseShareId = 1;
    // Initialize news IDs
    this.currentNewsSourceId = 1;
    this.currentNewsArticleId = 1;
    this.currentNewsUserPreferenceId = 1;
    this.currentUserPersonalInfoId = 1;
    
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
    this.currentHashtagId = 1;
    this.currentPulseHashtagId = 1;
    this.currentUserHashtagFollowId = 1;
    // Reset pulse interaction system IDs
    this.currentPulseReactionId = 1;
    this.currentUserReactionQuotaId = 1;
    this.currentPulseShareId = 1;
    // Reset News IDs
    this.currentNewsSourceId = 1;
    this.currentNewsArticleId = 1;
    this.currentNewsUserPreferenceId = 1;
    this.currentUserPersonalInfoId = 1;
    
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
    
    // Clear all existing personal info
    this.userPersonalInfo.clear();
    
    // Clear all existing services
    this.services.clear();
    
    // Clear all existing pulses
    this.pulses.clear();
    
    // Clear all existing pulse comments
    this.pulseComments.clear();
    
    // Clear all existing poll votes
    this.pollVotes.clear();
    
    // Clear all existing hashtags
    this.hashtags.clear();
    
    // Clear all existing pulse hashtags
    this.pulseHashtags.clear();
    
    // Clear all user hashtag follows
    this.userHashtagFollows.clear();
    
    // Clear all pulse reactions
    this.pulseReactions.clear();
    
    // Clear all user reaction quotas
    this.userReactionQuotas.clear();
    
    // Clear all pulse shares
    this.pulseShares.clear();
    
    // Clear all news sources
    this.newsSources.clear();
    
    // Clear all news articles
    this.newsArticles.clear();
    
    // Clear all news user preferences
    this.newsUserPreferences.clear();
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
    // Create a demo project for project-type pulse
    const demoProject: Project = {
      id: 1,
      userId: userId,
      title: "AI-Powered Career Platform",
      description: "A professional networking platform with intelligent career guidance and portfolio showcase",
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 60 days ago as YYYY-MM-DD
      projectUrl: "https://example.com/demo",
      category: "Web Development",
      thumbnailUrl: "/images/demo/ui-design-1.svg",
      thumbnailFile: null,
      mediaUrls: [
        "/images/demo/ui-design-1.svg",
        "/images/demo/ui-design-2.svg",
        "/images/demo/ui-design-3.svg"
      ],
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)  // 2 days ago
    };
    
    // Add project to storage
    this.projects.set(demoProject.id, demoProject);
    this.currentProjectId = 2; // Set next project ID
    
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
      insightfulCount: 18,
      misinformedCount: 2,
      shareCount: 5,
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
      insightfulCount: 30,
      misinformedCount: 3,
      shareCount: 10,
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
      insightfulCount: 12,
      misinformedCount: 0,
      shareCount: 3,
      comments: 5,
      isPublished: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    };
    
    // Create a project pulse
    const projectPulse: Pulse = {
      id: 4,
      userId: userId,
      type: "project",
      title: "Just Launched: AI-Powered Career Platform",
      content: "Excited to share my latest project! I've been working on a professional networking platform that uses AI to provide personalized career guidance and a sleek portfolio showcase. Looking for beta testers and feedback.",
      mediaType: null,
      mediaUrls: [],
      mediaLocalStorageKeys: [],
      pollOptions: [],
      projectId: demoProject.id,
      likes: 31,
      insightfulCount: 25,
      misinformedCount: 1,
      shareCount: 7,
      comments: 12,
      isPublished: true,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    };
    
    // Add pulses to storage
    this.pulses.set(imagePulse.id, imagePulse);
    this.pulses.set(pollPulse.id, pollPulse);
    this.pulses.set(videoPulse.id, videoPulse);
    this.pulses.set(projectPulse.id, projectPulse);
    this.currentPulseId = 5; // Set next pulse ID
    
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
      insightfulCount: 0,
      misinformedCount: 0,
      shareCount: 0,
      comments: 0,
      isPublished: insertPulse.isPublished ?? true,
      createdAt,
      updatedAt: createdAt
    };
    
    this.pulses.set(id, pulse);
    
    // Extract and save hashtags from the content/description
    if (insertPulse.content) {
      await this.extractAndSaveHashtags(insertPulse.content, id);
    }
    
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
    
    // If the content was updated, extract and save new hashtags
    if (pulseData.content && pulseData.content !== pulse.content) {
      await this.extractAndSaveHashtags(pulseData.content, id);
    }
    
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
  
  // Pulse Reaction operations
  async getPulseReactionsByPulseId(pulseId: number): Promise<PulseReaction[]> {
    return Array.from(this.pulseReactions.values())
      .filter(reaction => reaction.pulseId === pulseId);
  }
  
  async getPulseReactionById(id: number): Promise<PulseReaction | undefined> {
    return this.pulseReactions.get(id);
  }
  
  async getPulseReactionByUserAndPulse(userId: number, pulseId: number, reactionType: "insightful" | "misinformed"): Promise<PulseReaction | undefined> {
    return Array.from(this.pulseReactions.values())
      .find(reaction => reaction.userId === userId && reaction.pulseId === pulseId && reaction.reactionType === reactionType);
  }
  
  // Pulse Reaction operations implementation
  async createPulseReaction(insertReaction: InsertPulseReaction): Promise<PulseReaction> {
    const id = this.currentPulseReactionId++;
    const createdAt = new Date();
    
    const reaction: PulseReaction = {
      ...insertReaction,
      id,
      createdAt
    };
    
    this.pulseReactions.set(id, reaction);
    
    // Update the pulse reaction count
    const pulse = this.pulses.get(insertReaction.pulseId);
    if (pulse) {
      if (insertReaction.reactionType === "insightful") {
        this.pulses.set(pulse.id, {
          ...pulse,
          insightfulCount: (pulse.insightfulCount || 0) + 1
        });
      } else if (insertReaction.reactionType === "misinformed") {
        this.pulses.set(pulse.id, {
          ...pulse,
          misinformedCount: (pulse.misinformedCount || 0) + 1
        });
      }
    }
    
    return reaction;
  }
  
  async deletePulseReaction(id: number): Promise<boolean> {
    const reaction = this.pulseReactions.get(id);
    if (!reaction) return false;
    
    // Decrease the reaction count on the pulse
    const pulse = this.pulses.get(reaction.pulseId);
    if (pulse) {
      if (reaction.reactionType === "insightful" && pulse.insightfulCount && pulse.insightfulCount > 0) {
        this.pulses.set(pulse.id, {
          ...pulse,
          insightfulCount: pulse.insightfulCount - 1
        });
      } else if (reaction.reactionType === "misinformed" && pulse.misinformedCount && pulse.misinformedCount > 0) {
        this.pulses.set(pulse.id, {
          ...pulse,
          misinformedCount: pulse.misinformedCount - 1
        });
      }
    }
    
    // Restore the user's reaction quota when they remove a reaction
    if (reaction.userId && reaction.reactionType) {
      await this.decrementReactionQuota(reaction.userId, reaction.reactionType);
    }
    
    return this.pulseReactions.delete(id);
  }
  
  // User Reaction Quota operations
  async getUserReactionQuota(userId: number): Promise<UserReactionQuota | undefined> {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day
    
    return Array.from(this.userReactionQuotas.values())
      .find(quota => {
        const quotaDate = new Date(quota.date);
        quotaDate.setHours(0, 0, 0, 0);
        return quota.userId === userId && quotaDate.getTime() === today.getTime();
      });
  }
  
  async getOrCreateUserReactionQuota(userId: number): Promise<UserReactionQuota> {
    const existingQuota = await this.getUserReactionQuota(userId);
    if (existingQuota) {
      return existingQuota;
    }
    
    // Create a new quota for today
    const id = this.currentUserReactionQuotaId++;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const quota: UserReactionQuota = {
      id,
      userId,
      date: today,
      insightfulQuotaUsed: 0,
      misinformedQuotaUsed: 0,
      insightfulQuotaMax: 10,
      misinformedQuotaMax: 10,
      updatedAt: new Date()
    };
    
    this.userReactionQuotas.set(id, quota);
    return quota;
  }
  
  async incrementReactionQuota(userId: number, reactionType: "insightful" | "misinformed"): Promise<UserReactionQuota> {
    const quota = await this.getOrCreateUserReactionQuota(userId);
    
    // Update the appropriate counter
    if (reactionType === "insightful") {
      const currentUsed = quota.insightfulQuotaUsed || 0;
      quota.insightfulQuotaUsed = currentUsed + 1;
    } else if (reactionType === "misinformed") {
      const currentUsed = quota.misinformedQuotaUsed || 0;
      quota.misinformedQuotaUsed = currentUsed + 1;
    }
    
    quota.updatedAt = new Date();
    this.userReactionQuotas.set(quota.id, quota);
    
    return quota;
  }
  
  async decrementReactionQuota(userId: number, reactionType: "insightful" | "misinformed"): Promise<UserReactionQuota> {
    const quota = await this.getOrCreateUserReactionQuota(userId);
    
    // Update the appropriate counter (decrement only if greater than 0)
    if (reactionType === "insightful") {
      const currentUsed = quota.insightfulQuotaUsed || 0;
      if (currentUsed > 0) {
        quota.insightfulQuotaUsed = currentUsed - 1;
      }
    } else if (reactionType === "misinformed") {
      const currentUsed = quota.misinformedQuotaUsed || 0;
      if (currentUsed > 0) {
        quota.misinformedQuotaUsed = currentUsed - 1;
      }
    }
    
    quota.updatedAt = new Date();
    this.userReactionQuotas.set(quota.id, quota);
    
    return quota;
  }
  
  async checkReactionQuota(userId: number, reactionType: "insightful" | "misinformed"): Promise<{ 
    hasQuotaRemaining: boolean; 
    remaining: number; 
    used: number;
    max: number;
  }> {
    const quota = await this.getOrCreateUserReactionQuota(userId);
    
    if (reactionType === "insightful") {
      const used = quota.insightfulQuotaUsed || 0;
      const max = quota.insightfulQuotaMax || 10;
      const remaining = max - used;
      return {
        hasQuotaRemaining: remaining > 0,
        remaining,
        used,
        max
      };
    } else {
      const used = quota.misinformedQuotaUsed || 0;
      const max = quota.misinformedQuotaMax || 10;
      const remaining = max - used;
      return {
        hasQuotaRemaining: remaining > 0,
        remaining,
        used,
        max
      };
    }
  }
  
  // Pulse Share operations
  async getPulseSharesByRecipientId(recipientId: number): Promise<PulseShare[]> {
    return Array.from(this.pulseShares.values())
      .filter(share => share.recipientId === recipientId)
      .sort((a, b) => {
        const timeA = a.createdAt ? a.createdAt.getTime() : 0;
        const timeB = b.createdAt ? b.createdAt.getTime() : 0;
        return timeB - timeA; // Sort newest first
      });
  }
  
  async createPulseShare(insertShare: InsertPulseShare): Promise<PulseShare> {
    const id = this.currentPulseShareId++;
    const createdAt = new Date();
    
    // Ensure message is properly handled (null rather than undefined)
    const message = insertShare.message === undefined ? null : insertShare.message;
    
    const share: PulseShare = {
      ...insertShare,
      id,
      isRead: false,
      createdAt,
      message
    };
    
    this.pulseShares.set(id, share);
    
    // Update the share count on the pulse
    const pulse = this.pulses.get(insertShare.pulseId);
    if (pulse) {
      this.pulses.set(pulse.id, {
        ...pulse,
        shareCount: (pulse.shareCount || 0) + 1
      });
    }
    
    return share;
  }
  
  async markPulseShareRead(id: number): Promise<PulseShare | undefined> {
    const share = this.pulseShares.get(id);
    if (!share) return undefined;
    
    const updatedShare = { ...share, isRead: true };
    this.pulseShares.set(id, updatedShare);
    return updatedShare;
  }
  
  async deletePulseShare(id: number): Promise<boolean> {
    const share = this.pulseShares.get(id);
    if (!share) return false;
    
    // Decrease the share count on the pulse
    const pulse = this.pulses.get(share.pulseId);
    if (pulse && pulse.shareCount && pulse.shareCount > 0) {
      this.pulses.set(pulse.id, {
        ...pulse,
        shareCount: pulse.shareCount - 1
      });
    }
    
    return this.pulseShares.delete(id);
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
   
  // Hashtag operations
  async getHashtags(): Promise<Hashtag[]> {
    return Array.from(this.hashtags.values());
  }
  
  async getHashtagById(id: number): Promise<Hashtag | undefined> {
    return this.hashtags.get(id);
  }
  
  async getHashtagByTag(tag: string): Promise<Hashtag | undefined> {
    // Normalize the tag by removing the '#' if present and converting to lowercase
    const normalizedTag = tag.startsWith('#') ? tag.substring(1).toLowerCase() : tag.toLowerCase();
    return Array.from(this.hashtags.values())
      .find(hashtag => hashtag.tag.toLowerCase() === normalizedTag);
  }
  
  async createHashtag(insertHashtag: InsertHashtag): Promise<Hashtag> {
    const id = this.currentHashtagId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const hashtag: Hashtag = {
      ...insertHashtag,
      id,
      createdAt,
      updatedAt,
      count: 1
    };
    
    this.hashtags.set(id, hashtag);
    return hashtag;
  }
  
  async updateHashtag(id: number, hashtagData: Partial<Hashtag>): Promise<Hashtag | undefined> {
    const hashtag = this.hashtags.get(id);
    if (!hashtag) return undefined;
    
    const updatedHashtag = { ...hashtag, ...hashtagData };
    this.hashtags.set(id, updatedHashtag);
    return updatedHashtag;
  }
  
  async incrementHashtagCount(id: number): Promise<Hashtag | undefined> {
    const hashtag = this.hashtags.get(id);
    if (!hashtag) return undefined;
    
    const currentCount = hashtag.count || 0;
    const updatedHashtag = { 
      ...hashtag, 
      count: currentCount + 1,
      updatedAt: new Date()
    };
    
    this.hashtags.set(id, updatedHashtag);
    return updatedHashtag;
  }
  
  // Pulse Hashtag operations
  async createPulseHashtag(insertPulseHashtag: InsertPulseHashtag): Promise<PulseHashtag> {
    const id = this.currentPulseHashtagId++;
    const createdAt = new Date();
    
    const pulseHashtag: PulseHashtag = {
      ...insertPulseHashtag,
      id,
      createdAt
    };
    
    this.pulseHashtags.set(id, pulseHashtag);
    return pulseHashtag;
  }
  
  async getPulseHashtagsByPulseId(pulseId: number): Promise<PulseHashtag[]> {
    return Array.from(this.pulseHashtags.values())
      .filter(pulseHashtag => pulseHashtag.pulseId === pulseId);
  }
  
  async getHashtagsByPulseId(pulseId: number): Promise<Hashtag[]> {
    const pulseHashtags = await this.getPulseHashtagsByPulseId(pulseId);
    const hashtags: Hashtag[] = [];
    
    for (const pulseHashtag of pulseHashtags) {
      const hashtag = await this.getHashtagById(pulseHashtag.hashtagId);
      if (hashtag) {
        hashtags.push(hashtag);
      }
    }
    
    return hashtags;
  }
  
  async extractAndSaveHashtags(text: string, pulseId: number): Promise<Hashtag[]> {
    if (!text) return [];
    
    // Regular expression to match hashtags: #word
    // Words can include letters, numbers, underscores
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    
    if (!matches) return [];
    
    const savedHashtags: Hashtag[] = [];
    
    // Process each hashtag
    for (const match of matches) {
      // Remove the '#' character and normalize to lowercase
      const tagText = match.substring(1).toLowerCase();
      
      // Skip empty tags
      if (!tagText) continue;
      
      // Check if this hashtag already exists
      let hashtag = await this.getHashtagByTag(tagText);
      
      if (hashtag) {
        // If it exists, increment its count
        hashtag = await this.incrementHashtagCount(hashtag.id);
      } else {
        // If it doesn't exist, create a new one
        hashtag = await this.createHashtag({
          tag: tagText
        });
      }
      
      if (hashtag) {
        // Create the association between the pulse and the hashtag
        await this.createPulseHashtag({
          pulseId,
          hashtagId: hashtag.id
        });
        
        savedHashtags.push(hashtag);
      }
    }
    
    return savedHashtags;
  }
  
  async searchHashtagsByPrefix(prefix: string): Promise<Hashtag[]> {
    // Remove '#' if present and convert to lowercase
    const normalizedPrefix = prefix.startsWith('#') ? prefix.substring(1).toLowerCase() : prefix.toLowerCase();
    
    if (!normalizedPrefix) return [];
    
    return Array.from(this.hashtags.values())
      .filter(hashtag => hashtag.tag.toLowerCase().startsWith(normalizedPrefix))
      .sort((a, b) => {
        const countA = a.count || 0;
        const countB = b.count || 0;
        return countB - countA; // Sort by count (popularity) in descending order
      })
  }
  async searchPulses(query: string): Promise<Pulse[]> {
    console.log(`[storage] searchPulses: Searching pulses with query: "${query}"`);
    const normalizedQuery = query.toLowerCase().trim();
    
    if (!normalizedQuery) {
      return [];
    }
    
    // First collect all pulses that match by title or content
    const directMatches = Array.from(this.pulses.values()).filter(pulse => {
      // Check title for matches
      const titleMatch = pulse.title?.toLowerCase().includes(normalizedQuery);
      
      // Check content for matches (different field name than "description")
      const contentMatch = pulse.content?.toLowerCase().includes(normalizedQuery);
      
      return titleMatch || contentMatch;
    });
    
    // Now find pulses by hashtag
    let hashtagMatches: Pulse[] = [];
    
    // Check if the query is actually searching for a hashtag
    if (normalizedQuery.startsWith('#')) {
      // Get the tag without the # symbol
      const tagText = normalizedQuery.substring(1);
      
      // Find the hashtag in our hashtags collection
      const hashtag = await this.getHashtagByTag(tagText);
      
      if (hashtag) {
        // Get all pulse-hashtag relationships for this hashtag
        const pulseHashtags = Array.from(this.pulseHashtags.values())
          .filter(ph => ph.hashtagId === hashtag.id);
          
        // Get the corresponding pulses
        for (const ph of pulseHashtags) {
          const pulse = this.pulses.get(ph.pulseId);
          if (pulse) {
            hashtagMatches.push(pulse);
          }
        }
      }
    } else {
      // If not explicitly searching for a hashtag, still try to find hashtags containing the query
      const matchingHashtags = await this.searchHashtagsByPrefix(normalizedQuery);
      
      for (const hashtag of matchingHashtags) {
        // Get all pulse-hashtag relationships for this hashtag
        const pulseHashtags = Array.from(this.pulseHashtags.values())
          .filter(ph => ph.hashtagId === hashtag.id);
          
        // Get the corresponding pulses
        for (const ph of pulseHashtags) {
          const pulse = this.pulses.get(ph.pulseId);
          if (pulse) {
            hashtagMatches.push(pulse);
          }
        }
      }
    }
    
    // Combine the results, removing duplicates
    const allMatches = [...directMatches];
    
    // Add hashtag matches if they're not already in the results
    for (const pulse of hashtagMatches) {
      if (!allMatches.some(p => p.id === pulse.id)) {
        allMatches.push(pulse);
      }
    }
    
    // Sort by recency
    allMatches.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    
    // Get user info for each pulse
    const resultsWithUsers = await Promise.all(allMatches.map(async pulse => {
      const user = await this.getUser(pulse.userId);
      return { ...pulse, user };
    }));
    
    console.log(`[storage] searchPulses: Found ${allMatches.length} matching pulses`);
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
    
    // Search for hashtags with the searchHashtagsByPrefix method
    const hashtags = await this.searchHashtagsByPrefix(normalizedQuery);
    
    // Transform to the expected format
    const results = hashtags.map(hashtag => ({
      id: hashtag.id,
      name: hashtag.tag,
      count: hashtag.count || 0  // Default to 0 if null
    }));
    
    console.log(`[storage] searchHashtags: Found ${results.length} matching hashtags`);
    return results;
  }
  
  // User Hashtag Follow operations
  async followHashtag(userId: number, hashtagId: number): Promise<UserHashtagFollow> {
    console.log(`[storage] followHashtag: User ${userId} following hashtag ${hashtagId}`);
    
    // Check if the user is already following this hashtag
    const isFollowing = await this.isHashtagFollowedByUser(userId, hashtagId);
    if (isFollowing) {
      console.log(`[storage] followHashtag: User ${userId} is already following hashtag ${hashtagId}`);
      
      // Find the existing follow relationship
      const existingFollow = Array.from(this.userHashtagFollows.values())
        .find(follow => follow.userId === userId && follow.hashtagId === hashtagId);
      
      if (existingFollow) {
        return existingFollow;
      }
    }
    
    // Create a new follow relationship
    const id = this.currentUserHashtagFollowId++;
    const createdAt = new Date();
    
    const follow: UserHashtagFollow = {
      id,
      userId,
      hashtagId,
      createdAt
    };
    
    this.userHashtagFollows.set(id, follow);
    console.log(`[storage] followHashtag: Created new follow relationship with ID ${id}`);
    return follow;
  }
  
  async unfollowHashtag(userId: number, hashtagId: number): Promise<boolean> {
    console.log(`[storage] unfollowHashtag: User ${userId} unfollowing hashtag ${hashtagId}`);
    
    // Find the follow relationship
    const follow = Array.from(this.userHashtagFollows.values())
      .find(follow => follow.userId === userId && follow.hashtagId === hashtagId);
    
    if (!follow) {
      console.log(`[storage] unfollowHashtag: No follow relationship found for user ${userId} and hashtag ${hashtagId}`);
      return false;
    }
    
    // Delete the follow relationship
    const result = this.userHashtagFollows.delete(follow.id);
    console.log(`[storage] unfollowHashtag: Deleted follow relationship with ID ${follow.id}: ${result}`);
    return result;
  }
  
  async getFollowedHashtagsByUserId(userId: number): Promise<Hashtag[]> {
    console.log(`[storage] getFollowedHashtagsByUserId: Getting followed hashtags for user ${userId}`);
    
    // Get all hashtag IDs that the user is following
    const hashtagIds = Array.from(this.userHashtagFollows.values())
      .filter(follow => follow.userId === userId)
      .map(follow => follow.hashtagId);
    
    // Get the hashtags with those IDs
    const hashtags = hashtagIds.map(id => this.hashtags.get(id))
      .filter((hashtag): hashtag is Hashtag => hashtag !== undefined);
    
    console.log(`[storage] getFollowedHashtagsByUserId: Found ${hashtags.length} followed hashtags for user ${userId}`);
    return hashtags;
  }
  
  async isHashtagFollowedByUser(userId: number, hashtagId: number): Promise<boolean> {
    const isFollowed = Array.from(this.userHashtagFollows.values())
      .some(follow => follow.userId === userId && follow.hashtagId === hashtagId);
    
    console.log(`[storage] isHashtagFollowedByUser: Hashtag ${hashtagId} is ${isFollowed ? '' : 'not '}followed by user ${userId}`);
    return isFollowed;
  }
  
  async getPulsesByFollowedHashtags(userId: number): Promise<Pulse[]> {
    console.log(`[storage] getPulsesByFollowedHashtags: Getting pulses for hashtags followed by user ${userId}`);
    
    // Get all hashtags followed by the user
    const followedHashtags = await this.getFollowedHashtagsByUserId(userId);
    
    if (followedHashtags.length === 0) {
      console.log(`[storage] getPulsesByFollowedHashtags: User ${userId} is not following any hashtags`);
      return [];
    }
    
    // Get all pulse-hashtag relationships for these hashtags
    const pulseIds = new Set<number>();
    
    for (const hashtag of followedHashtags) {
      const pulseHashtags = Array.from(this.pulseHashtags.values())
        .filter(ph => ph.hashtagId === hashtag.id)
        .map(ph => ph.pulseId);
      
      pulseHashtags.forEach(id => pulseIds.add(id));
    }
    
    // Get all pulses with these IDs
    const pulses = Array.from(pulseIds)
      .map(id => this.pulses.get(id))
      .filter((pulse): pulse is Pulse => pulse !== undefined)
      .sort((a, b) => {
        // Sort by createdAt in descending order (newest first)
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
    
    console.log(`[storage] getPulsesByFollowedHashtags: Found ${pulses.length} pulses for hashtags followed by user ${userId}`);
    return pulses;
  }
  
  // News Source operations
  async getNewsSources(): Promise<NewsSource[]> {
    return Array.from(this.newsSources.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async getNewsSourceById(id: number): Promise<NewsSource | undefined> {
    return this.newsSources.get(id);
  }

  async getNewsSourcesByCategory(category: string): Promise<NewsSource[]> {
    return Array.from(this.newsSources.values())
      .filter(source => source.category === category)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async createNewsSource(source: InsertNewsSource): Promise<NewsSource> {
    const id = this.currentNewsSourceId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const newsSource: NewsSource = {
      ...source,
      id,
      createdAt,
      updatedAt,
      apiEndpoint: source.apiEndpoint ?? null,
      apiKey: source.apiKey ?? null,
      isActive: source.isActive ?? true
    };
    
    this.newsSources.set(id, newsSource);
    return newsSource;
  }

  async updateNewsSource(id: number, sourceData: Partial<NewsSource>): Promise<NewsSource | undefined> {
    const source = this.newsSources.get(id);
    if (!source) return undefined;
    
    const updatedSource = { 
      ...source, 
      ...sourceData,
      updatedAt: new Date() 
    };
    
    this.newsSources.set(id, updatedSource);
    return updatedSource;
  }

  async deleteNewsSource(id: number): Promise<boolean> {
    return this.newsSources.delete(id);
  }

  // News Article operations
  async getNewsArticles(): Promise<NewsArticle[]> {
    return Array.from(this.newsArticles.values())
      .sort((a, b) => {
        const timeA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const timeB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return timeB - timeA; // Sort by publishedAt in descending order (newest first)
      });
  }

  async getNewsArticleById(id: number): Promise<NewsArticle | undefined> {
    return this.newsArticles.get(id);
  }

  async getNewsArticlesBySourceId(sourceId: number): Promise<NewsArticle[]> {
    return Array.from(this.newsArticles.values())
      .filter(article => article.sourceId === sourceId)
      .sort((a, b) => {
        const timeA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const timeB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return timeB - timeA; // Sort by publishedAt in descending order (newest first)
      });
  }

  async getNewsArticlesByCategory(category: string): Promise<NewsArticle[]> {
    return Array.from(this.newsArticles.values())
      .filter(article => article.category === category)
      .sort((a, b) => {
        const timeA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const timeB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return timeB - timeA; // Sort by publishedAt in descending order (newest first)
      });
  }

  async getUnprocessedNewsArticles(): Promise<NewsArticle[]> {
    return Array.from(this.newsArticles.values())
      .filter(article => !article.processed)
      .sort((a, b) => {
        const timeA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const timeB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return timeB - timeA; // Sort by publishedAt in descending order (newest first)
      });
  }

  async getNewsArticlesByIndustry(industry: string): Promise<NewsArticle[]> {
    return Array.from(this.newsArticles.values())
      .filter(article => {
        if (!article.industries) return false;
        const industries = JSON.parse(article.industries as string);
        return Array.isArray(industries) && industries.includes(industry);
      })
      .sort((a, b) => {
        const timeA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const timeB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return timeB - timeA; // Sort by publishedAt in descending order (newest first)
      });
  }

  async createNewsArticle(article: InsertNewsArticle): Promise<NewsArticle> {
    const id = this.currentNewsArticleId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const newsArticle: NewsArticle = {
      ...article,
      id,
      createdAt,
      updatedAt,
      sourceId: article.sourceId ?? null,
      description: article.description ?? null,
      content: article.content ?? null,
      url: article.url ?? null,
      imageUrl: article.imageUrl ?? null,
      author: article.author ?? null,
      publishedAt: article.publishedAt ?? new Date(),
      category: article.category ?? null,
      industries: article.industries ?? '[]',
      processed: article.processed ?? false
    };
    
    this.newsArticles.set(id, newsArticle);
    return newsArticle;
  }

  async updateNewsArticle(id: number, articleData: Partial<NewsArticle>): Promise<NewsArticle | undefined> {
    const article = this.newsArticles.get(id);
    if (!article) return undefined;
    
    const updatedArticle = { 
      ...article, 
      ...articleData,
      updatedAt: new Date() 
    };
    
    this.newsArticles.set(id, updatedArticle);
    return updatedArticle;
  }

  async deleteNewsArticle(id: number): Promise<boolean> {
    return this.newsArticles.delete(id);
  }

  // News User Preference operations
  async getNewsUserPreferenceByUserId(userId: number): Promise<NewsUserPreference | undefined> {
    return Array.from(this.newsUserPreferences.values())
      .find(preference => preference.userId === userId);
  }

  async createNewsUserPreference(preference: InsertNewsUserPreference): Promise<NewsUserPreference> {
    const id = this.currentNewsUserPreferenceId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const newsUserPreference: NewsUserPreference = {
      ...preference,
      id,
      createdAt,
      updatedAt,
      preferredIndustries: preference.preferredIndustries ?? '[]',
      preferredSources: preference.preferredSources ?? '[]',
      excludedSources: preference.excludedSources ?? '[]',
      deliveryTime: preference.deliveryTime ?? '17:00',
      enabled: preference.enabled ?? true
    };
    
    this.newsUserPreferences.set(id, newsUserPreference);
    return newsUserPreference;
  }

  async updateNewsUserPreference(id: number, preferenceData: Partial<NewsUserPreference>): Promise<NewsUserPreference | undefined> {
    const preference = this.newsUserPreferences.get(id);
    if (!preference) return undefined;
    
    const updatedPreference = { 
      ...preference, 
      ...preferenceData,
      updatedAt: new Date() 
    };
    
    this.newsUserPreferences.set(id, updatedPreference);
    return updatedPreference;
  }

  async deleteNewsUserPreference(id: number): Promise<boolean> {
    return this.newsUserPreferences.delete(id);
  }

  // News Pulse operations
  async createNewsPulse(article: NewsArticle, userId: number): Promise<Pulse> {
    // First, generate content based on the article
    const newsContent = await this.generateNewsContent(article);
    
    // Create a pulse with the type "news-pulse"
    const pulseData: InsertPulse = {
      userId,
      type: "news-pulse",
      title: newsContent.title,
      content: newsContent.content,
      isPublished: true
    };
    
    // Create the pulse
    const pulse = await this.createPulse(pulseData);
    
    // Extract and save hashtags from the content
    if (newsContent.hashtags && newsContent.hashtags.length > 0) {
      // Convert hashtags array to string with # prefix
      const hashtagsText = newsContent.hashtags.map(tag => `#${tag}`).join(' ');
      await this.extractAndSaveHashtags(hashtagsText, pulse.id);
    }
    
    // Mark the article as processed
    await this.updateNewsArticle(article.id, { processed: true });
    
    return pulse;
  }

  async getLatestNewsPulses(userId: number, limit: number = 10): Promise<Pulse[]> {
    return Array.from(this.pulses.values())
      .filter(pulse => pulse.type === "news-pulse")
      .sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA; // Sort by createdAt in descending order (newest first)
      })
      .slice(0, limit);
  }

  async generateNewsContent(article: NewsArticle): Promise<{ title: string, content: string, hashtags: string[] }> {
    // In a real implementation, this would use an AI service to generate the content
    // For now, we'll create a simple implementation that formats the article data
    
    // Create a title with industry focus
    let title = article.title || 'Industry News Update';
    
    // Create content that summarizes the article
    let content = '';
    if (article.description) {
      content += article.description;
    } else if (article.content) {
      // Use just the first paragraph or first 200 characters
      const contentText = article.content;
      content += contentText.split('\n')[0] || contentText.substring(0, 200);
    } else {
      content = 'Check out this industry news article that might be relevant to your professional interests.';
    }
    
    // Add source attribution if available
    if (article.url) {
      content += `\n\nRead more: ${article.url}`;
    }
    
    // Generate relevant hashtags
    let hashtags: string[] = [];
    
    // Add category as hashtag if available
    if (article.category) {
      hashtags.push(article.category.replace(/[^a-zA-Z0-9]/g, ''));
    }
    
    // Add some basic industry hashtags
    if (article.industries) {
      try {
        const industriesArray = JSON.parse(article.industries as string);
        if (Array.isArray(industriesArray)) {
          industriesArray.forEach(industry => {
            // Clean up industry name for hashtag (remove spaces and special chars)
            const hashtagIndustry = industry.replace(/[^a-zA-Z0-9]/g, '');
            if (hashtagIndustry) {
              hashtags.push(hashtagIndustry);
            }
          });
        }
      } catch (error) {
        console.error('Error parsing industries JSON:', error);
      }
    }
    
    // Add some generic hashtags
    hashtags.push('industrynews');
    hashtags.push('careerdevelopment');
    
    // Remove duplicates and limit to 5 hashtags
    const uniqueHashtags: string[] = [];
    hashtags.forEach(tag => {
      if (!uniqueHashtags.includes(tag)) {
        uniqueHashtags.push(tag);
      }
    });
    
    return { title, content, hashtags: uniqueHashtags.slice(0, 5) };
  }
}

import { addUserPersonalInfoMethods } from './user-personal-info';

// Add UserPersonalInfo methods to MemStorage prototype
addUserPersonalInfoMethods(MemStorage.prototype);

export const storage = new MemStorage();
