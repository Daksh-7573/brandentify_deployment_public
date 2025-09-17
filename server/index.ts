import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";
import { createProxyMiddleware } from "http-proxy-middleware";
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
import { initializeJWTConfiguration } from "./jwt-secret-manager";

const app = express();

// Configure for external domain access with specific trust proxy setting for rate limiting
app.set('trust proxy', 1); // Trust only the first proxy (Replit's load balancer)

// Add cookie parser to handle session cookies
app.use(cookieParser());

// Add performance middleware first
app.use(performanceMiddleware());

// CRITICAL: Static asset bypass for heavy middleware but allow MIME type configuration
app.use((req, res, next) => {
  // For static assets, skip heavy middleware but allow MIME type and caching configuration
  if (req.path.startsWith('/assets/') || req.path.startsWith('/src/') || 
      req.path.includes('.js') || req.path.includes('.css') || req.path.includes('.tsx') ||
      req.path.includes('.jsx') || req.path.includes('.ts') || req.path.includes('.mjs')) {
    console.log(`🚀 STATIC ASSET BYPASS: ${req.method} ${req.path} - skipping heavy middleware only`);
    
    // Set a flag to indicate this is a static asset request
    (req as any).isStaticAsset = true;
    return next();
  }

  // SECURITY: Apply clickjacking protection and comprehensive CSP for all pages
  // Only allow Replit development environment embedding for preview functionality
  const isReplitDev = req.headers.host?.includes('.replit.dev') || req.headers.host?.includes('picard.replit.dev');
  
  if (isReplitDev) {
    // Allow iframe embedding only within Replit development environment
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    // Comprehensive CSP for Replit development
    res.setHeader('Content-Security-Policy', [
      "default-src 'self' https://*.replit.dev https://*.replit.app https://*.replit.co",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.replit.dev https://*.replit.app https://*.replit.co https://cdnjs.cloudflare.com https://fonts.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://*.replit.dev https://*.replit.app https://*.replit.co https://fonts.googleapis.com https://cdnjs.cloudflare.com",
      "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:",
      "img-src 'self' data: blob: https://*.replit.dev https://*.replit.app https://*.replit.co https://lh3.googleusercontent.com",
      "connect-src 'self' https://*.replit.dev https://*.replit.app https://*.replit.co wss://*.replit.dev wss://*.replit.app",
      "frame-ancestors 'self' https://*.replit.dev https://replit.com"
    ].join('; '));
  } else {
    // Production: Strong clickjacking protection with comprehensive CSP
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', [
      "default-src 'self' https://brandentifier.com https://www.brandentifier.com",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://fonts.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
      "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:",
      "img-src 'self' data: blob: https://lh3.googleusercontent.com",
      "connect-src 'self' https://brandentifier.com https://www.brandentifier.com",
      "frame-ancestors 'none'"
    ].join('; '));
  }
  
  console.log(`🔒 SECURITY: Clickjacking protection applied for ${req.method} ${req.path}`);
  next();
});

// Skip heavy middleware processing for static assets
app.use((req, res, next) => {
  if ((req as any).isStaticAsset) {
    console.log(`⏩ STATIC ASSET: Skipping heavy middleware for ${req.method} ${req.path}`);
    return next();
  }
  next();
});

// CORS Configuration using explicit allowlist (security best practice)
const ALLOWED_ORIGINS = [
  'https://brandentifier.com',
  'https://www.brandentifier.com',
  'https://brandentifier.replit.app',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'https://25d68c5d-166d-4f92-b5c1-cdfc68146e33-00-2kol6l2kz9i0s.picard.replit.dev'
];

// Function to check if origin is allowed
function isOriginAllowed(origin: string): boolean {
  // Check explicit allowlist first
  if (ALLOWED_ORIGINS.includes(origin)) {
    return true;
  }
  
  // Allow all Replit domains dynamically
  if (origin.endsWith('.replit.app') || origin.endsWith('.replit.dev') || origin.endsWith('.replit.co')) {
    return true;
  }
  
  return false;
}

