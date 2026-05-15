/**
 * Smart Post Suggestion Engine
 * Generates personalized post ideas based on user profile, industry, and goals
 */

import { AIProviderService } from './ai-provider.service';

export interface PostSuggestion {
  type: 'linkedin' | 'thought_leadership' | 'storytelling' | 'technical' | 'fallback';
  title: string;
  content: string;
  suggestedHashtags?: string[];
  estimatedEngagement?: 'high' | 'medium' | 'low';
  platform?: string;
}

export interface ProfileCompletionCheck {
  isComplete: boolean;
  missingFields: string[];
  completionPercentage: number;
}

/**
 * Required fields for generating personalized post suggestions
 */
const REQUIRED_FIELDS_FOR_SUGGESTIONS = [
  'industry',
  'title',
  'name'
] as const;

/**
 * Optional fields that enhance suggestion quality
 */
const OPTIONAL_FIELDS_FOR_SUGGESTIONS = [
  'domain',
  'lookingFor',
  'whatIOffer'
] as const;

/**
 * Check if user profile is complete enough for personalized suggestions
 */
export function isProfileCompleteForSuggestions(user: any): ProfileCompletionCheck {
  if (!user) {
    return {
      isComplete: false,
      missingFields: [...REQUIRED_FIELDS_FOR_SUGGESTIONS],
      completionPercentage: 0
    };
  }

  const missingFields: string[] = [];
  let completedFields = 0;
  const totalFields = REQUIRED_FIELDS_FOR_SUGGESTIONS.length + OPTIONAL_FIELDS_FOR_SUGGESTIONS.length;

  // Check required fields
  REQUIRED_FIELDS_FOR_SUGGESTIONS.forEach(field => {
    const value = user[field];
    if (!value || value.toString().trim() === '') {
      missingFields.push(field);
    } else {
      completedFields++;
    }
  });

  // Check optional fields (for better quality)
  OPTIONAL_FIELDS_FOR_SUGGESTIONS.forEach(field => {
    const value = user[field];
    if (value && value.toString().trim() !== '') {
      completedFields++;
    }
  });

  const isComplete = missingFields.length === 0; // All required fields present
  const completionPercentage = Math.round((completedFields / totalFields) * 100);

  return {
    isComplete,
    missingFields,
    completionPercentage
  };
}

/**
 * Generate fallback suggestion when profile is incomplete
 */
function generateFallbackSuggestion(): PostSuggestion {
  return {
    type: 'fallback',
    title: 'Complete Your Profile',
    content: 'Complete your profile to unlock personalized content ideas tailored to your industry, skills, and career goals.',
    platform: 'brandentifier'
  };
}

/**
 * Generate AI-powered post suggestions based on user profile
 */
