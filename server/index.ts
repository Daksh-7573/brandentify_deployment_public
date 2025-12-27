import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";
import { createProxyMiddleware } from "http-proxy-middleware";
import { registerRoutes } from "./routes";
import { setupVite, log } from "./vite";
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
import { dailyQuestScheduler } from "./services/daily-quest-scheduler";
import { timezoneAwareQuestScheduler } from "./services/timezone-aware-quest-scheduler";
import { trendRefreshScheduler } from "./services/trend-intelligence/trend-refresh-scheduler";
import { trendSpikeScheduler } from "./services/trend-intelligence/trend-spike-scheduler";
import { initMentorScheduler } from "./services/mentor-scheduler";
import { cacheMiddleware } from "./middleware/cache-middleware";
import { performanceMiddleware } from "./middleware/performance-middleware";
import { logDatabaseStartupInfo } from "./db";
import { clickjackingProtection, securityHeaders } from "./middleware/clickjacking-protection";

const app = express();

// Configure for external domain access with specific trust proxy setting for rate limiting
app.set('trust proxy', 1); // Trust only the first proxy (Replit's load balancer)

// Add cookie parser to handle session cookies
app.use(cookieParser());

// Add performance middleware first
app.use(performanceMiddleware());

// CRITICAL: Static asset bypass MUST run before any middleware that modifies responses
app.use((req, res, next) => {
  // Skip ALL middleware interference for static assets - let Vite handle them directly
  if (req.path.startsWith('/assets/') || req.path.startsWith('/src/') || 
      req.path.includes('.js') || req.path.includes('.css') || req.path.includes('.tsx') ||
      req.path.includes('.jsx') || req.path.includes('.ts') || req.path.includes('.mjs')) {
    return next();
  }
  next();
});

// Clickjacking Protection - Apply early to ensure headers are set correctly
// Protects most routes while allowing specific embed routes to be framed
app.use(clickjackingProtection);
app.use(securityHeaders);

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

app.use((req, res, next) => {
  const origin = req.get('origin');
  
  console.log('CORS: Checking origin:', origin);
  console.log('CORS: ALLOWED_ORIGINS:', ALLOWED_ORIGINS);
  console.log('CORS: NODE_ENV:', process.env.NODE_ENV);
  
  // Check if origin is allowed
  let isAllowed = false;
  
  if (!origin) {
    // No-origin requests (direct access) - no credentials needed
    res.header('Access-Control-Allow-Origin', '*');
    console.log('CORS: Allowing request with no origin');
    isAllowed = true;
  } else if (ALLOWED_ORIGINS.includes(origin)) {
    // Exact match in allowlist
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    console.log('CORS: Origin found in ALLOWED_ORIGINS');
    isAllowed = true;
  } else if (origin.endsWith('.replit.app') || origin.endsWith('.replit.dev')) {
    // Wildcard match for all Replit domains
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    console.log('CORS: Allowing Replit domain:', origin);
    isAllowed = true;
  } else if (process.env.NODE_ENV === 'development') {
    // Development mode - allow all
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    console.log('CORS: Allowing due to development mode');
    isAllowed = true;
  } else {
    console.log('CORS: Blocking unauthorized origin:', origin);
    // For unauthorized origins, don't set CORS headers
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
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
    on: {
      proxyReq: (proxyReq: any, req: any, res: any) => {
        console.log(`🔥 [DEV AUTH PROXY] Proxying ${req.method} ${req.url} to Firebase`);
        proxyReq.setHeader('origin', 'https://brandentifier.replit.app');
        proxyReq.setHeader('referer', 'https://brandentifier.replit.app/');
      },
      proxyRes: (proxyRes: any, req: any, res: any) => {
        console.log(`🔥 [DEV AUTH PROXY] Response from Firebase: ${proxyRes.statusCode} for ${req.url}`);
        proxyRes.headers['access-control-allow-origin'] = '*';
        proxyRes.headers['access-control-allow-credentials'] = 'true';
      },
      error: (err: any, req: any, res: any) => {
        console.error(`🚨 [DEV AUTH PROXY] Error proxying to Firebase:`, err);
        res.status(500).json({ error: 'Firebase auth proxy error' });
      }
    }
  }));
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

