#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Frontend Development Server...');

const clientDir = path.join(process.cwd(), 'client');
const vite = spawn('npm', ['run', 'dev', '--', '--host', '0.0.0.0', '--port', '5000'], {
  cwd: clientDir,
  stdio: 'inherit',
  shell: true
});

vite.on('error', (error) => {
  console.error('❌ Failed to start frontend server:', error);
  process.exit(1);
});

vite.on('close', (code) => {
  console.log(`Frontend server exited with code ${code}`);
  process.exit(code);
});

process.on('SIGINT', () => {
  console.log('🛑 Stopping frontend server...');
  vite.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('🛑 Stopping frontend server...');
  vite.kill('SIGTERM');
});