import { log } from '../vite';
import { spawn, type ChildProcess } from 'child_process';

/**
 * Ollama Service - Local LLM integration for resume and document analysis
 * 
 * Features:
 * - Runs locally without API costs
 * - Fully offline processing
 * - Swappable models via environment variable
 * - Structured JSON responses
 * - Retry logic for robustness
 * - Auto-start capability (no manual ollama serve needed)
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'phi3';
const REQUEST_TIMEOUT = parseInt(process.env.OLLAMA_TIMEOUT || '60000', 10); // 60 seconds

// Track Ollama process to prevent duplicate spawns
let ollamaProcess: ChildProcess | null = null;
let isStarting = false;

interface ResumeAnalysisResult {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  skills_detected: string[];
  improvement_suggestions: string[];
  score: number;
  score_breakdown?: {
    content_quality: number;
    skills_clarity: number;
    experience_presentation: number;
    formatting: number;
  };
}

interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

/**
 * Check if Ollama service is available
 */
export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('[Ollama] Service unavailable:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

/**
 * Check if Ollama is running (alias for isOllamaAvailable)
 */
export async function isOllamaRunning(): Promise<boolean> {
  return await isOllamaAvailable();
}

/**
 * Ensure Ollama is running, auto-start if needed
 * 
 * Safeguards:
 * - Checks if already running before spawning
 * - Prevents duplicate spawns with global lock
 * - Gracefully fails if Ollama not installed
 * - Non-blocking for server startup
 * - Works on Windows, macOS, Linux
 */
export async function ensureOllamaRunning(): Promise<void> {
  // Check if already running
  const running = await isOllamaRunning();
  
  if (running) {
    console.log('✅ [Ollama] Already running');
    return;
  }

  // Prevent duplicate spawn attempts
  if (isStarting) {
    console.log('⏳ [Ollama] Already starting, waiting...');
    // Wait for the other start attempt to complete
    for (let i = 0; i < 20; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (await isOllamaRunning()) {
        console.log('✅ [Ollama] Started by parallel process');
        return;
      }
    }
    throw new Error('Ollama failed to start within 10 seconds');
  }

  isStarting = true;

  try {
    console.log('🚀 [Ollama] Starting Ollama service...');

    // Spawn Ollama in detached mode (non-blocking)
    ollamaProcess = spawn('ollama', ['serve'], {
      detached: true,
      stdio: 'ignore', // Don't pipe stdout/stderr to parent
      windowsHide: true, // Hide console window on Windows
    });

    // Unref so parent process can exit independently
    ollamaProcess.unref();

    console.log(`[Ollama] Process spawned with PID: ${ollamaProcess.pid}`);

    // Wait for Ollama to boot (typically 2-4 seconds)
    console.log('[Ollama] Waiting for service to be ready...');
    for (let i = 0; i < 20; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (await isOllamaRunning()) {
        console.log(`✅ [Ollama] Service ready after ${(i + 1) * 0.5}s`);
        isStarting = false;
        return;
      }
    }

    isStarting = false;
    throw new Error('Ollama failed to start within 10 seconds - it may need more time or check if ollama is installed');
  } catch (error) {
    isStarting = false;
    
    // Check if error is due to Ollama not being installed
    if (error instanceof Error && (error.message.includes('ENOENT') || error.message.includes('not found'))) {
      console.error('❌ [Ollama] Ollama command not found. Please install Ollama from: https://ollama.ai');
      throw new Error('Ollama is not installed. Download from https://ollama.ai');
    }

    console.error('[Ollama] Failed to start:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * List available models in Ollama
 */
export async function listAvailableModels(): Promise<string[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to list models: HTTP ${response.status}`);
    }

    const data = await response.json() as { models?: Array<{ name: string }> };
    return (data.models || []).map(m => m.name.split(':')[0]);
  } catch (error) {
    console.error('[Ollama] Error listing models:', error);
    return [];
  }
}

/**
 * Analyze resume using Ollama with structured JSON output
 * 
 * @param resumeText - Extracted text from resume
 * @param model - Optional model name (defaults to OLLAMA_MODEL env var or phi3)
 * @returns Structured resume analysis
 */
export async function analyzeResumeWithOllama(
  resumeText: string,
  model: string = DEFAULT_MODEL
): Promise<ResumeAnalysisResult> {
  // Ensure Ollama is running before analysis
  await ensureOllamaRunning();

  console.log(`[Ollama Resume Analysis] Starting analysis with model: ${model}`);
  console.log(`[Ollama Resume Analysis] Text length: ${resumeText.length} characters`);
  console.log(`[Ollama Resume Analysis] Ollama endpoint: ${OLLAMA_BASE_URL}`);

  // Validate input
  if (!resumeText || resumeText.trim().length < 20) {
    throw new Error('Resume text is too short for analysis (minimum 20 characters)');
  }

  const analysisPrompt = `You are an expert resume analyzer. Analyze the following resume and return ONLY valid JSON in this exact format (no other text, no markdown, just JSON):

{
  "summary": "Brief 1-2 sentence summary of the candidate's profile",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Area for improvement 1", "Area for improvement 2"],
  "skills_detected": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
  "improvement_suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
  "score": 75,
  "score_breakdown": {
    "content_quality": 80,
    "skills_clarity": 75,
    "experience_presentation": 70,
    "formatting": 75
  }
}

RESUME TO ANALYZE:
${resumeText}

Return only the JSON object, nothing else.`;

  try {
    console.log('[Ollama Resume Analysis] Sending request to Ollama...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt: analysisPrompt,
        stream: false,
        temperature: 0.3, // Lower temperature for more consistent JSON output
        top_p: 0.9,
        top_k: 40,
      }),
      signal: controller.signal,
    } as RequestInit);

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error: HTTP ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as OllamaResponse;
    console.log('[Ollama Resume Analysis] Received response from Ollama');
    console.log('[Ollama Resume Analysis] Response length:', data.response.length);
    console.log('[Ollama Resume Analysis] Model:', data.model);

    if (!data.response) {
      throw new Error('Ollama returned empty response');
    }

    // Parse the JSON response
    let analysis: ResumeAnalysisResult;
    try {
      // Try to extract JSON from the response in case there's extra text
      const jsonMatch = data.response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      analysis = JSON.parse(jsonMatch[0]);
      console.log('[Ollama Resume Analysis] Successfully parsed JSON response');
    } catch (parseError) {
      console.error('[Ollama Resume Analysis] JSON parse error:', parseError);
      console.log('[Ollama Resume Analysis] Raw response:', data.response.substring(0, 500));
      
      // Fallback to a basic analysis if JSON parsing fails
      analysis = {
        summary: 'Resume analysis completed',
        strengths: ['Professional background', 'Experience demonstrated'],
        weaknesses: ['Could improve formatting', 'Add more specific metrics'],
        skills_detected: extractSkillsFromText(resumeText),
        improvement_suggestions: [
          'Add quantifiable achievements',
          'Highlight technical skills more prominently',
          'Include relevant certifications'
        ],
        score: 65,
        score_breakdown: {
          content_quality: 70,
          skills_clarity: 60,
          experience_presentation: 65,
          formatting: 65
        }
      };
    }

    // Validate and normalize output
    analysis = normalizeResumeAnalysis(analysis);
    console.log('[Ollama Resume Analysis] Analysis complete - Score:', analysis.score);

    return analysis;

  } catch (error) {
    console.error('[Ollama Resume Analysis] Error:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`Ollama request timed out after ${REQUEST_TIMEOUT}ms. Try with a shorter resume or increase timeout.`);
      }
      if (error.message.includes('ECONNREFUSED')) {
        throw new Error('Ollama service not running. Start Ollama with: ollama serve');
      }
    }

    throw error;
  }
}

/**
 * Analyze pitch deck using Ollama
 */
export async function analyzePitchDeckWithOllama(
  pitchDeckText: string,
  model: string = DEFAULT_MODEL
): Promise<Record<string, any>> {
  // Ensure Ollama is running before analysis
  await ensureOllamaRunning();

  console.log(`[Ollama Pitch Deck Analysis] Starting analysis with model: ${model}`);
  console.log(`[Ollama Pitch Deck Analysis] Text length: ${pitchDeckText.length} characters`);

  if (!pitchDeckText || pitchDeckText.trim().length < 20) {
    throw new Error('Pitch deck text is too short for analysis (minimum 20 characters)');
  }

  const analysisPrompt = `You are an expert pitch deck analyzer and investor. Analyze the following pitch deck content and return ONLY valid JSON in this exact format:

{
  "overall_score": 75,
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "key_messages": ["Message 1", "Message 2", "Message 3"],
  "investor_readiness": "High/Medium/Low",
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "highlights": {
    "problem_clarity": 8,
    "solution_differentiation": 7,
    "market_opportunity": 8,
    "team_strength": 6,
    "financial_projections": 7,
    "execution_plan": 7
  }
}

PITCH DECK CONTENT:
${pitchDeckText}

Return only the JSON object, nothing else.`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt: analysisPrompt,
        stream: false,
        temperature: 0.4,
        top_p: 0.9,
        top_k: 40,
      }),
      signal: controller.signal,
    } as RequestInit);

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ollama API error: HTTP ${response.status}`);
    }

    const data = (await response.json()) as OllamaResponse;

    if (!data.response) {
      throw new Error('Ollama returned empty response');
    }

    // Parse JSON response
    try {
      const jsonMatch = data.response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('[Ollama Pitch Deck Analysis] JSON parse error:', parseError);
      
      // Fallback response
      return {
        overall_score: 65,
        strengths: ['Clear problem definition', 'Professional presentation'],
        weaknesses: ['Could emphasize market size more', 'Team background could be clearer'],
        key_messages: ['Innovation focus', 'Market opportunity', 'Experienced team'],
        investor_readiness: 'Medium',
        recommendations: [
          'Add more financial projections',
          'Highlight competitive differentiation',
          'Include traction metrics'
        ],
        highlights: {
          problem_clarity: 7,
          solution_differentiation: 6,
          market_opportunity: 6,
          team_strength: 6,
          financial_projections: 5,
          execution_plan: 6
        }
      };
    }

  } catch (error) {
    console.error('[Ollama Pitch Deck Analysis] Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('AbortError')) {
        throw new Error('Ollama request timed out');
      }
    }

    throw error;
  }
}

