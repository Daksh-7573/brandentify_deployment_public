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
    
    // Allow fallback to OpenAI if local models fail
    this.fallbackToOpenAI = process.env.AI_FALLBACK_OPENAI === 'true';
    
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