export async function generatePostSuggestions(
  user: any,
  skills: any[] = [],
  experiences: any[] = [],
  count: number = 3
): Promise<PostSuggestion[]> {
  console.log('[PostSuggestion] Generating post suggestions for user:', user?.id);

  // Check profile completeness
  const profileCheck = isProfileCompleteForSuggestions(user);
  
  if (!profileCheck.isComplete) {
    console.log('[PostSuggestion] Profile incomplete. Returning fallback suggestion.');
    console.log('[PostSuggestion] Missing fields:', profileCheck.missingFields);
    return [generateFallbackSuggestion()];
  }

  try {
    // Build context from user profile
    const skillsList = skills.map(s => s.name).join(', ') || 'Not specified';
    const experienceLevel = experiences.length > 5 ? 'Senior' : 
                           experiences.length > 2 ? 'Mid-level' : 'Entry-level';
    const recentExperience = experiences[0]?.title || 'No experience listed';
    const careerGoal = user.lookingFor || 'Career growth';

    // Construct AI prompt
    const prompt = `
You are a career growth AI assistant specializing in professional content creation.

User Profile:
- Name: ${user.name}
- Industry: ${user.industry}
- Domain: ${user.domain || 'General'}
- Current Role: ${user.title}
- Experience Level: ${experienceLevel}
- Skills: ${skillsList}
- Career Goal: ${careerGoal}
- What I Offer: ${user.whatIOffer || 'Professional services'}

Task: Generate ${count} unique post ideas for this professional. For each post, provide:
1. Type (linkedin/thought_leadership/storytelling/technical)
2. Title (catchy, under 60 characters)
3. Content outline (2-3 sentences describing what to post)
4. 3-5 relevant hashtags

Format your response as JSON array:
[
  {
    "type": "linkedin",
    "title": "Post title here",
    "content": "Brief content outline here",
    "suggestedHashtags": ["Hashtag1", "Hashtag2", "Hashtag3"],
    "estimatedEngagement": "high"
  }
]

Focus on:
- Industry-specific insights
- Career development tips
- Personal brand building
- Professional storytelling
- Technical expertise sharing

Keep suggestions actionable, relevant, and professional.
`;

    console.log('[PostSuggestion] Calling AI provider...');
    const aiResponse = await AIProviderService.generate(prompt);
    
    console.log('[PostSuggestion] AI response received');
    
    // Parse AI response
    try {
      // Extract JSON from response (AI might wrap it in text)
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in AI response');
      }
      
      const suggestions: PostSuggestion[] = JSON.parse(jsonMatch[0]);
      
      // Validate and limit suggestions
      const validSuggestions = suggestions
        .filter(s => s.title && s.content && s.type)
        .slice(0, count)
        .map(s => ({
          ...s,
          platform: 'linkedin' // Default platform
        }));

      if (validSuggestions.length === 0) {
        console.warn('[PostSuggestion] No valid suggestions from AI, returning fallback');
        return [generateFallbackSuggestion()];
      }

      console.log(`[PostSuggestion] Generated ${validSuggestions.length} suggestions successfully`);
      return validSuggestions;

    } catch (parseError) {
      console.error('[PostSuggestion] Failed to parse AI response:', parseError);
      console.log('[PostSuggestion] Raw AI response:', aiResponse);
      
      // Return generic suggestions based on profile
      return generateGenericSuggestions(user, count);
    }

  } catch (error) {
    console.error('[PostSuggestion] Error generating suggestions:', error);
    return [generateFallbackSuggestion()];
  }
}

/**
 * Generate generic suggestions when AI fails
 */
function generateGenericSuggestions(user: any, count: number): PostSuggestion[] {
  const industry = user.industry || 'your industry';
  const title = user.title || 'professional';
  
  const templates: PostSuggestion[] = [
    {
      type: 'linkedin',
      title: `Share Your ${industry} Journey`,
      content: `Write about a key lesson you learned as a ${title}. Share specific examples and actionable insights that resonate with professionals in ${industry}.`,
      suggestedHashtags: ['CareerGrowth', industry.replace(/\s+/g, ''), 'ProfessionalDevelopment'],
      estimatedEngagement: 'high',
      platform: 'linkedin'
    },
    {
      type: 'thought_leadership',
      title: `Industry Trends in ${industry}`,
      content: `Discuss emerging trends in ${industry} and how professionals can adapt. Provide your unique perspective based on your experience as a ${title}.`,
      suggestedHashtags: ['ThoughtLeadership', industry.replace(/\s+/g, ''), 'FutureTrends'],
      estimatedEngagement: 'medium',
      platform: 'linkedin'
    },
    {
      type: 'storytelling',
      title: 'Behind the Scenes of Your Work',
      content: `Share a day-in-the-life story as a ${title}. Make it relatable and authentic. Show the challenges and wins that others in ${industry} can connect with.`,
      suggestedHashtags: ['BehindTheScenes', 'CareerStories', industry.replace(/\s+/g, '')],
      estimatedEngagement: 'high',
      platform: 'linkedin'
    }
  ];

  return templates.slice(0, count);
}

/**
 * Export service instance
 */
export const smartPostSuggestionEngine = {
  generatePostSuggestions,
  isProfileCompleteForSuggestions,
  generateFallbackSuggestion
};
