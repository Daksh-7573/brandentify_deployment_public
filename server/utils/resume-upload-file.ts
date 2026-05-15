import fs from "fs/promises";
import type { Request } from "express";

/**
 * Resolve uploaded resume file from multer (req.file) or express-fileupload (req.files).
 */
export async function resolveResumeUploadFile(
  req: Request,
  fieldNames: string[] = ["resume", "file", "attachment"]
): Promise<Express.Multer.File | null> {
  const multerFile = (req as Request & { file?: Express.Multer.File }).file;
  if (multerFile?.buffer?.length) {
    return multerFile;
  }

  const filesBag = (req as Request & { files?: Record<string, unknown> }).files;
  let raw: unknown = null;

  if (filesBag && typeof filesBag === "object") {
    for (const key of fieldNames) {
      const value = (filesBag as Record<string, unknown>)[key];
      if (value) {
        raw = Array.isArray(value) ? value[0] : value;
        break;
      }
    }
  }

  if (!raw) return null;

  return toMulterFile(raw);
}

async function toMulterFile(input: any): Promise<Express.Multer.File> {
  let buffer: Buffer;

  if (Buffer.isBuffer(input?.buffer)) {
    buffer = input.buffer;
  } else if (typeof input?.tempFilePath === "string") {
    buffer = await fs.readFile(input.tempFilePath);
  } else if (Buffer.isBuffer(input?.data)) {
    buffer = input.data;
  } else if (typeof input?.data === "string" && !input.data.startsWith("/")) {
    buffer = Buffer.from(input.data, "utf8");
  } else {
    throw new Error("Could not read the uploaded PDF from the request.");
  }

  const originalname =
    input?.originalname || input?.name || input?.filename || "resume.pdf";
  const mimetype = input?.mimetype || input?.type || "application/pdf";

  return {
    fieldname: input?.fieldname || "resume",
    originalname,
    encoding: input?.encoding || "7bit",
    mimetype,
    size: input?.size || buffer.length,
    destination: "",
    filename: "",
    path: input?.tempFilePath || input?.path || "",
    buffer,
    stream: undefined as any,
  } as Express.Multer.File;
}
