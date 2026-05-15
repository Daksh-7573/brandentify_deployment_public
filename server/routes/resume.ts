import express from "express";
import { upload } from "../middleware/upload";
import { analyzeMuskResume } from "../services/musk-resume-service";
import { addMessageToMemory } from "../services/conversation-memory";

const router = express.Router();

router.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    const userId = Number.parseInt(String(req.body?.userId ?? ''), 10);
    const resumeText = typeof req.body?.resumeText === "string"
      ? req.body.resumeText.trim()
      : typeof req.file?.buffer === "object"
        ? req.file.buffer.toString("utf8")
        : "";
    const fileName = typeof req.file?.originalname === "string" ? req.file.originalname : undefined;

    if (!Number.isFinite(userId)) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!resumeText) {
      return res.status(400).json({ error: "Resume content is required" });
    }

    const analysis = await analyzeMuskResume({ userId, resumeText, fileName });
    await addMessageToMemory(String(userId), "musk", analysis.summary, "resume_help", {
      type: "resume_analysis",
      fileName: fileName ?? null,
      score: analysis.score,
    });

    return res.status(200).json({
      success: true,
      message: "Resume analysis complete.",
      analysis,
    });
  } catch (error) {
    console.error("[resume/analyze] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to analyze resume.",
      analysis: null,
    });
  }
});

export default router;
