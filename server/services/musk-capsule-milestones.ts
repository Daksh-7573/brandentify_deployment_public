/**
 * Musk Career Capsule Milestones Service
 * 
 * This service provides AI-powered milestone generation for Career Capsules
 * leveraging either OpenAI or Anthropic's capabilities.
 */

import { OpenAI } from "openai";
import Anthropic from '@anthropic-ai/sdk';
import { storage } from '../storage';
import { CareerCapsule, CapsuleYear, CapsuleTask } from '@shared/schema';

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface MilestoneGenerationRequest {
  userId: number;
  capsuleId: number;
  goalType: string;
  customGoal?: string;
  timeframe: number;
  industry?: string;
  description?: string;
  useModel?: 'openai' | 'anthropic';
}

interface YearMilestone {
  yearNumber: number;
  title: string;
  description: string;
  milestone: string;
  tasks: {
    title: string;
    description: string;
    dueDate?: string; // Optional due date in ISO format
    priority: number; // 1-3 for priority levels
  }[];
}

interface MilestoneGenerationResult {
  success: boolean;
  message: string;
  years?: YearMilestone[];
}

/**
 * Generate milestone plans for a career capsule using AI
 * 
 * @param options The generation options including user ID, capsule details
 * @returns Generated milestones for each year in the timeframe
 */
export async function generateCapsuleMilestones(options: MilestoneGenerationRequest): Promise<MilestoneGenerationResult> {
  try {
    // Get user profile data
    const user = await storage.getUser(options.userId);
    if (!user) {
      return {
        success: false,
        message: "User not found"
      };
    }

    // Get user's work experiences, skills, education, etc.
    const experiences = await storage.getUserExperiences(options.userId);
    const skills = await storage.getUserSkills(options.userId);
    const education = await storage.getUserEducation(options.userId);

    // Format the prompt for the AI
    const aiContext = `
You are Musk, a sophisticated career development AI assistant specialized in creating detailed career progression plans.
Your task is to analyze the user's specific career goals, timeline, profile data, and current market trends to generate a ${options.timeframe}-year career plan with personalized milestone tasks.

USER CAREER GOAL: 
${options.goalType === 'custom' ? options.customGoal : options.goalType.replace('_', ' ')}

GOAL DETAILS:
${options.description || 'No additional details provided'}

GOAL TIMELINE:
${options.timeframe} years

TARGET INDUSTRY:
${options.industry || 'Not specified'}

CURRENT MARKET TRENDS TO ANALYZE:
- Rising skill demands in ${options.industry || 'the specified'} industry
- Emerging technologies and tools relevant to the user's career path
- Changing job market requirements and expectations
- Industry-specific certification or qualification trends

USER PROFILE:
- Name: ${user.name}
- Current title: ${user.title || 'Not specified'}
- Industry: ${user.industry || 'Not specified'}
- Domain: ${user.domain || 'Not specified'}
- Location: ${user.location || 'Not specified'}

WORK EXPERIENCE:
${experiences.length > 0 ? 
  experiences.map(exp => 
    `- ${exp.title} at ${exp.company} (${exp.startDate.substring(0, 4)} - ${exp.endDate ? exp.endDate.substring(0, 4) : 'Present'})
     Industry: ${exp.industry || 'Not specified'}
     Domain: ${exp.domain || 'Not specified'}
     Key responsibilities: ${exp.keyResponsibilities || 'Not specified'}`
  ).join('\n') : 
  'No work experience data available'}

SKILLS:
${skills.length > 0 ? 
  skills.map(skill => 
    typeof skill === 'string' ? skill : skill.name
  ).join(', ') : 
  'No skills data available'}

EDUCATION:
${education.length > 0 ? 
  education.map(edu => 
    `- ${edu.degree} in ${edu.fieldOfStudy || 'Not specified'} from ${edu.institution} (${edu.startDate.substring(0, 4)} - ${edu.endDate ? edu.endDate.substring(0, 4) : 'Present'})`
  ).join('\n') : 
  'No education data available'}

TASK:
Create a detailed ${options.timeframe}-year career development plan with personalized milestone tasks aligned with the user's goals and market demands.
For each year (1 through ${options.timeframe}), provide:
1. A title for the year
2. A detailed description of what should be accomplished during that year
3. A specific strategic milestone/achievement that reflects progress toward the user's goals
4. 3-5 specific milestone tasks with clear descriptions and suggested due dates (in YYYY-MM-DD format) that:
   - Reflect analysis of the user's profile, skills, and experiences
   - Consider current market trends and industry demands
   - Build strategically toward the user's stated career goals
   - Include skill development, networking, certifications, or other relevant activities

Format your response as a JSON array with the following structure:
[
  {
    "yearNumber": 1,
    "title": "Year 1 Title",
    "description": "Description of Year 1",
    "milestone": "Key milestone for Year 1",
    "tasks": [
      {
        "title": "Task 1 Title",
        "description": "Task 1 Description",
        "dueDate": "YYYY-MM-DD",
        "priority": 1
      },
      ...more tasks
    ]
  },
  ...more years
]

Please ensure that:
1. The plan is achievable and realistic
2. Milestones follow a logical progression
3. Each year builds upon previous accomplishments
4. Tasks have specific, actionable steps
5. The entire plan leads effectively to the user's stated career goal
6. Due dates are reasonable and properly formatted (YYYY-MM-DD)
7. Priority is a number from 1-3 (1=low, 2=medium, 3=high)
8. Your response is ONLY the requested JSON format (no other text)
`;

    // Get AI response based on selected model
    let aiResponse;
    
    if (options.useModel === 'anthropic') {
      // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
      const response = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 4000,
        messages: [{ role: 'user', content: aiContext }],
        system: "You are Musk, a sophisticated career planning assistant that generates personalized milestone tasks by analyzing goals, profile data, and market trends. Return only valid JSON with no additional text or explanation."
      });
      
      aiResponse = response.content[0].text;
    } else {
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "You are Musk, a sophisticated career planning assistant that generates personalized milestone tasks by analyzing goals, profile data, and market trends. Return only valid JSON with no additional text or explanation." 
          },
          { 
            role: "user", 
            content: aiContext 
          }
        ],
        max_tokens: 4000,
        response_format: { type: "json_object" }
      });
      
      aiResponse = completion.choices[0].message.content;
    }

    // Parse the response as JSON
    let milestones;
    try {
      // For OpenAI, the response is already formatted as JSON
      if (options.useModel === 'openai') {
        const parsedResponse = JSON.parse(aiResponse || "{}");
        milestones = parsedResponse.years || parsedResponse;
      } else {
        // For Anthropic, extract the JSON part from the text response
        const jsonMatch = aiResponse?.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          milestones = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not extract JSON from Anthropic response");
        }
      }

      // Validate the milestones structure
      if (!Array.isArray(milestones)) {
        return {
          success: false,
          message: "Invalid milestone format received from AI"
        };
      }

      return {
        success: true,
        message: "Successfully generated career milestones",
        years: milestones
      };
    } catch (error) {
      console.error("Error parsing AI response:", error);
      return {
        success: false,
        message: "Failed to parse AI-generated milestones"
      };
    }
  } catch (error) {
    console.error("Error generating career milestones:", error);
    return {
      success: false,
      message: "Failed to generate career milestones"
    };
  }
}

