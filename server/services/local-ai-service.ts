/**
 * Local AI Service
 * Replaces OpenAI with cost-effective local AI models
 * Supports multiple backends: Ollama (local only), LM Studio, Hugging Face Transformers
 * 
 * CRITICAL ARCHITECTURE:
 * - Local Ollama (localhost:11434) is PRIMARY and MUST succeed
 * - If Ollama fails, use deterministic fallback (NEVER throw error)
 * - OpenAI is optional fallback only for non-critical tasks
 * - System NEVER crashes due to AI provider failure
 */

import { deterministicFallbackGenerator } from './deterministic-fallback-generator';

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

export interface LocalAICompletionResult {
  text: string;
  provider: 'ollama' | 'openai' | 'deterministic';
  model: string;
  fallbackUsed: boolean;
}

export class LocalAIService {
  private static instance: LocalAIService;
  private config: LocalAIConfig;
  private openaiDisabledUntil: number = 0;
  private lastOpenAiError: Date | null = null;
  private ollamaAvailabilityCache = {
    available: true,
    checkedAt: 0,
  };

  private constructor() {
    // ARCHITECTURE FIX: Always use LOCAL Ollama as primary
    // Remove any VPS/remote Ollama references
    const baseUrl = 'http://localhost:11434'; // LOCKED to localhost only
    const model = process.env.OLLAMA_MODEL || 'phi3'; // Default to phi3

    this.config = {
      provider: 'ollama',
      baseUrl,
      model,
      apiKey: process.env.OPENAI_API_KEY || process.env.AI_API_KEY,
      maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2000'),
      temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7')
    };
    
    console.log(`[Local AI] Initialized with PRIMARY provider: LOCAL OLLAMA at ${baseUrl}`);
    console.log(`[Local AI] Model: ${model}`);
    console.log(`[Local AI] IMPORTANT: All AI calls are local-first. System never depends on external APIs.`);
  }

  /**
   * Get singleton instance (ensures only ONE LocalAIService throughout app)
   */
  public static getInstance(): LocalAIService {
    if (!LocalAIService.instance) {
      LocalAIService.instance = new LocalAIService();
    }
    return LocalAIService.instance;
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
    return this._generateCompletion(prompt, 'career-advice');
  }

  /**
   * Analyze resume using local AI models
   */
  async analyzeResume(resumeText: string): Promise<string> {
    const prompt = this.buildResumeAnalysisPrompt(resumeText);
    return this._generateCompletion(prompt, 'resume-analysis');
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
    const response = await this._generateCompletion(prompt, 'hashtag-suggestions');
    
    // Extract hashtags from response
    const hashtags = response.match(/#\w+/g) || [];
    return hashtags.slice(0, 10); // Return top 10 hashtags
  }

  /**
   * Generate news content for personalized Musk Pulses (FREE with Ollama)
   * Falls back to deterministic content if AI unavailable
   */
  async generateNewsContent(prompt: string): Promise<string> {
    try {
      return await this._generateCompletion(prompt, 'news-pulse-generation');
    } catch (error) {
      console.warn('[Local AI] Pulse generation failed, using deterministic fallback:', error instanceof Error ? error.message : String(error));
      // Return deterministic fallback instead of crashing
      return deterministicFallbackGenerator.generateFallbackPulseContent({
        industry: 'Technology',
        role: 'Professional',
        location: 'Global'
      });
    }
  }

  /**
   * Generate detailed career quest content with AI (FREE with Ollama)
   */
  async generateCareerQuest(questContext: {
    questType: string;
    baseTitle: string;
    baseDescription: string;
    userProfile: {
      name: string;
      title: string;
      industry: string;
      domain: string;
      location: string;
    };
    brandGoal: string;
    primaryAudience: string;
    variables: any;
  }): Promise<{
    personalizedTitle: string;
    personalizedDescription: string;
    personalizedMuskTip: string;
    deliverableFormat: string;
    quantityValue: number;
    quantityType: string;
    platformConstraints: string;
    guidanceSnippet: string;
    estimatedTime: number;
  }> {
    const safeParse = (jsonText: string): any | null => {
      try {
        return JSON.parse(jsonText);
      } catch {
        return null;
      }
    };

    const prompt = this.buildCareerQuestPrompt(questContext);
    const response = await this._generateCompletion(prompt, 'career-quest-generation');
    
    // Parse structured output from AI
    try {
      // Extract JSON from response (AI might wrap it in markdown code blocks)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = safeParse(jsonMatch[0]);
        if (parsed) {
          return parsed;
        }
      }
      throw new Error('No valid JSON found in AI response');
    } catch (parseError) {
      console.warn('[Local AI] Invalid AI JSON for quest generation, using safe fallback object');
      // Fallback: extract sections manually
      return this.parseQuestFromText(response, questContext);
    }
  }

