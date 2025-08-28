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
import { muskPulseScheduler } from "./services/musk-pulse-scheduler";
import { cacheMiddleware } from "./middleware/cache-middleware";
import { performanceMiddleware } from "./middleware/performance-middleware";

const app = express();

// Configure for external domain access with specific trust proxy setting for rate limiting
app.set('trust proxy', 1); // Trust only the first proxy (Replit's load balancer)

// Add performance middleware first
app.use(performanceMiddleware());

// Force removal of X-Frame-Options header - this must run before all other middleware
app.use((req, res, next) => {
  // Remove any existing X-Frame-Options header
  res.removeHeader('X-Frame-Options');
  
  // Override the setHeader method to prevent X-Frame-Options from being set
  const originalSetHeader = res.setHeader.bind(res);
  res.setHeader = function(name: string, value: any) {
    if (name.toLowerCase() === 'x-frame-options') {
      console.log(`🚫 Blocked attempt to set X-Frame-Options: ${value}`);
      return this; // Don't set the header
    }
    return originalSetHeader(name, value);
  };
  
  // Also override res.end to ensure no headers are set at response time
  const originalEnd = res.end.bind(res);
  res.end = function(chunk?: any, encoding?: any) {
    // Final removal of X-Frame-Options right before sending response (only if headers haven't been sent)
    if (!this.headersSent) {
      this.removeHeader('X-Frame-Options');
      console.log(`🔧 Final response for ${req.method} ${req.path} - headers:`, this.getHeaders());
    }
    return originalEnd.call(this, chunk, encoding);
  };
  
  console.log(`🔧 Request: ${req.method} ${req.path} - X-Frame-Options removal applied`);
  next();
});

