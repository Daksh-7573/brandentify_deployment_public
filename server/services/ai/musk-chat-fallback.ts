import type { AiChatMessage } from "./prompts";

function extractUserMessage(messages: AiChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === "user") {
      return messages[i].content.trim();
    }
  }
  return "";
}

function extractProfileContext(messages: AiChatMessage[]): string {
  return messages
    .filter((m) => m.role === "system" && m.content.includes("Brandentify user context:"))
    .map((m) => m.content.replace(/^Brandentify user context:\n?/i, "").trim())
    .join("\n");
}

function pickTopic(message: string): string {
  const lower = message.toLowerCase();
  if (/resume|cv|ats|cover letter/.test(lower)) return "resume";
  if (/linkedin|profile|headline|about section|portfolio/.test(lower)) return "profile";
  if (/network|connect|referral|outreach|cold email/.test(lower)) return "networking";
  if (/interview|offer|salary|negotiat/.test(lower)) return "interview";
  if (/quest|brandquest|xp|badge/.test(lower)) return "quests";
  if (/brand|personal brand|positioning|tagline/.test(lower)) return "branding";
  if (/job|career|role|promotion|switch/.test(lower)) return "career";
  return "general";
}

function profileLine(context: string, key: string): string | null {
  const match = context.match(new RegExp(`^${key}:\\s*(.+)$`, "im"));
  return match?.[1]?.trim() || null;
}

function buildResponse(topic: string, message: string, context: string): string {
  const name = profileLine(context, "Name");
  const title = profileLine(context, "Title");
  const industry = profileLine(context, "Industry");
  const location = profileLine(context, "Location");
  const greeting = name ? `${name}, ` : "";

  const roleHint = title
    ? `As a **${title}**${industry ? ` in **${industry}**` : ""}${location ? ` (${location})` : ""}, `
    : "";

  const templates: Record<string, string> = {
    resume: `${greeting}here is a focused resume plan:

## Quick read on your question
You asked about: "${message.slice(0, 160)}"

## What to fix first (this week)
1. **Lead with outcomes** — replace task bullets with metrics (%, $, time saved, users impacted).
2. **Tailor the top third** — summary + latest role should mirror the target role keywords.
3. **ATS hygiene** — one column, standard headings, no tables/icons, export as PDF from a clean source.

## 3 actions for today
- Rewrite your top 3 bullets using: *verb + scope + result*.
- Add 8–12 role-specific keywords from 3 target job posts.
- Cut anything older than ~10 years unless it is a major brand signal.

## Musk take
${roleHint}clarity beats length. Recruiters skim in seconds — make the first screen undeniable.`,

    profile: `${greeting}here is how to sharpen your professional profile:

## Your focus
"${message.slice(0, 160)}"

## Profile upgrades (high impact)
1. **Headline** — role + niche + proof (e.g. "Product Lead | B2B SaaS | Shipped 0→1 in 9 months").
2. **About** — 3 short paragraphs: who you help → proof → what you want next.
3. **Featured** — pin 1 case study, 1 post, 1 portfolio link.

## This week
- Post one insight from your real work (not generic motivation).
- Comment thoughtfully on 5 posts from people in your target network.
- Complete BrandQuest profile tasks to raise completion %.

## Musk take
${roleHint}your profile is a landing page, not a biography. Optimize for the next opportunity, not your entire history.`,

    networking: `${greeting}networking plan that actually converts:

## Context
"${message.slice(0, 160)}"

## Playbook
1. **Define 20 targets** — peers + hiring managers + creators in your space.
2. **Warm openers** — reference their post/project, then one specific ask.
3. **Give first** — share a useful intro, resource, or feedback before you request anything.

## Message template
> Hi [Name] — I liked your post on [topic]. I'm a ${title || "professional"} working on [specific area]. Would you be open to a 15-min swap on [specific topic]?

## Musk take
${roleHint}volume without relevance is spam. Ten precise messages beat a hundred generic ones.`,

    interview: `${greeting}interview prep that wins:

## You asked
"${message.slice(0, 160)}"

## Structure
1. **Stories** — prepare 5 STAR stories (Situation, Task, Action, Result).
2. **Role thesis** — one sentence: why you + why this company + why now.
3. **Questions** — ask about success metrics, team bottlenecks, and first-90-day priorities.

## Day-before checklist
- Research 2 recent company moves and 1 competitor angle.
- Rehearse 60-second intro out loud twice.
- Prepare salary range from market data, not feelings.

## Musk take
Interviews reward prepared clarity. Don't memorize scripts — memorize proof.`,

    quests: `${greeting}BrandQuest momentum plan:

## Your question
"${message.slice(0, 160)}"

## How to use BrandQuests well
1. Pick quests aligned with your **brand goal** (visibility, skills, or network).
2. Ship the deliverable the same day — partial credit compounds slowly.
3. Stack XP weekly; badges signal consistency to visitors.

## Suggested focus this week
- One **profile** quest (headline, about, or project).
- One **content** quest (Industry Pulse post with a clear takeaway).
- One **network** quest (5 intentional connections).

## Musk take
Gamification only works if you execute. Finish small, publish fast, iterate publicly.`,

    branding: `${greeting}personal brand clarity:

## Prompt
"${message.slice(0, 160)}"

## Positioning stack
1. **Audience** — who you want to be known by.
2. **Promise** — the outcome you deliver.
3. **Proof** — 3 artifacts (projects, posts, metrics).

## 7-day sprint
- Day 1–2: rewrite headline + tagline.
- Day 3–4: publish one proof-of-work post.
- Day 5–7: engage daily with your target audience.

## Musk take
${roleHint}brand is repeated proof in public. Pick a lane and dominate it.`,

    career: `${greeting}career move framework:

## You asked
"${message.slice(0, 160)}"

## Decision lens
1. **Skill market fit** — are you building skills that are rising in demand?
2. **Trajectory** — does the next role increase scope, proof, or network?
3. **Optionality** — will this role open more paths in 18 months?

## Next steps
- List 3 target roles and score each on growth, pay, and learning.
- Run 3 informational chats this week.
- Update one resume variant per target role.

## Musk take
${roleHint}optimize for slope, not title. The best move increases your surface area for luck.`,

    general: `${greeting}here is a practical answer:

## Your question
"${message.slice(0, 200)}"

## Recommended next steps
1. Clarify the outcome you want in one sentence.
2. Identify the smallest public action you can take in 24 hours.
3. Measure one metric (profile views, replies, applications, or shipped work).

## Brandentifier actions
- Strengthen your profile completion and featured projects.
- Complete a BrandQuest that matches your goal this week.
- Post one Industry Pulse insight from real experience.

## Musk take
${roleHint}speed matters. Ship something imperfect today, refine tomorrow.`,
  };

  return templates[topic] || templates.general;
}

export function generateMuskChatFallback(messages: AiChatMessage[]): string {
  const userMessage = extractUserMessage(messages);
  const profileContext = extractProfileContext(messages);
  const topic = pickTopic(userMessage || "help");
  return buildResponse(topic, userMessage || "How can I grow my professional brand?", profileContext);
}

export async function streamFallbackContent(
  content: string,
  onToken?: (token: string) => void,
  chunkSize = 48
): Promise<void> {
  if (!onToken) return;
  for (let i = 0; i < content.length; i += chunkSize) {
    onToken(content.slice(i, i + chunkSize));
    await new Promise((resolve) => setTimeout(resolve, 8));
  }
}