app.use((req, res, next) => {
  const origin = req.get('origin');
  
  console.log('CORS: Checking origin:', origin);
  console.log('CORS: ALLOWED_ORIGINS:', ALLOWED_ORIGINS);
  console.log('CORS: NODE_ENV:', process.env.NODE_ENV);
  
  // Set CORS headers based on allowlist or for no-origin requests (direct access)
  if (!origin) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    console.log('CORS: Allowing request with no origin');
  } else if (isOriginAllowed(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    console.log('CORS: Allowing origin:', origin);
  } else {
    console.log('CORS: Blocking unauthorized origin:', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Frame-Options');
  
  // Secure frame protection is handled in the middleware above
  // res.setHeader('X-Frame-Options') is set based on environment
  res.header('X-Content-Type-Options', 'nosniff');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

// 🚫 DISABLE Firebase proxies in production - they cause redirect loops
const isDevelopment = process.env.NODE_ENV !== 'production';

if (isDevelopment) {
  // 🔧 Development only: Keep Firebase auth proxy for local development
  console.log("🔧 Development mode: Enabling Firebase auth proxy");
  
  app.use('/__/auth/*', createProxyMiddleware({
    target: 'https://brandentifier-app.firebaseapp.com',
    changeOrigin: true,
    secure: true,
    onProxyReq: (proxyReq: any, req: any, res: any) => {
      console.log(`🔥 [DEV AUTH PROXY] Proxying ${req.method} ${req.url} to Firebase`);
      proxyReq.setHeader('origin', 'https://brandentifier.replit.app');
      proxyReq.setHeader('referer', 'https://brandentifier.replit.app/');
    },
    onProxyRes: (proxyRes: any, req: any, res: any) => {
      console.log(`🔥 [DEV AUTH PROXY] Response from Firebase: ${proxyRes.statusCode} for ${req.url}`);
      proxyRes.headers['access-control-allow-origin'] = '*';
      proxyRes.headers['access-control-allow-credentials'] = 'true';
    },
    onError: (err: any, req: any, res: any) => {
      console.error(`🚨 [DEV AUTH PROXY] Error proxying to Firebase:`, err);
      res.status(500).json({ error: 'Firebase auth proxy error' });
    }
  } as any));
} else {
  // 🚫 Production: Block Firebase auth routes with defensive 410 Gone responses
  console.log("🚫 Production mode: Blocking Firebase auth routes to prevent redirect loops");
  
  app.use('/__/auth/*', (req, res) => {
    console.log(`🚫 Blocked Firebase auth route: ${req.method} ${req.path}`);
    res.status(410).json({
      error: 'Firebase auth disabled',
      message: 'Firebase authentication is disabled on published domains. Please use /api/auth/google/url for authentication.',
      redirect: '/auth'
    });
  });
  
  app.use('/api/firebase-auth/*', (req, res) => {
    console.log(`🚫 Blocked Firebase proxy route: ${req.method} ${req.path}`);
    res.status(410).json({
      error: 'Firebase auth disabled', 
      message: 'Firebase authentication is disabled on published domains. Please use /api/auth/google/url for authentication.',
      redirect: '/auth'
    });
  });
}

// 🔧 DEPLOYMENT TEST ENDPOINT - Verify published app is working
app.get('/api/deployment-test', (req, res) => {
  console.log(`🚀 [DEPLOYMENT TEST] Request from: ${req.get('host')}`);
  res.json({
    status: 'SUCCESS',
    message: 'Published app is running correctly!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    host: req.get('host'),
    url: req.originalUrl,
    proxy_status: 'Firebase auth proxy active',
    build_version: 'latest'
  });
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

// Serve static files from public directory with proper MIME types
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads'), {
  setHeaders: (res, filePath) => {
    // Fix MIME type for JavaScript modules (only compiled JS files, not TS source)
    if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
  }
}));

// Serve the public directory directly for things like upload-test.html with proper MIME types
app.use(express.static(path.join(process.cwd(), 'public'), {
  setHeaders: (res, filePath) => {
    // Fix MIME type for JavaScript modules (only compiled JS files, not TS source)
    if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
  }
}));

// PRODUCTION STATIC ASSET SERVING: Add dedicated serving for built assets with proper MIME types
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
  const distPath = path.join(process.cwd(), 'dist', 'public');
  console.log(`🔧 Setting up production static asset serving from: ${distPath}`);
  
  // Serve production built assets with comprehensive MIME type configuration
  app.use('/assets', express.static(path.join(distPath, 'assets'), {
    setHeaders: (res, filePath) => {
      // Comprehensive MIME type configuration for all asset types
      if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      } else if (filePath.endsWith('.tsx')) {
        res.setHeader('Content-Type', 'application/typescript; charset=utf-8');
      } else if (filePath.endsWith('.ts')) {
        res.setHeader('Content-Type', 'application/typescript; charset=utf-8');
      } else if (filePath.endsWith('.jsx')) {
        res.setHeader('Content-Type', 'text/jsx; charset=utf-8');
      } else if (filePath.endsWith('.json')) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
      } else if (filePath.endsWith('.woff') || filePath.endsWith('.woff2')) {
        res.setHeader('Content-Type', 'font/woff');
      } else if (filePath.endsWith('.ttf')) {
        res.setHeader('Content-Type', 'font/ttf');
      } else if (filePath.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      } else if (filePath.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (filePath.endsWith('.ico')) {
        res.setHeader('Content-Type', 'image/x-icon');
      }
      
      // Add cache headers for static assets
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
      res.setHeader('ETag', 'strong'); // Enable ETag for better caching
      
      console.log(`📁 Production asset served: ${path.basename(filePath)} (${res.getHeader('Content-Type')})`);
    },
    // Enable compression
    index: false,
    redirect: false,
    maxAge: '1y' // 1 year max age for static assets
  }));
  
  // Also serve other static files from dist/public root
  app.use(express.static(distPath, {
    setHeaders: (res, filePath) => {
      // Same comprehensive MIME type configuration
      if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      } else if (filePath.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache'); // Don't cache HTML files
      }
      
      if (!filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      }
    },
    index: false // Prevent directory listing, let the app handle routing
  }));
  
  console.log(`✅ Production static asset serving configured with proper MIME types`);
}

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

