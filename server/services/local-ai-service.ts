/**
 * Local AI Service
 * Replaces OpenAI with cost-effective local AI models
 * Supports multiple backends: Ollama, LM Studio, Hugging Face Transformers
 */

import fetch from 'node-fetch';

interface AIResponse {
  content: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface LocalAIConfig {
  provider: 'ollama' | 'lmstudio' | 'huggingface' | 'openai';
  baseUrl: string;
  model: string;
  apiKey?: string;
  maxTokens: number;
  temperature: number;
}

export class LocalAIService {
  private config: LocalAIConfig;
  private fallbackToOpenAI: boolean;

  constructor() {
    this.config = {
      provider: (process.env.AI_PROVIDER as any) || 'ollama',
      baseUrl: process.env.AI_BASE_URL || 'http://localhost:11434',
      model: process.env.AI_MODEL || 'llama3.2:3b',
      apiKey: process.env.AI_API_KEY,
      maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2000'),
      temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7')
    };
    
    // Enable fallback to OpenAI for reliability when Ollama fails
    // Note: This only triggers if Ollama is down - keeps costs minimal
    this.fallbackToOpenAI = process.env.AI_FALLBACK_OPENAI !== 'false';
    
    console.log(`[Local AI] Initialized with provider: ${this.config.provider}, model: ${this.config.model}`);
  }

  /**
   * Generate career advice using local AI models
   */
  async generateCareerAdvice(userProfile: {
    user: any;
    workExperiences: any[];
    skills: any[];
    educations: any[];
    adviceType: string;
    customAdviceText?: string;
  }): Promise<string> {
    const prompt = this.buildCareerAdvicePrompt(userProfile);
    return this.generateCompletion(prompt, 'career-advice');
  }

  /**
   * Analyze resume using local AI models
   */
  async analyzeResume(resumeText: string): Promise<string> {
    const prompt = this.buildResumeAnalysisPrompt(resumeText);
    return this.generateCompletion(prompt, 'resume-analysis');
  }