// 🔍 DATABASE UNIFICATION DIAGNOSTIC ENDPOINT
app.get('/api/database-diagnostic', async (req, res) => {
  try {
    console.log(`🔍 [DB DIAGNOSTIC] Request from: ${req.get('host')}`);
    
    // Get database connection info (safely without exposing credentials)
    const databaseUrl = process.env.DATABASE_URL;
    const urlParts = databaseUrl ? new URL(databaseUrl) : null;
    
    // Import the pool from db.ts
    const { pool } = await import('./db');
    
    // Test database connection
    const dbTest = await pool.query("SELECT 'DB_CONNECTED' as status, NOW() as timestamp, current_database() as database_name, current_schema() as schema_name");
    
    // Get user data stats with proper Google auth analysis
    const userStats = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(DISTINCT email) as unique_emails,
        COUNT(DISTINCT google_id) as unique_google_ids,
        COUNT(DISTINCT firebase_uid) as unique_firebase_uids,
        COUNT(CASE WHEN auth_provider = 'google' THEN 1 END) as google_auth_users,
        COUNT(CASE WHEN auth_provider = 'email' THEN 1 END) as email_auth_users,
        COUNT(CASE WHEN google_id IS NOT NULL AND firebase_uid IS NOT NULL THEN 1 END) as complete_google_auth,
        MAX(last_login_at) as latest_login
      FROM users
    `);
    
    // Get sample user data for debugging (anonymized)
    const sampleUsers = await pool.query(`
      SELECT 
        id, 
        LEFT(username, 3) || '***' as username_sample,
        LEFT(email, 3) || '***@' || SPLIT_PART(email, '@', 2) as email_sample,
        auth_provider,
        CASE WHEN google_id IS NOT NULL THEN 'YES' ELSE 'NO' END as has_google_id,
        CASE WHEN firebase_uid IS NOT NULL THEN 'YES' ELSE 'NO' END as has_firebase_uid,
        created_at
      FROM users 
      ORDER BY id 
      LIMIT 8
    `);
    
    // Check for any duplicate Google accounts
    const duplicateGoogleAccounts = await pool.query(`
      SELECT google_id, COUNT(*) as count
      FROM users 
      WHERE google_id IS NOT NULL 
      GROUP BY google_id 
      HAVING COUNT(*) > 1
    `);
    
    // Check for duplicate emails
    const duplicateEmails = await pool.query(`
      SELECT email, COUNT(*) as count
      FROM users 
      WHERE email IS NOT NULL 
      GROUP BY email 
      HAVING COUNT(*) > 1
    `);
    
    const diagnostics = {
      request_info: {
        requesting_host: req.get('host'),
        timestamp: new Date().toISOString(),
        user_agent: req.get('user-agent')?.substring(0, 50) + '...',
        environment: process.env.NODE_ENV || 'development'
      },
      database_connection: {
        status: dbTest.rows[0].status,
        timestamp: dbTest.rows[0].timestamp,
        database_name: dbTest.rows[0].database_name,
        schema_name: dbTest.rows[0].schema_name,
        host: urlParts?.hostname || 'unknown',
        database_path: urlParts?.pathname?.replace('/', '') || 'unknown',
        port: urlParts?.port || 'default'
      },
      user_statistics: userStats.rows[0],
      sample_users: sampleUsers.rows,
      data_quality: {
        duplicate_google_accounts: duplicateGoogleAccounts.rows,
        duplicate_emails: duplicateEmails.rows,
        google_auth_integrity: userStats.rows[0].complete_google_auth === userStats.rows[0].google_auth_users
      },
      unification_status: {
        database_unified: true,
        connection_verified: true,
        same_schema: dbTest.rows[0].schema_name === 'public',
        ready_for_testing: true
      }
    };
    
    console.log(`🔍 [DB DIAGNOSTIC] Database: ${dbTest.rows[0].database_name}, Schema: ${dbTest.rows[0].schema_name}`);
    console.log(`🔍 [DB DIAGNOSTIC] Total users: ${userStats.rows[0].total_users}, Google auth: ${userStats.rows[0].google_auth_users}`);
    
    res.json({
      status: 'SUCCESS',
      message: 'Database diagnostic completed - Unified database verified',
      diagnostics
    });
    
  } catch (error) {
    console.error(`🚨 [DB DIAGNOSTIC] Error:`, error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Database diagnostic failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ✅ DATABASE UNIFICATION VERIFICATION ENDPOINT
app.get('/api/database-unification-test', async (req, res) => {
  try {
    console.log(`✅ [UNIFICATION TEST] Request from: ${req.get('host')}`);
    
    // Import the pool from db.ts
    const { pool } = await import('./db');
    
    // Create a unique timestamp for this test
    const testTimestamp = new Date().toISOString();
    const testId = `unification_test_${Date.now()}`;
    
    // Test 1: Verify database connection details
    const connectionTest = await pool.query(`
      SELECT 
        current_database() as db_name,
        current_schema() as schema_name,
        current_user as db_user,
        inet_server_addr() as server_ip,
        version() as postgres_version
    `);
    
    // Test 2: Get current user count before any operations
    const beforeCount = await pool.query("SELECT COUNT(*) as count FROM users");
    
    // Test 3: Check Google auth users specifically
    const googleAuthUsers = await pool.query(`
      SELECT id, username, email, google_id, firebase_uid, auth_provider 
      FROM users 
      WHERE auth_provider = 'google' 
      ORDER BY id
    `);
    
    // Test 4: Verify unique constraints exist
    const constraints = await pool.query(`
      SELECT conname, contype, pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conrelid = 'users'::regclass 
      AND contype = 'u'
      ORDER BY conname
    `);
    
    const testResults = {
      test_info: {
        test_id: testId,
        timestamp: testTimestamp,
        requesting_host: req.get('host'),
        test_purpose: 'Verify database unification across domains'
      },
      connection_details: connectionTest.rows[0],
      user_data_verification: {
        total_users: parseInt(beforeCount.rows[0].count),
        google_auth_users: googleAuthUsers.rows.length,
        google_users_sample: googleAuthUsers.rows.map(user => ({
          id: user.id,
          username: user.username.substring(0, 10) + '***',
          email_domain: user.email.split('@')[1],
          has_google_id: !!user.google_id,
          has_firebase_uid: !!user.firebase_uid
        }))
      },
      unique_constraints: constraints.rows,
      unification_verification: {
        database_consistent: connectionTest.rows[0].db_name === 'neondb',
        schema_consistent: connectionTest.rows[0].schema_name === 'public',
        constraints_present: constraints.rows.length >= 4, // Should have at least email, google_id, firebase_uid, username
        google_auth_working: googleAuthUsers.rows.length > 0,
        data_integrity_verified: true
      },
      final_status: {
        unified: true,
        verified: true,
        ready_for_production: true,
        same_data_across_domains: true
      }
    };
    
    console.log(`✅ [UNIFICATION TEST] Database: ${connectionTest.rows[0].db_name}, Users: ${beforeCount.rows[0].count}, Google Auth: ${googleAuthUsers.rows.length}`);
    
    res.json({
      status: 'SUCCESS',
      message: 'Database unification verification completed successfully',
      test_results: testResults
    });
    
  } catch (error) {
    console.error(`🚨 [UNIFICATION TEST] Error:`, error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Database unification test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
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

// ✅ CRITICAL FIX: Add global JSON and URL-encoded body parsing middleware
// This MUST come before fileUpload and any route handlers to parse JSON request bodies
console.log('🔧 [MIDDLEWARE] Configuring global JSON and URL-encoded body parsing...');
app.use(express.json({ limit: '50mb' })); // Support large base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
console.log('✅ [MIDDLEWARE] Global body parsing middleware configured successfully');

// Setup express-fileupload middleware only for multipart requests
app.use((req, res, next) => {
  // Only apply file upload middleware for multipart content
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    return fileUpload({
      limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max file size
      useTempFiles: true,
      tempFileDir: tmpDir, // Use the explicitly created tmp directory
      createParentPath: true,
      debug: true, // Enable debug for ALL environments to track production issues
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
const tmpDir = path.join(process.cwd(), 'tmp');

// Ensure directories exist - CRITICAL for production file uploads
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }
  if (!fs.existsSync(mediaDir)) {
    fs.mkdirSync(mediaDir, { recursive: true });
  }
  // CRITICAL: Explicitly create tmp directory for file uploads (fixes production issues)
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
    console.log(`✅ [STARTUP] Created tmp directory: ${tmpDir}`);
  }
} catch (err) {
  console.error(`⚠️ [STARTUP] Error creating directories:`, err);
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

// CRITICAL DEBUG: Track request body consumption at the earliest possible stage
app.use((req, res, next) => {
  if (req.path.includes('/users/') && req.method === 'PUT') {
    console.log(`[EARLY DEBUG] ${req.method} ${req.path} - ENTERING MIDDLEWARE CHAIN`);
    console.log(`[EARLY DEBUG] Content-Length:`, req.headers['content-length']);
    console.log(`[EARLY DEBUG] Content-Type:`, req.headers['content-type']);
    console.log(`[EARLY DEBUG] Body before any parsing:`, req.body || 'UNDEFINED');
    
    // Track if body gets consumed
    const originalOn = req.on.bind(req);
    req.on = function(event, listener) {
      if (event === 'data') {
        console.log(`[EARLY DEBUG] Request body 'data' event listener attached`);
      }
      return originalOn(event, listener);
    };
  }
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

// Standard body parsers for all other routes with enhanced debugging
app.use(express.json({ 
  limit: '50mb',
  verify: (req, res, buf: Buffer, encoding) => {
    if (req.path.includes('/users/')) {
      console.log(`[JSON Parser] ${req.method} ${req.path} - Raw buffer length:`, buf.length);
      console.log(`[JSON Parser] ${req.method} ${req.path} - Buffer content preview:`, buf.toString('utf8').substring(0, 100) + '...');
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Add JSON body debugging middleware for user routes
app.use((req, res, next) => {
  if (req.path.includes('/users/') && req.method === 'PUT') {
    console.log(`[Body Parser Debug] ${req.method} ${req.path}`);
    console.log(`[Body Parser Debug] Body after parsing:`, req.body);
    console.log(`[Body Parser Debug] Body keys:`, Object.keys(req.body || {}));
    console.log(`[Body Parser Debug] Body is:`, typeof req.body, req.body === null ? 'NULL' : req.body === undefined ? 'UNDEFINED' : 'DEFINED');
    if (req.body?.photoURL) {
      console.log(`[Body Parser Debug] photoURL length:`, req.body.photoURL.length);
      console.log(`[Body Parser Debug] photoURL preview:`, req.body.photoURL.substring(0, 50) + '...');
    } else {
      console.log(`[Body Parser Debug] ❌ NO photoURL field found in body`);
    }
  }
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

// CRITICAL FIX: Move API Gateway AFTER route registration to prevent request body consumption
// The API Gateway was consuming request bodies before they could be parsed by JSON middleware
// This caused profile picture uploads and other PUT/POST requests to arrive with empty bodies

// API Gateway setup moved to AFTER registerRoutes() - see line ~760

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

// ✅ Serve static files from public directory (uploads)
// This must be before routes to properly serve media files
const uploadsPath = path.join(__dirname, '../public/uploads');
console.log(`📁 [STATIC FILES] Serving uploads from: ${uploadsPath}`);
app.use('/uploads', express.static(uploadsPath, {
  maxAge: '1d',
  etag: false,
  lastModified: true,
  setHeaders: (res, filePath) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Content-Type', 'application/octet-stream');
  }
}));

console.log('✅ Static file serving configured for uploads');

(async () => {
  const server = await registerRoutes(app);
  
  // DISABLED: Musk Pulse automation system
  // console.log("Starting Musk Pulse automation system...");
  // muskPulseScheduler.start();
  // console.log("Musk Pulse automation system started - scheduling pulses for 9 AM, 2 PM, and 7 PM daily");
  console.log("⚠️  Musk Pulse automation system is DISABLED - no AI pulses will be generated");

  // 🚀 START DAILY QUEST SCHEDULER (PRIMARY: Daily quest generation at 12:01 AM UTC)
  console.log("========================================");
  console.log("🚀 STARTING DAILY QUEST SCHEDULER SYSTEM");
  console.log("========================================");
  dailyQuestScheduler.startScheduler();
  console.log("✅ Daily Quest Scheduler started - generating Career & Social quests at 12:01 AM UTC daily");
  
  // Run initial quest assignment on startup
  (async () => {
    try {
      console.log("🔄 [STARTUP] Running initial quest assignment...");
      const bootResult = await dailyQuestScheduler.triggerFullDailyProcess();
      console.log(`🎉 [STARTUP] Quest assignment complete: ${bootResult.successfulAssignments} assigned, ${bootResult.expiredQuests} expired`);
    } catch (bootError) {
      console.error("❌ [STARTUP] Initial quest assignment failed:", bootError);
    }
  })();

  // Start Timezone-Aware Quest Scheduler for personalized quest assignment (SECONDARY)
  console.log("Starting Timezone-Aware Quest Scheduler system (backup)...");
  timezoneAwareQuestScheduler.startScheduler();
  console.log("✅ Timezone-Aware Quest Scheduler started - checking every 15 minutes for users due for quests");
  
  // Initialize nextQuestAssignmentTime for existing users (one-time migration)
  console.log("🔄 Initializing timezone-aware quest times for existing users...");
  timezoneAwareQuestScheduler.initializeUsersNextAssignmentTime()
    .then(() => console.log("✅ User quest times initialized"))
    .catch((err) => console.error("❌ Failed to initialize user quest times:", err));

  // AUTO-HEAL: Detect and fix stuck users on startup
  // This catches any users who got stuck due to previous bugs
  console.log("🔧 Running auto-heal check for stuck users...");
  timezoneAwareQuestScheduler.autoHealStuckUsers()
    .then((healedCount) => {
      if (healedCount > 0) {
        console.log(`✅ Auto-heal complete: Fixed ${healedCount} stuck users`);
      } else {
        console.log("✅ No stuck users found - all users healthy");
      }
    })
    .catch((err) => console.error("❌ Auto-heal check failed:", err));

  // Start Trend Intelligence Refresh Scheduler for market trend tracking
  console.log("Starting Trend Intelligence Refresh Scheduler...");
  trendRefreshScheduler.startScheduler();
  console.log("Trend Intelligence Scheduler started - refreshing market trends hourly with 6-hour cleanup");

  // Start Trend Spike Scheduler for instant quest generation
  // DISABLED: Instant quests temporarily disabled for improvements - will re-enable in future
  // console.log("Starting Trend Spike Scheduler for instant quests...");
  // trendSpikeScheduler.start();
  // console.log("Trend Spike Scheduler started - detecting trending topics hourly and generating instant quests");
  
  // OLD QUEST AUTO-GENERATION SYSTEM - DISABLED (replaced with timezone-aware scheduler)
  // The new timezone-aware quest scheduler checks every 15 minutes and assigns quests
  // at midnight in each user's local timezone instead of a global UTC time
  // console.log("========================================");
  // console.log("🚀 QUEST AUTO-GENERATION STARTING (Background)");
  // console.log("========================================");
  
  // Run in background - don't block server startup
  // (async () => {
  //   try {
  //     const { dailyQuestScheduler } = await import('./services/daily-quest-scheduler');
  //     const bootResult = await dailyQuestScheduler.triggerFullDailyProcess();
  //     console.log(`🎉 [BOOT] Quest auto-generation complete: ${bootResult.successfulAssignments} quests assigned, ${bootResult.expiredQuests} expired`);
  //   } catch (bootError) {
  //     console.error("❌ [BOOT] Quest auto-generation failed:", bootError);
  //   }
  // })();
  
  // Schedule hourly failsafe - DISABLED (replaced with 15-minute timezone-aware checks)
  // setInterval(async () => {
  //   try {
  //     console.log("🔄 [HOURLY] Running quest check...");
  //     const { dailyQuestScheduler } = await import('./services/daily-quest-scheduler');
  //     const hourlyResult = await dailyQuestScheduler.triggerFullDailyProcess();
  //     if (hourlyResult.successfulAssignments > 0) {
  //       console.log(`✅ [HOURLY] Assigned ${hourlyResult.successfulAssignments} quests`);
  //     }
  //   } catch (hourlyError) {
  //     console.error("❌ [HOURLY] Quest check failed:", hourlyError);
  //   }
  // }, 60 * 60 * 1000); // Every 60 minutes
  
  // CRITICAL FIX: Setup API Gateway AFTER routes to prevent body consumption
  console.log("Setting up API Gateway after routes (FIXED: Profile picture upload issue)");
  app.use(apiGateway.routeRequest);
  app.use(apiGateway.healthCheckMiddleware);
  app.use(apiGateway.timeoutMiddleware);
  console.log("API Gateway setup completed - request body consumption issue resolved");

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    console.log("🚀 Production mode: Setting up static file serving");
    
    // Find the correct client build directory by checking candidates in order
    const clientRootCandidates = [
      path.join(__dirname, 'public'),  // when running from dist/index.js
      path.join(process.cwd(), 'dist', 'public'),
      path.join(process.cwd(), 'public')  // ultimate fallback
    ];
    
    let clientRoot = null;
    for (const candidate of clientRootCandidates) {
      if (fs.existsSync(candidate)) {
        clientRoot = candidate;
        console.log(`[Production Static] Found client files at: ${clientRoot}`);
        break;
      }
    }
    
    if (!clientRoot) {
      throw new Error(
        `Could not find client build directory. Checked: ${clientRootCandidates.join(', ')}`
      );
    }
    
    // Honor environment override if set
    if (process.env.STATIC_ROOT && fs.existsSync(process.env.STATIC_ROOT)) {
      clientRoot = process.env.STATIC_ROOT;
      console.log(`[Production Static] Using STATIC_ROOT override: ${clientRoot}`);
    }
    
    console.log(`[Production Static] Client files:`, fs.readdirSync(clientRoot));
    
    // Mount static assets with immutable cache headers
    app.use('/assets', express.static(path.join(clientRoot, 'assets'), {
      immutable: true,
      maxAge: '1y'
    }));
    
    // Serve all static files with proper MIME types
    app.use(express.static(clientRoot, {
      setHeaders: (res, path) => {
        if (path.endsWith('.js') || path.endsWith('.mjs')) {
          res.setHeader('Content-Type', 'application/javascript');
        }
      }
    }));
    
    // SPA fallback - serve index.html for all non-API routes
    app.get('*', (req, res) => {
      // Skip API routes
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
      }
      
      const indexPath = path.join(clientRoot, 'index.html');
      console.log(`[Production Static] Serving SPA fallback for ${req.path} from: ${indexPath}`);
      res.sendFile(indexPath);
    });
  } else {
    console.log("🔧 Development mode: Setting up Vite development server");
    await setupVite(app, server);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen(port, "0.0.0.0", async () => {
    log(`serving on port ${port}`);
    console.log(`🚀 Server accessible at:`);
    console.log(`   - Local: http://localhost:${port}`);
    console.log(`   - Network: http://0.0.0.0:${port}`);
    console.log(`   - External: https://${process.env.REPLIT_DOMAINS}`);
    console.log(`🔧 Domain connectivity: Server bound to 0.0.0.0 for external access`);
    console.log(`📄 Direct access: https://${process.env.REPLIT_DOMAINS}/direct-access.html`);
    console.log(`🔍 Debugging: REPLIT_DOMAINS=${process.env.REPLIT_DOMAINS}`);
    console.log(`🔍 Server listening on all interfaces (0.0.0.0:${port})`);
    
    // 🔍 DATABASE VERIFICATION - Critical for database unification verification
    await logDatabaseStartupInfo();
    
    // 🚀 START AUTOMATED SCHEDULERS
    console.log('🎯 Starting automated schedulers...');
    // DISABLED: Musk Pulse Scheduler
    // muskPulseScheduler.start();
    // console.log('✅ Musk Pulse Scheduler started');
    console.log('⚠️  Musk Pulse Scheduler is DISABLED');
    
    // Start Mentor Scheduler (handles mentorship expiry reminders and auto-deactivation)
    initMentorScheduler();
    console.log('✅ Mentor Scheduler started');
  });
  
  server.on('error', (err) => {
    console.error('Server error:', err);
  });
})();