  /**
   * Build career quest generation prompt
   */
  private buildCareerQuestPrompt(questContext: {
    questType: string;
    baseTitle: string;
    baseDescription: string;
    userProfile: any;
    brandGoal: string;
    primaryAudience: string;
    variables: any;
  }): string {
    return `You are Musk, an expert career strategist. Generate a detailed, personalized career quest for a professional.

PROFILE:
- Name: ${questContext.userProfile.name}
- Title: ${questContext.userProfile.title}
- Industry: ${questContext.userProfile.industry}
- Domain: ${questContext.userProfile.domain}
- Location: ${questContext.userProfile.location}

BRAND GOAL: ${questContext.brandGoal}
PRIMARY AUDIENCE: ${questContext.primaryAudience}

QUEST TYPE: ${questContext.questType}
BASE TITLE: ${questContext.baseTitle}
BASE DESCRIPTION: ${questContext.baseDescription}

CONTEXT VARIABLES: ${JSON.stringify(questContext.variables, null, 2)}

Generate a detailed quest with these specifications. Return ONLY valid JSON with NO markdown code blocks or additional text:

{
  "personalizedTitle": "Creative, specific title that includes location/industry context",
  "personalizedDescription": "Detailed description (300-500 words) with specific deliverables, metrics, examples from their location/industry, and step-by-step requirements. Include exact numbers, formats, dimensions.",
  "personalizedMuskTip": "Brutal, honest advice (100-150 words) in Musk's direct style. Reference specific aspects of their profile, location, or audience. No sugar-coating.",
  "deliverableFormat": "Exact format specification (e.g., '3 images with captions, 800x600px, professional quality')",
  "quantityValue": 3,
  "quantityType": "images",
  "platformConstraints": "Specific technical requirements or platform limitations",
  "guidanceSnippet": "Step-by-step guidance (5-7 concrete steps) tailored to their profile",
  "estimatedTime": 45
}

Be specific, use real examples from ${questContext.userProfile.location}, and make it actionable. Focus on ${questContext.brandGoal}.`;
  }

  /**
   * Fallback parser if JSON extraction fails
   */
  private parseQuestFromText(response: string, questContext: any): any {
    // Fallback to basic structure
    return {
      personalizedTitle: questContext.baseTitle,
      personalizedDescription: questContext.baseDescription,
      personalizedMuskTip: "Focus on execution. Results matter more than plans.",
      deliverableFormat: "Standard format as specified",
      quantityValue: 1,
      quantityType: "item",
      platformConstraints: "Follow best practices",
      guidanceSnippet: "Complete the task according to specifications",
      estimatedTime: 30
    };
  }

