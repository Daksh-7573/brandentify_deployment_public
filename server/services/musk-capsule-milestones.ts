/**
 * Musk Career Capsule Milestones Service
 * 
 * This service provides AI-powered milestone generation for Career Capsules
 * leveraging either OpenAI or Anthropic's capabilities.
 */

import { OpenAI } from "openai";
import Anthropic from '@anthropic-ai/sdk';
import { storage } from '../storage';

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
  year: number;
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
  console.log(`[Musk AI] Starting milestone generation for career capsule ${options.capsuleId}`);
  console.log(`[Musk AI] Options:`, JSON.stringify(options));
  console.log(`[Musk AI] Using model: ${options.useModel || 'openai'}`);
  
  try {
    // Check that API keys are configured
    const apiKey = options.useModel === 'anthropic' ? process.env.ANTHROPIC_API_KEY : process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error(`[Musk AI] Missing API key for ${options.useModel || 'openai'}`);
      return {
        success: false,
        message: `Missing API key for ${options.useModel || 'openai'}`
      };
    }
    
    // Get user profile data
    console.log(`[Musk AI] Fetching user profile for ID: ${options.userId}`);
    const user = await storage.getUser(options.userId);
    if (!user) {
      console.error(`[Musk AI] User not found with ID: ${options.userId}`);
      return {
        success: false,
        message: "User not found"
      };
    }
    console.log(`[Musk AI] Found user: ${user.name || user.username}`);

    // Get user's work experiences, skills, education, etc.
    console.log(`[Musk AI] Fetching user career data...`);
    const experiences = await storage.getWorkExperiencesByUserId(options.userId);
    const skills = await storage.getSkillsByUserId(options.userId);
    const education = await storage.getEducationsByUserId(options.userId);
    console.log(`[Musk AI] Career data retrieved: ${experiences.length} experiences, ${skills.length} skills, ${education.length} education entries`);

    // Format the prompt for the AI
    const aiContext = `
You are Musk, an elite career development AI coach specialized in creating hyper-personalized, industry-specific career progression plans.
Your task is to create a detailed, actionable ${options.timeframe}-year career roadmap with specific milestones and tasks that feels custom-crafted for this unique professional.

USER CAREER GOAL: 
${options.goalType === 'custom' ? options.customGoal : options.goalType.replace('_', ' ')}

GOAL DETAILS:
${options.description || 'No additional details provided'}

GOAL TIMELINE:
${options.timeframe} years

TARGET INDUSTRY:
${options.industry || 'Not specified'}

CAREER GOAL TYPE ANALYSIS:
${options.goalType === 'position_change' ? 
  `This user wants to change positions, which typically requires:
   - Identifying transferable skills and experience gaps
   - Building networks in the target position's community
   - Gaining relevant certifications and qualifications
   - Creating tangible work examples for the new position
   - Developing a compelling narrative around the transition` 
  : options.goalType === 'skill_acquisition' ?
  `This user wants to acquire new skills, which typically requires:
   - Identifying the most valuable skills within their industry/domain
   - Finding optimal learning resources and pathways
   - Building practical application opportunities for new skills
   - Getting mentorship from practitioners with those skills
   - Creating demonstration projects to showcase new abilities`
  : options.goalType === 'promotion' ?
  `This user is seeking a promotion, which typically requires:
   - Understanding the competencies needed at the next level
   - Demonstrating leadership and strategic thinking
   - Building visibility with decision makers
   - Taking on projects that demonstrate readiness for more responsibility
   - Quantifying their impact and value to the organization`
  : options.goalType === 'industry_switch' ?
  `This user wants to switch industries, which typically requires:
   - Research and networking in the target industry
   - Identifying transferable skills and addressing gaps
   - Understanding the target industry's culture and expectations
   - Building experience through side projects, volunteering, or part-time work
   - Developing industry-specific knowledge and vocabulary`
  : options.goalType === 'entrepreneurship' ?
  `This user is pursuing entrepreneurship, which typically requires:
   - Market research and business planning
   - Building MVP (minimum viable product) and iterating
   - Networking with potential investors/partners
   - Developing sales, marketing, and operational skills
   - Creating legal and financial frameworks`
  : options.goalType === 'relocation' ?
  `This user is planning career relocation, which typically requires:
   - Understanding job market differences in the target location
   - Building a remote network in the new location
   - Adapting skills to regional requirements
   - Understanding visa/work permit requirements (if international)
   - Planning the logistics of job searching while relocating`
  : options.goalType === 'education' ?
  `This user is pursuing further education, which typically requires:
   - Researching programs aligned with career goals
   - Preparing applications and securing recommendations
   - Planning financial resources and time management
   - Balancing current work with educational commitments
   - Leveraging new knowledge in career advancement`
  : options.goalType === 'certification' ?
  `This user is pursuing professional certification, which typically requires:
   - Selecting the most valuable certificates for their goals
   - Structured study and preparation
   - Practical application of certification material
   - Test preparation strategies
   - Leveraging the certification for career advancement`
  : `This user has a custom career goal that will require personalized milestones and tasks.`
}

INDUSTRY-SPECIFIC ANALYSIS:
${options.industry ? 
  `For the ${options.industry} industry, important considerations include:
   - Current technology trends: AI/ML adoption, automation, digital transformation
   - Regulatory changes impacting roles and responsibilities
   - Emerging job titles and roles in this sector
   - Industry-specific certifications gaining recognition
   - Skills gaps reported by industry leaders
   - Networking opportunities specific to this field`
  : 'Industry not specified - provide general career progression advice.'
}

CURRENT MARKET TRENDS TO INCORPORATE:
- Leadership skills emphasizing emotional intelligence and remote/hybrid team management
- Rising demand for data literacy and analytical decision-making across all roles
- Increasing importance of cross-functional collaboration and communication
- Growth of project-based work requiring adaptability and self-management
- Emphasis on continuous learning and skill development as core competency
${options.industry ? `- Specific ${options.industry} industry trends including emerging technologies and shifting job requirements` : ''}

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
Create a hyper-personalized, action-oriented ${options.timeframe}-year career development plan with specific milestone tasks that directly address the user's goals and incorporate current industry realities.

For each year (1 through ${options.timeframe}), provide:
1. An inspiring, specific title that captures the focus for that year
2. A detailed description with specific outcomes expected that year, including:
   - Skills to be mastered
   - Knowledge to be acquired
   - Professional relationships to be built
   - Tangible achievements to be accomplished
3. A significant milestone achievement that represents major progress
4. 3-5 highly specific tasks with actionable descriptions and strategically timed due dates that:
   - Connect directly to the user's current skills and experience level
   - Address specific gaps between their current state and goal state
   - Include specific companies, technologies, certifications by name when relevant
   - Incorporate specific networking events, courses, or resources when possible
   - Provide clear next actions rather than vague directions

Format your response as a JSON array with the following structure:
[
  {
    "year": 1,
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

IMPORTANT GUIDELINES:
1. Be extremely specific and detailed in every element
2. Use a confident, motivational tone appropriate for career coaching
3. Include highly specific skills, technologies, and certifications relevant to the goal/industry
4. Suggest actual resources (books, courses, events) where appropriate
5. Create milestones that feel significant but achievable 
6. Tasks should be specific enough that the user knows exactly what to do next
7. Due dates should consider logical sequencing and realistic timeframes
8. Priority is a number from 1-3 (1=high priority, 2=medium, 3=low)
9. Your response must be ONLY the requested JSON format (no other text)

Remember, your mission is to create a career roadmap so personalized and actionable that the user feels it was custom-created just for them.
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
      // Log the raw AI response for debugging
      console.log(`[Musk AI] Raw AI response (truncated): ${aiResponse?.substring(0, 200)}...`);
      
      // For OpenAI, the response is already formatted as JSON
      if (options.useModel === 'openai') {
        const parsedResponse = JSON.parse(aiResponse || "{}");
        console.log(`[Musk AI] Parsed OpenAI response structure: ${JSON.stringify(Object.keys(parsedResponse))}`);
        
        // Handle different response formats from OpenAI
        if (Array.isArray(parsedResponse)) {
          milestones = parsedResponse;
        } else if (parsedResponse.years && Array.isArray(parsedResponse.years)) {
          milestones = parsedResponse.years;
        } else if ((parsedResponse.year || parsedResponse.yearNumber) && parsedResponse.title && parsedResponse.tasks) {
          // The AI returned a single year object instead of an array
          console.log('[Musk AI] Detected single year object, converting to array');
          milestones = [parsedResponse];
        } else {
          milestones = parsedResponse;
        }
        
        console.log(`[Musk AI] Extracted milestones type: ${Array.isArray(milestones) ? 'Array' : typeof milestones}`);
      } else {
        // For Anthropic, extract the JSON part from the text response
        const jsonMatch = aiResponse?.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          milestones = JSON.parse(jsonMatch[0]);
        } else {
          // Try to extract a single object if array not found
          const jsonObject = aiResponse?.match(/\{[\s\S]*\}/);
          if (jsonObject) {
            const parsedObject = JSON.parse(jsonObject[0]);
            if ((parsedObject.year || parsedObject.yearNumber) && parsedObject.title && parsedObject.tasks) {
              milestones = [parsedObject];
            } else {
              throw new Error("Invalid JSON object format from Anthropic response");
            }
          } else {
            throw new Error("Could not extract JSON from Anthropic response");
          }
        }
      }

      // Validate the milestones structure
      if (!Array.isArray(milestones)) {
        console.log(`[Musk AI] Milestone validation failed. Type: ${typeof milestones}, Value: ${JSON.stringify(milestones).substring(0, 200)}...`);
        return {
          success: false,
          message: "Invalid milestone format received from AI"
        };
      }
      
      // Additional validation for empty array
      if (milestones.length === 0) {
        console.log('[Musk AI] Milestone validation failed: Empty array');
        return {
          success: false,
          message: "Empty milestone array received from AI"
        };
      }
      
      // Log the successful milestone structure
      console.log(`[Musk AI] Successfully extracted ${milestones.length} milestones`);
      

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
        year: yearData.year || yearData.yearNumber || 1, // Support both field names
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
            description: taskData.description + (taskData.dueDate ? `\nDue: ${taskData.dueDate}` : '') + 
                         (taskData.priority ? `\nPriority: ${taskData.priority}` : ''), // Add due date and priority to description
            isCompleted: false
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