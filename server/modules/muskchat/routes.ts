import { Router, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { storage } from "../../storage";
import {
  createUserMessage,
  deleteConversation,
  generateChatCompletion,
  getMessagesForUser,
  listConversations,
  persistAssistantMessage,
} from "./chat-service";
import {
  analyzeResumeUpload,
  persistResumeUpload,
  validateResumeFile,
} from "./resume-service";
import type { AuthenticatedMuskUser } from "./types";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || "development-only-secret";

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 24,
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    try {
      validateResumeFile(file as Express.Multer.File);
      cb(null, true);
    } catch (error) {
      cb(error as Error);
    }
  },
});

function readUserIdFromUnsafeDevFallback(req: Request): number | null {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const raw = req.body?.userId ?? req.query?.userId ?? req.get("x-user-id");
  const userId = Number.parseInt(String(raw || ""), 10);
  return Number.isFinite(userId) ? userId : null;
}

async function requireMuskAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.brandentifier_session;
    let userId: number | null = null;
    let email: string | undefined;
    let name: string | undefined;

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId?: number; email?: string; name?: string };
      userId = typeof decoded.userId === "number" ? decoded.userId : null;
      email = decoded.email;
      name = decoded.name;
    } else {
      userId = readUserIdFromUnsafeDevFallback(req);
    }

    if (!userId) {
      return res.status(401).json({ success: false, error: "Sign in to use Musk Chat 2.0." });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ success: false, error: "User session is invalid." });
    }

    (req as Request & { muskUser?: AuthenticatedMuskUser }).muskUser = {
      id: user.id,
      email: user.email || email,
      name: user.name || name,
    };

    next();
  } catch (error) {
    console.warn("[MuskChat2] Auth failed:", error instanceof Error ? error.message : String(error));
    return res.status(401).json({ success: false, error: "Your session expired. Sign in again to continue." });
  }
}

function getMuskUser(req: Request): AuthenticatedMuskUser {
  const user = (req as Request & { muskUser?: AuthenticatedMuskUser }).muskUser;
  if (!user) {
    throw new Error("Musk auth middleware did not attach a user");
  }
  return user;
}

function writeSse(res: Response, event: string, payload: unknown) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

const chatSchema = z.object({
  message: z.string().trim().min(1).max(8000),
  conversationId: z.number().int().positive().optional(),
  stream: z.boolean().optional(),
});

router.post("/chat", requireMuskAuth, chatLimiter, async (req, res) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: "Enter a valid message." });
  }

  const user = getMuskUser(req);
  const wantsStream = parsed.data.stream === true || req.accepts("text/event-stream") === "text/event-stream";

  try {
    const { conversation, message: userMessage } = await createUserMessage({
      userId: user.id,
      conversationId: parsed.data.conversationId,
      content: parsed.data.message,
    });

    if (wantsStream) {
      res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders?.();

      writeSse(res, "conversation", { conversation, userMessage });
      let providerMeta = { provider: "fallback", model: "deterministic-fallback" };

      const ai = await generateChatCompletion({
        user,
        conversationId: conversation.id,
        userMessage: parsed.data.message,
        handlers: {
          onProvider: (provider, model) => {
            providerMeta = { provider, model };
            writeSse(res, "provider", providerMeta);
          },
          onToken: (token) => writeSse(res, "token", { token }),
        },
      });

      const assistantMessage = await persistAssistantMessage({
        conversationId: conversation.id,
        content: ai.content,
        providerUsed: ai.provider,
      });

      writeSse(res, "done", {
        success: true,
        conversationId: conversation.id,
        assistantMessage,
        provider: ai.provider,
        model: ai.model,
        fallbackUsed: ai.fallbackUsed,
        providerMeta,
      });
      return res.end();
    }

    const ai = await generateChatCompletion({
      user,
      conversationId: conversation.id,
      userMessage: parsed.data.message,
    });
    const assistantMessage = await persistAssistantMessage({
      conversationId: conversation.id,
      content: ai.content,
      providerUsed: ai.provider,
    });

    return res.json({
      success: true,
      conversation,
      userMessage,
      assistantMessage,
      response: ai.content,
      provider: ai.provider,
      model: ai.model,
      fallbackUsed: ai.fallbackUsed,
    });
  } catch (error) {
    console.error("[MuskChat2] Chat route failed:", error);
    return res.status(500).json({
      success: false,
      error: "Musk Chat 2.0 could not process that message. Please try again.",
    });
  }
});

