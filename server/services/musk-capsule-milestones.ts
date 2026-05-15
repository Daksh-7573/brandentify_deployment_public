/**
 * Musk Career Capsule Milestones Service
 * 
 * This service provides AI-powered milestone generation for Career Capsules
 * NOW USING FREE VPS OLLAMA!
 */

import { storage } from '../storage';
import { generateAIResponse } from './ai-provider';

interface MilestoneGenerationRequest {
  userId: number;
  capsuleId: number;
  goalType: string;
  customGoal?: string;
  timeframe: number;
  industry?: string;
  description?: string;
}

interface YearMilestone {
  year: number;
  yearNumber?: number; // For backward compatibility with AI responses
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

interface StructuredMilestone {
  milestone_title: string;
  description: string;
  recommended_actions: string[];
  expected_outcome: string;
  estimated_timeframe: string;
}

// Helper function to check if a goal relates to CEO career path
function isCEORelatedGoal(goalType: string, customGoal?: string, description?: string, industry?: string): boolean {
  // First check for CEO in the custom goal if present
  if (customGoal) {
    const customGoalLower = customGoal.toLowerCase();
    if (
      customGoalLower.includes('ceo') || 
      customGoalLower.includes('chief executive') || 
      customGoalLower.includes('executive officer') ||
      customGoalLower.includes('c-suite')
    ) {
      return true;
    }
  }
  
  // Check for CEO in the description if present
  if (description) {
    const descriptionLower = description.toLowerCase();
    if (
      descriptionLower.includes('ceo') || 
      descriptionLower.includes('chief executive') || 
      descriptionLower.includes('executive officer') ||
      descriptionLower.includes('c-suite')
    ) {
      return true;
    }
  }
  
  // Check for specific goal types that might indicate executive path
  if (goalType === 'position_change' || goalType === 'promotion') {
    // If industry is provided and customGoal is not explicitly about CEO,
    // combine with position_change/promotion goal type to suggest executive path
    if (industry && 
        (industry.toLowerCase().includes('executive') || 
         industry.toLowerCase().includes('leadership') ||
         industry.toLowerCase().includes('management'))) {
      return true;
    }
  }
  
  return false;
}

/**
 * Generate milestone plans for a career capsule using AI
 * 
 * @param options The generation options including user ID, capsule details
 * @returns Generated milestones for each year in the timeframe
 */
export async function generateCapsuleMilestones(options: MilestoneGenerationRequest): Promise<MilestoneGenerationResult> {
  console.log(`[CareerCapsule] Generating milestones for capsule ${options.capsuleId}`);
  
  try {
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

    // Format a strict structured prompt for milestone generation
    const yearsOfExperience = experiences.length;
    const goalText = options.goalType === 'custom'
      ? (options.customGoal || 'custom career goal')
      : options.goalType.replace('_', ' ');

    const aiContext = `Create a career milestone roadmap for a professional.

User information:
Industry: ${options.industry || user.industry || 'Not specified'}
Domain: ${user.domain || 'Not specified'}
Experience: ${yearsOfExperience} years
Goal: ${goalText}
Current Role: ${user.title || 'Not specified'}
Goal details: ${options.description || 'Not provided'}
Top skills: ${skills.slice(0, 8).map((skill: any) => (typeof skill === 'string' ? skill : skill.name)).join(', ') || 'Not provided'}

Generate 5 milestones.

Each milestone must include:
- milestone_title
- description
- recommended_actions
- expected_outcome
- estimated_timeframe

Requirements:
- recommended_actions must be an array of exactly 3 concise, actionable items.
- Be specific to the user's industry and role.
- Use realistic and measurable outcomes.
- Avoid generic advice.

Return JSON format only as an array of milestone objects.
`;

    // Using the helper function that was moved outside of the generateCapsuleMilestones function to check if a goal relates to CEO career path

    // Check if this is a CEO career path goal
    let enhancedContext = aiContext;
    const isCEOCareerPath = isCEORelatedGoal(
      options.goalType, 
      options.customGoal, 
      options.description,
      options.industry
    );
    
    if (isCEOCareerPath) {
      console.log(`[Musk AI] Detected CEO career path goal`);
      // Additional logging for diagnostic purposes
      console.log(`[Musk AI] Goal Details - Type: ${options.goalType}, Custom: ${options.customGoal || 'N/A'}, Industry: ${options.industry || 'N/A'}`);
      
      
      // Create enhanced AI context with CEO-specific guidance
      enhancedContext = aiContext + `
SPECIFIC CEO SKILLS DEVELOPMENT FOCUS:
I need you to create a personalized roadmap focusing on these five key CEO skill areas:

1. Strategic Business Leadership
   - Strategic Planning & Vision Setting skills with courses like Harvard's "Strategy Execution"
   - Financial Acumen development through resources like Wharton's "Financial Accounting"

2. Organizational Leadership
   - Team Building & Management using frameworks from books like "Team of Teams" by General Stanley McChrystal
   - Change Management methodologies from resources like John Kotter's "Leading Change"

3. Advanced Decision-Making
   - Data-Driven Leadership approaches from courses like Columbia's "Data Science for Business"
   - Risk Assessment frameworks similar to COSO's Enterprise Risk Management

4. Communication & Influence
   - Executive Communication tactics from programs like "Executive Presence" by Bates Communications
   - Stakeholder Management using principles from "Influence" by Robert Cialdini

5. Industry-Specific Knowledge
   - Market & Technology Trends from sources like McKinsey Global Institute
   - Regulatory Knowledge from resources like Harvard Law School's "Corporate Governance" program

For each year's milestones, include specific courses, books, and development activities from these categories.
`;
    }

    const systemPrompt = isCEOCareerPath
      ? "You are a career strategy expert focused on executive growth plans. Return only strict JSON."
      : "You are a career strategy expert. Return only strict JSON.";

    const fullPrompt = `${systemPrompt}\n\n${enhancedContext}`;

    const parsedMilestones = await generateValidatedMilestones(fullPrompt);
    const years = normalizeStructuredMilestones(parsedMilestones, options.timeframe || 3);

    console.log("[CareerCapsule] Milestones generated successfully");
    return {
      success: true,
      message: "Successfully generated career milestones",
      years,
    };
  } catch (error) {
    console.error("Error generating career milestones:", error);
    const fallbackYears = getTemplateMilestones(options, options.timeframe || 3);
    return {
      success: true,
      message: "Using fallback template milestones",
      years: fallbackYears,
    };
  }
}

async function generateValidatedMilestones(prompt: string): Promise<StructuredMilestone[]> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await generateAIResponse(prompt);
      const parsed = parseStructuredMilestones(response);
      validateStructuredMilestones(parsed);
      return parsed;
    } catch (error) {
      lastError = error;
      console.warn(`[CareerCapsule] Milestone parsing failed on attempt ${attempt}`, error);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Milestone generation failed after retry");
}

