import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import fileUpload from "express-fileupload";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { questProgressMiddleware } from "./middleware/quest-progress-tracker";
import { setupSecurity, validateFileUpload } from "./security";
import { setupInfrastructureSecurity } from "./infrastructure-security";
import { setupPrivacyRoutes } from "./privacy-compliance";
import { aiSecurityMiddleware } from "./ai-security";
import { securityMonitoringMiddleware } from "./security-monitoring";
import securityDashboardRoutes from "./security-dashboard";
import { firebaseAuthRedirectHandler } from "./firebase-auth-handler";
import { apiGateway } from "./services/api-gateway";
import { messageQueue, TaskTypes } from "./services/message-queue";

const app = express();
// Increase body size limit to handle file uploads (25MB)
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: false, limit: '25mb' }));

// Firebase Auth Handler - detect and handle Firebase auth redirects early in the middleware stack
app.use(firebaseAuthRedirectHandler);

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

// Setup express-fileupload middleware with enhanced security
app.use(fileUpload({
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max file size (to accommodate 20MB images + overhead)
  useTempFiles: true,
  tempFileDir: path.join(process.cwd(), 'tmp'),
  createParentPath: true,
  debug: process.env.NODE_ENV === 'development', // Enable debug mode in development
  abortOnLimit: true, // Prevent DOS attacks
  safeFileNames: true, // Remove special characters 
  preserveExtension: true // Preserve file extension
}));

// Add secure file validation middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  if (!req.files) {
    return next();
  }
  
  // Skip validation for media upload endpoints that have their own validation
  const mediaUploadPaths = ['/api/pulses/upload-media', '/api/projects/upload-media'];
  if (mediaUploadPaths.some(path => req.path.includes(path))) {
    return next();
  }
  
  // Loop through all uploaded files to validate them
  const fileArray = Object.values(req.files as Record<string, any>).flat();
  
  for (const file of fileArray) {
    const validation = validateFileUpload(file);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'INVALID_FILE',
        message: validation.message || 'Invalid file uploaded'
      });
    }
  }
  
  next();
});

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
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
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

// Setup security features (in a non-breaking way)
console.log("Setting up Enhanced Security Features");
setupSecurity(app);

// Setup infrastructure and hosting security (in a non-breaking way)
console.log("Setting up Infrastructure & Hosting Security");
setupInfrastructureSecurity(app);

// Setup privacy and compliance features (in a non-breaking way)
console.log("Setting up Privacy & Compliance Features");
setupPrivacyRoutes(app);

// Setup AI-specific security middleware (in a non-breaking way)
console.log("Setting up AI-Specific Security");
app.use(aiSecurityMiddleware);

// Setup security monitoring and threat detection (in a non-breaking way)
console.log("Setting up Security Monitoring & Threat Detection");
app.use(securityMonitoringMiddleware);

// Add security dashboard routes (admin only)
app.use('/api/security', securityDashboardRoutes);

// Setup API Gateway and Message Queue (Phase 3: Microservices Architecture)
console.log("Setting up API Gateway and Message Queue services");
app.use(apiGateway.routeRequest);
app.use(apiGateway.healthCheckMiddleware);
app.use(apiGateway.timeoutMiddleware);

// Initialize message queue handlers
messageQueue.registerHandler(TaskTypes.EMAIL_NOTIFICATION, async (payload) => {
  console.log('Processing email notification:', payload);
  // Email processing would be handled here
});

messageQueue.registerHandler(TaskTypes.AI_PROCESSING, async (payload) => {
  console.log('Processing AI task:', payload);
  // AI processing would be handled here
});

messageQueue.registerHandler(TaskTypes.USER_ACTIVITY_LOG, async (payload) => {
  console.log('Logging user activity:', payload);
  // User activity logging would be handled here
});

console.log("Phase 3 microservices architecture initialized");

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
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