  /**
   * Generate hashtag suggestions using local AI models
   */
  async suggestHashtags(context: {
    industry?: string;
    domain?: string;
    content?: string;
    platform?: string;
  }): Promise<string[]> {
    const prompt = this.buildHashtagPrompt(context);
    const response = await this.generateCompletion(prompt, 'hashtag-suggestions');
    
    // Extract hashtags from response
    const hashtags = response.match(/#\w+/g) || [];
    return hashtags.slice(0, 10); // Return top 10 hashtags
  }

  /**
   * Generate news content for personalized Musk Pulses (FREE with Ollama)
   */
  async generateNewsContent(prompt: string): Promise<string> {
    return this.generateCompletion(prompt, 'news-pulse-generation');
  }

  /**
   * Generate personalized quest using AI (career or social) with detailed subtasks
   */
  async generateQuest(userContext: {
    name: string;
    title: string;
    industry: string;
    domain: string;
    location: string;
    primaryAudience: string;
    secondaryAudience?: string;
    brandGoals: string[];
    skills: string[];
    questType: 'career' | 'social';
    platform?: string;
  }): Promise<{
    title: string;
    description: string;
    muskTip: string;
    subtasks?: Array<{
      title: string;
      description: string;
      estimatedMinutes: number;
      platformActivity?: string;
      platformDetails?: any;
    }>;
  }> {
    const prompt = this.buildQuestPrompt(userContext);
    const response = await this.generateCompletion(prompt, `${userContext.questType}-quest-generation`);
    
    // Parse the AI response to extract structured quest data including subtasks
    return this.parseQuestResponse(response);
  }

  /**
   * Generate general AI completion
   */
  private async generateCompletion(prompt: string, taskType: string): Promise<string> {
    try {
      console.log(`[Local AI] Generating ${taskType} with ${this.config.provider}`);
      
      switch (this.config.provider) {
        case 'ollama':
          return await this.generateWithOllama(prompt);
        case 'lmstudio':
          return await this.generateWithLMStudio(prompt);
        case 'huggingface':
          return await this.generateWithHuggingFace(prompt);
        case 'openai':
          return await this.generateWithOpenAI(prompt);
        default:
          throw new Error(`Unsupported AI provider: ${this.config.provider}`);
      }
    } catch (error) {
      console.error(`[Local AI] Error with ${this.config.provider}:`, error);
      
      if (this.fallbackToOpenAI && this.config.provider !== 'openai') {
        console.log('[Local AI] Falling back to OpenAI');
        return await this.generateWithOpenAI(prompt);
      }
      
      throw error;
    }
  }

  /**
   * Generate completion using Ollama (recommended for local deployment)
   */
  private async generateWithOllama(prompt: string): Promise<string> {
    const response = await fetch(`${this.config.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: this.config.temperature,
          num_predict: this.config.maxTokens
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    return data.response || 'No response generated';
  }

  /**
   * Generate completion using LM Studio
   */
  private async generateWithLMStudio(prompt: string): Promise<string> {
    const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature
      })
    });

    if (!response.ok) {
      throw new Error(`LM Studio API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    return data.choices[0]?.message?.content || 'No response generated';
  }

  /**
   * Generate completion using Hugging Face Inference API
   */
  private async generateWithHuggingFace(prompt: string): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('Hugging Face API key is required');
    }

    const response = await fetch(`https://api-inference.huggingface.co/models/${this.config.model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          return_full_text: false
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    return data[0]?.generated_text || 'No response generated';
  }

  /**
   * Fallback to OpenAI when local models are unavailable
   */
  private async generateWithOpenAI(prompt: string): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is required for fallback');
    }

    const { OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Use cheaper model for fallback
      messages: [{ role: 'user', content: prompt }],
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature
    });

    return response.choices[0]?.message?.content || 'No response generated';
  }

  /**
   * Build career advice prompt
   */
  private buildCareerAdvicePrompt(userProfile: {
    user: any;
    workExperiences: any[];
    skills: any[];
    educations: any[];
    adviceType: string;
    customAdviceText?: string;
  }): string {
    const userName = userProfile.user?.name || 'User';
    const userTitle = userProfile.user?.title || 'Professional';
    const userIndustry = userProfile.user?.industry || 'Various industries';

    const workExp = userProfile.workExperiences?.map(exp => 
      `- ${exp.title} at ${exp.company} (${exp.startDate} to ${exp.endDate || 'Present'})`
    ).join('\n') || 'No work experience provided';

    const skills = userProfile.skills?.map(skill => 
      `- ${skill.name} (${skill.level || 'Not specified'})`
    ).join('\n') || 'No skills provided';

    const education = userProfile.educations?.map(edu => 
      `- ${edu.degree} from ${edu.institution} (${edu.startDate} to ${edu.endDate || 'Present'})`
    ).join('\n') || 'No education provided';

    return `You are Musk, an expert career advisor. Provide personalized career advice for ${userName}, who works as ${userTitle} in ${userIndustry}.

PROFILE:
Work Experience:
${workExp}

Skills:
${skills}

Education:
${education}

ADVICE TYPE: ${userProfile.adviceType}
${userProfile.customAdviceText ? `SPECIFIC REQUEST: ${userProfile.customAdviceText}` : ''}

Provide actionable, specific career advice in the following format:

# Career Assessment
[Personalized assessment based on their profile]

## Key Strengths
[List 3-4 specific strengths based on their background]

## Recommendations
[3-5 actionable recommendations]

## Next Steps
[Specific steps they can take in the next 30-90 days]

## Resources
[Relevant courses, certifications, or learning resources]

Keep the response professional, specific to their background, and actionable.`;
  }

  /**
   * Build resume analysis prompt
   */
  private buildResumeAnalysisPrompt(resumeText: string): string {
    return `You are Musk, an expert resume analyst. Analyze this resume and provide detailed feedback:

RESUME CONTENT:
${resumeText}

Provide analysis in this format:

# Resume Analysis

## Overall Assessment
[Brief overall evaluation with score out of 10]

## Strengths
[List specific strengths found in the resume]

## Areas for Improvement
[Specific areas that need enhancement]

## Recommendations
[Actionable suggestions to improve the resume]

## Keywords & ATS Optimization
[Suggest relevant keywords and ATS improvements]

Be specific, constructive, and focus on actionable improvements.`;
  }

  /**
   * Build hashtag suggestion prompt
   */
  private buildHashtagPrompt(context: {
    industry?: string;
    domain?: string;
    content?: string;
    platform?: string;
  }): string {
    return `Generate relevant professional hashtags for:

Industry: ${context.industry || 'General'}
Domain: ${context.domain || 'General'}
Content: ${context.content || 'Professional post'}
Platform: ${context.platform || 'LinkedIn'}

Provide 10 relevant hashtags that are:
- Professional and industry-appropriate
- Mix of popular and niche tags
- Relevant to the content and industry
- Formatted with # symbol

Example format:
#CareerDevelopment #TechInnovation #ProfessionalGrowth

Hashtags:`;
  }

  /**
   * Build quest generation prompt
   */
  private buildQuestPrompt(context: {
    name: string;
    title: string;
    industry: string;
    domain: string;
    location: string;
    primaryAudience: string;
    secondaryAudience?: string;
    brandGoals: string[];
    skills: string[];
    questType: 'career' | 'social';
    platform?: string;
  }): string {
    const audienceText = context.secondaryAudience 
      ? `${context.primaryAudience} and ${context.secondaryAudience} professionals`
      : `${context.primaryAudience} professionals`;

    if (context.questType === 'career') {
      return `You are Musk, a brutally honest career coach. Generate ONE focused career quest for this professional:

NAME: ${context.name}
TITLE: ${context.title}
INDUSTRY: ${context.industry}
DOMAIN/EXPERTISE: ${context.domain}
LOCATION: ${context.location}
TARGET AUDIENCE: ${audienceText}
BRAND GOALS: ${context.brandGoals.join(', ')}
SKILLS: ${context.skills.join(', ')}

CRITICAL RULES:
1. Generate ONE focused activity per quest (not multiple different activities)
2. All 3-5 subtasks must be STEPS to complete that ONE activity
3. Be EXTREMELY specific about topics, sections, content - no generic descriptions
4. Focus on current ${context.industry} trends and ${context.domain} expertise
5. All subtasks must use Brandentifier platform features

QUEST STRUCTURE - Choose ONE main activity type:

OPTION A - Create Project Showcase (LIMIT: Max 10 images or 150-sec video):
SUBTASK_1: Research phase - identify specific trending topic in ${context.industry}
SUBTASK_2: Plan structure - outline EXACT sections with specific titles (e.g., "Market Analysis: 2025 AI Regulation Changes", "Case Study: Enterprise Client Success", etc.)
SUBTASK_3: Create content - write detailed content for each section with data, examples, metrics
SUBTASK_4: Add supporting materials - charts, visuals (max 10 images), resources with specific details
SUBTASK_5: Review and publish on Brandentifier with relevant tags

OPTION B - Create Media Pulse (LIMIT: Max 10 images):
SUBTASK_1: Research current visual trends in ${context.industry} and identify specific trending topic
SUBTASK_2: Plan content - outline EXACT topics for each image (specify 3-10 images, never exceed 10)
SUBTASK_3: Design visuals - create specific number of images with themes, data visualizations, style
SUBTASK_4: Write detailed caption (200-500 words) explaining insights with industry context
SUBTASK_5: Select 10-20 relevant hashtags and publish on Brandentifier with engagement plan

OPTION C - Industry Pulse Engagement Campaign:
SUBTASK_1: Research trending discussions in ${context.domain} on Industry Pulse feed
SUBTASK_2: Identify 5-10 high-quality posts about specific topics (name the exact topics)
SUBTASK_3: Write detailed, insightful comments (50+ words each) adding specific expertise and value
SUBTASK_4: Create follow-up pulse (200-400 words) summarizing key insights and your unique perspective
SUBTASK_5: Respond to engagement and connect with 3-5 thought leaders who commented

OPTION D - Strategic Networking Campaign:
SUBTASK_1: Research top ${context.domain} professionals in ${context.location} with specific criteria
SUBTASK_2: Identify 10-15 target connections aligned with your goals in ${context.industry}
SUBTASK_3: Craft personalized connection messages (50-100 words) mentioning specific shared interests or work
SUBTASK_4: Follow 20-30 industry leaders and engage with their recent posts (thoughtful comments)
SUBTASK_5: Track responses and plan follow-up conversations or collaboration opportunities

OPTION E - Content Engagement Sprint:
SUBTASK_1: Find 10 recent Industry Pulse posts about ${context.domain} trending topics
SUBTASK_2: Write 10 thoughtful comments (50+ words each) sharing specific insights from your experience
SUBTASK_3: Follow 10 authors who posted valuable ${context.industry} content
SUBTASK_4: Save 5 high-quality posts as references and note key takeaways
SUBTASK_5: Create summary pulse sharing your analysis of the trend with original perspective

OPTION F - Profile Optimization Campaign:
SUBTASK_1: Audit current profile sections and identify gaps in ${context.domain} positioning
SUBTASK_2: Research top 5 ${context.title} profiles and identify compelling presentation patterns
SUBTASK_3: Update specific profile section (e.g., About, Experience, Skills) with achievement metrics
SUBTASK_4: Add 3-5 portfolio pieces or certifications related to ${context.brandGoals.join(', ')}
SUBTASK_5: Request 3-5 recommendations from colleagues highlighting specific ${context.domain} expertise

RESPOND IN THIS EXACT FORMAT:

TITLE: [Specific quest title mentioning exact topic - max 60 characters]

DESCRIPTION: [What they'll create, the specific topic, and why it advances their career in ${context.industry} - 2-3 sentences]

SUBTASK_1: [First step - typically research. Be SPECIFIC about what to research, how many examples, which platforms. Example: "Research 3 current ${context.industry} trends in [specific subtopic] and save 10 case studies from Industry Pulse showing ROI metrics" (Est: 20 min)]

SUBTASK_2: [Second step - planning/outlining. Be EXTREMELY specific. Example: "Outline project with 4 sections: 'Market Analysis: 2025 Retirement Tax Changes', 'Case Study: 55-Year-Old Tech Professional', '5-Step Portfolio Rebalancing Strategy', 'Compliance Checklist & Resources'" (Est: 15 min)]

SUBTASK_3: [Third step - main creation. Ultra-specific about content. Example: "Write 500+ words per section covering: regulatory changes data, client demographics, strategy implementation steps, before/after portfolio comparisons, and downloadable checklist" (Est: 35 min)]

SUBTASK_4: [Fourth step - enhancement. Specific materials. Example: "Create 3 supporting materials: comparison chart of traditional vs Roth conversions, risk assessment calculator spreadsheet, and curated list of 5 IRS resources with direct links" (Est: 20 min)]

SUBTASK_5: [Fifth step - finalize and publish. Example: "Review content for clarity, add 5 relevant images showing data visualizations, tag with #RetirementPlanning #TaxStrategy #WealthManagement, and publish on Brandentifier" (Est: 10 min)]

MUSK_TIP: [Brutally honest, motivating one-liner in Musk's direct style - max 100 characters]

REMEMBER: All 5 subtasks must build toward completing ONE activity. Be ultra-specific about topics, section names, content details - never use generic descriptions like "create project with 4 sections".`;
    } else {
      return `You are Musk, a brutally honest social media strategist. Generate ONE focused social media content quest for this professional:

NAME: ${context.name}
TITLE: ${context.title}
INDUSTRY: ${context.industry}
DOMAIN/EXPERTISE: ${context.domain}
LOCATION: ${context.location}
TARGET AUDIENCE: ${audienceText}
BRAND GOALS: ${context.brandGoals.join(', ')}
PLATFORM: ${context.platform || 'LinkedIn'}
SKILLS: ${context.skills.join(', ')}

CRITICAL RULES:
1. Generate ONE focused content piece per quest (one carousel OR one video OR one image series - not multiple types)
2. All 3-5 subtasks must be STEPS to create that ONE content piece
3. Be EXTREMELY specific about the topic, slide titles, talking points - no generic descriptions
4. Focus on current ${context.industry} trends on ${context.platform || 'LinkedIn'}
5. Include exact specifications: dimensions, word counts, slide counts, etc.

QUEST STRUCTURE - Choose ONE content type (RESPECT ${context.platform || 'LinkedIn'} LIMITS):

OPTION A - Carousel Post (Max 10 slides):
SUBTASK_1: Research trending topics and identify ONE specific angle in ${context.industry}
SUBTASK_2: Outline carousel with EXACT slide titles - specify 5-10 slides (e.g., Slide 1: "5 AI Tools Reshaping Marketing in 2025", Slide 2: "Tool #1: Predictive Analytics - 40% ROI Increase", etc.)
SUBTASK_3: Design all slides (1080x1080) with specific data, visuals, brand colors
SUBTASK_4: Write detailed 250-word caption with hook, 3 insights, and CTA
SUBTASK_5: Select 15-20 hashtags, schedule for optimal time, and prepare 3 engagement responses

OPTION B - Video Content (Max 150 seconds):
SUBTASK_1: Research trending video formats in ${context.industry} and choose specific topic
SUBTASK_2: Script detailed outline with intro hook, 3 main points, specific examples, and CTA (60-90 seconds total, never exceed 150 sec)
SUBTASK_3: Record video in 9:16 or 16:9 format at specific location with professional lighting and audio
SUBTASK_4: Edit video with captions, B-roll clips, transitions, branded end screen (final length under 150 sec)
SUBTASK_5: Write caption, add hashtags, post on ${context.platform || 'LinkedIn'}, and engage with first 10 comments

OPTION C - Image Series (3-10 images, Max 10):
SUBTASK_1: Research visual trends in ${context.industry} and identify 3-7 specific data points to visualize
SUBTASK_2: Plan each image with EXACT content (e.g., Image 1: "2025 Market Share Graph comparing 4 platforms", Image 2: "Before/After Metrics Dashboard", etc.)
SUBTASK_3: Design specified number of images (16:9 or 1080x1080 format) using consistent style, brand colors, data visualizations
SUBTASK_4: Write 300-word caption explaining each image's insight with industry context
SUBTASK_5: Add 15-20 hashtags, schedule post, and prepare 3 follow-up comments for engagement

OPTION D - Engagement Challenge (No posting, pure engagement):
SUBTASK_1: Identify 15-20 high-engagement posts in ${context.industry} on ${context.platform || 'LinkedIn'} from past 48 hours
SUBTASK_2: Follow 10 thought leaders and industry influencers who posted valuable ${context.domain} content
SUBTASK_3: Write 15 insightful comments (50+ words each) adding unique expertise, not generic praise
SUBTASK_4: Like and save 10 posts for future reference, noting key insights and trends
SUBTASK_5: Send connection requests to 5 people who posted quality content with personalized messages

OPTION E - Thought Leadership Thread:
SUBTASK_1: Research 3 current debates or trending topics in ${context.industry}
SUBTASK_2: Craft detailed post (400-600 words) with controversial or unique perspective backed by data
SUBTASK_3: Create supporting visual (1 image or infographic) highlighting key statistics or framework
SUBTASK_4: Post during peak engagement hours and monitor first 30 minutes closely
SUBTASK_5: Reply to all comments within 2 hours with thoughtful responses, start conversations with engaged users

RESPOND IN THIS EXACT FORMAT:

TITLE: [Specific content title mentioning exact topic - max 60 characters]

DESCRIPTION: [What content piece they'll create, the specific topic/angle, and why ${audienceText} will engage with it on ${context.platform || 'LinkedIn'} - 2-3 sentences]

SUBTASK_1: [Research phase - SPECIFIC topic selection. Example: "Research 5 viral ${context.industry} carousels on LinkedIn about AI automation and identify the top 3 engagement patterns (storytelling, data-heavy, or tutorial style)" (Est: 15 min)]

SUBTASK_2: [Planning phase - EXACT outline. Example: "Outline 10-slide carousel: Slide 1 'AI Marketing Revolution 2025', Slide 2 'Trend #1: Hyper-Personalization at Scale', Slide 3 '67% Increase in Click Rates', Slide 4 'Case Study: E-commerce Brand', Slides 5-9 covering remaining trends with data, Slide 10 'Your Action Plan + Free Template'" (Est: 20 min)]

SUBTASK_3: [Creation phase - specific deliverables. Example: "Design all 10 slides (1080x1080) in Canva using navy/orange brand colors, include 3 data charts, 2 case study screenshots, and consistent typography. Each slide must have headline + 2-3 bullet points + visual element" (Est: 40 min)]

SUBTASK_4: [Writing phase - detailed copy. Example: "Write 250-word caption with opening hook about marketer pain points, explain each of the 5 trends briefly, include 3 actionable takeaways, and CTA to download free template from your bio" (Est: 15 min)]

SUBTASK_5: [Publishing phase - complete strategy. Example: "Select 15 hashtags (#AIMarketing #MarketingAutomation #ContentStrategy), schedule for Tuesday 2 PM, prepare 3 value-adding comments to post in first hour when engagement peaks" (Est: 10 min)]

MUSK_TIP: [Brutally honest, motivating one-liner about content creation - max 100 characters]

REMEMBER: All 5 subtasks must build toward creating ONE content piece. Be ultra-specific about slide titles, talking points, data to include - never use generic descriptions like "create carousel about marketing".`;
    }
  }

  /**
   * Parse AI quest response into structured data with subtasks
   */
  private parseQuestResponse(response: string): {
    title: string;
    description: string;
    muskTip: string;
    subtasks?: Array<{
      title: string;
      description: string;
      estimatedMinutes: number;
      platformActivity?: string;
      platformDetails?: any;
    }>;
  } {
    // Extract title, description, and musk tip from AI response
    const titleMatch = response.match(/TITLE:\s*(.+?)(?=\n|DESCRIPTION:|$)/i);
    const descriptionMatch = response.match(/DESCRIPTION:\s*([\s\S]+?)(?=\n\nSUBTASK_1:|SUBTASK_1:|MUSK_TIP:|$)/i);
    const muskTipMatch = response.match(/MUSK_TIP:\s*([\s\S]+?)(?=\n\n|$)/i);

    // Extract subtasks (SUBTASK_1 through SUBTASK_5)
    const subtasks: Array<{
      title: string;
      description: string;
      estimatedMinutes: number;
      platformActivity?: string;
      platformDetails?: any;
    }> = [];

    for (let i = 1; i <= 5; i++) {
      const subtaskPattern = new RegExp(`SUBTASK_${i}:\\s*([\\s\\S]+?)(?=\\n\\nSUBTASK_${i + 1}:|SUBTASK_${i + 1}:|MUSK_TIP:|$)`, 'i');
      const subtaskMatch = response.match(subtaskPattern);
      
      if (subtaskMatch && subtaskMatch[1]) {
        const subtaskText = subtaskMatch[1].trim();
        
        // Extract time estimate from format like "(Est: 20 min)" or "(20 min)"
        const timeMatch = subtaskText.match(/\((?:Est:\s*)?(\d+)\s*min(?:utes?)?\)/i);
        const estimatedMinutes = timeMatch ? parseInt(timeMatch[1]) : 15;
        
        // Remove time estimate from description
        const cleanText = subtaskText.replace(/\((?:Est:\s*)?\d+\s*min(?:utes?)?\)/i, '').trim();
        
        // Parse platform activity from text (e.g., "Create media pulse", "Create project")
        let platformActivity = undefined;
        let platformDetails = undefined;
        
        if (cleanText.match(/create\s+media\s+pulse/i)) {
          platformActivity = 'create_media_pulse';
          const imageCountMatch = cleanText.match(/(\d+)\s+images?/i);
          const topicMatch = cleanText.match(/about\s+([^,\.]+)/i);
          platformDetails = {
            type: 'media_pulse',
            imageCount: imageCountMatch ? parseInt(imageCountMatch[1]) : 3,
            topic: topicMatch ? topicMatch[1].trim() : ''
          };
        } else if (cleanText.match(/create\s+project/i)) {
          platformActivity = 'create_project';
          const sectionMatch = cleanText.match(/(\d+)\s+sections?/i);
          platformDetails = {
            type: 'project',
            sectionCount: sectionMatch ? parseInt(sectionMatch[1]) : 1
          };
        } else if (cleanText.match(/post.*comments?/i)) {
          platformActivity = 'post_comment';
          const countMatch = cleanText.match(/(\d+)\s+comments?/i);
          platformDetails = {
            type: 'comment',
            count: countMatch ? parseInt(countMatch[1]) : 3
          };
        }
        
        // Generate concise title from first few words
        const titleWords = cleanText.split(' ').slice(0, 8).join(' ');
        const title = titleWords.length < cleanText.length ? titleWords + '...' : titleWords;
        
        subtasks.push({
          title: title.substring(0, 100), // Max 100 chars for title
          description: cleanText,
          estimatedMinutes,
          platformActivity,
          platformDetails
        });
      }
    }

    return {
      title: titleMatch?.[1]?.trim() || 'Quest Generated',
      description: descriptionMatch?.[1]?.trim().replace(/\n/g, ' ') || 'Complete this quest to advance your career.',
      muskTip: muskTipMatch?.[1]?.trim() || 'Action beats perfection. Start now.',
      subtasks: subtasks.length > 0 ? subtasks : undefined
    };
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<{
    provider: string;
    model: string;
    status: 'healthy' | 'unhealthy';
    latency?: number;
    error?: string;
  }> {
    try {
      const startTime = Date.now();
      await this.generateCompletion('Test prompt for health check', 'health-check');
      const latency = Date.now() - startTime;

      return {
        provider: this.config.provider,
        model: this.config.model,
        status: 'healthy',
        latency
      };
    } catch (error) {
      return {
        provider: this.config.provider,
        model: this.config.model,
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const localAIService = new LocalAIService();