function parseStructuredMilestones(raw: string): StructuredMilestone[] {
  if (!raw || !raw.trim()) {
    throw new Error("AI returned empty milestone output");
  }

  const blockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = blockMatch ? blockMatch[1].trim() : raw.trim();

  const arrayMatch = candidate.match(/\[[\s\S]*\]/);
  if (!arrayMatch) {
    throw new Error("No JSON array found in AI output");
  }

  const parsed = JSON.parse(arrayMatch[0]);
  if (!Array.isArray(parsed)) {
    throw new Error("Milestones JSON is not an array");
  }

  return parsed as StructuredMilestone[];
}

function validateStructuredMilestones(milestones: StructuredMilestone[]) {
  if (!milestones.length) {
    throw new Error("Milestones array is empty");
  }

  milestones.forEach((milestone, idx) => {
    if (!milestone.milestone_title || !milestone.description || !milestone.expected_outcome || !milestone.estimated_timeframe) {
      throw new Error(`Milestone ${idx + 1} missing required fields`);
    }

    if (!Array.isArray(milestone.recommended_actions) || milestone.recommended_actions.length === 0) {
      throw new Error(`Milestone ${idx + 1} has invalid recommended_actions`);
    }
  });
}

function normalizeStructuredMilestones(
  milestones: StructuredMilestone[],
  timeframe: number
): YearMilestone[] {
  const maxYears = Math.max(1, Math.min(timeframe, milestones.length));
  const now = new Date();

  return milestones.slice(0, maxYears).map((milestone, index) => {
    const yearNumber = index + 1;
    const dueDate = new Date(now);
    dueDate.setFullYear(now.getFullYear() + yearNumber);
    dueDate.setMonth(5, 15);

    return {
      year: yearNumber,
      title: `Year ${yearNumber}: ${milestone.milestone_title}`,
      description: milestone.description,
      milestone: milestone.expected_outcome,
      tasks: milestone.recommended_actions.slice(0, 5).map((action, taskIndex) => ({
        title: action,
        description: `${action}. Target timeframe: ${milestone.estimated_timeframe}`,
        dueDate: dueDate.toISOString().split('T')[0],
        priority: taskIndex === 0 ? 1 : 2,
      })),
    };
  });
}

