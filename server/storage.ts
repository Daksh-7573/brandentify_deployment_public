import { 
  users, User, InsertUser, 
  resumes, Resume, InsertResume,
  workExperiences, WorkExperience, InsertWorkExperience,
  educations, Education, InsertEducation,
  skills, Skill, InsertSkill,
  chatMessages, ChatMessage, InsertChatMessage
} from "@shared/schema";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Resume operations
  getResumeByUserId(userId: number): Promise<Resume | undefined>;
  createResume(resume: InsertResume): Promise<Resume>;
  updateResume(id: number, resume: Partial<Resume>): Promise<Resume | undefined>;
  
  // Work Experience operations
  getWorkExperiencesByUserId(userId: number): Promise<WorkExperience[]>;
  createWorkExperience(experience: InsertWorkExperience): Promise<WorkExperience>;
  updateWorkExperience(id: number, experience: Partial<WorkExperience>): Promise<WorkExperience | undefined>;
  deleteWorkExperience(id: number): Promise<boolean>;
  
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
  
  // Chat Message operations
  getChatMessagesByUserId(userId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
}

// In-memory implementation of the storage
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private resumes: Map<number, Resume>;
  private workExperiences: Map<number, WorkExperience>;
  private educations: Map<number, Education>;
  private skills: Map<number, Skill>;
  private chatMessages: Map<number, ChatMessage>;
  
  private currentUserId: number;
  private currentResumeId: number;
  private currentWorkExperienceId: number;
  private currentEducationId: number;
  private currentSkillId: number;
  private currentChatMessageId: number;

  constructor() {
    this.users = new Map();
    this.resumes = new Map();
    this.workExperiences = new Map();
    this.educations = new Map();
    this.skills = new Map();
    this.chatMessages = new Map();
    
    this.currentUserId = 1;
    this.currentResumeId = 1;
    this.currentWorkExperienceId = 1;
    this.currentEducationId = 1;
    this.currentSkillId = 1;
    this.currentChatMessageId = 1;
    
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
      name: "Senior Professional",
      photoURL: null,
      title: "Senior Software Engineer",
      location: "San Francisco, CA, USA",
      profileCompleted: 65,
      createdAt: new Date()
    };
    this.users.set(demoUser.id, demoUser);
    this.currentUserId++;
    
    // Clear any existing work experiences for the demo user
    this.workExperiences.clear();
    
    // Add baseline education entries (empty by default)
    const education: Education = {
      id: 1,
      userId: 1,
      degree: "Bachelor of Science",
      institution: "University",
      location: "San Francisco, CA",
      startDate: "2014",
      endDate: "2018"
    };
    this.educations.set(education.id, education);
    this.currentEducationId++;
    
    // Add baseline skills
    const skill1: Skill = {
      id: 1,
      userId: 1,
      name: "JavaScript",
      level: "Intermediate",
      proficiency: 75
    };
    const skill2: Skill = {
      id: 2,
      userId: 1,
      name: "Communication",
      level: "Advanced",
      proficiency: 90
    };
    this.skills.set(skill1.id, skill1);
    this.skills.set(skill2.id, skill2);
    this.currentSkillId += 2;
  }
  
  /**
   * Clears all work experience data for a user
   * Used for debugging and resetting demo data
   */
  async clearUserWorkExperiences(userId: number): Promise<number> {
    let deleted = 0;
    for (const [id, exp] of this.workExperiences.entries()) {
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
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
    const resume: Resume = { ...insertResume, id, uploadedAt };
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
    const experience: WorkExperience = { ...insertExperience, id };
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
    const education: Education = { ...insertEducation, id };
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
    const skill: Skill = { ...insertSkill, id };
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
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatMessageId++;
    const timestamp = new Date();
    const message: ChatMessage = { ...insertMessage, id, timestamp };
    this.chatMessages.set(id, message);
    return message;
  }
}

export const storage = new MemStorage();
