import { Request, Response } from "express";

export const analyzeResumeController = async (req: Request, res: Response) => {
  return res.status(410).json({
    success: false,
    message: "Resume analysis is temporarily disabled"
  });
};
