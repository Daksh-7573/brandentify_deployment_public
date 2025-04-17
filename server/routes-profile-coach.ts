import express, { Request, Response } from "express";
import { IStorage } from "./storage";
import { OpenAI } from "openai";

/**
 * Routes for the Profile Coach feature
 */
export function registerProfileCoachRoutes(app: express.Express, storage: IStorage) {
  // OpenAI instance
  const openai = new OpenAI();

  // Profile analysis endpoint
  app.get("/api/profile-coach/analysis/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Fetch user profile data
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Fetch additional user data
      const experiences = await storage.getWorkExperiencesByUserId(userId);
      const educations = await storage.getEducationsByUserId(userId);
      const skills = await storage.getSkillsByUserId(userId);
      const projects = await storage.getProjectsByUserId(userId);
      
      // Generate profile analysis
      const profileAnalysis = await generateProfileAnalysis({
        user,
        experiences,
        educations,
        skills,
        projects
      });
      
      return res.status(200).json(profileAnalysis);
    } catch (error) {
      console.error("Profile coach analysis error:", error);
      return res.status(500).json({ message: "Failed to analyze profile" });
    }
  });
  
  // Get improvement suggestions for specific section
  app.post("/api/profile-coach/suggestions", async (req: Request, res: Response) => {
    try {
      const { userId, section, currentContent } = req.body;
      
      if (!userId || !section || !currentContent) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Get user data for context
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Generate suggestions based on section
      const suggestions = await generateSectionSuggestions({
        user,
        section,
        currentContent
      });
      
      return res.status(200).json(suggestions);
    } catch (error) {
      console.error("Profile coach suggestions error:", error);
      return res.status(500).json({ message: "Failed to generate suggestions" });
    }
  });
  
  // Save profile section improvements
  app.post("/api/profile-coach/save-improvements", async (req: Request, res: Response) => {
    try {
      const { userId, section, updatedContent } = req.body;
      
      if (!userId || !section || !updatedContent) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Update the appropriate section based on section type
      let result;
      switch (section) {
        case "basic":
          result = await storage.updateUser(userId, updatedContent);
          break;
        case "experience":
          if (updatedContent.id) {
            result = await storage.updateWorkExperience(updatedContent.id, updatedContent);
          } else {
            result = await storage.createWorkExperience({ ...updatedContent, userId });
          }
          break;
        case "education":
          if (updatedContent.id) {
            result = await storage.updateEducation(updatedContent.id, updatedContent);
          } else {
            result = await storage.createEducation({ ...updatedContent, userId });
          }
          break;
        case "skills":
          if (updatedContent.id) {
            result = await storage.updateSkill(updatedContent.id, updatedContent);
          } else {
            result = await storage.createSkill({ ...updatedContent, userId });
          }
          break;
        case "project":
          if (updatedContent.id) {
            result = await storage.updateProject(updatedContent.id, updatedContent);
          } else {
            result = await storage.createProject({ ...updatedContent, userId });
          }
          break;
        default:
          return res.status(400).json({ message: "Invalid section type" });
      }
      
      return res.status(200).json({ success: true, result });
    } catch (error) {
      console.error("Profile coach save improvements error:", error);
      return res.status(500).json({ message: "Failed to save improvements" });
    }
  });
  
  /**
   * Generate AI analysis of user profile
   */
  async function generateProfileAnalysis(profileData: any) {
    try {
      const { user, experiences, educations, skills, projects } = profileData;
      
      // Format the user profile data for AI analysis
      const profileSummary = `
        Name: ${user.name || 'Not provided'}
        Title: ${user.title || 'Not provided'}
        Industry: ${user.industry || 'Not provided'}
        Location: ${user.location || 'Not provided'}
        
        Work Experience:
        ${experiences.map((exp: any) => 
          `- ${exp.title} at ${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'})
           ${exp.description || 'No description provided'}`
        ).join('\n\n')}
        
        Education:
        ${educations.map((edu: any) => 
          `- ${edu.degree} in ${edu.fieldOfStudy} at ${edu.institution} (${edu.startDate} - ${edu.endDate || 'Present'})
           ${edu.description || 'No description provided'}`
        ).join('\n\n')}
        
        Skills:
        ${skills.map((skill: any) => `- ${skill.name} (${skill.proficiency || 'No proficiency specified'})`).join('\n')}
        
        Projects:
        ${projects.map((project: any) => 
          `- ${project.title}
           ${project.description || 'No description provided'}`
        ).join('\n\n')}
      `;
      
      // Calculate profile completeness
      const profileCompletenessScore = calculateProfileCompleteness({
        user, experiences, educations, skills, projects
      });
      
      try {
        // Generate analysis using OpenAI
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an expert career coach and profile analyst. Your job is to analyze professional profiles and provide specific, actionable advice to improve them. Focus on identifying strengths, weaknesses, gaps, and opportunities for improvement. Be specific, practical, and actionable in your feedback."
            },
            {
              role: "user",
              content: `Analyze this professional profile and provide detailed feedback in JSON format with these keys: 
              - overallAnalysis: A paragraph about the overall profile strengths and weaknesses
              - profileCompleteness: Already calculated as ${profileCompletenessScore}%
              - sectionFeedback: An object with keys for each section (basic, experience, education, skills, projects) containing strengths and weaknesses arrays for each
              - improvementPriorities: Array of 3-5 specific improvement suggestions in priority order
              - keywordRecommendations: Array of industry/role relevant keywords the profile should include
              
              Here is the profile:
              ${profileSummary}`
            }
          ],
          response_format: { type: "json_object" }
        });
      
        // Parse and return the analysis
        return JSON.parse(completion.choices[0].message.content);
      } catch (error) {
        console.error("OpenAI API error:", error);
        
        // Fallback to mock analysis if OpenAI is unavailable (temporary solution)
        return {
          overallAnalysis: "Profile analysis currently unavailable. Please try again later.",
          profileCompleteness: profileCompletenessScore,
          sectionFeedback: {
            basic: {
              strengths: ["Profile has basic information filled out"],
              weaknesses: ["Consider adding more details to your profile"]
            },
            experience: {
              strengths: ["Work experience entries present"],
              weaknesses: ["Consider adding more detail to work descriptions"]
            },
            education: {
              strengths: ["Education history present"],
              weaknesses: ["Consider adding relevant coursework or achievements"]
            },
            skills: {
              strengths: ["Some skills are listed"],
              weaknesses: ["Consider organizing skills by proficiency level"]
            },
            projects: {
              strengths: ["Project entries present"],
              weaknesses: ["Add more details about your project contributions"]
            }
          },
          improvementPriorities: [
            "Add more detail to your work experience descriptions",
            "Include more specific technical skills",
            "Add measurable achievements to your profile"
          ],
          keywordRecommendations: [
            "leadership",
            "project management",
            "technical expertise",
            "innovation"
          ]
        };
      }
    } catch (error) {
      console.error("Profile analysis generation error:", error);
      throw error;
    }
  }
  
  /**
   * Generate AI suggestions for a specific profile section
   */
  async function generateSectionSuggestions(data: any) {
    try {
      const { user, section, currentContent } = data;
      
      try {
        // Generate suggestions using OpenAI
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an expert career coach specializing in professional profiles and resumes. Your job is to provide specific improvements for sections of a professional profile. Focus on concrete, actionable suggestions that will make the content more impressive, specific, and effective. Provide both suggestions for improvement and a fully rewritten version."
            },
            {
              role: "user",
              content: `I need suggestions to improve this "${section}" section of my professional profile. I work in the "${user.industry || 'technology'}" industry as a "${user.title || 'professional'}".
              
              Current content:
              ${JSON.stringify(currentContent, null, 2)}
              
              Please provide feedback in JSON format with these keys:
              - suggestions: Array of 3-5 specific improvement suggestions
              - improvedVersion: A completely rewritten version that implements all your suggestions
              - keywords: Array of 5-10 relevant keywords that should be incorporated`
            }
          ],
          response_format: { type: "json_object" }
        });
      
        // Parse and return the suggestions
        return JSON.parse(completion.choices[0].message.content);
      } catch (error) {
        console.error("OpenAI API error:", error);
        
        // Fallback to mock suggestions if OpenAI is unavailable (temporary solution)
        return {
          suggestions: [
            "Add more specific details about your accomplishments",
            "Include quantifiable results where possible",
            "Use more industry-specific keywords",
            "Focus on your unique contributions"
          ],
          improvedVersion: currentContent,
          keywords: [
            "leadership",
            "innovation",
            "expertise",
            "collaboration",
            "results-driven"
          ]
        };
      }
    } catch (error) {
      console.error("Section suggestions generation error:", error);
      throw error;
    }
  }
  
  /**
   * Calculate profile completeness score
   */
  function calculateProfileCompleteness(profileData: any) {
    const { user, experiences, educations, skills, projects } = profileData;
    
    // Define weights for each section
    const weights = {
      basic: 0.25,
      experience: 0.25,
      education: 0.15,
      skills: 0.20,
      projects: 0.15
    };
    
    // Calculate basic info completeness
    const basicFields = ['name', 'title', 'industry', 'location', 'email', 'phoneNumber'];
    const basicFieldsPresent = basicFields.filter(field => !!user[field]).length;
    const basicScore = (basicFieldsPresent / basicFields.length) * weights.basic;
    
    // Calculate experience completeness
    const experienceScore = experiences.length > 0 
      ? Math.min(experiences.length, 3) / 3 * weights.experience 
      : 0;
    
    // Calculate education completeness
    const educationScore = educations.length > 0 
      ? Math.min(educations.length, 2) / 2 * weights.education 
      : 0;
    
    // Calculate skills completeness
    const skillsScore = skills.length > 0 
      ? Math.min(skills.length, 10) / 10 * weights.skills 
      : 0;
    
    // Calculate projects completeness
    const projectsScore = projects.length > 0 
      ? Math.min(projects.length, 3) / 3 * weights.projects 
      : 0;
    
    // Calculate total score
    const totalScore = (basicScore + experienceScore + educationScore + skillsScore + projectsScore) * 100;
    
    return Math.round(totalScore);
  }
}