  /**
   * Generate response with custom options (used by dynamic quest narrative generator)
   */
  async generateResponse(prompt: string, options?: {
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<string> {
    // If system prompt provided, prepend it to the user prompt
    const fullPrompt = options?.systemPrompt 
      ? `${options.systemPrompt}\n\n${prompt}`
      : prompt;
    
    // Temporarily override config if custom options provided
    const originalTemp = this.config.temperature;
    const originalTokens = this.config.maxTokens;
    
    if (options?.temperature !== undefined) {
      this.config.temperature = options.temperature;
    }
    if (options?.maxTokens !== undefined) {
      this.config.maxTokens = options.maxTokens;
    }
    
    try {
      const result = await this._generateCompletion(fullPrompt, 'custom-request');
      return result;
    } finally {
      // Restore original config
      this.config.temperature = originalTemp;
      this.config.maxTokens = originalTokens;
    }
  }

  /**
   * Public method for general completions with customizable temperature and maxTokens
   */
  async generateCompletion(prompt: string, temperature?: number, maxTokens?: number): Promise<string> {
    // Temporarily override config if parameters provided
    const originalTemp = this.config.temperature;
    const originalTokens = this.config.maxTokens;
    
    if (temperature !== undefined) {
      this.config.temperature = temperature;
    }
    if (maxTokens !== undefined) {
      this.config.maxTokens = maxTokens;
    }
    
    try {
      const result = await this._generateCompletion(prompt, 'general-completion');
      return result;
    } finally {
      // Restore original config
      this.config.temperature = originalTemp;
      this.config.maxTokens = originalTokens;
    }
  }

  /**
   * Structured completion result for routes/services that need accurate provider metadata.
   */
  async generateCompletionDetailed(
    prompt: string,
    temperature?: number,
    maxTokens?: number,
    taskType: string = 'general-completion'
  ): Promise<LocalAICompletionResult> {
    const originalTemp = this.config.temperature;
    const originalTokens = this.config.maxTokens;

    if (temperature !== undefined) {
      this.config.temperature = temperature;
    }
    if (maxTokens !== undefined) {
      this.config.maxTokens = maxTokens;
    }

    try {
      console.log(`\n[Local AI] ${'═'.repeat(60)}`);
      console.log(`[Local AI] AI STAGE A: Checking Ollama health...`);
      console.log(`[Local AI] Task type: ${taskType}`);
      console.log(`[Local AI] Provider: LOCAL OLLAMA at ${this.config.baseUrl}`);
      console.log(`[Local AI] Model: ${this.config.model}`);

      console.log(`[Local AI] AI STAGE B: Sending prompt to Ollama (${prompt.length} chars)...`);
      const ollamaText = await this.generateWithOllama(prompt);
      if (!ollamaText || !ollamaText.trim()) {
        throw new Error('Ollama returned empty response');
      }

      console.log(`[Local AI] AI STAGE C: Ollama succeeded ✅`);
      return {
        text: ollamaText,
        provider: 'ollama',
        model: this.config.model,
        fallbackUsed: false,
      };
    } catch (ollamaError) {
      const errorMsg = ollamaError instanceof Error ? ollamaError.message : String(ollamaError);
      console.error(`[Local AI] AI STAGE B FAILED: ${errorMsg}`);

      if (this.shouldUseOpenAI() && process.env.OPENAI_API_KEY) {
        try {
          console.log(`[Local AI] AI STAGE D: Attempting OpenAI fallback...`);
          const openAiText = await this.generateWithOpenAI(prompt);
          console.log(`[Local AI] AI STAGE D: OpenAI succeeded ✅`);
          return {
            text: openAiText,
            provider: 'openai',
            model: 'gpt-4o-mini',
            fallbackUsed: true,
          };
        } catch (openaiError) {
          const openaiErrorMsg = openaiError instanceof Error ? openaiError.message : String(openaiError);
          console.error(`[Local AI] AI STAGE D FAILED: ${openaiErrorMsg}`);

          if (openaiErrorMsg.includes('429') || openaiErrorMsg.includes('rate_limit_exceeded')) {
            console.error('[Local AI] 🚨 OpenAI quota exceeded. Cooling down for 5 minutes.');
            this.openaiDisabledUntil = Date.now() + 5 * 60 * 1000;
            this.lastOpenAiError = new Date();
          }
        }
      } else {
        if (!this.shouldUseOpenAI()) {
          const remainingMs = Math.max(0, this.openaiDisabledUntil - Date.now());
          console.log(`[Local AI] OpenAI cooldown active (${Math.ceil(remainingMs / 1000)}s remaining)`);
        } else {
          console.log(`[Local AI] OpenAI not configured (no API key)`);
        }
      }

      console.warn(`\n[Local AI] AI STAGE E: Falling back to deterministic generator...`);
      return {
        text: this.buildDeterministicFallbackText(taskType, prompt),
        provider: 'deterministic',
        model: 'deterministic-fallback',
        fallbackUsed: true,
      };
    } finally {
      this.config.temperature = originalTemp;
      this.config.maxTokens = originalTokens;
    }
  }

  private buildDeterministicFallbackText(taskType: string, prompt: string): string {
    if (taskType === 'health-check') {
      return 'Deterministic fallback active';
    }

    if (taskType === 'hashtag-suggestions') {
      return '#CareerGrowth #ProfessionalDevelopment #IndustryInsights #Leadership #Networking';
    }

    if (taskType === 'resume-analysis') {
      return 'Resume analysis is temporarily unavailable because both AI providers are unavailable. Please retry shortly.';
    }

    if (taskType.includes('quest') || taskType.includes('custom-request')) {
      // Always return strict JSON for quest-like tasks to prevent parser crashes.
      return JSON.stringify({
        personalizedTitle: 'Complete Your Profile',
        personalizedDescription: 'Add missing profile details and publish one actionable update for your professional brand today.',
        personalizedMuskTip: 'Execution beats theory. Ship one concrete improvement now.',
        title: 'Complete Your Profile',
        description: 'Add missing profile details and publish one actionable update for your professional brand today.',
        category: 'Career',
        difficulty: 'Easy',
        xpReward: 50,
        estimatedTime: 15,
        deliverableFormat: 'Text input',
        platformConstraints: 'Max 150 characters',
        guidanceSnippet: '1. Open profile\n2. Fill one missing field\n3. Save changes',
        quantityValue: 1,
        quantityType: 'task'
      });
    }

    const preview = prompt.trim().slice(0, 120);
    return `AI services are temporarily unavailable. Deterministic fallback active for: ${preview || 'request'}. Please retry shortly.`;
  }

  private shouldUseOpenAI(): boolean {
    return Date.now() >= this.openaiDisabledUntil;
  }

  private async isOllamaAvailable(): Promise<boolean> {
    const now = Date.now();
    const cacheTtlMs = 30_000;
    if (now - this.ollamaAvailabilityCache.checkedAt < cacheTtlMs) {
      return this.ollamaAvailabilityCache.available;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    try {
      const res = await fetch(`${this.config.baseUrl}/api/tags`, {
        method: 'GET',
        signal: controller.signal,
      } as any);
      this.ollamaAvailabilityCache = { available: res.ok, checkedAt: now };
      return res.ok;
    } catch {
      this.ollamaAvailabilityCache = { available: false, checkedAt: now };
      return false;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Internal method for AI completion (private)
   * ARCHITECTURE: Ollama (local) → Fallback generator (deterministic) → OpenAI (optional)
   * System NEVER crashes due to AI failure
   */
  private async _generateCompletion(prompt: string, taskType: string): Promise<string> {
    const startTime = Date.now();
    
    try {
      console.log(`\n[Local AI] ${'═'.repeat(60)}`);
      console.log(`[Local AI] AI STAGE A: Checking Ollama health...`);
      console.log(`[Local AI] Task type: ${taskType}`);
      console.log(`[Local AI] Provider: LOCAL OLLAMA at ${this.config.baseUrl}`);
      console.log(`[Local AI] Model: ${this.config.model}`);
      
      console.log(`[Local AI] AI STAGE B: Sending prompt to Ollama (${prompt.length} chars)...`);
      // ALWAYS try local Ollama first, but fail fast if unreachable.
      const result = await this.generateWithOllama(prompt);
      if (!result || !result.trim()) {
        throw new Error('Ollama returned empty response');
      }
      console.log(`[Local AI] AI STAGE C: Ollama succeeded ✅`);
      return result;
    } catch (ollamaError) {
      const elapsed = Date.now() - startTime;
      const errorMsg = ollamaError instanceof Error ? ollamaError.message : String(ollamaError);
      console.error(`\n[Local AI] AI STAGE B FAILED: Ollama error after ${elapsed}ms`);
      console.error(`[Local AI] Error: ${errorMsg}`);
      
      // Try OpenAI as optional fallback (with cooldown after 429)
      if (this.shouldUseOpenAI() && process.env.OPENAI_API_KEY) {
        try {
          console.log(`[Local AI] AI STAGE D: Attempting OpenAI fallback...`);
          const result = await this.generateWithOpenAI(prompt);
          console.log(`[Local AI] AI STAGE D: OpenAI succeeded ✅ (${Date.now() - startTime}ms)`);
          return result;
        } catch (openaiError) {
          const openaiErrorMsg = openaiError instanceof Error ? openaiError.message : String(openaiError);
          console.error(`[Local AI] AI STAGE D FAILED: OpenAI error`);
          console.error(`[Local AI] Error: ${openaiErrorMsg}`);
          
          // Check if it's a 429 error (quota exceeded)
          if (openaiErrorMsg.includes('429') || openaiErrorMsg.includes('rate_limit_exceeded')) {
            console.error('[Local AI] 🚨 OpenAI quota exceeded. Cooling down for 5 minutes.');
            this.openaiDisabledUntil = Date.now() + 5 * 60 * 1000;
            this.lastOpenAiError = new Date();
          }
        }
      } else {
        if (!this.shouldUseOpenAI()) {
          const remainingMs = Math.max(0, this.openaiDisabledUntil - Date.now());
          console.log(`[Local AI] OpenAI cooldown active (${Math.ceil(remainingMs / 1000)}s remaining)`);
        } else {
          console.log(`[Local AI] OpenAI not configured (no API key)`);
        }
      }
      
      // FALLBACK: Use deterministic generator
      // This ensures system NEVER crashes
      console.warn(`\n[Local AI] AI STAGE E: Falling back to deterministic generator...`);
      return this.buildDeterministicFallbackText(taskType, prompt);
    }
  }

  /**
   * Generate completion using LOCAL Ollama ONLY (no VPS)
   * TIMEOUT: 15 seconds (fail fast for graceful fallback)
   */
  private async generateWithOllama(prompt: string): Promise<string> {
    const reachable = await this.isOllamaAvailable();
    if (!reachable) {
      throw new Error('Local Ollama unavailable at http://localhost:11434 - skipping to fallback');
    }

    const controller = new AbortController();
    const OLLAMA_TIMEOUT = 15000; // 15 second timeout - fail fast
    const timeoutId = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT);
    
    console.log(`[Ollama] Connecting to localhost at ${this.config.baseUrl}/api/generate...`);
    const requestStart = Date.now();
    
    try {
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
        }),
        signal: controller.signal
      } as any);

      clearTimeout(timeoutId);
      const elapsed = Date.now() - requestStart;
      console.log(`[Ollama] Response received in ${elapsed}ms, status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        const err = new Error(`Ollama API error: ${response.status} ${response.statusText}`);
        (err as any).debug = {
          provider: 'ollama',
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText
        };
        throw err;
      }

      const data = await response.json() as any;
      const text = typeof data.response === 'string' ? data.response.trim() : '';
      console.log(`[Ollama] ✅ Generation complete, response length: ${text.length} chars`);
      if (!text) {
        throw new Error('Ollama returned empty response');
      }
      return text;
    } catch (error: any) {
      clearTimeout(timeoutId);
      const elapsed = Date.now() - requestStart;
      
      if (error.name === 'AbortError') {
        console.error(`[Ollama] ⏱️ TIMEOUT after ${elapsed}ms (limit: ${OLLAMA_TIMEOUT}ms)`);
        throw new Error(`Local Ollama timeout after ${OLLAMA_TIMEOUT/1000}s - Make sure ollama serve is running`);
      }
      
      // Check for connection errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
        console.error(`[Ollama] 🔌 Connection error: ${error.code} after ${elapsed}ms`);
        throw new Error(`Cannot connect to local Ollama (${error.code}). Start Ollama with: ollama serve`);
      }
      
      console.error(`[Ollama] Error after ${elapsed}ms:`, error.message || error);
      throw error;
    }
  }

  /**
   * Generate completion using LM Studio
   */
  private async generateWithLMStudio(prompt: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
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
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        const err = new Error(`LM Studio API error: ${response.status} ${response.statusText}`);
        (err as any).debug = {
          provider: 'lmstudio',
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText
        };
        throw err;
      }

      const data = await response.json() as any;
      return data.choices[0]?.message?.content || 'No response generated';
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('LM Studio request timeout after 30 seconds');
      }
      throw error;
    }
  }

  /**
   * Generate completion using Hugging Face Inference API
   */
  private async generateWithHuggingFace(prompt: string): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('Hugging Face API key is required');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
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
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        const err = new Error(`Hugging Face API error: ${response.status} ${response.statusText}`);
        (err as any).debug = {
          provider: 'huggingface',
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText
        };
        throw err;
      }

      const data = await response.json() as any;
      return data[0]?.generated_text || 'No response generated';
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Hugging Face request timeout after 30 seconds');
      }
      throw error;
    }
  }

  /**
   * Optional OpenAI fallback (only if Ollama fails)
   * IMPORTANT: This is NOT required for system stability
   * Handles 429 (quota) errors gracefully
   */
  private async generateWithOpenAI(prompt: string): Promise<string> {
    console.log(`[OpenAI] Using OpenAI as optional fallback...`);
    const startTime = Date.now();
    
    const openAiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
    if (!openAiKey) {
      throw new Error('OpenAI API key not configured - skipping OpenAI fallback');
    }
    
    console.log(`[OpenAI] API key present (length: ${openAiKey.length})`);

    try {
      const { OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey: openAiKey, timeout: 15000, maxRetries: 1 }); // Reduced timeout and retries

      const tryModels = ['gpt-4o-mini', 'gpt-4o'];
      let response: any;

      for (const model of tryModels) {
        try {
          response = await openai.chat.completions.create({
            model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: this.config.maxTokens,
            temperature: this.config.temperature
          });
          break;
        } catch (modelError: any) {
          const status = modelError?.status;
          const code = modelError?.error?.code;
          
          // Handle 429 (rate limit/quota exceeded) - apply cooldown instead of permanent disable
          if (status === 429 || code === 'rate_limit_exceeded') {
            console.error(`[OpenAI] 🚨 QUOTA EXCEEDED (429). Cooling down for 5 minutes.`);
            this.openaiDisabledUntil = Date.now() + 5 * 60 * 1000;
            this.lastOpenAiError = new Date();
            throw new Error('OpenAI quota exceeded (429) - cooldown active');
          }
          
          const isModelError = status === 404 || code === 'model_not_found' || code === 'invalid_model';
          if (!isModelError || model === tryModels[tryModels.length - 1]) {
            throw modelError;
          }
        }
      }

      const elapsed = Date.now() - startTime;
      const content = response.choices[0]?.message?.content || 'No response generated';
      console.log(`[OpenAI] ✅ Fallback succeeded in ${elapsed}ms`);
      
      return content;
    } catch (error) {
      const elapsed = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn(`[OpenAI] Fallback failed after ${elapsed}ms:`, errorMsg);
      throw error;
    }
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
      const result = await this.generateCompletionDetailed('Test prompt for health check', undefined, undefined, 'health-check');
      const latency = Date.now() - startTime;

      if (result.provider === 'deterministic') {
        return {
          provider: this.config.provider,
          model: this.config.model,
          status: 'unhealthy',
          latency,
          error: 'Primary and fallback AI providers unavailable; deterministic fallback active'
        };
      }

      return {
        provider: result.provider,
        model: result.model,
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

// Export singleton instance
export const localAIService = LocalAIService.getInstance();

// Export as localAI for backward compatibility
export const localAI = localAIService;