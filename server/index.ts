import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import fileUpload from "express-fileupload";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { questProgressMiddleware } from "./middleware/quest-progress-tracker";
import { applySecurityConfig } from "./config/security-config";
import { DataPrivacyService } from './services/data-privacy-service';
import securityMonitoringRoutes from './routes-security-monitoring';
import { 
  errorMonitoringMiddleware, 
  attackDetectionMiddleware, 
  adminActionLoggingMiddleware,
  requestMetricsMiddleware
} from './middleware/security-monitoring-middleware';
import { SecurityMonitoringService } from './services/security-monitoring-service';

const app = express();

// Apply security configurations
applySecurityConfig(app);
// Increase body size limit to handle file uploads (10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Apply security monitoring middleware
app.use(requestMetricsMiddleware); // Track request metrics for all requests
app.use(attackDetectionMiddleware); // Detect attack attempts
// Only apply admin action logging to admin routes, not globally
// app.use(adminActionLoggingMiddleware);

// Request timeout middleware (45 seconds)
const requestTimeout = (req: Request, res: Response, next: NextFunction) => {
  // Skip timeout for non-AI-related endpoints
  if (!req.path.includes('/ai/')) {
    return next();
  }
  
  const timeout = 45000; // 45 seconds timeout for AI requests
  res.setTimeout(timeout, () => {
    console.log(`Request to ${req.path} timed out after ${timeout}ms`);
    if (!res.headersSent) {
      res.status(503).json({
        error: "TIMEOUT",
        message: "The request took too long to process. Please try again with a shorter resume text or contact support."
      });
    }
  });
  next();
};

app.use(requestTimeout);

// Setup express-fileupload middleware
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
  useTempFiles: true,
  tempFileDir: path.join(process.cwd(), 'tmp'),
  createParentPath: true,
  debug: process.env.NODE_ENV === 'development' // Enable debug mode in development
}));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
const projectDir = path.join(uploadsDir, 'projects');
const mediaDir = path.join(uploadsDir, 'media');

// Ensure directories exist
import fs from 'fs';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(projectDir)) {
  fs.mkdirSync(projectDir, { recursive: true });
}
if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

// Serve static files from public directory
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));
// Serve the public directory directly for things like upload-test.html
app.use(express.static(path.join(process.cwd(), 'public')));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        // Sanitize PII data from logs using DataPrivacyService
        try {
          const sanitizedResponse = JSON.stringify(capturedJsonResponse);
          const sanitizedLogResponse = DataPrivacyService.sanitizeLogging(sanitizedResponse);
          logLine += ` :: ${sanitizedLogResponse}`;
        } catch (error) {
          // Fallback if sanitization fails - avoid showing raw data
          logLine += " :: [Response with potential PII data - not shown]";
        }
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Apply the optimized quest progress tracking middleware
console.log("Setting up Optimized Quest Progress Tracking Middleware");
app.use(questProgressMiddleware);

// Register security monitoring routes
app.use(securityMonitoringRoutes);
console.log("Security Monitoring and Threat Detection system initialized");

(async () => {
  const server = await registerRoutes(app);

  // Add error monitoring middleware for security logging
  app.use(errorMonitoringMiddleware);
  
  // Global error handler
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
