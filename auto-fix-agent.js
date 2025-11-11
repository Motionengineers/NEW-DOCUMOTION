#!/usr/bin/env node
'use strict';

/*
 Auto Fix Agent v1
 - Runs lint/format/typecheck/tests (best-effort)
 - Builds, starts the app, and opens Chrome to the chosen port
 - Non-interactive; continues on errors
*/

const { execa } = require('execa');
const fs = require('fs');
const path = require('path');
const os = require('os');
const open = require('open');

const ROOT = process.cwd();
const LOG_PREFIX = '[AutoFix]';

function log(...args) {
  console.log(LOG_PREFIX, ...args);
}

async function run(command, args = [], opts = {}) {
  try {
    log(`> ${command} ${args.join(' ')}`);
    const subprocess = execa(command, args, { stdio: 'inherit', preferLocal: true, ...opts });
    await subprocess;
    return { ok: true };
  } catch (err) {
    log(`ERROR: ${command} ${args.join(' ')} (continuing)`);
    return { ok: false, error: err };
  }
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

async function main() {
  log('Starting Auto Fix Agent v1 — non-interactive');

  // Ensure dependencies
  if (!exists('node_modules')) {
    log('node_modules missing — running npm ci (fallback to npm install)');
    const ci = await run('npm', ['ci']);
    if (!ci.ok) await run('npm', ['install']);
  }

  // Lint/format
  try {
    const pkg = require(path.join(ROOT, 'package.json'));
    if (pkg.scripts && pkg.scripts.lint) await run('npm', ['run', 'lint', '--silent']);
    else await run('npx', ['eslint', '--fix', '.']);

    if (pkg.scripts && pkg.scripts.format) await run('npm', ['run', 'format', '--silent']);
    else await run('npx', ['prettier', '**/*.{js,jsx,ts,tsx,json,css,md}', '--write']);
  } catch {}

  // Depcheck
  await run('npx', ['depcheck', '--json']);

  // Typecheck
  if (exists('tsconfig.json')) await run('npx', ['tsc', '--noEmit']);

  // Tests (best-effort)
  try {
    const pkg = require(path.join(ROOT, 'package.json'));
    if (pkg.scripts && pkg.scripts.test)
      await run('npm', ['test', '--silent', '--', '--runInBand']);
    else await run('npx', ['jest', '--runInBand']);
  } catch {}

  // Security audit fix
  await run('npm', ['audit', 'fix']);

  // Build
  try {
    const pkg = require(path.join(ROOT, 'package.json'));
    if (pkg.scripts && pkg.scripts.build) await run('npm', ['run', 'build', '--silent']);
    else {
      await run('npx', ['next', 'build']);
    }
  } catch {}

  // Start app (prefer start, then dev)
  let started = false;
  try {
    const pkg = require(path.join(ROOT, 'package.json'));
    if (pkg.scripts && pkg.scripts.start) {
      log('Launching `npm run start`');
      await run('npm', ['run', 'start']);
      started = true;
    }
    if (!started && pkg.scripts && pkg.scripts.dev) {
      log('Launching `npm run dev`');
      await run('npm', ['run', 'dev']);
      started = true;
    }
    if (!started && (exists('build') || exists('.next'))) {
      await run('npx', ['serve', '-s', 'build', '-l', '3001']);
      started = true;
    }
  } catch {}

  // Open browser to chosen port (3001 by default)
  const port = process.env.PORT || process.env.DEV_PORT || '3001';
  const url = `http://localhost:${port}`;

  try {
    log(`Opening ${url} in Chrome (fallback to default browser)`);
    const platform = os.platform();
    if (platform === 'darwin') {
      await open(url, { app: { name: 'google chrome' } }).catch(async () => await open(url));
    } else if (platform === 'win32') {
      await open(url, { app: { name: 'chrome' } }).catch(async () => await open(url));
    } else {
      await open(url, { app: { name: 'google-chrome' } }).catch(async () => await open(url));
    }
  } catch {
    await open(url).catch(() => {});
  }

  log('✅ Auto Fix Agent completed');
}

main().catch(err => {
  console.error(LOG_PREFIX, 'Unhandled error', err);
  process.exit(1);
});
