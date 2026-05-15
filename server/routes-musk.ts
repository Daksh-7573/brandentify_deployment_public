import { Request, Response } from 'express';
import { storage } from './storage';
import { createUserMessage, generateChatCompletion, getMessagesForUser, listConversations, persistAssistantMessage } from './modules/muskchat/chat-service';
import { analyzeResumeUpload, persistResumeUpload, extractResumeText, validateResumeFile } from './modules/muskchat/resume-service';
import { buildPitchDeckMessages, buildResumeMessages, buildChatMessages } from './services/ai/prompts';
import { generateBrandentifyResponse } from './services/ai/provider';
import { generateMuskChatFallback, streamFallbackContent } from './services/ai/musk-chat-fallback';
import { generateOutcomeAnchoredFollowUps } from './services/musk-followup-intelligence';
import { resolveResumeUploadFile } from './utils/resume-upload-file';

function getUploadedFile(req: Request, preferredKeys: string[]): any | null {
  const fileBag = (req as any).files || {};
  for (const key of preferredKeys) {
    const value = fileBag[key];
    if (value) {
      return Array.isArray(value) ? value[0] : value;
    }
  }
  return (req as any).file || null;
}

function extractUserId(req: Request): number | null {
  const raw = req.body?.userId ?? req.query?.userId ?? req.params?.userId;
  const parsed = Number.parseInt(String(raw ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export const handleMuskChat = async (req: Request, res: Response) => {
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  const userId = extractUserId(req);
  const conversationId = typeof req.body?.conversationId === 'number'
    ? req.body.conversationId
    : req.body?.conversationId
      ? Number.parseInt(String(req.body.conversationId), 10)
      : undefined;
  const wantsStream = req.body?.stream === true || req.headers.accept?.includes('text/event-stream');

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const user = await storage.getUser(userId);
    const conversations = await listConversations(userId);
    const existingConversationId = Number.isFinite(conversationId) ? conversationId : conversations[0]?.id;

    const { conversation, message: userMessage } = await createUserMessage({
      userId,
      conversationId: existingConversationId,
      content: message,
    });

    const pastMessages = await getMessagesForUser(conversation.id, userId) || [];
    const chatHistory = pastMessages.map((entry) => ({ role: entry.role, content: entry.content }));
    const profileContext = [
      user?.name ? `Name: ${user.name}` : '',
      user?.title ? `Title: ${user.title}` : '',
      user?.industry ? `Industry: ${user.industry}` : '',
      user?.domain ? `Domain: ${user.domain}` : '',
      user?.location ? `Location: ${user.location}` : '',
      user?.lookingFor ? `Looking for: ${user.lookingFor}` : '',
    ].filter(Boolean).join('\n');

    const responseHandlers = wantsStream
      ? {
          onProvider: (provider: string, model: string) => {
            if (!res.headersSent) {
              res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
              res.setHeader('Cache-Control', 'no-cache, no-transform');
              res.setHeader('Connection', 'keep-alive');
              res.flushHeaders?.();
            }
            res.write(`event: provider\n`);
            res.write(`data: ${JSON.stringify({ provider, model })}\n\n`);
          },
          onToken: (token: string) => {
            res.write(`event: token\n`);
            res.write(`data: ${JSON.stringify({ token })}\n\n`);
          },
        }
      : {};

    if (wantsStream) {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();
      res.write(`event: conversation\n`);
      res.write(`data: ${JSON.stringify({ conversation, userMessage })}\n\n`);
    }

    const aiResponse = await generateChatCompletion({
      user: { id: user.id, email: user.email || undefined, name: user.name || undefined },
      conversationId: conversation.id,
      userMessage: message,
      handlers: wantsStream ? responseHandlers : undefined,
    });

    const assistantMessage = await persistAssistantMessage({
      conversationId: conversation.id,
      content: aiResponse.content,
      providerUsed: aiResponse.provider,
    });

    const followUps = generateOutcomeAnchoredFollowUps(
      {
        userId,
        userData: user,
        experiences: await storage.getWorkExperiencesByUserId(userId),
        skills: await storage.getSkillsByUserId(userId),
        educations: await storage.getEducationsByUserId(userId),
        projects: await storage.getProjectsByUserId(userId),
        conversationHistory: chatHistory.map((entry) => ({ content: entry.content, sender: entry.role })),
      },
      'general_advice'
    ).map((entry) => entry.text);

    if (wantsStream) {
      res.write(`event: done\n`);
      res.write(`data: ${JSON.stringify({
        success: true,
        conversationId: conversation.id,
        assistantMessage,
        response: aiResponse.content,
        quickResponses: followUps,
        provider: aiResponse.provider,
        model: aiResponse.model,
        fallbackUsed: aiResponse.fallbackUsed,
      })}\n\n`);
      return res.end();
    }

    return res.status(200).json({
      success: true,
      id: `response-${Date.now()}`,
      message: aiResponse.content,
      response: aiResponse.content,
      quickResponses: followUps,
      timestamp: new Date(),
      enhanced: true,
      metadata: {
        provider: aiResponse.provider,
        model: aiResponse.model,
        fallbackUsed: aiResponse.fallbackUsed,
      },
      contextUsed: {
        dataSource: 'postgres',
        hasResumeData: Boolean(user?.title || user?.industry || user?.domain || user?.lookingFor),
        detectedRole: user?.title ?? null,
        hasUserMemory: pastMessages.length > 0,
      },
    });
  } catch (error) {
    console.error('[Musk Chat] Error processing message:', error);

    const fallbackMessages = buildChatMessages({
      userMessage: message,
      history: [],
      profileContext: '',
    });
    const fallbackContent = generateMuskChatFallback(fallbackMessages);

    if (wantsStream && !res.headersSent) {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();
      res.write(`event: provider\n`);
      res.write(`data: ${JSON.stringify({ provider: 'fallback', model: 'musk-coach-fallback' })}\n\n`);
      await streamFallbackContent(fallbackContent, (token) => {
        res.write(`event: token\n`);
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      });
      res.write(`event: done\n`);
      res.write(`data: ${JSON.stringify({
        success: true,
        response: fallbackContent,
        provider: 'fallback',
        model: 'musk-coach-fallback',
        fallbackUsed: true,
      })}\n\n`);
      return res.end();
    }

    if (wantsStream && res.headersSent) {
      await streamFallbackContent(fallbackContent, (token) => {
        res.write(`event: token\n`);
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      });
      res.write(`event: done\n`);
      res.write(`data: ${JSON.stringify({
        success: true,
        response: fallbackContent,
        provider: 'fallback',
        model: 'musk-coach-fallback',
        fallbackUsed: true,
      })}\n\n`);
      return res.end();
    }

    return res.status(200).json({
      success: true,
      id: `response-${Date.now()}`,
      message: fallbackContent,
      response: fallbackContent,
      quickResponses: ['Tell me more about this', 'What are the next steps?', 'How can I apply this?'],
      timestamp: new Date(),
      metadata: {
        provider: 'fallback',
        model: 'musk-coach-fallback',
        fallbackUsed: true,
      },
    });
  }
};

export const handleMuskHistory = async (req: Request, res: Response) => {
  const userId = extractUserId(req);

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const conversations = await listConversations(userId);
  const latestConversation = conversations[0];

  if (!latestConversation) {
    return res.status(200).json({ success: true, userId, messages: [] });
  }

  const messages = await getMessagesForUser(latestConversation.id, userId) || [];

  return res.status(200).json({
    success: true,
    userId,
    messages: messages.map((entry) => ({
      role: entry.role === 'assistant' ? 'musk' : 'user',
      message: entry.content,
      timestamp: entry.createdAt,
    })),
  });
};

export const handlePitchDeckUpload = async (req: Request, res: Response) => {
  const userId = extractUserId(req);
  const rawText = typeof req.body?.pitchDeckText === 'string' ? req.body.pitchDeckText.trim() : '';

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    let deckText = rawText;
    let deckName = typeof req.body?.deckName === 'string' ? req.body.deckName.trim() : 'Pitch Deck';

    if (!deckText) {
      const fileLike = await resolveResumeUploadFile(req, ['deck', 'pitchDeck', 'file']);
      if (!fileLike) {
        return res.status(400).json({ success: false, error: 'Upload a PDF pitch deck.' });
      }
      deckName = deckName || fileLike.originalname || 'Pitch Deck';
      validateResumeFile(fileLike);
      deckText = await extractResumeText(fileLike);
    }

    if (!deckText) {
      return res.status(400).json({ error: 'Upload a pitch deck file or include pitchDeckText.' });
    }

    const ai = await generateBrandentifyResponse(buildPitchDeckMessages(deckText), {}, { temperature: 0.35, maxTokens: 1200 });

    return res.status(200).json({
      success: true,
      id: `pitchdeck-${Date.now()}`,
      analysis: ai.content,
      response: ai.content,
      provider: ai.provider,
      model: ai.model,
      fallbackUsed: ai.fallbackUsed,
      deckName,
    });
  } catch (error) {
    console.error('[Musk Chat] Pitch deck analysis failed:', error);
    return res.status(503).json({
      success: false,
      error: error instanceof Error ? error.message : 'Pitch deck analysis failed.',
    });
  }
};

export const handleResumeUpload = async (req: Request, res: Response) => {
  const userId = extractUserId(req);
  const fileName = typeof req.body?.fileName === 'string' ? req.body.fileName.trim() : undefined;

  if (!userId) {
    return res.status(400).json({ success: false, error: 'User ID is required' });
  }

  try {
    const uploadedFile = await resolveResumeUploadFile(req, ['resume', 'file', 'attachment']);

    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        error: 'No resume file received. Upload a PDF using the Resume button.',
      });
    }

    validateResumeFile(uploadedFile);

    const displayName =
      fileName || uploadedFile.originalname || 'resume.pdf';

    const conversationResult = await createUserMessage({
      userId,
      content: `Analyze my resume: ${displayName}`,
    });
    const conversationId = conversationResult.conversation.id;

    const analysis = await analyzeResumeUpload({
      userId,
      conversationId,
      file: uploadedFile,
    });

    let uploadRecord = null;
    try {
      uploadRecord = await persistResumeUpload({
        userId,
        conversationId,
        fileName: displayName,
        fileUrl: analysis.fileUrl,
        extractedText: analysis.extractedText,
        aiFeedback: analysis.ai.content,
        score: analysis.score,
        providerUsed: analysis.ai.provider,
      });
    } catch (persistError) {
      console.warn('[Musk Chat] Resume saved to chat but DB upload record failed:', persistError);
    }

    await persistAssistantMessage({
      conversationId,
      content: analysis.ai.content,
      providerUsed: analysis.ai.provider,
    });

    return res.status(200).json({
      success: true,
      response: analysis.ai.content,
      analysis: {
        summary: analysis.ai.content,
        score: analysis.score,
        highlights: [],
        provider: analysis.ai.provider,
        model: analysis.ai.model,
        fallbackUsed: analysis.ai.fallbackUsed,
      },
      upload: uploadRecord,
      provider: analysis.ai.provider,
      model: analysis.ai.model,
    });
  } catch (error) {
    console.error('[Musk Chat] Resume upload failed:', error);
    const message = error instanceof Error ? error.message : 'Resume upload failed.';
    const isClientError =
      message.includes('PDF') ||
      message.includes('Upload') ||
      message.includes('extract') ||
      message.includes('too large') ||
      message.includes('Only PDF');
    return res.status(isClientError ? 400 : 503).json({
      success: false,
      error: message,
    });
  }
};

export const handleGenerateContextualSuggestions = async (_req: Request, res: Response) => {
  return res.status(200).json({
    suggestions: [
      { text: 'Ask for a 90-day career plan', template_id: 1 },
      { text: 'Request resume feedback', template_id: 2 },
      { text: 'Prepare for interviews', template_id: 3 },
    ],
    source: 'musk-intelligence',
  });
};
