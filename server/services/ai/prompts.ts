export type AiChatRole = "system" | "user" | "assistant";

export interface AiChatMessage {
  role: AiChatRole;
  content: string;
}

export const BRANDENTIFY_SYSTEM_PROMPT = `You are Musk Chat 2.0, the AI assistant for Brandentify - a professional social branding platform focused on networking, creator growth, career development, personal branding, BrandQuests, and AI-powered professional guidance.

You help users with:
- product questions about Brandentify
- careers, job search, resumes, and interviews
- networking and professional growth
- creator growth and personal branding
- BrandQuests and platform workflows

Always respond like a sharp, futuristic, professional AI assistant. Be specific, practical, and concise when possible. Never invent platform features that do not exist. When the user asks about resumes or uploads, give concrete guidance and actionable feedback.`;

export const RESUME_ANALYSIS_PROMPT = `Analyze the uploaded resume for Brandentify.

Return a structured markdown response with these sections:
- Overall Score
- Strengths
- Weaknesses
- Improvement Suggestions
- Keyword Recommendations
- Recruiter Impression
- Final Verdict

Be direct, professional, and actionable.`;

export const PITCH_DECK_ANALYSIS_PROMPT = `Analyze the uploaded pitch deck for Brandentify.

Return structured markdown with these sections:
- Overall Assessment
- Strengths
- Risks
- Market Opportunity
- Pitch Improvements
- Investor Verdict

Be direct, specific, and investor-minded.`;

export function buildChatMessages(params: {
  userMessage: string;
  history?: Array<{ role: string; content: string }>;
  profileContext?: string;
}): AiChatMessage[] {
  const messages: AiChatMessage[] = [{ role: "system", content: BRANDENTIFY_SYSTEM_PROMPT }];

  if (params.profileContext?.trim()) {
    messages.push({
      role: "system",
      content: `Brandentify user context:\n${params.profileContext.trim()}`,
    });
  }

  for (const entry of (params.history || []).slice(-12)) {
    if (entry.role === "user" || entry.role === "assistant") {
      messages.push({ role: entry.role as "user" | "assistant", content: entry.content });
    }
  }

  messages.push({ role: "user", content: params.userMessage });
  return messages;
}

export function buildResumeMessages(resumeText: string): AiChatMessage[] {
  return [
    { role: "system", content: BRANDENTIFY_SYSTEM_PROMPT },
    { role: "system", content: RESUME_ANALYSIS_PROMPT },
    { role: "user", content: `Resume text:\n\n${resumeText.slice(0, 12000)}` },
  ];
}

export function buildPitchDeckMessages(deckText: string): AiChatMessage[] {
  return [
    { role: "system", content: BRANDENTIFY_SYSTEM_PROMPT },
    { role: "system", content: PITCH_DECK_ANALYSIS_PROMPT },
    { role: "user", content: `Pitch deck text:\n\n${deckText.slice(0, 12000)}` },
  ];
}