router.post(
  "/upload-resume",
  requireMuskAuth,
  uploadLimiter,
  upload.single("resume"),
  async (req, res) => {
    const user = getMuskUser(req);
    const conversationId = req.body?.conversationId
      ? Number.parseInt(String(req.body.conversationId), 10)
      : undefined;

    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: "Upload a PDF resume (.pdf)." });
      }

      const { conversation, message: userMessage } = await createUserMessage({
        userId: user.id,
        conversationId: Number.isFinite(conversationId) ? conversationId : undefined,
        content: `Analyze my resume: ${req.file.originalname}`,
      });

      const analysis = await analyzeResumeUpload({
        userId: user.id,
        conversationId: conversation.id,
        file: req.file,
      });

      const uploadRecord = await persistResumeUpload({
        userId: user.id,
        conversationId: conversation.id,
        fileName: req.file.originalname,
        fileUrl: analysis.fileUrl,
        extractedText: analysis.extractedText,
        aiFeedback: analysis.ai.content,
        score: analysis.score,
        providerUsed: analysis.ai.provider,
      });

      const assistantMessage = await persistAssistantMessage({
        conversationId: conversation.id,
        content: analysis.ai.content,
        providerUsed: analysis.ai.provider,
      });

      return res.json({
        success: true,
        conversation,
        userMessage,
        assistantMessage,
        upload: uploadRecord,
        extractedTextPreview: analysis.extractedText.slice(0, 1600),
        response: analysis.ai.content,
        analysis: {
          summary: analysis.ai.content,
          score: analysis.score,
          provider: analysis.ai.provider,
          model: analysis.ai.model,
          fallbackUsed: analysis.ai.fallbackUsed,
        },
        score: analysis.score,
        provider: analysis.ai.provider,
        model: analysis.ai.model,
      });
    } catch (error) {
      console.error("[MuskChat2] Resume upload failed:", error);
      const message = error instanceof Error ? error.message : "Resume upload failed.";
      return res.status(400).json({
        success: false,
        error: message,
      });
    }
  }
);

router.get("/conversations", requireMuskAuth, async (req, res) => {
  try {
    const user = getMuskUser(req);
    const conversations = await listConversations(user.id);
    return res.json({ success: true, conversations });
  } catch (error) {
    console.error("[MuskChat2] Conversation list failed:", error);
    return res.status(500).json({ success: false, error: "Could not load conversations." });
  }
});

router.get("/messages/:conversationId", requireMuskAuth, async (req, res) => {
  const conversationId = Number.parseInt(req.params.conversationId, 10);
  if (!Number.isFinite(conversationId)) {
    return res.status(400).json({ success: false, error: "Invalid conversation." });
  }

  try {
    const user = getMuskUser(req);
    const messages = await getMessagesForUser(conversationId, user.id);
    if (!messages) {
      return res.status(404).json({ success: false, error: "Conversation not found." });
    }
    return res.json({ success: true, messages });
  } catch (error) {
    console.error("[MuskChat2] Message load failed:", error);
    return res.status(500).json({ success: false, error: "Could not load messages." });
  }
});

router.delete("/conversation/:id", requireMuskAuth, async (req, res) => {
  const conversationId = Number.parseInt(req.params.id, 10);
  if (!Number.isFinite(conversationId)) {
    return res.status(400).json({ success: false, error: "Invalid conversation." });
  }

  try {
    const user = getMuskUser(req);
    const deleted = await deleteConversation(user.id, conversationId);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Conversation not found." });
    }
    return res.json({ success: true });
  } catch (error) {
    console.error("[MuskChat2] Delete conversation failed:", error);
    return res.status(500).json({ success: false, error: "Could not delete conversation." });
  }
});

router.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[MuskChat2] Route error:", error);
  return res.status(400).json({
    success: false,
    error: error.message || "Musk Chat 2.0 request failed.",
  });
});

export default router;
