import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "../../db";
import { storage } from "../../storage";
import {
  muskChatConversations,
  muskChatMessages,
  muskResumeUploads,
} from "@shared/schema";
import { generateMuskChatResponse } from "./ai-provider";
import { buildChatMessages } from "./prompts";
import type { AuthenticatedMuskUser, MuskProviderResult, MuskStreamHandlers } from "./types";

const MAX_HISTORY_MESSAGES = 24;

function createTitle(message: string): string {
  const normalized = message.replace(/\s+/g, " ").trim();
  if (!normalized) return "New chat";
  return normalized.length > 64 ? `${normalized.slice(0, 61)}...` : normalized;
}

async function buildProfileContext(userId: number): Promise<string> {
  try {
    const [user, experiences, educations, skills, projects, latestResume] = await Promise.all([
      storage.getUser(userId),
      storage.getWorkExperiencesByUserId(userId).catch(() => []),
      storage.getEducationsByUserId(userId).catch(() => []),
      storage.getSkillsByUserId(userId).catch(() => []),
      storage.getProjectsByUserId(userId).catch(() => []),
      db
        .select()
        .from(muskResumeUploads)
        .where(eq(muskResumeUploads.userId, userId))
        .orderBy(desc(muskResumeUploads.createdAt))
        .limit(1)
        .catch(() => []),
    ]);

    const lines = [
      user?.name ? `Name: ${user.name}` : "",
      user?.title ? `Title: ${user.title}` : "",
      user?.industry ? `Industry: ${user.industry}` : "",
      user?.domain ? `Domain: ${user.domain}` : "",
      user?.location ? `Location: ${user.location}` : "",
      user?.lookingFor ? `Looking for: ${user.lookingFor}` : "",
      experiences.length ? `Experience: ${experiences.slice(0, 4).map((exp: any) => `${exp.title} at ${exp.company}`).join("; ")}` : "",
      educations.length ? `Education: ${educations.slice(0, 3).map((edu: any) => `${edu.degree} at ${edu.institution}`).join("; ")}` : "",
      skills.length ? `Skills: ${skills.slice(0, 16).map((skill: any) => skill.name).join(", ")}` : "",
      projects.length ? `Projects: ${projects.slice(0, 4).map((project: any) => project.title).join(", ")}` : "",
      latestResume[0]?.extractedText ? `Latest resume preview: ${latestResume[0].extractedText.slice(0, 1200)}` : "",
    ];

    return lines.filter(Boolean).join("\n");
  } catch (error) {
    console.warn("[MuskChat2] Failed to build profile context:", error instanceof Error ? error.message : String(error));
    return "";
  }
}

export async function listConversations(userId: number) {
  return db
    .select()
    .from(muskChatConversations)
    .where(eq(muskChatConversations.userId, userId))
    .orderBy(desc(muskChatConversations.updatedAt))
    .limit(50);
}

export async function getConversationForUser(conversationId: number, userId: number) {
  const [conversation] = await db
    .select()
    .from(muskChatConversations)
    .where(and(eq(muskChatConversations.id, conversationId), eq(muskChatConversations.userId, userId)))
    .limit(1);

  return conversation;
}

export async function getMessagesForUser(conversationId: number, userId: number) {
  const conversation = await getConversationForUser(conversationId, userId);
  if (!conversation) {
    return null;
  }

  return db
    .select()
    .from(muskChatMessages)
    .where(eq(muskChatMessages.conversationId, conversationId))
    .orderBy(asc(muskChatMessages.createdAt));
}

export async function deleteConversation(userId: number, conversationId: number): Promise<boolean> {
  const conversation = await getConversationForUser(conversationId, userId);
  if (!conversation) {
    return false;
  }

  await db.delete(muskChatConversations).where(eq(muskChatConversations.id, conversationId));
  return true;
}

async function ensureConversation(userId: number, conversationId: number | undefined, firstMessage: string) {
  if (conversationId) {
    const existing = await getConversationForUser(conversationId, userId);
    if (!existing) {
      throw new Error("Conversation not found");
    }
    return existing;
  }

  const [created] = await db
    .insert(muskChatConversations)
    .values({
      userId,
      title: createTitle(firstMessage),
    })
    .returning();

  return created;
}

export async function createUserMessage(params: {
  userId: number;
  conversationId?: number;
  content: string;
}) {
  const conversation = await ensureConversation(params.userId, params.conversationId, params.content);

  const [message] = await db
    .insert(muskChatMessages)
    .values({
      conversationId: conversation.id,
      role: "user",
      content: params.content,
    })
    .returning();

  await db
    .update(muskChatConversations)
    .set({ updatedAt: new Date(), title: conversation.title === "New chat" ? createTitle(params.content) : conversation.title })
    .where(eq(muskChatConversations.id, conversation.id));

  return { conversation, message };
}

export async function persistAssistantMessage(params: {
  conversationId: number;
  content: string;
  providerUsed: string;
}) {
  const [message] = await db
    .insert(muskChatMessages)
    .values({
      conversationId: params.conversationId,
      role: "assistant",
      content: params.content,
      providerUsed: params.providerUsed,
    })
    .returning();

  await db
    .update(muskChatConversations)
    .set({ updatedAt: new Date() })
    .where(eq(muskChatConversations.id, params.conversationId));

  return message;
}

export async function generateChatCompletion(params: {
  user: AuthenticatedMuskUser;
  conversationId: number;
  userMessage: string;
  handlers?: Partial<MuskStreamHandlers>;
}): Promise<MuskProviderResult> {
  const [historyRows, profileContext] = await Promise.all([
    db
      .select({
        role: muskChatMessages.role,
        content: muskChatMessages.content,
      })
      .from(muskChatMessages)
      .where(eq(muskChatMessages.conversationId, params.conversationId))
      .orderBy(desc(muskChatMessages.createdAt))
      .limit(MAX_HISTORY_MESSAGES),
    buildProfileContext(params.user.id),
  ]);

  const history = historyRows.reverse().map((row) => ({
    role: row.role,
    content: row.content,
  }));

  const messages = buildChatMessages({
    userMessage: params.userMessage,
    history,
    profileContext,
  });

  return generateMuskChatResponse(messages, params.handlers);
}
