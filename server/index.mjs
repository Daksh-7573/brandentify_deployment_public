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

// 🚨 MAIN.JS FIX: Serve simplified JavaScript version
app.get('/src/main.js', (req, res) => {
  console.log('🎯 SERVING simplified main.js that browsers can understand');
  
  const simpleMainJs = `
// Simple landing page loader
console.log('🎯 Simple main.js loaded successfully');

// Remove loading screen
const loader = document.getElementById('app-loader');
if (loader) {
  loader.style.opacity = '0';
  setTimeout(() => loader.remove(), 200);
}

// Show simple landing page HTML
const root = document.getElementById('root');
if (root) {
  root.innerHTML = \`
    <div style="min-height: 100vh; background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%); color: white; font-family: 'Inter', Arial, sans-serif;">
      <header style="padding: 20px 40px; border-bottom: 1px solid rgba(255,255,255,0.1);">
        <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between;">
          <h1 style="font-size: 28px; font-weight: 700; margin: 0;">Brandentifier</h1>
          <div style="font-size: 14px; opacity: 0.8;">AI-Powered Career Platform</div>
        </div>
      </header>
      <main style="padding: 60px 40px; max-width: 1200px; margin: 0 auto; text-align: center;">
        <div style="max-width: 800px; margin: 0 auto;">
          <h2 style="font-size: 48px; font-weight: 800; margin-bottom: 20px; background: linear-gradient(135deg, #60a5fa, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            Build Your Professional Brand
          </h2>
          <p style="font-size: 20px; margin-bottom: 40px; opacity: 0.9; line-height: 1.6;">
            Leverage AI-powered insights to accelerate your career growth, connect with industry leaders, and showcase your expertise to the world.
          </p>
          <div style="display: flex; gap: 20px; justify-content: center; margin-bottom: 60px; flex-wrap: wrap;">
            <button onclick="window.location.href='/auth'" style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); border: none; padding: 15px 30px; border-radius: 12px; color: white; font-size: 16px; font-weight: 600; cursor: pointer;">Get Started</button>
            <button style="background: transparent; border: 2px solid rgba(255,255,255,0.3); padding: 15px 30px; border-radius: 12px; color: white; font-size: 16px; font-weight: 600; cursor: pointer;">Learn More</button>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; margin-top: 60px;">
            <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 16px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2);">
              <div style="font-size: 24px; margin-bottom: 15px;">🤖</div>
              <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 10px;">AI Career Insights</h3>
              <p style="opacity: 0.8; line-height: 1.5;">Get personalized career guidance powered by advanced AI technology.</p>
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 16px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2);">
              <div style="font-size: 24px; margin-bottom: 15px;">🌟</div>
              <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 10px;">Brand Building</h3>
              <p style="opacity: 0.8; line-height: 1.5;">Create a compelling professional presence across all platforms.</p>
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 16px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2);">
              <div style="font-size: 24px; margin-bottom: 15px;">🚀</div>
              <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 10px;">Career Growth</h3>
              <p style="opacity: 0.8; line-height: 1.5;">Track your progress and achieve your professional goals faster.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  \`;
  console.log('✅ Landing page HTML injected successfully');
}
`;
  
  res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.send(simpleMainJs);
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