#!/usr/bin/env node

import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

console.log('Building Claude Code Router for Docker...');

try {
  // Build the main CLI application
  console.log('Building CLI application...');
  execSync('npx esbuild src/cli.ts --bundle --platform=node --outfile=dist/cli.cjs', { stdio: 'inherit' });
  
  // Copy the tiktoken WASM file
  console.log('Copying tiktoken WASM file...');
  execSync('npx shx cp node_modules/tiktoken/tiktoken_bg.wasm dist/tiktoken_bg.wasm', { stdio: 'inherit' });
  
  // Skip UI build for Docker - will be built separately if needed
  
  console.log('Docker build completed successfully!');
} catch (error) {
  console.error('Docker build failed:', error.message);
  process.exit(1);
}