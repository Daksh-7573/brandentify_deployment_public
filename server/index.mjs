// Temporary working server to get the app running
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting Brandentifier application...');

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Basic CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    app: 'Brandentifier',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve static files first
const clientPath = path.join(__dirname, '../client');
const distPath = path.join(__dirname, '../dist/public');

// 🚨 MAIN.JS FIX: Handle main.js specially before static serving
app.get('/src/main.js', (req, res) => {
  console.log('🎯 SERVING main.js with correct MIME type from index.mjs');
  
  const mainTsxPath = path.join(clientPath, 'src', 'main.tsx');
  res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(mainTsxPath);
});

// Configure MIME types for static serving
express.static.mime.define({
  'text/javascript': ['tsx', 'ts', 'jsx', 'js', 'mjs'],
  'text/css': ['css'],
  'application/javascript': ['tsx', 'ts', 'jsx', 'js', 'mjs']
});

// Serve built assets if available
app.use('/assets', express.static(path.join(distPath, 'assets')));

// Serve client source files with correct MIME types
app.use('/src', (req, res, next) => {
  // Set correct MIME types for TypeScript and CSS files
  if (req.path.endsWith('.tsx') || req.path.endsWith('.ts') || req.path.endsWith('.jsx') || req.path.endsWith('.js')) {
    res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
  } else if (req.path.endsWith('.css')) {
    res.setHeader('Content-Type', 'text/css; charset=utf-8');
  }
  next();
}, express.static(path.join(clientPath, 'src')));

// API routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    app: 'Brandentifier',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Catch all other API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// SPA fallback - serve the React app for all non-API routes
app.get('*', (req, res) => {
  // Check for built version first, then fallback to client
  const builtIndexFile = path.join(distPath, 'index.html');
  const devIndexFile = path.join(clientPath, 'index.html');
  
  // Try built version first
  res.sendFile(builtIndexFile, (err) => {
    if (err) {
      // Fallback to development version
      res.sendFile(devIndexFile, (devErr) => {
        if (devErr) {
          console.error('Error serving index.html:', devErr);
          res.status(500).json({ 
            message: 'Frontend application not available',
            suggestion: 'Please build the frontend application'
          });
        }
      });
    }
  });
});

const port = 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server accessible at:`);
  console.log(`   - Local: http://localhost:${port}`);
  console.log(`   - Network: http://0.0.0.0:${port}`);
  console.log(`   - External: https://${process.env.REPLIT_DOMAINS}`);
  console.log(`🔧 Brandentifier is running successfully!`);
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
});