/**
 * Save AI-generated milestones to the database
 * 
 * @param capsuleId The ID of the career capsule
 * @param years The generated year milestones
 * @returns Whether the operation was successful
 */
export async function saveCapsuleMilestones(capsuleId: number, years: YearMilestone[]): Promise<boolean> {
  try {
    // Check if the capsule exists
    const capsule = await storage.getCareerCapsuleById(capsuleId);
    if (!capsule) {
      console.error("Capsule not found:", capsuleId);
      return false;
    }

    // Create years and tasks
    for (const yearData of years) {
      // Create the year
      const yearRecord = await storage.createCapsuleYear({
        capsuleId,
        yearNumber: yearData.yearNumber,
        title: yearData.title,
        description: yearData.description,
        milestone: yearData.milestone,
        progress: 0
      });

      // Create tasks for this year
      if (yearRecord && yearData.tasks && yearData.tasks.length > 0) {
        for (const taskData of yearData.tasks) {
          await storage.createCapsuleTask({
            yearId: yearRecord.id,
            title: taskData.title,
            description: taskData.description,
            isCompleted: false,
            dueDate: taskData.dueDate || null,
            priority: taskData.priority || 1,
            difficulty: 1 // Default difficulty
          });
        }
      }
    }

    // Update the capsule to mark it as Musk-generated
    await storage.updateCareerCapsule(capsuleId, {
      isMuskGenerated: true,
      overallProgress: 0
    });

    return true;
  } catch (error) {
    console.error("Error saving capsule milestones:", error);
    return false;
  }
}