import type { MuskIntentClassification } from "./intent-classifier";
import type { EnrichedMuskContext } from "./context-enricher";

export function generateFollowUpIntelligence(
  intent: MuskIntentClassification,
  context: EnrichedMuskContext,
  responseText: string
): string[] {
  const suggestions = new Set<string>();

  if (intent.type === "resume_help") {
    suggestions.add("Review my top resume gaps");
    suggestions.add("Rewrite my summary");
    suggestions.add("Tailor this for a specific job");
  }

  if (intent.type === "career_planning" || intent.type === "career_confusion") {
    suggestions.add("Show me a 90-day plan");
    suggestions.add("What skills matter most next?");
    suggestions.add("What should I stop doing?");
  }

  if (intent.type === "interview_prep") {
    suggestions.add("Give me mock interview questions");
    suggestions.add("Help me answer tell me about yourself");
  }

  if (context.resumeSummary.hasResume) {
    suggestions.add("Use my resume context");
  }

  if (responseText.length > 0) {
    suggestions.add("Break this down into next actions");
  }

  return Array.from(suggestions).slice(0, 4);
}
