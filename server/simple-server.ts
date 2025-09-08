import express from 'express';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 5000;

console.log('🚀 Starting clean server for React app...');

// Create Vite server in middleware mode
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'spa',
  root: resolve(__dirname, '..', 'client')
});

// Use Vite's connect middleware
app.use(vite.middlewares);

app.listen(port, '0.0.0.0', () => {
  console.log(`🎉 Clean server running on http://0.0.0.0:${port}`);
  console.log('✨ Your original React landing page should now load properly!');
});