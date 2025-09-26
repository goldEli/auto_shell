#!/usr/bin/env node

import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the path to the TypeScript file
const scriptPath = join(__dirname, 'run_pipeline.ts');

// Execute the TypeScript file using tsx
const command = `npx tsx "${scriptPath}" ${process.argv.slice(2).join(' ')}`;

exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }
  
  if (stderr) {
    console.error(stderr);
  }
  
  if (stdout) {
    console.log(stdout);
  }
});
