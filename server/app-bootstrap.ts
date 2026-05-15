import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";
import { apiGateway } from "./services/api-gateway";
import { setupVite } from "./vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let initialized = false;
let httpServer: Server | null = null;

export async function bootstrapApp(app: Express): Promise<Express> {
  if (initialized) {
    return app;
  }

  httpServer = await registerRoutes(app);

  console.log("Setting up API Gateway after routes");
  app.use(apiGateway.routeRequest);
  app.use(apiGateway.healthCheckMiddleware);
  app.use(apiGateway.timeoutMiddleware);

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const error = err as { status?: number; statusCode?: number; message?: string };
    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error("[Express Error Middleware]", err);
  });

  initialized = true;
  return app;
}

export function getHttpServer(): Server | null {
  return httpServer;
}

/** Attach static assets or Vite dev server (not used on Vercel — static files served by CDN). */
export async function attachClientHosting(app: Express): Promise<void> {
  const isProduction = process.env.NODE_ENV === "production";
  const server = getHttpServer();
  if (!server) {
    throw new Error("bootstrapApp must run before attachClientHosting");
  }

  if (isProduction) {
    const clientRootCandidates = [
      path.join(__dirname, "public"),
      path.join(process.cwd(), "dist", "public"),
      path.join(process.cwd(), "public"),
    ];

    let clientRoot: string | null = null;
    for (const candidate of clientRootCandidates) {
      if (fs.existsSync(candidate)) {
        clientRoot = candidate;
        break;
      }
    }

    if (!clientRoot) {
      throw new Error(
        `Could not find client build directory. Checked: ${clientRootCandidates.join(", ")}`
      );
    }

    if (process.env.STATIC_ROOT && fs.existsSync(process.env.STATIC_ROOT)) {
      clientRoot = process.env.STATIC_ROOT;
    }

    const express = await import("express");
    app.use(
      "/assets",
      express.default.static(path.join(clientRoot, "assets"), {
        immutable: true,
        maxAge: "1y",
      })
    );
    app.use(express.default.static(clientRoot));

    app.get("*", (req, res) => {
      if (req.path.startsWith("/api/")) {
        return res.status(404).json({ error: "API endpoint not found" });
      }
      res.sendFile(path.join(clientRoot!, "index.html"));
    });
  } else {
    await setupVite(app, server);
  }
}
