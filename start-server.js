#!/usr/bin/env node
// Simple script to start the server with the working approach
import { spawn } from 'child_process';

console.log('🚀 Starting Brandentifier server...');

const server = spawn('node', ['server/index.mjs'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});