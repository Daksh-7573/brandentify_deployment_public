import type { VercelRequest, VercelResponse } from "@vercel/node";

let isReady = false;
let expressApp: import("express").Express | null = null;

/**
 * Vercel serverless entry for /api/* and /health.
 * Frontend is served from dist/public via vercel.json rewrites.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isReady) {
    process.env.VERCEL = "1";
    process.env.NODE_ENV = process.env.NODE_ENV || "production";

    const { app, bootstrapApp } = await import("../server/index.js");
    await bootstrapApp(app);
    expressApp = app;
    isReady = true;
  }

  return expressApp!(req, res);
}
