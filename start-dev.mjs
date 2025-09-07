#!/usr/bin/env node
// Temporary workaround to start the development server
import { spawn } from 'child_process';

console.log('Starting development server with npx tsx...');

const child = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  shell: true
});

child.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

child.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});