function getTemplateMilestones(options: MilestoneGenerationRequest, timeframe: number): YearMilestone[] {
  const goalLabel = options.customGoal || options.goalType.replace('_', ' ');
  const safeTimeframe = Math.max(1, timeframe);

  return Array.from({ length: safeTimeframe }, (_, idx) => {
    const year = idx + 1;
    const baseDate = new Date();
    baseDate.setFullYear(baseDate.getFullYear() + year);

    return {
      year,
      title: `Year ${year}: Progress toward ${goalLabel}`,
      description: `Build measurable progress toward ${goalLabel} with role-specific outcomes in ${options.industry || 'your industry'}.`,
      milestone: `Complete major yearly checkpoint for ${goalLabel}`,
      tasks: [
        {
          title: "Define measurable quarterly targets",
          description: "Document 3 measurable KPIs and track progress monthly.",
          dueDate: new Date(baseDate.getFullYear(), 2, 15).toISOString().split('T')[0],
          priority: 1,
        },
        {
          title: "Execute one portfolio-ready project",
          description: "Deliver one outcome with documented impact and lessons learned.",
          dueDate: new Date(baseDate.getFullYear(), 6, 15).toISOString().split('T')[0],
          priority: 2,
        },
        {
          title: "Expand strategic network",
          description: "Build 5 high-quality professional connections aligned with this goal.",
          dueDate: new Date(baseDate.getFullYear(), 10, 15).toISOString().split('T')[0],
          priority: 2,
        },
      ],
    };
  });
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
      console.error("[Milestone Save] Capsule not found:", capsuleId);
      return false;
    }

    const timeframe = capsule.timeframe || 3; // Default to 3 years if not specified
    console.log(`[Milestone Save] Starting to save milestones for capsule ${capsuleId}, found ${years.length} years from AI, timeframe=${timeframe}`);
    console.log(`[Milestone Save] Capsule details: ${JSON.stringify(capsule)}`);

    // Ensure we have the correct number of years based on the timeframe
    // If AI generated too few, we'll fill in the rest with defaults
    // If AI generated too many, we'll only use the first 'timeframe' number of years
    const yearsToProcess = years.slice(0, timeframe);
    
    // If AI didn't generate enough years, create placeholders for the remaining years
    if (yearsToProcess.length < timeframe) {
      console.log(`[Milestone Save] AI generated only ${yearsToProcess.length} years, but timeframe is ${timeframe}. Creating placeholders for the remaining years.`);
      
      for (let i = yearsToProcess.length + 1; i <= timeframe; i++) {
        yearsToProcess.push({
          year: i,
          title: `Year ${i}${i === 1 ? " - Foundation" : i === timeframe ? " - Achievement" : " - Development"}`,
          description: `Focus on ${i === 1 ? "building foundational skills and knowledge" : 
                    i === timeframe ? "reaching your target goal and establishing yourself" : 
                    "developing advanced expertise and expanding your network"}`,
          milestone: `${i === 1 ? "Foundation Building" : i === timeframe ? "Goal Achievement" : "Skills Development"} - Year ${i}`,
          tasks: [
            {
              title: `${i === 1 ? "Research" : i === timeframe ? "Achieve" : "Advance"} in ${capsule.title || 'Your Career Path'}`,
              description: `${i === 1 ? 
                "Conduct thorough research on requirements and pathways" : 
                i === timeframe ? 
                "Accomplish your primary goal and celebrate your achievement" : 
                "Continue building on previous progress and expanding your expertise"}`,
              priority: 1,
              dueDate: new Date(new Date().setFullYear(new Date().getFullYear() + i, 5, 30)).toISOString().split('T')[0]
            },
            {
              title: `${i === 1 ? "Learn" : i === timeframe ? "Lead" : "Master"} Key Skills`,
              description: `${i === 1 ? 
                "Identify and begin learning essential skills for your goal" : 
                i === timeframe ? 
                "Demonstrate leadership and mentor others in your field" : 
                "Deepen your expertise in specialized areas relevant to your goal"}`,
              priority: 1,
              dueDate: new Date(new Date().setFullYear(new Date().getFullYear() + i, 2, 15)).toISOString().split('T')[0]
            }
          ]
        });
      }
    }
    
    // Now ensure years are properly numbered from 1 to timeframe in sequential order
    yearsToProcess.forEach((yearData, index) => {
      // Set the correct year number based on index (1-based)
      yearData.year = index + 1;
    });
    
    console.log(`[Milestone Save] Final milestone distribution: ${timeframe} milestones to be created`);

    // Create years and tasks
    for (const yearData of yearsToProcess) {
      console.log(`[Milestone Save] Creating year for capsule ${capsuleId}: year=${yearData.year}, title=${yearData.title}`);
      
      // Create the year
      const yearRecord = await storage.createCapsuleYear({
        capsuleId,
        year: yearData.year, // Now using the corrected year number
        title: yearData.title,
        description: yearData.description,
        milestone: yearData.milestone,
        progress: 0
      });
      
      console.log(`[Milestone Save] Created year record: ${JSON.stringify(yearRecord)}`);

      // Create tasks for this year
      if (yearRecord && yearData.tasks && yearData.tasks.length > 0) {
        console.log(`[Milestone Save] Creating ${yearData.tasks.length} tasks for year ${yearRecord.id}`);
        
        for (const taskData of yearData.tasks) {
          console.log(`[Milestone Save] Creating task: ${taskData.title} for year ${yearRecord.id}`);
          
          const isCEOPath = capsule.goalType === 'position_change' && capsule.customGoal?.toLowerCase().includes('ceo');
          console.log(`[Milestone Save] Is CEO path: ${isCEOPath}, goalType=${capsule.goalType}, customGoal=${capsule.customGoal}`);
          
          // Calculate proper due date - either use the provided date but update year, or create new date
          let dueDate = null;
          if (taskData.dueDate) {
            // Parse the original due date
            const originalDate = new Date(taskData.dueDate);
            
            // Calculate appropriate year based on current year and year number
            const currentYear = new Date().getFullYear();
            const targetYear = currentYear + yearData.year;
            
            // Create new date with corrected year
            const updatedDate = new Date(originalDate);
            updatedDate.setFullYear(targetYear);
            dueDate = updatedDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
          }
          
          const task = await storage.createCapsuleTask({
            yearId: yearRecord.id,
            title: taskData.title,
            description: taskData.description + 
                         (dueDate ? `\n\nDue Date: ${dueDate}` : '') + 
                         `\n\nPriority: High` +
                         (isCEOPath ? 
                           `\n\nCEO SKILL AREA: This task develops critical executive capabilities aligned with industry best practices.` : "") +
                         "\n\nTask includes specific resources and action steps to ensure clear direction and accountability.",
            isCompleted: false,
            dueDate: dueDate
          });
          
          console.log(`[Milestone Save] Created task: ${JSON.stringify(task)}`);
        }
      } else {
        console.log(`[Milestone Save] No tasks to create for year ${yearRecord?.id || 'undefined'}`);
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