import { Router } from "express";
import { IStorage } from "./storage";
import { OpenAI } from "openai";
import { z } from "zod";

export function registerProfileCoachRoutes(router: Router, storage: IStorage) {
  
  // Configure OpenAI client
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const openai = new OpenAI({
    apiKey: openaiApiKey,
  });
  
  // Analyze user profile and provide recommendations
  router.get("/profile-coach/analyze", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      // Get user profile data
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Get user experiences, education, skills, and projects
      const experiences = await storage.getWorkExperienceByUserId(userId);
      const educations = await storage.getEducationByUserId(userId);
      const skills = await storage.getSkillsByUserId(userId);
      const projects = await storage.getProjectsByUserId(userId);
      
      // Calculate profile completeness score
      const completenessScore = calculateProfileCompletenessScore(
        user,
        experiences || [],
        educations || [],
        skills || [],
        projects || []
      );
      
      // Generate improvement priorities based on profile analysis
      const improvementPriorities = generateImprovementPriorities(
        user,
        experiences || [],
        educations || [],
        skills || [],
        projects || []
      );
      
      // Generate recommended keywords for the user's profile
      const recommendedKeywords = generateRecommendedKeywords(
        user,
        experiences || [],
        educations || [],
        skills || []
      );
      
      // Create feedback for each section
      const basicFeedback = generateBasicFeedback(user);
      const experienceFeedback = generateExperienceFeedback(experiences || []);
      const educationFeedback = generateEducationFeedback(educations || []);
      const skillsFeedback = generateSkillsFeedback(skills || []);
      const projectsFeedback = generateProjectsFeedback(projects || []);
      
      // Generate overall analysis
      let overallAnalysis = generateOverallAnalysis(
        user,
        completenessScore,
        experiences || [],
        educations || [],
        skills || [],
        projects || []
      );
      
      // If OpenAI API key is available, enhance the analysis with AI-powered recommendations
      if (openaiApiKey) {
        try {
          const enhancedAnalysis = await enhanceAnalysisWithAI(
            user,
            completenessScore,
            experiences || [],
            educations || [],
            skills || [],
            projects || []
          );
          
          if (enhancedAnalysis) {
            overallAnalysis = enhancedAnalysis;
          }
        } catch (aiError) {
          console.error("Error enhancing analysis with AI:", aiError);
          // Continue with the basic analysis if AI enhancement fails
        }
      }
      
      return res.status(200).json({
        completenessScore,
        improvementPriorities,
        recommendedKeywords,
        overallAnalysis,
        basicInfo: user,
        experiences,
        educations,
        skills,
        projects,
        basicFeedback,
        experienceFeedback,
        educationFeedback,
        skillsFeedback,
        projectsFeedback,
      });
      
    } catch (error) {
      console.error("Error analyzing profile:", error);
      return res.status(500).json({ error: "Failed to analyze profile" });
    }
  });
  
  // Refresh profile analysis (force recalculation)
  router.post("/profile-coach/refresh-analysis", async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      // This endpoint simply triggers a refresh, but we're using the same logic
      // as the analyze endpoint. In a real app, we might have more complex
      // refresh logic or caching.
      return res.status(200).json({ success: true, message: "Analysis refreshed" });
      
    } catch (error) {
      console.error("Error refreshing analysis:", error);
      return res.status(500).json({ error: "Failed to refresh analysis" });
    }
  });
  
  // Get AI-powered suggestions for a specific section
  router.post("/profile-coach/suggestions", async (req, res) => {
    try {
      const { userId, section, currentContent } = req.body;
      
      if (!userId || !section) {
        return res.status(400).json({ error: "User ID and section are required" });
      }
      
      // Get user to provide context for the suggestions
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // If OpenAI API key is not available, return basic suggestions
      if (!openaiApiKey) {
        return res.status(200).json({
          suggestions: getBasicSuggestions(section),
          keywords: getBasicKeywords(section, user.industry || ""),
          improvedVersion: null,
        });
      }
      
      // Get section-specific suggestions using AI
      try {
        const aiSuggestions = await generateAISuggestions(section, currentContent, user);
        return res.status(200).json(aiSuggestions);
      } catch (aiError) {
        console.error("Error generating AI suggestions:", aiError);
        // Fall back to basic suggestions if AI fails
        return res.status(200).json({
          suggestions: getBasicSuggestions(section),
          keywords: getBasicKeywords(section, user.industry || ""),
          improvedVersion: null,
        });
      }
      
    } catch (error) {
      console.error("Error getting suggestions:", error);
      return res.status(500).json({ error: "Failed to get suggestions" });
    }
  });
  
  // Save improvements to a profile section
  router.post("/profile-coach/save-improvements", async (req, res) => {
    try {
      const { userId, section, updatedContent } = req.body;
      
      if (!userId || !section || !updatedContent) {
        return res.status(400).json({ error: "User ID, section, and updated content are required" });
      }
      
      // Update the appropriate section
      switch (section) {
        case "basic":
          // Update user basic information
          const basicSchema = z.object({
            id: z.number(),
            name: z.string().min(2, "Name must be at least 2 characters"),
            title: z.string().min(2, "Job title must be at least 2 characters"),
            industry: z.string().min(2, "Industry must be at least 2 characters"),
            location: z.string().min(2, "Location must be at least 2 characters"),
            email: z.string().email("Please enter a valid email address"),
            phoneNumber: z.string().nullable().optional(),
            lookingFor: z.string().nullable().optional(),
          });
          
          const validatedBasic = basicSchema.parse(updatedContent);
          await storage.updateUser(userId, {
            name: validatedBasic.name,
            title: validatedBasic.title,
            industry: validatedBasic.industry,
            location: validatedBasic.location,
            phoneNumber: validatedBasic.phoneNumber,
            lookingFor: validatedBasic.lookingFor,
          });
          break;
          
        case "experience":
          // Update or create work experience
          const experienceSchema = z.object({
            id: z.number().optional(),
            userId: z.number(),
            title: z.string().min(2, "Job title is required"),
            company: z.string().min(2, "Company name is required"),
            location: z.string().nullable().optional(),
            startDate: z.string().min(2, "Start date is required"),
            endDate: z.string().nullable().optional(),
            description: z.string().min(10, "Please provide at least a brief description"),
            current: z.boolean().optional(),
          });
          
          const validatedExperience = experienceSchema.parse(updatedContent);
          if (validatedExperience.id) {
            // Update existing experience
            await storage.updateWorkExperience(validatedExperience.id, {
              title: validatedExperience.title,
              company: validatedExperience.company,
              location: validatedExperience.location,
              startDate: validatedExperience.startDate,
              endDate: validatedExperience.endDate,
              description: validatedExperience.description,
              current: validatedExperience.current,
            });
          } else {
            // Create new experience
            await storage.createWorkExperience({
              userId,
              title: validatedExperience.title,
              company: validatedExperience.company,
              location: validatedExperience.location,
              startDate: validatedExperience.startDate,
              endDate: validatedExperience.endDate,
              description: validatedExperience.description,
              current: validatedExperience.current,
            });
          }
          break;
          
        case "education":
          // Update or create education
          const educationSchema = z.object({
            id: z.number().optional(),
            userId: z.number(),
            institution: z.string().min(2, "Institution name is required"),
            degree: z.string().min(2, "Degree is required"),
            fieldOfStudy: z.string().min(2, "Field of study is required"),
            startDate: z.string().min(2, "Start date is required"),
            endDate: z.string().nullable().optional(),
            description: z.string().nullable().optional(),
          });
          
          const validatedEducation = educationSchema.parse(updatedContent);
          if (validatedEducation.id) {
            // Update existing education
            await storage.updateEducation(validatedEducation.id, {
              institution: validatedEducation.institution,
              degree: validatedEducation.degree,
              fieldOfStudy: validatedEducation.fieldOfStudy,
              startDate: validatedEducation.startDate,
              endDate: validatedEducation.endDate,
              description: validatedEducation.description,
            });
          } else {
            // Create new education
            await storage.createEducation({
              userId,
              institution: validatedEducation.institution,
              degree: validatedEducation.degree,
              fieldOfStudy: validatedEducation.fieldOfStudy,
              startDate: validatedEducation.startDate,
              endDate: validatedEducation.endDate,
              description: validatedEducation.description,
            });
          }
          break;
          
        case "skills":
          // Update or create skill
          const skillSchema = z.object({
            id: z.number().optional(),
            userId: z.number(),
            name: z.string().min(2, "Skill name is required"),
            proficiency: z.string().min(2, "Proficiency level is required"),
            yearsOfExperience: z.number().optional(),
            description: z.string().nullable().optional(),
          });
          
          const validatedSkill = skillSchema.parse(updatedContent);
          if (validatedSkill.id) {
            // Update existing skill
            await storage.updateSkill(validatedSkill.id, {
              name: validatedSkill.name,
              proficiency: validatedSkill.proficiency,
              yearsOfExperience: validatedSkill.yearsOfExperience,
              description: validatedSkill.description,
            });
          } else {
            // Create new skill
            await storage.createSkill({
              userId,
              name: validatedSkill.name,
              proficiency: validatedSkill.proficiency,
              yearsOfExperience: validatedSkill.yearsOfExperience,
              description: validatedSkill.description,
            });
          }
          break;
          
        case "projects":
          // Update or create project
          const projectSchema = z.object({
            id: z.number().optional(),
            userId: z.number(),
            title: z.string().min(2, "Project title is required"),
            description: z.string().min(10, "Please provide a project description"),
            url: z.string().nullable().optional(),
            startDate: z.string().min(2, "Start date is required"),
            endDate: z.string().nullable().optional(),
            status: z.string().nullable().optional(),
          });
          
          const validatedProject = projectSchema.parse(updatedContent);
          if (validatedProject.id) {
            // Update existing project
            await storage.updateProject(validatedProject.id, {
              title: validatedProject.title,
              description: validatedProject.description,
              url: validatedProject.url,
              startDate: validatedProject.startDate,
              endDate: validatedProject.endDate,
              status: validatedProject.status,
            });
          } else {
            // Create new project
            await storage.createProject({
              userId,
              title: validatedProject.title,
              description: validatedProject.description,
              url: validatedProject.url,
              startDate: validatedProject.startDate,
              endDate: validatedProject.endDate,
              status: validatedProject.status,
            });
          }
          break;
          
        default:
          return res.status(400).json({ error: "Invalid section" });
      }
      
      return res.status(200).json({ success: true, message: "Improvements saved successfully" });
      
    } catch (error) {
      console.error("Error saving improvements:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      return res.status(500).json({ error: "Failed to save improvements" });
    }
  });
  
  // Helper functions for profile analysis and recommendations
  
  // Calculate profile completeness score based on various factors
  function calculateProfileCompletenessScore(
    user: any,
    experiences: any[],
    educations: any[],
    skills: any[],
    projects: any[]
  ): number {
    let score = 0;
    
    // Basic information (30%)
    const basicInfoScore = calculateBasicInfoScore(user);
    score += basicInfoScore * 0.3;
    
    // Work experience (25%)
    const experienceScore = calculateExperienceScore(experiences);
    score += experienceScore * 0.25;
    
    // Education (15%)
    const educationScore = calculateEducationScore(educations);
    score += educationScore * 0.15;
    
    // Skills (20%)
    const skillsScore = calculateSkillsScore(skills);
    score += skillsScore * 0.2;
    
    // Projects (10%)
    const projectsScore = calculateProjectsScore(projects);
    score += projectsScore * 0.1;
    
    // Round to the nearest integer
    return Math.round(score);
  }
  
  // Calculate score for basic information
  function calculateBasicInfoScore(user: any): number {
    let score = 0;
    
    // Name
    if (user.name) score += 20;
    
    // Title
    if (user.title) score += 20;
    
    // Industry
    if (user.industry) score += 20;
    
    // Location
    if (user.location) score += 20;
    
    // Additional factors (lookingFor)
    if (user.lookingFor) score += 10;
    
    // Profile photo
    if (user.photoURL) score += 10;
    
    return score;
  }
  
  // Calculate score for work experience
  function calculateExperienceScore(experiences: any[]): number {
    if (!experiences.length) return 0;
    
    let score = 0;
    const maxScore = 100;
    
    // Base score for having at least one experience
    score += 50;
    
    // Additional score for each experience, up to a maximum
    const additionalScore = Math.min(experiences.length, 4) * 10;
    score += additionalScore;
    
    // Check for completeness of experience entries
    let completeness = 0;
    experiences.forEach(exp => {
      let expCompleteness = 0;
      if (exp.title) expCompleteness += 1;
      if (exp.company) expCompleteness += 1;
      if (exp.startDate) expCompleteness += 1;
      if (exp.description && exp.description.length > 20) expCompleteness += 2;
      
      completeness += expCompleteness;
    });
    
    // Calculate average completeness (out of 5) and scale to remaining percentage
    const averageCompleteness = completeness / (experiences.length * 5);
    score += averageCompleteness * 30;
    
    return Math.min(score, maxScore);
  }
  
  // Calculate score for education
  function calculateEducationScore(educations: any[]): number {
    if (!educations.length) return 0;
    
    let score = 0;
    const maxScore = 100;
    
    // Base score for having at least one education
    score += 60;
    
    // Additional score for each education, up to a maximum
    const additionalScore = Math.min(educations.length, 3) * 10;
    score += additionalScore;
    
    // Check for completeness of education entries
    let completeness = 0;
    educations.forEach(edu => {
      let eduCompleteness = 0;
      if (edu.institution) eduCompleteness += 1;
      if (edu.degree) eduCompleteness += 1;
      if (edu.fieldOfStudy) eduCompleteness += 1;
      if (edu.startDate) eduCompleteness += 1;
      
      completeness += eduCompleteness;
    });
    
    // Calculate average completeness (out of 4) and scale to remaining percentage
    const averageCompleteness = completeness / (educations.length * 4);
    score += averageCompleteness * 20;
    
    return Math.min(score, maxScore);
  }
  
  // Calculate score for skills
  function calculateSkillsScore(skills: any[]): number {
    if (!skills.length) return 0;
    
    let score = 0;
    const maxScore = 100;
    
    // Base score for having at least one skill
    score += 40;
    
    // Additional score based on number of skills, up to a maximum
    const skillsCount = Math.min(skills.length, 10);
    const additionalScore = skillsCount * 5;
    score += additionalScore;
    
    // Check for completeness of skill entries
    let completeness = 0;
    skills.forEach(skill => {
      let skillCompleteness = 0;
      if (skill.name) skillCompleteness += 1;
      if (skill.proficiency) skillCompleteness += 1;
      if (skill.yearsOfExperience) skillCompleteness += 1;
      
      completeness += skillCompleteness;
    });
    
    // Calculate average completeness (out of 3) and scale to remaining percentage
    const averageCompleteness = completeness / (skills.length * 3);
    score += averageCompleteness * 10;
    
    return Math.min(score, maxScore);
  }
  
  // Calculate score for projects
  function calculateProjectsScore(projects: any[]): number {
    if (!projects.length) return 0;
    
    let score = 0;
    const maxScore = 100;
    
    // Base score for having at least one project
    score += 50;
    
    // Additional score for each project, up to a maximum
    const additionalScore = Math.min(projects.length, 4) * 10;
    score += additionalScore;
    
    // Check for completeness of project entries
    let completeness = 0;
    projects.forEach(project => {
      let projCompleteness = 0;
      if (project.title) projCompleteness += 1;
      if (project.description && project.description.length > 20) projCompleteness += 2;
      if (project.url) projCompleteness += 1;
      if (project.startDate) projCompleteness += 1;
      
      completeness += projCompleteness;
    });
    
    // Calculate average completeness (out of 5) and scale to remaining percentage
    const averageCompleteness = completeness / (projects.length * 5);
    score += averageCompleteness * 30;
    
    return Math.min(score, maxScore);
  }
  
  // Generate improvement priorities
  function generateImprovementPriorities(
    user: any,
    experiences: any[],
    educations: any[],
    skills: any[],
    projects: any[]
  ): string[] {
    const priorities: string[] = [];
    
    // Check basic info
    const basicInfoScore = calculateBasicInfoScore(user);
    if (basicInfoScore < 70) {
      priorities.push("Complete your basic profile information");
    }
    
    // Check experience
    if (!experiences.length) {
      priorities.push("Add your work experience history");
    } else if (experiences.length < 2) {
      priorities.push("Add more work experience entries");
    } else {
      // Check for quality of descriptions
      const lowQualityDescriptions = experiences.filter(
        exp => !exp.description || exp.description.length < 50
      );
      
      if (lowQualityDescriptions.length > 0) {
        priorities.push("Enhance your work descriptions with more detail and achievements");
      }
    }
    
    // Check education
    if (!educations.length) {
      priorities.push("Add your educational background");
    }
    
    // Check skills
    if (!skills.length) {
      priorities.push("Add your professional skills");
    } else if (skills.length < 5) {
      priorities.push("Add more skills to showcase your expertise");
    }
    
    // Check projects
    if (!projects.length) {
      priorities.push("Add projects to demonstrate your work");
    }
    
    // If all the basics are covered, suggest more advanced improvements
    if (priorities.length === 0) {
      priorities.push("Add measurable achievements to your work experience");
      priorities.push("Ensure your skills align with your industry and career goals");
      priorities.push("Keep your profile updated with your latest accomplishments");
    }
    
    return priorities.slice(0, 5); // Return top 5 priorities
  }
  
  // Generate recommended keywords
  function generateRecommendedKeywords(
    user: any,
    experiences: any[],
    educations: any[],
    skills: any[]
  ): string[] {
    const industry = user.industry || "";
    let keywords: string[] = [];
    
    // Add industry-specific keywords
    const industryKeywords = getIndustryKeywords(industry);
    keywords = [...keywords, ...industryKeywords];
    
    // Add keywords from job titles
    const titleKeywords = experiences
      .map(exp => exp.title)
      .filter(Boolean)
      .flatMap(title => title.split(/\s+/))
      .filter(word => word.length > 3);
    
    keywords = [...keywords, ...titleKeywords];
    
    // Add keywords from skills
    const skillKeywords = skills.map(skill => skill.name).filter(Boolean);
    keywords = [...keywords, ...skillKeywords];
    
    // Add keywords from education
    const educationKeywords = educations
      .map(edu => edu.fieldOfStudy)
      .filter(Boolean);
    
    keywords = [...keywords, ...educationKeywords];
    
    // Remove duplicates and limit the number of keywords
    const uniqueKeywords = [...new Set(keywords)].slice(0, 12);
    
    return uniqueKeywords;
  }
  
  // Get industry-specific keywords
  function getIndustryKeywords(industry: string): string[] {
    const industryKeywordMap: Record<string, string[]> = {
      "Technology": ["Software Development", "DevOps", "Cloud Computing", "Agile", "Data Science", "AI"],
      "Healthcare": ["Patient Care", "Clinical", "Medical", "Healthcare Management", "EHR"],
      "Finance": ["Financial Analysis", "Investment", "Banking", "Risk Management", "Compliance"],
      "Marketing": ["Digital Marketing", "SEO", "Content Strategy", "Brand Management", "Analytics"],
      "Education": ["Curriculum Development", "Teaching", "E-Learning", "Educational Technology"],
      "Design": ["UX/UI", "Product Design", "Graphic Design", "User Research", "Prototyping"],
      "Engineering": ["CAD", "Quality Control", "Process Improvement", "Project Management"],
      "Consulting": ["Business Analysis", "Change Management", "Strategy", "Client Management"],
      "Human Resources": ["Talent Acquisition", "Employee Relations", "Performance Management", "HRIS"],
      "Operations": ["Supply Chain", "Logistics", "Process Optimization", "Quality Assurance"],
      "Legal": ["Contract Law", "Legal Research", "Compliance", "Regulatory Affairs"],
      "Real Estate": ["Property Management", "Commercial Real Estate", "Leasing", "Development"],
      "Media": ["Content Creation", "Broadcasting", "Journalism", "Digital Media", "Production"],
      "Manufacturing": ["Lean Manufacturing", "Quality Control", "Production Planning", "Six Sigma"],
      "Retail": ["Merchandising", "Inventory Management", "Customer Experience", "E-commerce"],
      "Hospitality": ["Guest Services", "Event Management", "Food & Beverage", "Operations"],
      "Transportation": ["Logistics", "Fleet Management", "Distribution", "Supply Chain"],
      "Construction": ["Project Management", "Estimating", "Safety Management", "Building Information Modeling"],
      "Agriculture": ["Crop Management", "Precision Agriculture", "Sustainable Farming", "Agricultural Technology"],
      "Entertainment": ["Production", "Content Development", "Talent Management", "Event Planning"],
      "Telecommunications": ["Network Operations", "Infrastructure", "Customer Service", "Technical Support"],
      "Biotechnology": ["Research & Development", "Clinical Trials", "Regulatory Affairs", "Laboratory Management"],
      "Energy": ["Renewable Energy", "Energy Efficiency", "Environmental Compliance", "Sustainability"],
      "Government": ["Public Policy", "Program Management", "Grant Management", "Community Outreach"],
      "Nonprofit": ["Fundraising", "Volunteer Management", "Community Engagement", "Program Development"],
    };
    
    // Return keywords for the given industry or general professional keywords if not found
    return industryKeywordMap[industry] || [
      "Project Management", 
      "Leadership", 
      "Communication", 
      "Strategic Planning", 
      "Problem Solving",
      "Collaboration"
    ];
  }
  
  // Generate feedback for basic information
  function generateBasicFeedback(user: any): any {
    const completeness = calculateBasicInfoScore(user);
    const strengths: string[] = [];
    const improvements: string[] = [];
    
    // Identify strengths
    if (user.name) strengths.push("You've provided your name");
    if (user.title) strengths.push("Your professional title is clear");
    if (user.industry) strengths.push("You've specified your industry");
    if (user.location) strengths.push("Your location is provided");
    if (user.lookingFor) strengths.push("You've clarified what you're looking for professionally");
    if (user.photoURL) strengths.push("You have a profile photo");
    
    // Identify areas for improvement
    if (!user.name) improvements.push("Add your full name");
    if (!user.title) improvements.push("Include your professional title");
    if (!user.industry) improvements.push("Specify your industry");
    if (!user.location) improvements.push("Add your location (city, state, country)");
    if (!user.lookingFor) improvements.push("Clarify what you're looking for professionally");
    if (!user.photoURL) improvements.push("Upload a professional profile photo");
    
    let summary = "";
    if (completeness >= 90) {
      summary = "Your basic information is complete and professional.";
    } else if (completeness >= 70) {
      summary = "Your basic information is mostly complete. Add a few more details.";
    } else if (completeness >= 40) {
      summary = "Your basic information needs improvement. Complete the missing fields.";
    } else {
      summary = "Your basic information is minimal. Start by filling in the essential details.";
    }
    
    return {
      completeness,
      summary,
      strengths,
      improvements,
    };
  }
  
  // Generate feedback for work experience
  function generateExperienceFeedback(experiences: any[]): any {
    const count = experiences.length;
    let strengths: string[] = [];
    let improvements: string[] = [];
    let summary = "";
    
    if (count === 0) {
      summary = "You haven't added any work experience yet.";
      improvements.push("Add your current or most recent position");
      improvements.push("Include your job title, company, and dates");
      improvements.push("Describe your responsibilities and achievements");
      return { count, summary, strengths, improvements };
    }
    
    const completedFields: Record<string, number> = {
      title: 0,
      company: 0,
      description: 0,
      dateRange: 0,
    };
    
    // Check which fields are completed
    experiences.forEach(exp => {
      if (exp.title) completedFields.title++;
      if (exp.company) completedFields.company++;
      if (exp.description && exp.description.length > 20) completedFields.description++;
      if (exp.startDate) completedFields.dateRange++;
    });
    
    // Identify strengths
    if (count >= 3) {
      strengths.push("You have multiple work experiences, showing career progression");
    } else if (count > 0) {
      strengths.push("You've added work experience to your profile");
    }
    
    if (completedFields.title === count && completedFields.company === count) {
      strengths.push("All positions include job titles and companies");
    }
    
    if (completedFields.description === count) {
      strengths.push("All positions include descriptions");
    }
    
    if (completedFields.dateRange === count) {
      strengths.push("You've included dates for all positions");
    }
    
    // Identify areas for improvement
    if (count < 2) {
      improvements.push("Add more work experiences to show your career progression");
    }
    
    if (completedFields.title < count || completedFields.company < count) {
      improvements.push("Ensure all positions have job titles and company names");
    }
    
    if (completedFields.description < count) {
      improvements.push("Add detailed descriptions to all positions");
    } else {
      // Check for quality of descriptions
      const shortDescriptions = experiences.filter(
        exp => exp.description && exp.description.length < 100
      );
      
      if (shortDescriptions.length > 0) {
        improvements.push("Enhance your work descriptions with more detail and achievements");
      }
    }
    
    if (completedFields.dateRange < count) {
      improvements.push("Include start and end dates for all positions");
    }
    
    // Generate summary
    if (improvements.length === 0) {
      summary = "Your work experience section is comprehensive and well-detailed.";
    } else if (improvements.length <= 2) {
      summary = "Your work experience section is good but could use some refinement.";
    } else {
      summary = "Your work experience section needs improvement to effectively showcase your career.";
    }
    
    return {
      count,
      summary,
      strengths,
      improvements,
    };
  }
  
  // Generate feedback for education
  function generateEducationFeedback(educations: any[]): any {
    const count = educations.length;
    let strengths: string[] = [];
    let improvements: string[] = [];
    let summary = "";
    
    if (count === 0) {
      summary = "You haven't added any education yet.";
      improvements.push("Add your highest level of education");
      improvements.push("Include the institution, degree, and field of study");
      improvements.push("Add graduation date or dates of attendance");
      return { count, summary, strengths, improvements };
    }
    
    const completedFields: Record<string, number> = {
      institution: 0,
      degree: 0,
      fieldOfStudy: 0,
      dateRange: 0,
    };
    
    // Check which fields are completed
    educations.forEach(edu => {
      if (edu.institution) completedFields.institution++;
      if (edu.degree) completedFields.degree++;
      if (edu.fieldOfStudy) completedFields.fieldOfStudy++;
      if (edu.startDate) completedFields.dateRange++;
    });
    
    // Identify strengths
    if (count >= 2) {
      strengths.push("You have multiple educational qualifications");
    } else {
      strengths.push("You've added education to your profile");
    }
    
    if (completedFields.institution === count && completedFields.degree === count) {
      strengths.push("All education entries include institutions and degrees");
    }
    
    if (completedFields.fieldOfStudy === count) {
      strengths.push("You've specified fields of study for all education entries");
    }
    
    if (completedFields.dateRange === count) {
      strengths.push("You've included dates for all education entries");
    }
    
    // Identify areas for improvement
    if (completedFields.institution < count || completedFields.degree < count) {
      improvements.push("Ensure all education entries have institutions and degrees");
    }
    
    if (completedFields.fieldOfStudy < count) {
      improvements.push("Specify fields of study for all education entries");
    }
    
    if (completedFields.dateRange < count) {
      improvements.push("Include dates for all education entries");
    }
    
    // Generate summary
    if (improvements.length === 0) {
      summary = "Your education section is complete and well-detailed.";
    } else if (improvements.length <= 2) {
      summary = "Your education section is good but could use some minor additions.";
    } else {
      summary = "Your education section needs improvement to effectively showcase your qualifications.";
    }
    
    return {
      count,
      summary,
      strengths,
      improvements,
    };
  }
  
  // Generate feedback for skills
  function generateSkillsFeedback(skills: any[]): any {
    const count = skills.length;
    let strengths: string[] = [];
    let improvements: string[] = [];
    let summary = "";
    
    if (count === 0) {
      summary = "You haven't added any skills yet.";
      improvements.push("Add at least 5-10 relevant skills for your field");
      improvements.push("Include technical and soft skills");
      improvements.push("Specify proficiency levels for your skills");
      return { count, summary, strengths, improvements };
    }
    
    const completedFields: Record<string, number> = {
      name: 0,
      proficiency: 0,
      yearsOfExperience: 0,
    };
    
    // Check which fields are completed
    skills.forEach(skill => {
      if (skill.name) completedFields.name++;
      if (skill.proficiency) completedFields.proficiency++;
      if (skill.yearsOfExperience) completedFields.yearsOfExperience++;
    });
    
    // Identify strengths
    if (count >= 8) {
      strengths.push("You have a comprehensive set of skills");
    } else if (count >= 5) {
      strengths.push("You have a good number of skills listed");
    } else {
      strengths.push("You've started adding skills to your profile");
    }
    
    if (completedFields.proficiency === count) {
      strengths.push("You've specified proficiency levels for all skills");
    }
    
    if (completedFields.yearsOfExperience === count) {
      strengths.push("You've included years of experience for all skills");
    }
    
    // Identify areas for improvement
    if (count < 5) {
      improvements.push("Add more skills to showcase your expertise (aim for 8-10 skills)");
    }
    
    if (completedFields.proficiency < count) {
      improvements.push("Specify proficiency levels for all skills");
    }
    
    if (completedFields.yearsOfExperience < count) {
      improvements.push("Include years of experience for all skills");
    }
    
    // Generate summary
    if (count >= 8 && improvements.length === 0) {
      summary = "Your skills section is comprehensive and detailed.";
    } else if (count >= 5 && improvements.length <= 1) {
      summary = "Your skills section is good but could be enhanced.";
    } else {
      summary = "Your skills section needs improvement to effectively showcase your capabilities.";
    }
    
    return {
      count,
      summary,
      strengths,
      improvements,
    };
  }
  
  // Generate feedback for projects
  function generateProjectsFeedback(projects: any[]): any {
    const count = projects.length;
    let strengths: string[] = [];
    let improvements: string[] = [];
    let summary = "";
    
    if (count === 0) {
      summary = "You haven't added any projects yet.";
      improvements.push("Add at least 2-3 relevant projects");
      improvements.push("Include project title, description, and dates");
      improvements.push("Add links to project websites or repositories if available");
      return { count, summary, strengths, improvements };
    }
    
    const completedFields: Record<string, number> = {
      title: 0,
      description: 0,
      url: 0,
      dateRange: 0,
    };
    
    // Check which fields are completed
    projects.forEach(project => {
      if (project.title) completedFields.title++;
      if (project.description && project.description.length > 20) completedFields.description++;
      if (project.url) completedFields.url++;
      if (project.startDate) completedFields.dateRange++;
    });
    
    // Identify strengths
    if (count >= 3) {
      strengths.push("You have multiple projects showcasing your work");
    } else {
      strengths.push("You've added projects to your profile");
    }
    
    if (completedFields.description === count) {
      strengths.push("All projects include descriptions");
    }
    
    if (completedFields.url > 0) {
      strengths.push("You've included links to some of your projects");
    }
    
    if (completedFields.dateRange === count) {
      strengths.push("You've included dates for all projects");
    }
    
    // Identify areas for improvement
    if (count < 2) {
      improvements.push("Add more projects to showcase your work");
    }
    
    if (completedFields.title < count) {
      improvements.push("Ensure all projects have titles");
    }
    
    if (completedFields.description < count) {
      improvements.push("Add detailed descriptions to all projects");
    } else {
      // Check for quality of descriptions
      const shortDescriptions = projects.filter(
        project => project.description && project.description.length < 100
      );
      
      if (shortDescriptions.length > 0) {
        improvements.push("Enhance your project descriptions with more detail");
      }
    }
    
    if (completedFields.url === 0) {
      improvements.push("Add links to your projects when available");
    } else if (completedFields.url < count) {
      improvements.push("Include links for more of your projects when available");
    }
    
    if (completedFields.dateRange < count) {
      improvements.push("Include dates for all projects");
    }
    
    // Generate summary
    if (improvements.length === 0) {
      summary = "Your projects section is comprehensive and well-detailed.";
    } else if (improvements.length <= 2) {
      summary = "Your projects section is good but could use some refinement.";
    } else {
      summary = "Your projects section needs improvement to effectively showcase your work.";
    }
    
    return {
      count,
      summary,
      strengths,
      improvements,
    };
  }
  
  // Generate overall analysis
  function generateOverallAnalysis(
    user: any,
    completenessScore: number,
    experiences: any[],
    educations: any[],
    skills: any[],
    projects: any[]
  ): string {
    let analysis = "";
    
    // Profile completeness assessment
    if (completenessScore >= 90) {
      analysis += "Your profile is very well-developed and complete. You've provided comprehensive information across all sections, which will help you stand out to potential connections and employers.\n\n";
    } else if (completenessScore >= 70) {
      analysis += "Your profile is well-developed with good information in most sections. With a few more enhancements, your profile will be exceptional.\n\n";
    } else if (completenessScore >= 50) {
      analysis += "Your profile has a solid foundation, but there are several areas where additional information would significantly improve your presence.\n\n";
    } else {
      analysis += "Your profile is still in the early stages of development. Focusing on adding essential information will help you create a more comprehensive professional presence.\n\n";
    }
    
    // Section-specific feedback summaries
    if (experiences.length === 0) {
      analysis += "Work Experience: Adding your work history is essential. List your positions with detailed descriptions of your responsibilities and achievements.\n\n";
    } else if (experiences.length < 2) {
      analysis += "Work Experience: You've started documenting your work history. Consider adding more positions or enhancing your current entries with more details about your accomplishments.\n\n";
    } else {
      analysis += "Work Experience: You have a good record of your work history. To strengthen this section further, ensure each position highlights specific achievements with measurable results.\n\n";
    }
    
    if (educations.length === 0) {
      analysis += "Education: Adding your educational background will complete your professional story. Include your degrees, institutions, and relevant coursework.\n\n";
    } else {
      analysis += "Education: Your educational background is documented. Make sure all relevant certifications and continuing education are also included.\n\n";
    }
    
    if (skills.length < 5) {
      analysis += "Skills: Expanding your skills section will help showcase your professional capabilities. Aim for 8-10 skills that are most relevant to your field.\n\n";
    } else {
      analysis += "Skills: Your skills section gives a good overview of your capabilities. Consider organizing them by proficiency and relevance to your career goals.\n\n";
    }
    
    if (projects.length === 0) {
      analysis += "Projects: Adding projects will demonstrate your practical experience. Include personal, academic, and professional projects relevant to your field.\n\n";
    } else {
      analysis += "Projects: Your projects section helps showcase your practical work. Consider adding links to live examples or repositories where applicable.\n\n";
    }
    
    // Overall recommendation
    analysis += "Recommendation: ";
    if (completenessScore < 50) {
      analysis += "Focus on completing the basic sections of your profile first: add your work experience, education, and essential skills to establish your professional background.";
    } else if (completenessScore < 70) {
      analysis += "Now that you have the foundations in place, focus on adding more detail to your existing entries and filling in any missing sections to present a more complete picture of your professional capabilities.";
    } else if (completenessScore < 90) {
      analysis += "Your profile is quite strong already. Focus on quality improvements such as adding achievements with measurable results and ensuring your skills align with your career objectives.";
    } else {
      analysis += "Maintain your excellent profile by keeping it current with your latest accomplishments and skills. Consider refreshing your content periodically to reflect your career growth and evolving professional interests.";
    }
    
    return analysis;
  }
  
  // Enhance analysis with AI
  async function enhanceAnalysisWithAI(
    user: any,
    completenessScore: number,
    experiences: any[],
    educations: any[],
    skills: any[],
    projects: any[]
  ): Promise<string | null> {
    try {
      // Prepare context from user data
      const userContext = {
        name: user.name || "Anonymous",
        title: user.title || "Not specified",
        industry: user.industry || "Not specified",
        location: user.location || "Not specified",
        lookingFor: user.lookingFor || "Not specified",
        completenessScore,
        experienceCount: experiences.length,
        educationCount: educations.length,
        skillsCount: skills.length,
        projectsCount: projects.length,
        experiences: experiences.map((exp: any) => ({
          title: exp.title,
          company: exp.company,
          dateRange: `${exp.startDate} - ${exp.endDate || 'Present'}`,
          descriptionLength: exp.description ? exp.description.length : 0,
        })),
        skills: skills.map((skill: any) => skill.name),
      };
      
      // Create prompt for OpenAI
      const prompt = `
        You are an expert career coach analyzing a professional profile. 
        Provide a personalized, insightful analysis based on this profile information:
        
        Name: ${userContext.name}
        Title: ${userContext.title}
        Industry: ${userContext.industry}
        Location: ${userContext.location}
        Looking For: ${userContext.lookingFor}
        
        Profile Completeness: ${userContext.completenessScore}%
        Work Experience Entries: ${userContext.experienceCount}
        Education Entries: ${userContext.educationCount}
        Skills Listed: ${userContext.skillsCount}
        Projects Listed: ${userContext.projectsCount}
        
        Key Skills: ${userContext.skills.join(', ')}
        
        Provide a 3-4 paragraph analysis that:
        1. Assesses overall profile strength
        2. Highlights specific areas for improvement with actionable advice
        3. Offers industry-specific recommendations
        4. Includes a final recommendation summary
        
        Keep the tone professional, constructive, and encouraging. Focus on practical advice that would genuinely improve the profile.
        Do NOT mention that you are an AI or that this is an AI-generated analysis.
      `;
      
      // Call OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert career coach providing insightful profile analysis and recommendations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });
      
      // Return the AI-generated analysis
      return response.choices[0]?.message.content || null;
      
    } catch (error) {
      console.error("Error enhancing analysis with AI:", error);
      return null;
    }
  }
  
  // Generate AI-powered suggestions for a section
  async function generateAISuggestions(
    section: string,
    currentContent: any,
    user: any
  ): Promise<any> {
    try {
      // Prepare context
      const userInfo = {
        name: user.name || "Anonymous",
        title: user.title || "Not specified",
        industry: user.industry || "Not specified",
        location: user.location || "Not specified",
      };
      
      // Create section-specific prompt
      let prompt = "";
      let keywords: string[] = [];
      
      switch (section) {
        case "basic":
          prompt = `
            As a career coach, provide 3-5 specific suggestions to improve this professional's basic profile information:
            
            Name: ${currentContent?.name || "Not provided"}
            Title: ${currentContent?.title || "Not provided"}
            Industry: ${currentContent?.industry || "Not provided"}
            Location: ${currentContent?.location || "Not provided"}
            Looking For: ${currentContent?.lookingFor || "Not provided"}
            
            Also provide 5-8 relevant keywords they should consider using in their profile.
            Finally, provide an improved version of their title that would be more impactful (only 1-2 sentences).
          `;
          keywords = getIndustryKeywords(currentContent?.industry || user.industry || "");
          break;
          
        case "experience":
          prompt = `
            As a career coach, provide 3-5 specific suggestions to improve this work experience entry:
            
            Job Title: ${currentContent?.title || "Not provided"}
            Company: ${currentContent?.company || "Not provided"}
            Dates: ${currentContent?.startDate || "Not provided"} to ${currentContent?.endDate || "Present"}
            Current Position: ${currentContent?.current ? "Yes" : "No"}
            Description: ${currentContent?.description || "Not provided"}
            
            Also provide 5-8 relevant keywords they should consider using in this experience description.
            These should be action verbs and industry-specific terms that would strengthen this entry.
            
            Finally, provide 2-3 examples of specific achievements they might consider adding to this experience (with metrics if possible).
          `;
          keywords = getExperienceKeywords(currentContent?.title || "", currentContent?.industry || user.industry || "");
          break;
          
        case "education":
          prompt = `
            As a career coach, provide 3-5 specific suggestions to improve this education entry:
            
            Institution: ${currentContent?.institution || "Not provided"}
            Degree: ${currentContent?.degree || "Not provided"}
            Field of Study: ${currentContent?.fieldOfStudy || "Not provided"}
            Dates: ${currentContent?.startDate || "Not provided"} to ${currentContent?.endDate || "Not provided"}
            Description: ${currentContent?.description || "Not provided"}
            
            Also provide 5-8 relevant keywords they should consider using in this education description.
            Finally, provide 2-3 examples of specific achievements or relevant coursework they might consider adding.
          `;
          keywords = getEducationKeywords(currentContent?.fieldOfStudy || "", user.industry || "");
          break;
          
        case "skills":
          prompt = `
            As a career coach, provide 3-5 specific suggestions to improve this skill entry:
            
            Skill: ${currentContent?.name || "Not provided"}
            Proficiency: ${currentContent?.proficiency || "Not provided"}
            Years of Experience: ${currentContent?.yearsOfExperience || "Not provided"}
            Description: ${currentContent?.description || "Not provided"}
            
            The professional's industry is: ${user.industry || "Not specified"}
            
            Also provide 5-8 related skills that complement this one and would be valuable to add to their profile.
            Finally, provide a short, improved description for this skill that showcases practical application.
          `;
          keywords = getSkillComplementaryKeywords(currentContent?.name || "", user.industry || "");
          break;
          
        case "projects":
          prompt = `
            As a career coach, provide 3-5 specific suggestions to improve this project entry:
            
            Project Title: ${currentContent?.title || "Not provided"}
            Dates: ${currentContent?.startDate || "Not provided"} to ${currentContent?.endDate || "Not provided"}
            Status: ${currentContent?.status || "Not provided"}
            Description: ${currentContent?.description || "Not provided"}
            URL: ${currentContent?.url || "Not provided"}
            
            The professional's industry is: ${user.industry || "Not specified"}
            
            Also provide 5-8 relevant keywords they should consider using in this project description.
            Finally, provide a short, improved description for this project that highlights outcomes and skills demonstrated.
          `;
          keywords = getProjectKeywords(user.industry || "");
          break;
          
        default:
          return {
            suggestions: getBasicSuggestions(section),
            keywords: getBasicKeywords(section, user.industry || ""),
            improvedVersion: null,
          };
      }
      
      // Call OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert career coach providing specific suggestions to improve professional profiles."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });
      
      // Parse response
      const content = response.choices[0]?.message.content || "";
      
      // Extract suggestions (assuming they come in numbered or bullet point format)
      const suggestionRegex = /(?:\d+\.|\*)\s+(.+?)(?=(?:\d+\.|\*)|$)/gs;
      const suggestions: string[] = [];
      let match;
      while ((match = suggestionRegex.exec(content)) !== null) {
        if (match[1].trim()) {
          suggestions.push(match[1].trim());
        }
      }
      
      // Extract improved version (usually in the last paragraph)
      let improvedVersion = null;
      if (section === "basic" && currentContent) {
        improvedVersion = { ...currentContent };
        
        // Look for suggested title in the content
        const titleMatch = content.match(/improved (?:version|title).*?["""](.+?)["""]/i);
        if (titleMatch && titleMatch[1]) {
          improvedVersion.title = titleMatch[1].trim();
        }
      }
      
      // Return the results along with some default keywords
      return {
        suggestions: suggestions.length > 0 ? suggestions : getBasicSuggestions(section),
        keywords: [...new Set([...keywords, ...extractKeywords(content)])].slice(0, 10),
        improvedVersion,
      };
      
    } catch (error) {
      console.error("Error generating AI suggestions:", error);
      return {
        suggestions: getBasicSuggestions(section),
        keywords: getBasicKeywords(section, user.industry || ""),
        improvedVersion: null,
      };
    }
  }
  
  // Extract keywords from AI response
  function extractKeywords(content: string): string[] {
    // Look for sections that might contain keywords
    const keywordSectionMatch = content.match(/keywords?:?\s*(?:\n|.)*?(?:\n\n|\.|$)/i);
    
    if (keywordSectionMatch) {
      const keywordSection = keywordSectionMatch[0];
      // Extract words within quotes or just standalone words
      const extractedKeywords = keywordSection.match(/[""]([^""]+)[""]/g) || 
                                keywordSection.match(/\b([\w-]+(?:\s+[\w-]+){0,2})\b/g);
      
      if (extractedKeywords) {
        return extractedKeywords
          .map(k => k.replace(/[""]|^\s+|\s+$|\.$|,$|:$|;$/g, '').trim())
          .filter(k => 
            k.length > 3 && 
            !['keywords', 'consider', 'using', 'include', 'such', 'as', 'the', 'and', 'relevant', 'also'].includes(k.toLowerCase())
          );
      }
    }
    
    return [];
  }
  
  // Get basic suggestions when AI is not available
  function getBasicSuggestions(section: string): string[] {
    switch (section) {
      case "basic":
        return [
          "Use a professional and descriptive job title",
          "Specify your industry to help connections find you",
          "Include your location to appear in local searches",
          "Clarify what you're looking for professionally",
          "Upload a professional profile photo",
        ];
        
      case "experience":
        return [
          "Use action verbs to begin each bullet point in your description",
          "Include measurable achievements, not just responsibilities",
          "Quantify your impact with specific metrics and numbers",
          "Focus on accomplishments that demonstrate your skills",
          "Keep descriptions concise but comprehensive",
        ];
        
      case "education":
        return [
          "Include all relevant degrees and certifications",
          "Specify your field of study",
          "List relevant coursework that aligns with your career goals",
          "Include academic achievements and honors",
          "Mention any leadership roles or extracurricular activities",
        ];
        
      case "skills":
        return [
          "List both technical and soft skills",
          "Specify your proficiency level for each skill",
          "Organize skills by relevance to your career goals",
          "Include industry-specific technical skills",
          "Update skills regularly to reflect your current capabilities",
        ];
        
      case "projects":
        return [
          "Include a clear, concise project title",
          "Describe the problem or goal the project addressed",
          "Highlight the technologies or methodologies used",
          "Emphasize your specific role and contributions",
          "Include links to live projects or repositories when possible",
        ];
        
      default:
        return [
          "Add more detail to strengthen this section",
          "Include specific examples to support your claims",
          "Use industry-relevant keywords",
          "Keep content concise but comprehensive",
          "Regularly update this information",
        ];
    }
  }
  
  // Get basic keywords when AI is not available
  function getBasicKeywords(section: string, industry: string): string[] {
    const industryKeywords = getIndustryKeywords(industry);
    
    switch (section) {
      case "basic":
        return [...industryKeywords, "Professional", "Expert", "Specialist", "Consultant", "Leader"];
        
      case "experience":
        return ["Leadership", "Project Management", "Team Collaboration", "Strategic Planning", "Process Improvement", ...industryKeywords.slice(0, 3)];
        
      case "education":
        return ["Graduate", "Certified", "Academic Excellence", "Research", "Specialized Training", ...industryKeywords.slice(0, 3)];
        
      case "skills":
        return ["Technical Expertise", "Problem Solving", "Communication", "Analytical Skills", "Innovation", ...industryKeywords.slice(0, 3)];
        
      case "projects":
        return ["Implementation", "Development", "Coordination", "Management", "Design", ...industryKeywords.slice(0, 3)];
        
      default:
        return [...industryKeywords, "Professional", "Expert", "Specialized", "Experienced", "Qualified"];
    }
  }
  
  // Get job-specific keywords
  function getExperienceKeywords(jobTitle: string, industry: string): string[] {
    const commonActionVerbs = [
      "Achieved", "Analyzed", "Built", "Coordinated", "Delivered",
      "Developed", "Enhanced", "Established", "Generated", "Implemented",
      "Improved", "Increased", "Led", "Managed", "Negotiated",
      "Optimized", "Produced", "Reduced", "Resolved", "Streamlined"
    ];
    
    // Job-specific keywords based on common job titles
    const jobTitleKeywords: Record<string, string[]> = {
      "software engineer": ["Architected", "Coded", "Debugged", "Deployed", "Programmed", "Refactored", "Tested"],
      "developer": ["Architected", "Coded", "Deployed", "Documented", "Programmed", "Tested"],
      "project manager": ["Budgeted", "Executed", "Planned", "Scheduled", "Supervised"],
      "product manager": ["Defined", "Launched", "Prioritized", "Roadmapped", "Specified"],
      "marketing": ["Campaigned", "Branded", "Promoted", "Researched", "Targeted"],
      "sales": ["Acquired", "Closed", "Negotiated", "Prospected", "Sold"],
      "designer": ["Created", "Designed", "Illustrated", "Prototyped", "Visualized"],
      "analyst": ["Assessed", "Calculated", "Forecasted", "Modeled", "Researched"],
      "consultant": ["Advised", "Diagnosed", "Evaluated", "Recommended", "Solved"],
      "manager": ["Delegated", "Directed", "Mentored", "Oversaw", "Supervised"],
      "director": ["Aligned", "Established", "Guided", "Spearheaded", "Strategized"],
      "executive": ["Authorized", "Directed", "Governed", "Pioneered", "Transformed"],
      "engineer": ["Constructed", "Designed", "Implemented", "Modified", "Tested"],
      "researcher": ["Analyzed", "Conducted", "Discovered", "Investigated", "Published"],
      "teacher": ["Educated", "Facilitated", "Instructed", "Mentored", "Taught"],
      "writer": ["Authored", "Composed", "Drafted", "Edited", "Wrote"],
    };
    
    // Find matching job title
    const jobTitleLower = jobTitle.toLowerCase();
    let specificKeywords: string[] = [];
    
    Object.entries(jobTitleKeywords).forEach(([title, keywords]) => {
      if (jobTitleLower.includes(title)) {
        specificKeywords = [...specificKeywords, ...keywords];
      }
    });
    
    // Get industry-specific keywords
    const industryKeywords = getIndustryKeywords(industry);
    
    // Combine and return unique keywords
    return [...new Set([...commonActionVerbs.slice(0, 10), ...specificKeywords, ...industryKeywords.slice(0, 5)])];
  }
  
  // Get education-specific keywords
  function getEducationKeywords(fieldOfStudy: string, industry: string): string[] {
    const commonEducationKeywords = [
      "Academic", "Certificate", "Course", "Degree", "Diploma",
      "Education", "Graduate", "Honors", "Learning", "Research",
      "Scholarship", "Study", "Training", "University", "Workshop"
    ];
    
    // Field-specific keywords
    const fieldKeywords: Record<string, string[]> = {
      "computer science": ["Algorithm", "Computing", "Data Structures", "Programming", "Software Development"],
      "business": ["Finance", "Management", "Marketing", "Strategy", "Operations"],
      "engineering": ["Design", "Development", "Mechanics", "Systems", "Technical"],
      "arts": ["Creative", "Design", "Humanities", "Studio", "Visual"],
      "science": ["Analytical", "Experiment", "Laboratory", "Research", "Scientific"],
      "medicine": ["Clinical", "Healthcare", "Medical", "Patient Care", "Treatment"],
      "law": ["Case Study", "Jurisprudence", "Legal", "Regulation", "Statute"],
      "education": ["Curriculum", "Instruction", "Pedagogy", "Teaching", "Training"],
    };
    
    // Find matching field
    const fieldLower = fieldOfStudy.toLowerCase();
    let specificKeywords: string[] = [];
    
    Object.entries(fieldKeywords).forEach(([field, keywords]) => {
      if (fieldLower.includes(field)) {
        specificKeywords = [...specificKeywords, ...keywords];
      }
    });
    
    // Get industry-specific keywords
    const industryKeywords = getIndustryKeywords(industry);
    
    // Combine and return unique keywords
    return [...new Set([...commonEducationKeywords.slice(0, 5), ...specificKeywords, ...industryKeywords.slice(0, 3)])];
  }
  
  // Get complementary skills
  function getSkillComplementaryKeywords(skillName: string, industry: string): string[] {
    const skillGroups: Record<string, string[]> = {
      // Programming languages and technologies
      "javascript": ["React", "Node.js", "TypeScript", "Vue.js", "Angular", "Express", "REST API", "Frontend Development"],
      "python": ["Django", "Flask", "FastAPI", "Data Science", "Machine Learning", "NumPy", "Pandas", "Scikit-learn"],
      "java": ["Spring Boot", "Hibernate", "Microservices", "Object-Oriented Design", "JUnit", "Maven", "Gradle"],
      "c#": [".NET", "ASP.NET", "Entity Framework", "LINQ", "MVC", "Visual Studio", "Azure"],
      "react": ["JavaScript", "Redux", "Hooks", "Component Design", "Frontend Architecture", "UI/UX", "Web Development"],
      
      // Data science and analytics
      "data science": ["Python", "R", "Machine Learning", "Data Analysis", "Statistics", "Data Visualization", "Big Data"],
      "machine learning": ["AI", "Deep Learning", "Neural Networks", "TensorFlow", "PyTorch", "Statistical Analysis", "Model Deployment"],
      "sql": ["Database Design", "Query Optimization", "Data Modeling", "PostgreSQL", "MySQL", "NoSQL", "Data Analysis"],
      
      // Design
      "ux design": ["UI Design", "User Research", "Wireframing", "Prototyping", "Figma", "Adobe XD", "Usability Testing"],
      "graphic design": ["Adobe Creative Suite", "Illustration", "Typography", "Brand Identity", "Visual Communication", "Layout Design"],
      
      // Project management
      "project management": ["Agile", "Scrum", "JIRA", "Resource Allocation", "Risk Management", "Stakeholder Management", "Timeline Planning"],
      "agile": ["Scrum", "Kanban", "Sprint Planning", "Retrospectives", "User Stories", "Product Backlog", "Continuous Delivery"],
      
      // Marketing
      "digital marketing": ["SEO", "Content Marketing", "Social Media Strategy", "Google Analytics", "SEM", "Email Marketing", "Growth Hacking"],
      "seo": ["Content Strategy", "Keyword Research", "On-Page Optimization", "Link Building", "Analytics", "Technical SEO", "Local SEO"],
      
      // General business
      "leadership": ["Team Management", "Strategic Planning", "Decision Making", "Mentoring", "Delegation", "Change Management", "Conflict Resolution"],
      "communication": ["Presentation Skills", "Technical Writing", "Client Interaction", "Stakeholder Management", "Negotiation", "Documentation"],
      
      // Default general professional skills
      "default": ["Communication", "Problem Solving", "Teamwork", "Adaptability", "Time Management", "Critical Thinking", "Attention to Detail"]
    };
    
    // Find matching skill group
    const skillLower = skillName.toLowerCase();
    let complementarySkills: string[] = [];
    
    let found = false;
    Object.entries(skillGroups).forEach(([skill, relatedSkills]) => {
      if (skillLower.includes(skill)) {
        complementarySkills = [...complementarySkills, ...relatedSkills];
        found = true;
      }
    });
    
    // If no specific match, use default and industry keywords
    if (!found) {
      complementarySkills = [...skillGroups.default];
    }
    
    // Add industry-specific keywords
    const industryKeywords = getIndustryKeywords(industry);
    
    // Combine and return unique keywords
    return [...new Set([...complementarySkills, ...industryKeywords.slice(0, 3)])];
  }
  
  // Get project keywords
  function getProjectKeywords(industry: string): string[] {
    const commonProjectKeywords = [
      "Launched", "Developed", "Implemented", "Managed", "Designed",
      "Delivered", "Created", "Built", "Optimized", "Researched",
      "Analyzed", "Improved", "Coordinated", "Led", "Executed"
    ];
    
    // Get industry-specific keywords
    const industryKeywords = getIndustryKeywords(industry);
    
    // Combine and return unique keywords
    return [...new Set([...commonProjectKeywords, ...industryKeywords])];
  }
}