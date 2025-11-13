#!/usr/bin/env node
/*
  Offline-friendly integrations check.
  - Calls local API status/data endpoints that have fallbacks when API keys are missing
  - Updates report.json with results
*/

const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function safeJsonFetch(url) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data };
  } catch (e) {
    return { ok: false, data: { error: e.message } };
  }
}

async function run() {
  const endpoints = {
    openai: `${BASE}/api/openai/status`,
    gov_data: `${BASE}/api/govt-schemes/status`,
    newsapi: `${BASE}/api/live-updates/status`,
    env_check: `${BASE}/api/system/env-check`,
    schemes: `${BASE}/api/govt-schemes`,
    banks: `${BASE}/api/bank-schemes`,
  };

  const results = {};
  for (const [key, url] of Object.entries(endpoints)) {
    const { ok, data } = await safeJsonFetch(url);
    results[key] = { ok, data };
  }

  // Derive integration status without external keys
  const integrations_status = {
    openai: results.openai?.data?.success ? 'ok' : 'missing_key',
    gov_data: results.gov_data?.data?.success ? 'ok' : 'missing_key',
    newsapi: results.newsapi?.data?.success ? 'ok' : 'missing_key',
    google_places: 'missing_key',
    razorpay: process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET ? 'ok' : 'missing_key',
  };

  // Merge into report.json
  const reportPath = path.join(process.cwd(), 'report.json');
  let report = {};
  try {
    report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
  } catch {}

  report.integrations_status = integrations_status;
  report.next_steps = Array.from(
    new Set([...(report.next_steps || []), 'Add sandbox keys to fully validate integrations'])
  );

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Pretty print summary
  console.log('\nIntegrations check (offline-friendly)');
  console.table(integrations_status);
}

run().catch(e => {
  console.error('integrations-check failed:', e);
  process.exit(1);
});