// Conditional body parser - only for specific routes that need debugging
app.use((req, res, next) => {
  if (req.url && req.url.includes('/career-capsule')) {
    console.log('[JSON Parser Debug] Before parsing - Path:', req.path);
    console.log('[JSON Parser Debug] Content-Type:', req.headers['content-type']);
    return express.json({ 
      limit: '50mb',
      verify: (req, res, buf: Buffer, encoding) => {
        console.log('[JSON Parser Debug] Raw buffer length:', buf.length);
        console.log('[JSON Parser Debug] Raw buffer content:', buf.toString('utf8'));
      }
    })(req, res, next);
  }
  next();
});

// Standard body parsers for all other routes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));



// Apply the optimized quest progress tracking middleware (skip for static assets)
console.log("Setting up Optimized Quest Progress Tracking Middleware");
app.use((req, res, next) => {
  if ((req as any).isStaticAsset) {
    return next();
  }
  return questProgressMiddleware(req, res, next);
});

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
  // CRITICAL: Initialize JWT configuration before server starts
  // This validates JWT_SECRET in production and exits if missing
  console.log("🔐 Initializing JWT secret management...");
  try {
    initializeJWTConfiguration();
    console.log("✅ JWT secret management initialized successfully");
  } catch (error) {
    console.error("❌ FATAL: JWT configuration failed:", error instanceof Error ? error.message : error);
    console.error("❌ Server startup aborted due to JWT configuration error");
    process.exit(1);
  }

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
  // Properly detect development vs production mode
  const isDevelopment = process.env.NODE_ENV !== 'production';
  if (isDevelopment) {
    console.log("🔧 Setting up Vite development server");
    await setupVite(app, server);
  } else {
    console.log("🔧 Setting up static file serving for production");
    
    // CRITICAL: Add explicit asset serving BEFORE serveStatic to prevent MIME errors
    // This prevents missing assets from serving index.html (which causes MIME type violations)
    const assetsPath = path.resolve(process.cwd(), "public", "assets");
    
    app.use("/assets", express.static(assetsPath, {
      fallthrough: false, // Return 404 for missing assets instead of falling through to SPA
      maxAge: "1y", // Cache hashed assets for 1 year
      immutable: true, // Assets with hashes are immutable
      setHeaders: (res, filePath) => {
        // Immutable cache for hashed assets
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        
        // Set explicit MIME types to prevent confusion
        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.js' || ext === '.mjs') {
          res.setHeader('Content-Type', 'application/javascript');
        } else if (ext === '.css') {
          res.setHeader('Content-Type', 'text/css');
        }
        
        console.log(`📦 ASSET SERVED: ${path.basename(filePath)} with immutable cache`);
      }
    }));
    
    // Add 404 handler for missing assets to prevent SPA fallback
    app.use("/assets/*", (req, res) => {
      console.log(`⚠️ ASSET 404: ${req.path} not found - returning 404 instead of SPA fallback`);
      res.status(404).json({ 
        error: 'Asset not found',
        message: `Asset ${req.path} does not exist - check for invalid preload entries in HTML`,
        path: req.path 
      });
    });
    
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
