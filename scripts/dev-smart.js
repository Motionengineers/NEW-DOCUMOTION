#!/usr/bin/env node
'use strict';

const { execa } = require('execa');
const waitOn = require('wait-on');
const open = require('open');
const os = require('os');

const HOST = process.env.HOST || 'localhost';
const CANDIDATE_PORTS = (process.env.PORTS || '3000,3001,3002,3003,3004,3005')
  .split(',')
  .map(p => parseInt(p.trim(), 10))
  .filter(Boolean);

async function startOnPort(port) {
  const url = `http://${HOST}:${port}`;
  const env = {
    ...process.env,
    HOST,
    PORT: String(port),
    NEXTAUTH_URL: url,
  };
  const child = execa('next', ['dev', '-p', String(port)], {
    stdio: 'inherit',
    env,
    preferLocal: true,
  });

  try {
    await waitOn({
      resources: [url],
      timeout: 90000,
      interval: 500,
      validateStatus: s => s >= 200,
    });
    const preview = process.env.PREVIEW_URL || url;

    // Always open in Google Chrome
    if (os.platform() === 'darwin') {
      // macOS - use open command with Chrome app
      execa('open', ['-a', 'Google Chrome', preview], { stdio: 'ignore' }).catch(() => {
        // Fallback to default browser if Chrome not found
        open(preview);
      });
    } else if (os.platform() === 'win32') {
      // Windows
      execa('start', ['chrome', preview], { stdio: 'ignore' }).catch(() => {
        open(preview);
      });
    } else {
      // Linux
      execa('google-chrome', [preview], { stdio: 'ignore' }).catch(() => {
        open(preview);
      });
    }

    console.log(`\n✅ Server ready at ${url}`);
    console.log(`🌐 Opening in Google Chrome...\n`);

    return child; // keep running
  } catch (e) {
    // give child a moment; if exited, throw to try next port
    try {
      child.kill('SIGTERM', { forceKillAfterTimeout: 2000 });
    } catch {}
    throw e;
  }
}

(async () => {
  for (const port of CANDIDATE_PORTS) {
    try {
      await startOnPort(port);
      return; // success, keep process attached to child (stdio inherited)
    } catch (e) {
      // try next port
      continue;
    }
  }
  console.error('Failed to start dev server on any candidate port:', CANDIDATE_PORTS.join(', '));
  process.exit(1);
})();