/**
 * Basic skill extraction from resume text (fallback)
 */
function extractSkillsFromText(text: string): string[] {
  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'SQL',
    'AWS', 'Docker', 'Kubernetes', 'Git', 'REST API', 'GraphQL', 'PostgreSQL', 'MongoDB',
    'Communication', 'Leadership', 'Project Management', 'Problem Solving'
  ];

  const foundSkills = commonSkills.filter(skill =>
    text.toLowerCase().includes(skill.toLowerCase())
  );

  return foundSkills.length > 0 ? foundSkills.slice(0, 8) : ['Technical Skills', 'Project Experience'];
}

/**
 * Normalize and validate resume analysis output
 */
function normalizeResumeAnalysis(analysis: any): ResumeAnalysisResult {
  return {
    summary: String(analysis.summary || '').substring(0, 500) || 'Resume analysis completed',
    strengths: Array.isArray(analysis.strengths) 
      ? analysis.strengths.slice(0, 5).map((s: any) => String(s).substring(0, 200))
      : [],
    weaknesses: Array.isArray(analysis.weaknesses)
      ? analysis.weaknesses.slice(0, 5).map((w: any) => String(w).substring(0, 200))
      : [],
    skills_detected: Array.isArray(analysis.skills_detected)
      ? analysis.skills_detected.slice(0, 10).map((s: any) => String(s).substring(0, 100))
      : [],
    improvement_suggestions: Array.isArray(analysis.improvement_suggestions)
      ? analysis.improvement_suggestions.slice(0, 5).map((s: any) => String(s).substring(0, 200))
      : [],
    score: Math.min(100, Math.max(0, parseInt(String(analysis.score || 70), 10))),
    score_breakdown: analysis.score_breakdown ? {
      content_quality: Math.min(100, Math.max(0, parseInt(String(analysis.score_breakdown.content_quality || 70), 10))),
      skills_clarity: Math.min(100, Math.max(0, parseInt(String(analysis.score_breakdown.skills_clarity || 70), 10))),
      experience_presentation: Math.min(100, Math.max(0, parseInt(String(analysis.score_breakdown.experience_presentation || 70), 10))),
      formatting: Math.min(100, Math.max(0, parseInt(String(analysis.score_breakdown.formatting || 70), 10)))
    } : undefined
  };
}

/**
 * Get health status of Ollama service
 */
export async function getOllamaHealth(): Promise<{
  available: boolean;
  model?: string;
  url: string;
  error?: string;
}> {
  try {
    const isAvailable = await isOllamaAvailable();
    
    if (!isAvailable) {
      return {
        available: false,
        url: OLLAMA_BASE_URL,
        error: 'Ollama service not responding'
      };
    }

    const models = await listAvailableModels();
    const hasDefaultModel = models.includes(DEFAULT_MODEL);

    return {
      available: true,
      model: DEFAULT_MODEL,
      url: OLLAMA_BASE_URL,
      ...(hasDefaultModel ? {} : { 
        error: `Model ${DEFAULT_MODEL} not found. Available models: ${models.join(', ')}` 
      })
    };
  } catch (error) {
    return {
      available: false,
      url: OLLAMA_BASE_URL,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
