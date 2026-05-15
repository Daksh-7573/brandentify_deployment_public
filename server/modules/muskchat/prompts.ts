import type { MuskChatInputMessage } from "./types";

export const BRANDENTIFY_SYSTEM_PROMPT = `You are Musk Chat 2.0, the AI assistant for Brandentify - a professional social branding platform focused on personal branding, professional growth, networking, AI-powered career guidance, BrandQuests, creator growth, and professional identity building.

Your role:
- Help users improve their professional brand
- Guide users on networking and career growth
- Assist with resumes and LinkedIn-style optimization
- Explain BrandQuests
- Help users use Brandentify features
- Give startup, creator, branding, and career advice
- Maintain a smart, confident, futuristic tone inspired by Elon Musk-style concise communication

Always stay relevant to Brandentify. Be direct, practical, and specific. Prefer actionable steps over vague motivation.`;

export const RESUME_ANALYSIS_PROMPT = `Analyze this resume for Brandentify's professional branding and career-growth context.

Return beautiful markdown with these exact sections:

# Resume Analysis

## Overall Score
Give a score out of 100 and one sentence explaining it.

## Strengths
Bullet list of the strongest signals.

## Weaknesses
Bullet list of gaps, risks, or unclear areas.

## Improvement Suggestions
Specific changes the user should make.

## Rewritten Summary Suggestion
Rewrite a stronger professional summary.

## Keyword Recommendations
Suggest relevant role/ATS keywords.

## Recruiter Impression
Explain what a recruiter would likely think in the first 20 seconds.

## Final Verdict
Give a concise verdict and the next 3 actions.

Evaluate ATS friendliness, formatting, keyword optimization, skills, experience quality, grammar, readability, achievements, project quality, professional branding, and missing sections.`;

export function buildChatMessages(params: {
  userMessage: string;
  history: Array<{ role: string; content: string }>;
  profileContext?: string;
}): MuskChatInputMessage[] {
  const messages: MuskChatInputMessage[] = [
    { role: "system", content: BRANDENTIFY_SYSTEM_PROMPT },
  ];

  if (params.profileContext?.trim()) {
    messages.push({
      role: "system",
      content: `Brandentify user context:\n${params.profileContext.trim()}`,
    });
  }

  for (const entry of params.history.slice(-12)) {
    if (entry.role === "user" || entry.role === "assistant") {
      messages.push({ role: entry.role, content: entry.content });
    }
  }

  messages.push({ role: "user", content: params.userMessage });
  return messages;
}

export function buildResumeMessages(resumeText: string): MuskChatInputMessage[] {
  return [
    { role: "system", content: BRANDENTIFY_SYSTEM_PROMPT },
    { role: "system", content: RESUME_ANALYSIS_PROMPT },
    {
      role: "user",
      content: `Resume text:\n\n${resumeText.slice(0, 12000)}`,
    },
  ];
}