app.use((req, res, next) => {
  // Allow access from Replit domains and external sources
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Frame-Options');
  // Forcibly remove X-Frame-Options to allow iframe embedding
  res.removeHeader('X-Frame-Options');
  res.header('X-Content-Type-Options', 'nosniff');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

// Very first handler - career capsule POST bypass (before any middleware that touches the body)
app.use('/api/users/:userId/career-capsule', (req, res, next) => {
  if (req.method === 'POST') {
    console.log('[Ultra Early Career Capsule Handler] Intercepting POST before any body parsing');
    console.log('[Ultra Early Career Capsule Handler] Request headers:', req.headers);
    console.log('[Ultra Early Career Capsule Handler] Content-Length:', req.headers['content-length']);
    
    let rawBody = '';
    req.setEncoding('utf8');
    
    req.on('data', (chunk) => {
      console.log('[Ultra Early Career Capsule Handler] Received data chunk:', chunk.length, 'bytes');
      rawBody += chunk;
    });
    
    req.on('end', async () => {
      console.log('[Ultra Early Career Capsule Handler] Request end event fired');
      console.log('[Ultra Early Career Capsule Handler] Raw body received:', rawBody);
      console.log('[Ultra Early Career Capsule Handler] Body length:', rawBody.length);
      
      try {
        if (!rawBody.trim()) {
          console.log('[Ultra Early Career Capsule Handler] Empty body received');
          return res.status(400).json({ message: 'Empty request body' });
        }

        const body = JSON.parse(rawBody);
        console.log('[Ultra Early Career Capsule Handler] Parsed body:', body);
        
        const userId = req.params.userId;
        const { title, description, goalType, timeframe } = body;

        console.log('[Ultra Early Career Capsule Handler] UserId:', userId);
        console.log('[Ultra Early Career Capsule Handler] Title:', title);
        console.log('[Ultra Early Career Capsule Handler] Goal Type:', goalType);

        // Validate required fields
        if (!title || title.trim() === '') {
          console.log('[Ultra Early Career Capsule Handler] Validation failed: Title is required');
          return res.status(400).json({ message: 'Title is required for career goal' });
        }

        if (!goalType) {
          console.log('[Ultra Early Career Capsule Handler] Validation failed: Goal type is required');
          return res.status(400).json({ message: 'Goal type is required' });
        }

        // Create the career capsule
        const capsuleData = {
          userId: parseInt(userId!),
          title: title.trim(),
          description: description || null,
          goalType,
          customGoal: null,
          timeframe: timeframe || 5,
          industry: null,
          isPrivate: false,
          isMuskGenerated: true,
          overallProgress: 0
        };

        console.log('[Ultra Early Career Capsule Handler] Creating capsule with data:', capsuleData);

        // Import storage dynamically
        const { storage } = await import('./storage');
        console.log('[Ultra Early Career Capsule Handler] Storage imported successfully');
        
        const newCapsule = await storage.createCareerCapsule(capsuleData);
        console.log('[Ultra Early Career Capsule Handler] Capsule created successfully:', newCapsule);

        const response = {
          message: 'Career capsule created successfully',
          capsule: newCapsule
        };

        console.log('[Ultra Early Career Capsule Handler] Sending response:', response);
        res.status(201).json(response);
        console.log('[Ultra Early Career Capsule Handler] Response sent');

      } catch (error) {
        console.error('[Ultra Early Career Capsule Handler] Error in processing:', error);
        console.error('[Ultra Early Career Capsule Handler] Error stack:', error instanceof Error ? error.stack : 'No stack');
        res.status(500).json({ 
          message: 'Failed to create career capsule',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    req.on('error', (error) => {
      console.error('[Ultra Early Career Capsule Handler] Request error:', error);
      res.status(400).json({ 
        message: 'Invalid request',
        error: error.message 
      });
    });
    
    console.log('[Ultra Early Career Capsule Handler] Event listeners attached, waiting for data...');
    // Stop here, don't call next()
    return;
  }
  
  next();
});

// Body parsing is handled later with enhanced debugging - removed duplicate parser

// Firebase Auth Handler - detect and handle Firebase auth redirects early in the middleware stack
app.use(firebaseAuthRedirectHandler);

// Request timeout middleware (45 seconds)
const requestTimeout = (req: Request, res: Response, next: NextFunction) => {
  // Apply extended timeout for AI-related endpoints including Musk chat
  const isAIEndpoint = req.path.includes('/ai/') || 
                      req.path.includes('/musk/') || 
                      req.path.includes('/api/musk/') ||
                      req.path.includes('/resume/analyze');
  
  if (!isAIEndpoint) {
    return next();
  }
  
  const timeout = 120000; // 2 minutes timeout for AI requests - increased for reliability
  
  // Set server-level timeout
  req.setTimeout(timeout);
  res.setTimeout(timeout, () => {
    console.log(`[Server Timeout] Request to ${req.path} timed out after ${timeout}ms`);
    if (!res.headersSent) {
      res.status(504).json({
        error: "Request timeout",
        message: "I'm processing your request. This may take a moment for complex analysis."
      });
    }
  });
  
  next();
};

app.use(requestTimeout);

// Setup express-fileupload middleware only for multipart requests
app.use((req, res, next) => {
  // Only apply file upload middleware for multipart content
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    return fileUpload({
      limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max file size
      useTempFiles: true,
      tempFileDir: path.join(process.cwd(), 'tmp'),
      createParentPath: true,
      debug: process.env.NODE_ENV === 'development',
      abortOnLimit: true,
      safeFileNames: true,
      preserveExtension: true
    })(req, res, next);
  }
  next();
});

// Add secure file validation middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  if (!req.files) {
    return next();
  }
  
  // Skip validation for media upload endpoints that have their own validation
  const mediaUploadPaths = ['/api/pulses/upload-media', '/api/projects/upload-media', '/api/musk/resume-upload', '/api/musk/pitchdeck-upload'];
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

// Configure JSON and URL-encoded body parsing BEFORE other middleware with debugging
app.use((req, res, next) => {
  if (req.path.includes('/career-capsule')) {
    console.log('[JSON Parser Debug] Before parsing - Path:', req.path);
    console.log('[JSON Parser Debug] Content-Type:', req.headers['content-type']);
    console.log('[JSON Parser Debug] Content-Length:', req.headers['content-length']);
  }
  next();
});

app.use(express.json({ 
  limit: '50mb',
  verify: (req, res, buf, encoding) => {
    if (req.url && req.url.includes('/career-capsule')) {
      console.log('[JSON Parser Debug] Raw buffer length:', buf.length);
      console.log('[JSON Parser Debug] Raw buffer content:', buf.toString('utf8'));
    }
  }
}));

app.use(express.urlencoded({ extended: true, limit: '50mb' }));



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

// Profile picture upload debugging completed - core issue fixed

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

// Start Musk Pulse automation system
console.log("Starting Musk Pulse automation system...");
muskPulseScheduler.start();
console.log("Musk Pulse automation system started - scheduling pulses for 9 AM, 2 PM, and 7 PM daily");

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
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
    console.log(`🚀 Server accessible at:`);
    console.log(`   - Local: http://localhost:${port}`);
    console.log(`   - Network: http://0.0.0.0:${port}`);
    console.log(`   - External: https://${process.env.REPLIT_DOMAINS}`);
    console.log(`🔧 Domain connectivity: Server bound to 0.0.0.0 for external access`);
    console.log(`📄 Direct access: https://${process.env.REPLIT_DOMAINS}/direct-access.html`);
    console.log(`🔍 Debugging: REPLIT_DOMAINS=${process.env.REPLIT_DOMAINS}`);
    console.log(`🔍 Server listening on all interfaces (0.0.0.0:${port})`);
  });
  
  server.on('error', (err) => {
    console.error('Server error:', err);
  });
})();
