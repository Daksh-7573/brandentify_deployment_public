// Simple Express server that bypasses vite dependencies
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from client directory
app.use(express.static(path.join(__dirname, 'client')));
app.use('/assets', express.static(path.join(__dirname, 'client/src/assets')));

// Basic API health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Serve the React app for all non-API routes
app.get('*', (req, res) => {
  // Check if client/index.html exists
  const indexPath = path.join(__dirname, 'client', 'index.html');
  try {
    res.sendFile(indexPath);
  } catch (error) {
    res.status(500).json({ 
      error: 'Client build not found', 
      message: 'Run the build process first or use development server' 
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Simple server running on http://0.0.0.0:${PORT}`);
  console.log(`🔍 Environment: ${process.env.NODE_ENV || 'development'}`);
});